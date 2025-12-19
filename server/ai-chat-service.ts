import { Product, Category } from "@shared/models";

// AI Chat Service - Supporting Multiple AI Providers
// Supported providers: DeepSeek, Kimi (Moonshot), OpenAI, Groq, Baidu (ERNIE)
// Priority order: DEEPSEEK_API_KEY > KIMI_API_KEY > OPENAI_API_KEY > GROQ_API_KEY > BAIDU_API_KEY
// All APIs are compatible with OpenAI's interface format

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

interface ChatResponse {
  response: string;
  products?: any[];
}

// Get product information for AI responses
async function getProductContext(query: string): Promise<string> {
  try {
    // Search for relevant products
    const keywords = query.toLowerCase();
    // Try to find matching categories first
    const matchingCategories = await Category.find({
      $or: [
        { name: { $regex: keywords, $options: 'i' } },
        { slug: { $regex: keywords, $options: 'i' } }
      ]
    }).select('_id').lean();
    const categoryIds = matchingCategories.map(c => c._id.toString());
    
    const searchQuery: any = {
      $or: [
        { name: { $regex: keywords, $options: 'i' } },
        { description: { $regex: keywords, $options: 'i' } }
      ]
    };
    
    // Add category search if matching categories found
    if (categoryIds.length > 0) {
      searchQuery.$or.push({ categoryId: { $in: categoryIds } });
    }

    const products = await Product.find(searchQuery).limit(5).lean();

    if (products.length === 0) {
      return "Our store offers a variety of pet supplies, including cat food, dog food, toys, accessories, and more.";
    }

    // Format product information
    const productInfo = products.map(p => 
      `Product: ${p.name}\n` +
      `Price: HK$${p.price}\n` +
      `Description: ${p.description || 'No description available'}\n` +
      `Stock: ${(p.stockQuantity || 0) > 0 ? 'In Stock' : 'Out of Stock'}`
    ).join('\n\n---\n\n');

    return `Here is the relevant product information:\n\n${productInfo}`;
  } catch (error) {
    console.error('Failed to get product information:', error);
    return "Sorry, unable to retrieve product information.";
  }
}

// Helper function to add timeout to fetch requests
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 30000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// AI Provider Configuration Interface
interface AIProvider {
  name: string;
  apiKey: string | undefined;
  baseUrl: string;
  model: string;
}

// Get the first available AI provider based on priority
function getAIProvider(): AIProvider | null {
  // Priority order: DeepSeek > Kimi > OpenAI > Groq > Baidu
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      name: 'DeepSeek',
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseUrl: 'https://api.deepseek.com/v1/chat/completions',
      model: 'deepseek-chat'
    };
  }
  
  if (process.env.KIMI_API_KEY) {
    return {
      name: 'Kimi (Moonshot)',
      apiKey: process.env.KIMI_API_KEY,
      baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
      model: 'moonshot-v1-8k'
    };
  }
  
  if (process.env.OPENAI_API_KEY) {
    return {
      name: 'OpenAI',
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-3.5-turbo'
    };
  }
  
  if (process.env.GROQ_API_KEY) {
    return {
      name: 'Groq',
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.1-8b-instant'
    };
  }
  
  if (process.env.BAIDU_API_KEY && process.env.BAIDU_SECRET_KEY) {
    // Baidu requires special handling, will be implemented separately
    return null;
  }
  
  return null;
}

