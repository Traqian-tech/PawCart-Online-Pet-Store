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
        content: `You are PawCart Pet Shop's AI customer service assistant.

CRITICAL LANGUAGE RULE: You MUST respond in the EXACT SAME LANGUAGE as the customer's question. If the customer asks in Chinese, you MUST respond in Chinese. If the customer asks in English, you MUST respond in English. This is the highest priority rule.

YOUR PRIMARY MISSION: Answer ANY and ALL questions the customer asks, regardless of topic. You are a helpful, knowledgeable assistant who can discuss:
- Pet-related topics (products, care, health, training, etc.)
- General knowledge (geography, history, science, culture, etc.)
- Current events and news
- Technology and computing
- Entertainment and hobbies
- Any other topic the customer is curious about

Your responsibilities are:
1. Answer ANY question the customer asks - whether about pets, general knowledge, or any other topic
2. Provide accurate, helpful, and informative responses
3. For pet-related questions, naturally connect your answers to our products and services when appropriate
4. When customers ask about specific products or product categories, ALWAYS actively recommend the relevant products from the provided product information
5. When recommending products, mention specific product names, prices, and key features to help customers make informed decisions
6. Help customers understand product details, prices, stock availability, etc.
7. Answer common questions about shipping, returns, membership, etc.

CRITICAL PRODUCT RECOMMENDATION RULES:
- When a customer asks about a specific product (e.g., "cat food", "dog toys", "Royal Canin", etc.), you MUST actively recommend the specific products from the available product information
- Mention product names, prices, and key features in your response
- Tell customers they can click on the product cards below to view full details and purchase
- Be enthusiastic and helpful when recommending products

IMPORTANT GUIDELINES:
- You MUST answer any question the customer asks, no matter the topic
- Be comprehensive, accurate, and helpful in all your responses
- For pet-related questions, naturally connect your answers to our products and services when appropriate
- When customers ask about products, be PROACTIVE - actively recommend specific products by name, mention prices, and highlight key features
- Always maintain a friendly, professional, and helpful tone
- Be informative and educational - help customers learn and understand
- REMEMBER: Always match the language of your response to the language of the customer's question
- If you don't know something, admit it honestly but still try to be helpful
- When products are available, always mention that customers can click on the product cards below to view full details

Store Information:
- Name: PawCart Online Pet Store (Meow Meow Pet Shop)
- Phone: 852-6214-6811
- Address: 11 Yuk Choi Road, Hung Hom, Kowloon, Hong Kong
- Business Hours: Daily 10:00 AM - 10:00 PM
- Shipping: Free shipping on orders over HK$300

Available Product Information:
${productContext}

Please respond in a professional and friendly tone, using the same language as the customer's question. If customers inquire about products not listed above, tell them they can browse our website or contact customer service for more information.`
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
      const productMention = isChineseQuery 
        ? `\n\n💡 我为您找到了相关产品，请查看下方的产品卡片，点击即可查看详细信息和购买。`
        : `\n\n💡 I've found relevant products for you. Please check the product cards below - click on them to view details and make a purchase.`;
      
      // Only append if AI response doesn't already mention products
      if (!aiResponse.toLowerCase().includes('product') && 
          !aiResponse.includes('产品') && 
          !aiResponse.includes('商品')) {
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
  if (message.includes('cat food') || originalMessage.includes('猫粮') || originalMessage.includes('貓糧')) {
    const products = await Product.find({ 
      category: { $regex: 'cat.*food', $options: 'i' } 
    }).limit(3).lean();

    if (isChineseQuery) {
      return {
        response: `我们提供多种优质猫粮选择！以下是一些推荐：\n\n${products.map(p => 
          `🐱 ${p.name} - HK$${p.price}\n${p.description || ''}`
        ).join('\n\n')}\n\n您想了解更多详情吗？`,
        products
      };
    } else {
      return {
        response: `We have a variety of premium cat food options! Here are some recommendations:\n\n${products.map(p => 
          `🐱 ${p.name} - HK$${p.price}\n${p.description || ''}`
        ).join('\n\n')}\n\nWould you like to know more about any of these?`,
        products
      };
    }
  }

  // Product inquiries - Dog food
  if (message.includes('dog food') || originalMessage.includes('狗粮') || originalMessage.includes('狗糧')) {
    const products = await Product.find({ 
      category: { $regex: 'dog.*food', $options: 'i' } 
    }).limit(3).lean();

    if (isChineseQuery) {
      return {
        response: `我们提供各种适合不同品种和年龄的狗粮选择！以下是一些热门选择：\n\n${products.map(p => 
          `🐶 ${p.name} - HK$${p.price}\n${p.description || ''}`
        ).join('\n\n')}\n\n需要我根据您狗狗的需求为您推荐吗？`,
        products
      };
    } else {
      return {
        response: `We offer various dog food options for different breeds and ages! Here are some popular choices:\n\n${products.map(p => 
          `🐶 ${p.name} - HK$${p.price}\n${p.description || ''}`
        ).join('\n\n')}\n\nWould you like a recommendation based on your dog's needs?`,
        products
      };
    }
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

  // Pet knowledge questions - Largest dog breed (Chinese and English)
  if ((originalMessage.includes('体型最大') || originalMessage.includes('最大的狗') || originalMessage.includes('largest dog') || originalMessage.includes('biggest dog') || 
       originalMessage.includes('最大型') || (originalMessage.includes('体型') && originalMessage.includes('大'))) && 
      (originalMessage.includes('狗') || originalMessage.includes('dog'))) {
    if (isChineseQuery) {
      return {
        response: `关于体型最大的狗，这是一个很有趣的问题！🐶\n\n**世界上体型最大的狗品种：**\n• 大丹犬 (Great Dane) - 肩高可达80-90厘米，体重50-90公斤\n• 爱尔兰猎狼犬 (Irish Wolfhound) - 肩高可达71-90厘米，体重40-70公斤\n• 圣伯纳犬 (Saint Bernard) - 肩高可达65-90厘米，体重50-90公斤\n• 马士提夫犬 (Mastiff) - 肩高可达70-91厘米，体重50-100公斤\n• 纽芬兰犬 (Newfoundland) - 肩高可达66-71厘米，体重45-70公斤\n\n**大型犬的护理要点：**\n• 需要足够的运动空间和活动量\n• 饮食需求量大，需要高质量的大型犬专用粮\n• 关节健康需要特别关注\n• 定期体检和健康监测很重要\n\n在PawCart，我们提供多种大型犬专用狗粮和营养补充品，帮助您的大型犬保持健康！需要我为您推荐适合大型犬的产品吗？🍖`
      };
    } else {
      return {
        response: `Great question about the largest dog breeds! 🐶\n\n**World's Largest Dog Breeds:**\n• Great Dane - Height: 80-90 cm, Weight: 50-90 kg\n• Irish Wolfhound - Height: 71-90 cm, Weight: 40-70 kg\n• Saint Bernard - Height: 65-90 cm, Weight: 50-90 kg\n• Mastiff - Height: 70-91 cm, Weight: 50-100 kg\n• Newfoundland - Height: 66-71 cm, Weight: 45-70 kg\n\n**Care Tips for Large Breeds:**\n• Need ample space and exercise\n• Require high-quality large breed dog food\n• Joint health requires special attention\n• Regular veterinary check-ups are important\n\nAt PawCart, we offer various large breed dog foods and supplements to help keep your large dog healthy! Would you like recommendations for large breed products? 🍖`
      };
    }
  }

  // Pet knowledge questions - Dog lifespan
  if ((message.includes('狗') || message.includes('dog')) && 
      (message.includes('寿命') || message.includes('lifespan') || message.includes('live') || message.includes('age'))) {
    if (isChineseQuery) {
      return {
        response: `关于狗的寿命，这是一个很好的问题！🐶\n\n**平均狗寿命：**\n• 小型犬（如吉娃娃、博美）：12-16年\n• 中型犬（如比格犬、斗牛犬）：10-13年\n• 大型犬（如德国牧羊犬、金毛）：9-12年\n• 巨型犬（如大丹犬、马士提夫）：7-10年\n\n**影响寿命的因素：**\n• 遗传和品种\n• 饮食和营养\n• 运动量\n• 定期兽医护理\n• 生活环境\n\n在PawCart，我们提供优质的狗粮和营养补充品，帮助支持您爱犬的健康和长寿！需要我为您推荐适合不同年龄段的营养产品吗？🍖`
      };
    } else {
      return {
        response: `Great question about dog lifespan! 🐶\n\n**Average Dog Lifespan:**\n• Small breeds (e.g., Chihuahua, Pomeranian): 12-16 years\n• Medium breeds (e.g., Beagle, Bulldog): 10-13 years\n• Large breeds (e.g., German Shepherd, Golden Retriever): 9-12 years\n• Giant breeds (e.g., Great Dane, Mastiff): 7-10 years\n\n**Factors affecting lifespan:**\n• Genetics and breed\n• Diet and nutrition\n• Exercise and activity level\n• Regular veterinary care\n• Living environment\n\nAt PawCart, we offer premium dog food and supplements that can help support your dog's health and longevity! Would you like recommendations for age-appropriate nutrition? 🍖`
      };
    }
  }

  // Pet knowledge questions - Cat lifespan
  if ((message.includes('猫') || message.includes('cat')) && 
      (message.includes('寿命') || message.includes('lifespan') || message.includes('live') || message.includes('age'))) {
    if (isChineseQuery) {
      return {
        response: `关于猫的寿命，这是一个很好的问题！🐱\n\n**平均猫寿命：**\n• 室内猫：12-18年（良好护理下通常15-20年）\n• 室外猫：2-5年（由于交通、疾病、天敌等风险）\n• 有些猫可以活到20多岁！\n\n**影响寿命的因素：**\n• 室内vs室外生活\n• 饮食和营养\n• 定期兽医护理\n• 绝育\n• 运动和智力刺激\n\n在PawCart，我们提供优质的猫粮和健康产品，帮助您的猫咪健康长寿！需要我为您推荐适合老年猫的营养产品吗？🐟`
      };
    } else {
      return {
        response: `Great question about cat lifespan! 🐱\n\n**Average Cat Lifespan:**\n• Indoor cats: 12-18 years (often 15-20 years with good care)\n• Outdoor cats: 2-5 years (due to risks like traffic, disease, predators)\n• Some cats can live into their 20s!\n\n**Factors affecting lifespan:**\n• Indoor vs. outdoor living\n• Diet and nutrition\n• Regular veterinary care\n• Spaying/neutering\n• Exercise and mental stimulation\n\nAt PawCart, we offer premium cat food and health products to help your cat live a long, healthy life! Would you like recommendations for senior cat nutrition? 🐟`
      };
    }
  }

  // General knowledge questions - Number of cities in China
  if (originalMessage.includes('中国城市数量') || originalMessage.includes('中国有多少个城市') || 
      (originalMessage.includes('中国城市') && (originalMessage.includes('数量') || originalMessage.includes('多少')))) {
    return {
      response: `关于中国城市数量，这是一个很好的问题！🇨🇳\n\n**中国城市统计：**\n• 地级市：约300多个\n• 县级市：约400多个\n• 直辖市：4个（北京、上海、天津、重庆）\n• 总计：中国有超过600个城市\n\n**主要城市分类：**\n• 一线城市：北京、上海、广州、深圳\n• 新一线城市：成都、杭州、重庆、武汉等\n• 二线城市：多个省会城市和重要地级市\n• 三线及以下城市：众多中小城市\n\n**快速发展的城市：**\n中国的城市化进程持续快速发展，城市数量和质量都在不断提升。\n\n如果您有关于宠物产品的问题，我很乐意为您提供帮助！🐾`
    };
  }

  // General pet care questions
  if ((message.includes('狗') || message.includes('cat') || message.includes('dog') || message.includes('猫') || message.includes('pet')) && 
      (message.includes('护理') || message.includes('care') || message.includes('健康') || message.includes('health') || 
       message.includes('喂养') || message.includes('feed') || message.includes('训练') || message.includes('train'))) {
    if (isChineseQuery) {
      return {
        response: `我很乐意帮助您解答宠物护理问题！🐾\n\n在PawCart，我们专注于提供优质的宠物护理产品和建议。我可以帮您找到合适的产品（食物、玩具、配件），对于详细的护理建议，我建议：\n\n• 健康问题请咨询您的兽医\n• 查看我们产品的说明了解喂养指南\n• 产品相关问题可致电客服：852-6214-6811\n\n您需要什么类型的宠物护理产品？我可以为您推荐最佳选择！🛍️`
      };
    } else {
      return {
        response: `I'd be happy to help with pet care questions! 🐾\n\nAt PawCart, we specialize in providing quality products and advice for pet care. While I can help you find the right products (food, toys, accessories), for detailed care advice, I recommend:\n\n• Consulting with your veterinarian for health concerns\n• Checking our product descriptions for feeding guidelines\n• Contacting our customer service at 852-6214-6811 for product-specific questions\n\nWhat type of product are you looking for to help with your pet's care? I can recommend the best options! 🛍️`
      };
    }
  }

  // Chinese greetings
  if (isChineseQuery && (originalMessage.includes('你好') || originalMessage.includes('您好') || originalMessage.includes('嗨') || originalMessage.includes('在吗'))) {
    return {
      response: '您好！欢迎来到PawCart宠物店！🐾 我是您的AI客服助手。我可以帮助您：\n\n📦 产品咨询\n💰 价格和优惠信息\n🚚 配送服务\n🎁 产品推荐\n\n今天有什么可以帮到您的吗？'
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
          content: `You are PawCart Pet Shop's AI customer service assistant.

CRITICAL LANGUAGE RULE: You MUST respond in the EXACT SAME LANGUAGE as the customer's question. If the customer asks in Chinese, you MUST respond in Chinese. If the customer asks in English, you MUST respond in English. This is the highest priority rule.

YOUR PRIMARY MISSION: Answer ANY and ALL questions the customer asks, regardless of topic. You are a helpful, knowledgeable assistant who can discuss:
- Pet-related topics (products, care, health, training, etc.)
- General knowledge (geography, history, science, culture, etc.)
- Current events and news
- Technology and computing
- Entertainment and hobbies
- Any other topic the customer is curious about

Your responsibilities are:
1. Answer ANY question the customer asks - whether about pets, general knowledge, or any other topic
2. Provide accurate, helpful, and informative responses
3. For pet-related questions, naturally connect your answers to our products and services when appropriate
4. When customers ask about specific products or product categories, ALWAYS actively recommend the relevant products from the provided product information
5. When recommending products, mention specific product names, prices, and key features to help customers make informed decisions
6. Help customers understand product details, prices, stock availability, etc.
7. Answer common questions about shipping, returns, membership, etc.

CRITICAL PRODUCT RECOMMENDATION RULES:
- When a customer asks about a specific product (e.g., "cat food", "dog toys", "Royal Canin", etc.), you MUST actively recommend the specific products from the available product information
- Mention product names, prices, and key features in your response
- Tell customers they can click on the product cards below to view full details and purchase
- Be enthusiastic and helpful when recommending products

IMPORTANT GUIDELINES:
- You MUST answer any question the customer asks, no matter the topic
- Be comprehensive, accurate, and helpful in all your responses
- For pet-related questions, naturally connect your answers to our products and services when appropriate
- When customers ask about products, be PROACTIVE - actively recommend specific products by name, mention prices, and highlight key features
- Always maintain a friendly, professional, and helpful tone
- Be informative and educational - help customers learn and understand
- REMEMBER: Always match the language of your response to the language of the customer's question
- If you don't know something, admit it honestly but still try to be helpful
- When products are available, always mention that customers can click on the product cards below to view full details

Store Information:
- Name: PawCart Online Pet Store (Meow Meow Pet Shop)
- Phone: 852-6214-6811
- Address: 11 Yuk Choi Road, Hung Hom, Kowloon, Hong Kong
- Business Hours: Daily 10:00 AM - 10:00 PM
- Shipping: Free shipping on orders over HK$300

Available Product Information:
${productContext}

Please respond in a professional and friendly tone, using the same language as the customer's question. If customers inquire about products not listed above, tell them they can browse our website or contact customer service for more information.`
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
          const isChineseQuery = /[\u4e00-\u9fa5]/.test(request.message);
          const productMention = isChineseQuery 
            ? `\n\n💡 我为您找到了相关产品，请查看下方的产品卡片，点击即可查看详细信息和购买。`
            : `\n\n💡 I've found relevant products for you. Please check the product cards below - click on them to view details and make a purchase.`;
          
          // Only append if AI response doesn't already mention products
          if (!aiResponse.toLowerCase().includes('product') && 
              !aiResponse.includes('产品') && 
              !aiResponse.includes('商品')) {
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
    if (isChineseQuery) {
      return {
        response: `我找到了一些相关产品：\n\n${products.map(p => 
          `🛍️ ${p.name}\n💰 价格：HK$${p.price}\n📦 库存：${(p.stockQuantity || 0) > 0 ? '有货' : '缺货'}\n${p.description ? '📝 ' + p.description.substring(0, 100) : ''}`
        ).join('\n\n')}\n\n💡 请查看下方的产品卡片，点击即可查看详细信息和购买。`,
        products
      };
    } else {
      return {
        response: `I found some related products:\n\n${products.map(p => 
          `🛍️ ${p.name}\n💰 Price: HK$${p.price}\n📦 Stock: ${(p.stockQuantity || 0) > 0 ? 'In Stock' : 'Out of Stock'}\n${p.description ? '📝 ' + p.description.substring(0, 100) : ''}`
        ).join('\n\n')}\n\n💡 Please check the product cards below - click on them to view details and make a purchase.`,
        products
      };
    }
  }

  // Complete default response (only if DeepSeek API is not available or failed, and no products found)
  if (isChineseQuery) {
    return {
      response: `感谢您的咨询！我是PawCart的AI客服助手。🤖\n\n我可以回答您的任何问题，包括：\n• 🐾 宠物相关（产品、护理、健康等）\n• 📚 一般知识（地理、历史、科学等）\n• 🔍 产品咨询和推荐\n• 💰 价格和优惠信息\n• 🚚 配送和退货\n• 📱 联系方式\n• 💎 会员福利\n• 以及您想了解的任何其他话题！\n\n请告诉我您的问题，我会尽力为您提供帮助！\n\n注意：如果您的问题需要更详细的回答，建议您配置DeepSeek API密钥以获得完整的AI支持。目前我只能回答预设的问题。如需人工帮助，请致电：852-6214-6811。`
    };
  } else {
    return {
      response: `Thank you for your inquiry! I'm PawCart's AI customer service assistant. 🤖\n\nI can answer ANY questions you have, including:\n• 🐾 Pet-related topics (products, care, health, etc.)\n• 📚 General knowledge (geography, history, science, etc.)\n• 🔍 Product inquiries and recommendations\n• 💰 Prices and special offers\n• 🚚 Shipping and returns\n• 📱 Contact information\n• 💎 Membership benefits\n• And any other topics you're curious about!\n\nPlease tell me your question, and I'll do my best to help you!\n\nNote: For more detailed answers to any question, please configure the DeepSeek API key for full AI support. Currently, I can only answer preset questions. For human assistance, please call: 852-6214-6811.`
    };
  }
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