// Chat service using available AI API
export async function chatWithAI(request: ChatRequest): Promise<ChatResponse> {
  const provider = getAIProvider();
  
  if (!provider) {
    console.log('[chatWithAI] No AI API key found, falling back to rule engine');
    return await chatWithRules(request);
  }

  console.log(`[chatWithAI] Using ${provider.name} API`);
  console.log('[chatWithAI] Message:', request.message);

  try {
    // Get relevant product information
    const productContext = await getProductContext(request.message);

    // Build conversation history
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a customer service assistant for PawCart Pet Shop. Respond in the same language as the customer's question.

You can help with:
- Pet products and care questions
- General questions about pets
- Product recommendations
- Order and shipping questions

When customers ask about products, recommend relevant items from the product list below. Mention product names and prices when helpful.

Store info:
- Name: PawCart Online Pet Store (Meow Meow Pet Shop)
- Phone: 852-6214-6811
- Address: 11 Yuk Choi Road, Hung Hom, Kowloon, Hong Kong
- Hours: Daily 10:00 AM - 10:00 PM
- Free shipping on orders over HK$300

Products:
${productContext}

Be friendly and helpful. Use the same language as the customer.`
      },
      ...(request.conversationHistory || []),
      {
        role: 'user',
        content: request.message
      }
    ];

    // Call AI API with timeout
    const response = await fetchWithTimeout(provider.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500
      })
    }, 30000); // 30 second timeout

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[chatWithAI] ${provider.name} API error:`, response.status, errorText);
      throw new Error(`${provider.name} API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // Get relevant products for frontend display with improved search
    const keywords = request.message.toLowerCase();
    const searchTerms = keywords.split(/\s+/).filter(term => term.length > 1);
    
    // Try to find matching categories first
    const matchingCategories = await Category.find({
      $or: [
        { name: { $regex: keywords, $options: 'i' } },
        { slug: { $regex: keywords, $options: 'i' } }
      ]
    }).select('_id').lean();
    const categoryIds = matchingCategories.map(c => c._id.toString());
    
    // Build more comprehensive search query
    const searchQuery: any = {
      $or: [
        { name: { $regex: keywords, $options: 'i' } },
        { description: { $regex: keywords, $options: 'i' } }
      ]
    };
    
    // Add category search if matching categories found
    if (categoryIds.length > 0) {
      searchQuery.$or.push({ categoryId: { $in: categoryIds } });
    }
    
    // If multiple search terms, also try to match products that contain all terms
    if (searchTerms.length > 1) {
      const termQueries = searchTerms.map(term => ({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } }
        ]
      }));
      if (categoryIds.length > 0) {
        termQueries.push({ categoryId: { $in: categoryIds } } as any);
      }
      searchQuery.$or.push({
        $and: termQueries
      });
    }

    const products = await Product.find(searchQuery as any)
      .limit(5) // Increase limit to show more products
      .sort({ stockQuantity: -1, rating: -1, reviews: -1 }) // Prioritize in-stock, highly rated products
      .lean()
      .select('name price categoryId description stockQuantity image slug brandId rating reviews'); // Ensure slug is included

    // If products found, enhance AI response to mention them
    if (products.length > 0) {
      const isChineseQuery = /[\u4e00-\u9fa5]/.test(request.message);
      const productMention = `\n\n💡 I've found relevant products for you. Please check the product cards below - click on them to view details and make a purchase.`;
      
      // Only append if AI response doesn't already mention products
      if (!aiResponse.toLowerCase().includes('product')) {
        aiResponse += productMention;
      }
    }

    return {
      response: aiResponse,
      products: products
    };

  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT') || error?.code === 'UND_ERR_CONNECT_TIMEOUT') {
      console.error(`[chatWithAI] ${provider.name} API call timed out:`, errorMessage);
      console.log('[chatWithAI] Falling back to rule engine due to timeout');
    } else {
      console.error(`[chatWithAI] ${provider.name} API call failed:`, error);
    }
    // If API call fails, fall back to rule engine
    return await chatWithRules(request);
  }
}

// Helper function to detect if message is in Chinese
function isChinese(text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text);
}

// Rule-based chat engine (fallback solution)
async function chatWithRules(request: ChatRequest): Promise<ChatResponse> {
  const message = request.message.toLowerCase();
  const originalMessage = request.message;
  const isChineseQuery = isChinese(originalMessage);

  // Greetings
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return {
      response: 'Hello! Welcome to PawCart Pet Shop! 🐾 I\'m your AI customer service assistant. I can help you with:\n\n📦 Product inquiries\n💰 Prices and special offers\n🚚 Shipping services\n🎁 Product recommendations\n\nWhat can I help you with today?'
    };
  }

  // Product inquiries - Cat food
  if (message.includes('cat food')) {
    const products = await Product.find({ 
      category: { $regex: 'cat.*food', $options: 'i' } 
    }).limit(3).lean();

    return {
      response: `We have a variety of premium cat food options! Here are some recommendations:\n\n${products.map(p => 
        `🐱 ${p.name} - HK$${p.price}\n${p.description || ''}`
      ).join('\n\n')}\n\nWould you like to know more about any of these?`,
      products
    };
  }

  // Product inquiries - Dog food
  if (message.includes('dog food')) {
    const products = await Product.find({ 
      category: { $regex: 'dog.*food', $options: 'i' } 
    }).limit(3).lean();

    return {
      response: `We offer various dog food options for different breeds and ages! Here are some popular choices:\n\n${products.map(p => 
        `🐶 ${p.name} - HK$${p.price}\n${p.description || ''}`
      ).join('\n\n')}\n\nWould you like a recommendation based on your dog's needs?`,
      products
    };
  }

  // Toy inquiries
  if (message.includes('toy')) {
    const products = await Product.find({ 
      category: { $regex: 'toy', $options: 'i' } 
    }).limit(3).lean();

    return {
      response: `We have many fun pet toys! 🎾 Keep your pet happy and active:\n\n${products.map(p => 
        `🎮 ${p.name} - HK$${p.price}`
      ).join('\n\n')}\n\nThese toys help keep your pet energized and healthy!`,
      products
    };
  }

  // Shipping information
  if (message.includes('delivery') || message.includes('shipping')) {
    return {
      response: `Our Shipping Information:\n\n🚚 Delivery Options:\n• Standard Delivery (3-5 days)\n• Express Delivery (1-2 days)\n• Same-Day Delivery\n\n💰 Shipping Fees:\n• Orders over HK$300 - FREE SHIPPING!\n• Orders under HK$300 - HK$30 shipping fee\n\n📍 Delivery Area: All Hong Kong\n\nWhat else would you like to know?`
    };
  }

  // Return policy
  if (message.includes('return') || message.includes('refund')) {
    return {
      response: `Our Return Policy:\n\n✅ Return Conditions:\n• Returns accepted within 7 days of delivery\n• Products must be unopened\n• Original packaging must be intact\n\n💰 Refund Method:\n• Refunded to original payment account\n• Processing time: 3-5 business days\n\n📞 For returns, please contact:\nPhone: 852-6214-6811\nEmail: boqianjlu@gmail.com\n\nDo you have a specific return request? I can connect you to our customer service team.`
    };
  }

  // Membership information
  if (message.includes('membership') || message.includes('member') || message.includes('points')) {
    return {
      response: `PawCart Membership Benefits:\n\n🌟 Member Privileges:\n• 10% discount on all products\n• Exclusive monthly coupons\n• Points reward program\n• Birthday special gifts\n\n💎 Points System:\n• HK$1 spent = 1 point\n• Redeem points for products and coupons\n\n📝 How to Become a Member:\nVisit our "Membership Club" page to register!\n\nWould you like to know more about membership?`
    };
  }

  // Payment methods
  if (message.includes('payment') || message.includes('pay')) {
    return {
      response: `We support various payment methods:\n\n💳 Payment Options:\n• Credit/Debit Cards\n• PayPal\n• Apple Pay\n• Google Pay\n• Bank Transfer\n• Wallet Balance\n\n🔒 All payments are encrypted to ensure your information is secure!\n\nWould you like to know about the payment process?`
    };
  }

  // Contact information
  if (message.includes('contact') || message.includes('phone') || message.includes('reach')) {
    return {
      response: `Contact PawCart:\n\n📞 Phone: 852-6214-6811\n📧 Email: boqianjlu@gmail.com\n🏪 Address: 11 Yuk Choi Road, Hung Hom, Kowloon, Hong Kong\n⏰ Business Hours: Daily 10:00 AM - 10:00 PM\n\n💬 Online Support: Available 24/7\n\nDo you need to speak to a live agent right now?`
    };
  }

  // Price inquiries
  if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
    return {
      response: `Which product would you like to know the price of? You can:\n\n1️⃣ Tell me the specific product name\n2️⃣ Tell me your pet type (cat/dog/rabbit/bird, etc.)\n3️⃣ Specify the product type (food/toys/accessories, etc.)\n\nI'll look up the latest price information for you! 🔍`
    };
  }

  // Product recommendations
  if (message.includes('recommend') || message.includes('suggest') || message.includes('what should')) {
    return {
      response: `I'd be happy to recommend products for you! 🎁 To give you the best recommendations, please tell me:\n\n1️⃣ Your pet type? (cat/dog/rabbit/bird, etc.)\n2️⃣ What type of product do you need? (food/toys/accessories)\n3️⃣ Your budget range?\n\nThis way I can give you precise recommendations! 😊`
    };
  }

  // Stock inquiries
  if (message.includes('stock') || message.includes('available') || message.includes('in stock')) {
    return {
      response: `I can help you check product stock! 📦 Please tell me:\n\n• Which product would you like to check?\n• Or you can provide the product ID\n\nI'll check the latest stock status for you right away!`
    };
  }

  // Pet knowledge questions - Largest dog breed
  if ((originalMessage.includes('largest dog') || originalMessage.includes('biggest dog'))) {
    return {
      response: `Great question about the largest dog breeds! 🐶\n\n**World's Largest Dog Breeds:**\n• Great Dane - Height: 80-90 cm, Weight: 50-90 kg\n• Irish Wolfhound - Height: 71-90 cm, Weight: 40-70 kg\n• Saint Bernard - Height: 65-90 cm, Weight: 50-90 kg\n• Mastiff - Height: 70-91 cm, Weight: 50-100 kg\n• Newfoundland - Height: 66-71 cm, Weight: 45-70 kg\n\n**Care Tips for Large Breeds:**\n• Need ample space and exercise\n• Require high-quality large breed dog food\n• Joint health requires special attention\n• Regular veterinary check-ups are important\n\nAt PawCart, we offer various large breed dog foods and supplements to help keep your large dog healthy! Would you like recommendations for large breed products? 🍖`
    };
  }

  // Pet knowledge questions - Dog lifespan
  if (message.includes('dog') && 
      (message.includes('lifespan') || message.includes('live') || message.includes('age'))) {
    return {
      response: `Great question about dog lifespan! 🐶\n\n**Average Dog Lifespan:**\n• Small breeds (e.g., Chihuahua, Pomeranian): 12-16 years\n• Medium breeds (e.g., Beagle, Bulldog): 10-13 years\n• Large breeds (e.g., German Shepherd, Golden Retriever): 9-12 years\n• Giant breeds (e.g., Great Dane, Mastiff): 7-10 years\n\n**Factors affecting lifespan:**\n• Genetics and breed\n• Diet and nutrition\n• Exercise and activity level\n• Regular veterinary care\n• Living environment\n\nAt PawCart, we offer premium dog food and supplements that can help support your dog's health and longevity! Would you like recommendations for age-appropriate nutrition? 🍖`
    };
  }

  // Pet knowledge questions - Cat lifespan
  if (message.includes('cat') && 
      (message.includes('lifespan') || message.includes('live') || message.includes('age'))) {
    return {
      response: `Great question about cat lifespan! 🐱\n\n**Average Cat Lifespan:**\n• Indoor cats: 12-18 years (often 15-20 years with good care)\n• Outdoor cats: 2-5 years (due to risks like traffic, disease, predators)\n• Some cats can live into their 20s!\n\n**Factors affecting lifespan:**\n• Indoor vs. outdoor living\n• Diet and nutrition\n• Regular veterinary care\n• Spaying/neutering\n• Exercise and mental stimulation\n\nAt PawCart, we offer premium cat food and health products to help your cat live a long, healthy life! Would you like recommendations for senior cat nutrition? 🐟`
    };
  }

  // General knowledge questions - Number of cities in China
  if (originalMessage.includes('china') && originalMessage.includes('cities') && 
      (originalMessage.includes('how many') || originalMessage.includes('number'))) {
    return {
      response: `Great question about the number of cities in China! 🇨🇳\n\n**China City Statistics:**\n• Prefecture-level cities: Over 300\n• County-level cities: Over 400\n• Direct-controlled municipalities: 4 (Beijing, Shanghai, Tianjin, Chongqing)\n• Total: China has over 600 cities\n\n**Major City Classifications:**\n• Tier 1 cities: Beijing, Shanghai, Guangzhou, Shenzhen\n• New Tier 1 cities: Chengdu, Hangzhou, Chongqing, Wuhan, etc.\n• Tier 2 cities: Multiple provincial capitals and important prefecture-level cities\n• Tier 3 and below: Many small and medium-sized cities\n\n**Rapidly Developing Cities:**\nChina's urbanization process continues to develop rapidly, with both the number and quality of cities constantly improving.\n\nIf you have questions about pet products, I'd be happy to help! 🐾`
    };
  }

  // General pet care questions
  if ((message.includes('cat') || message.includes('dog') || message.includes('pet')) && 
      (message.includes('care') || message.includes('health') || 
       message.includes('feed') || message.includes('train'))) {
    return {
      response: `I'd be happy to help with pet care questions! 🐾\n\nAt PawCart, we specialize in providing quality products and advice for pet care. While I can help you find the right products (food, toys, accessories), for detailed care advice, I recommend:\n\n• Consulting with your veterinarian for health concerns\n• Checking our product descriptions for feeding guidelines\n• Contacting our customer service at 852-6214-6811 for product-specific questions\n\nWhat type of product are you looking for to help with your pet's care? I can recommend the best options! 🛍️`
    };
  }


  // PRIORITY: Try calling AI API first if available (before product search)
  // This ensures we can answer ANY question, not just product-related ones
  const provider = getAIProvider();
  if (provider) {
    try {
      console.log(`[chatWithRules] Attempting to call ${provider.name} API for message:`, request.message);
      const productContext = await getProductContext(request.message);
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are a customer service assistant for PawCart Pet Shop. Respond in the same language as the customer's question.

You can help with:
- Pet products and care questions
- General questions about pets
- Product recommendations
- Order and shipping questions

When customers ask about products, recommend relevant items from the product list below. Mention product names and prices when helpful.

Store info:
- Name: PawCart Online Pet Store (Meow Meow Pet Shop)
- Phone: 852-6214-6811
- Address: 11 Yuk Choi Road, Hung Hom, Kowloon, Hong Kong
- Hours: Daily 10:00 AM - 10:00 PM
- Free shipping on orders over HK$300

Products:
${productContext}

Be friendly and helpful. Use the same language as the customer.`
        },
        ...(request.conversationHistory || []),
        {
          role: 'user',
          content: request.message
        }
      ];

      const response = await fetchWithTimeout(provider.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`
        },
        body: JSON.stringify({
          model: provider.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1500
        })
      }, 30000); // 30 second timeout

      if (response.ok) {
        const data = await response.json();
        let aiResponse = data.choices[0].message.content;
        
        // Get relevant products for frontend display with improved search
        const keywords = request.message.toLowerCase();
        const searchTerms = keywords.split(/\s+/).filter(term => term.length > 1);
        
        // Build more comprehensive search query
        const searchQuery: any = {
          $or: [
            { name: { $regex: keywords, $options: 'i' } },
            { description: { $regex: keywords, $options: 'i' } },
            { category: { $regex: keywords, $options: 'i' } },
            { brand: { $regex: keywords, $options: 'i' } }
          ]
        };
        
        // If multiple search terms, also try to match products that contain all terms
        if (searchTerms.length > 1) {
          searchQuery.$or.push({
            $and: searchTerms.map(term => ({
              $or: [
                { name: { $regex: term, $options: 'i' } },
                { description: { $regex: term, $options: 'i' } },
                { brand: { $regex: term, $options: 'i' } }
              ]
            }))
          });
        }

        const products = await Product.find(searchQuery)
          .limit(5)
          .sort({ stock: -1, rating: -1, sold: -1 })
          .lean()
          .select('name price category description stock image slug brand rating sold');

        // If products found, enhance AI response to mention them
        if (products.length > 0) {
          const productMention = `\n\n💡 I've found relevant products for you. Please check the product cards below - click on them to view details and make a purchase.`;
          
          // Only append if AI response doesn't already mention products
          if (!aiResponse.toLowerCase().includes('product')) {
            aiResponse += productMention;
          }
        }
        
        return {
          response: aiResponse,
          products: products
        };
      } else {
        const errorData = await response.text();
        console.error(`[chatWithRules] ${provider.name} API returned error status:`, response.status, errorData);
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT') || error?.code === 'UND_ERR_CONNECT_TIMEOUT') {
        console.error(`${provider.name} API call timed out in chatWithRules:`, errorMessage);
      } else {
        console.error(`${provider.name} API call failed in chatWithRules:`, error);
      }
      // Continue to product search as fallback
    }
  }

  // Fallback: Try searching products if API is not available or failed
  const keywords = originalMessage.toLowerCase();
  const searchTerms = keywords.split(/\s+/).filter(term => term.length > 1);
  
  // Try to find matching categories first
  const matchingCategories = await Category.find({
    $or: [
      { name: { $regex: keywords, $options: 'i' } },
      { slug: { $regex: keywords, $options: 'i' } }
    ]
  }).select('_id').lean();
  const categoryIds = matchingCategories.map(c => c._id.toString());
  
  // Build more comprehensive search query
  const searchQuery: any = {
    $or: [
      { name: { $regex: keywords, $options: 'i' } },
      { description: { $regex: keywords, $options: 'i' } }
    ]
  };
  
  // Add category search if matching categories found
  if (categoryIds.length > 0) {
    searchQuery.$or.push({ categoryId: { $in: categoryIds } });
  }
  
  // If multiple search terms, also try to match products that contain all terms
  if (searchTerms.length > 1) {
    const termQueries = searchTerms.map(term => ({
      $or: [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } }
      ]
    }));
    if (categoryIds.length > 0) {
      termQueries.push({ categoryId: { $in: categoryIds } });
    }
    searchQuery.$or.push({
      $and: termQueries
    });
  }

  const products = await Product.find(searchQuery as any)
    .limit(5)
    .sort({ stockQuantity: -1, rating: -1, reviews: -1 })
    .lean()
    .select('name price categoryId description stockQuantity image slug brandId rating reviews');

  if (products.length > 0) {
    return {
      response: `I found some related products:\n\n${products.map(p => 
        `🛍️ ${p.name}\n💰 Price: HK$${p.price}\n📦 Stock: ${(p.stockQuantity || 0) > 0 ? 'In Stock' : 'Out of Stock'}\n${p.description ? '📝 ' + p.description.substring(0, 100) : ''}`
      ).join('\n\n')}\n\n💡 Please check the product cards below - click on them to view details and make a purchase.`,
      products
    };
  }

  // Complete default response (only if DeepSeek API is not available or failed, and no products found)
  return {
    response: `Thank you for your inquiry! I'm PawCart's AI customer service assistant. 🤖\n\nI can answer ANY questions you have, including:\n• 🐾 Pet-related topics (products, care, health, etc.)\n• 📚 General knowledge (geography, history, science, etc.)\n• 🔍 Product inquiries and recommendations\n• 💰 Prices and special offers\n• 🚚 Shipping and returns\n• 📱 Contact information\n• 💎 Membership benefits\n• And any other topics you're curious about!\n\nPlease tell me your question, and I'll do my best to help you!\n\nNote: For more detailed answers to any question, please configure the DeepSeek API key for full AI support. Currently, I can only answer preset questions. For human assistance, please call: 852-6214-6811.`
  };
}

// Get popular product recommendations
export async function getRecommendedProducts(category?: string, limit: number = 5) {
  try {
    const query = category ? { category: { $regex: category, $options: 'i' } } : {};
    const products = await Product.find(query)
      .sort({ sold: -1, rating: -1 })
      .limit(limit)
      .lean();

    return products;
  } catch (error) {
    console.error('Failed to get recommended products:', error);
    return [];
  }
}

// Smart product search
export async function searchProducts(query: string, limit: number = 10) {
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } }
      ],
      stockQuantity: { $gt: 0 } // Only return products in stock
    })
    .sort({ rating: -1, sold: -1 })
    .limit(limit)
    .lean();

    return products;
  } catch (error) {
    console.error('Failed to search products:', error);
    return [];
  }
}

