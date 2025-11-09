/**
 * Database Translation Script
 * Translates all Chinese product names, descriptions, and tags to English
 */

import { Product } from '@shared/models';
import mongoose from 'mongoose';

// Translation dictionary - same as client/src/lib/product-translator.ts
const productTerms: { [key: string]: string } = {
  // Brands
  '使臣': 'Royal Canin',
  '宠吉喜': 'Happy Leap',
  '洁馨': 'Sheba',
  '洁荷': 'Clean Lotus',
  '猫跳进': 'Cat Leap',
  '妙鲜': 'Meow Fresh',
  
  // Animal types & sizes
  '猫粮': 'Cat Food',
  '狗粮': 'Dog Food',
  '犬粮': 'Dog Food',
  '猫罐头': 'Cat Canned Food',
  '狗罐头': 'Dog Canned Food',
  '犬罐头': 'Dog Canned Food',
  '湿粮': 'Wet Food',
  '干粮': 'Dry Food',
  '粮': 'Food',
  
  // Cat & Dog
  '猫': 'Cat',
  '狗': 'Dog',
  '犬': 'Dog',
  '小猫': 'Kitten',
  '幼猫': 'Kitten',
  '幼': 'Young',
  '成猫': 'Adult Cat',
  '小型犬': 'Small Dog',
  '大型犬': 'Large Dog',
  '小狗': 'Puppy',
  '小犬': 'Small Dog',
  '成': 'Adult',
  '中型': 'Medium',
  '幼犬': 'Puppy',
  '成犬': 'Adult Dog',
  '咪': 'Cat',
  
  // Breeds
  '波斯猫': 'Persian Cat',
  '英国短毛猫': 'British Shorthair',
  '英短': 'British Shorthair',
  '英国': 'British',
  '短毛猫': 'Shorthair',
  '泰迪贵宾': 'Poodle',
  '泰迪': 'Teddy',
  '贵宾': 'Poodle',
  '金毛': 'Golden Retriever',
  '法斗': 'French Bulldog',
  '拉布拉多': 'Labrador',
  '萨摩耶': 'Samoyed',
  
  // Flavors
  '鸡肉': 'Chicken',
  '牛肉': 'Beef',
  '鱼': 'Fish',
  '金枪鱼': 'Tuna',
  '三文鱼': 'Salmon',
  '海鲜': 'Seafood',
  '蔬菜': 'Vegetables',
  '绿茶': 'Green Tea',
  '桃子': 'Peach',
  '原': 'Original',
  '紫薯': 'Purple Sweet Potato',
  
  // Food characteristics
  '专用粮': 'Specialized Food',
  '专用': 'Specialized',
  '主粮': 'Main Food',
  '零食': 'Treats',
  '活干': 'Treats',
  '奶糕': 'Puppy Formula',
  '营养': 'Nutrition',
  '天然': 'Natural',
  '有机': 'Organic',
  '无谷物': 'Grain-Free',
  '无谷': 'Grain-Free',
  '配方': 'Formula',
  '食材': 'Ingredients',
  '适合': 'Suitable for',
  '敏感': 'Sensitive',
  '狗狗': 'Dogs',
  '低敏': 'Hypoallergenic',
  '全面': 'Complete',
  '全阶段': 'All Life Stages',
  '促进': 'Promotes',
  '活力': 'Vitality',
  '增强': 'Enhances',
  '免疫力': 'Immunity',
  '针对': 'For',
  '体质': 'Physique',
  '研发': 'Developed',
  '强健': 'Strengthens',
  '骨骼': 'Bones',
  '和': 'and',
  '肌肉': 'Muscles',
  '控制': 'Controls',
  '控重': 'Weight Control',
  '体重': 'Weight',
  '减肥': 'Weight Loss',
  '化毛球': 'Hairball Control',
  '化毛': 'Hairball',
  '毛球': 'Hairball',
  '洁齿': 'Dental Care',
  '湿': 'Wet',
  '优质': 'Premium',
  '室内': 'Indoor',
  '室内猫': 'Indoor Cat',
  '冻干': 'Freeze-Dried',
  
  // Toys & Accessories
  '玩具': 'Toy',
  '球': 'Ball',
  '棒': 'Wand',
  '套装': 'Set',
  '件套': 'Piece Set',
  '个装': 'Pack',
  '配件': 'Accessories',
  '用品': 'Supplies',
  '护理': 'Care',
  '健康': 'Health',
  '逗': 'Teaser',
  '薄荷': 'Catnip',
  '猫薄荷': 'Catnip',
  '混合装': 'Mixed Pack',
  '混合': 'Mixed',
  '装': 'Pack',
  
  // Equipment
  '饮水机': 'Water Fountain',
  '自动饮水机': 'Automatic Water Fountain',
  '自动': 'Automatic',
  '喂食器': 'Feeder',
  '自动喂食器': 'Automatic Feeder',
  '智能版': 'Smart Version',
  '智能': 'Smart',
  '版': 'Version',
  '盆': 'Box',
  '盘': 'Pan',
  '封闭式': 'Enclosed',
  '封闭': 'Closed',
  '大号': 'Large',
  '中号': 'Medium',
  '小号': 'Small',
  '指甲剪': 'Nail Clipper',
  '指甲': 'Nail',
  '剪': 'Clipper',
  '专业级': 'Professional Grade',
  '专业': 'Professional',
  '级': 'Grade',
  
  // Cat Litter
  '膨润土': 'Bentonite',
  '豆腐砂': 'Tofu Litter',
  '豆腐': 'Tofu',
  '水晶砂': 'Crystal Litter',
  '水晶': 'Crystal',
  '松木砂': 'Pine Litter',
  '松木': 'Pine Wood',
  '活性炭': 'Activated Carbon',
  '砂': 'Litter',
  
  // Packaging
  '罐装': 'Canned',
  '袋装': 'Bagged',
  '罐': 'cans',
  '包': 'pack',
  '布': 'Pouch',
  '袋': 'Bag',
  
  // Others
  '喜跃': 'Happy Leap',
  '老年': 'Senior',
  '淘': '',
  '宠物': 'Pet',
  '绝育': 'Neutered',
  '白': 'White',
  '冬季': 'Winter',
  '冬': 'Winter',
  '保暖': 'Warm',
  '窝': 'Bed',
  '加厚': 'Thickened',
  '款': 'Style',
  '外出': 'Outdoor',
  '背': 'Backpack',
  '双肩': 'Shoulder',
  '磨牙': 'Dental',
  '礼盒': 'Gift Box',
  '支': 'pieces',
  '牵引绳': 'Leash',
  '反光': 'Reflective',
  '去泪痕液': 'Tear Stain Remover',
  '去': 'Remove',
  '泪痕': 'Tear Stain',
  '液': 'Solution',
  '洗澡': 'Bath',
  '防抓': 'Anti-Scratch',
  '固定': 'Fixed',
  '旋转': 'Rotating',
  '轨道': 'Track',
  '衣服': 'Clothes',
  '油': 'Oil',
  '胶囊': 'Capsules',
  '粒': 'pills',
  '膏': 'Paste',
  '羽毛': 'Feather',
  '爬架': 'Climbing Tower',
  '抓板': 'Scratching Post',
  '鸟类': 'Bird',
  '滋补丸': 'Supplement Pills',
  '提摩西草': 'Timothy Hay',
  '提摩西': 'Timothy',
  '草': 'Hay',
  '兔窝': 'Rabbit Hutch',
  '兔': 'Rabbit',
  '笼子': 'Cage',
  '双层': 'Double Layer',
  '海': 'Ocean',
  '糙米': 'Brown Rice',
  '米': 'Rice',
  '小颗粒': 'Small Kibble',
  '颗粒': 'Kibble',
  '设计': 'Design',
  '咀嚼': 'Chewing',
  '浓缩': 'Concentrated',
  '能量': 'Energy',
  '充足': 'Sufficient',
  '专为': 'Specially for',
  '年龄段': 'Age Stage',
  '年龄': 'Age',
  '均衡': 'Balanced',
  '富含': 'Rich in',
  '帮助': 'Helps',
  '高品质': 'High Quality',
  '高': 'High',
  '品质': 'Quality',
  '含有': 'Contains',
  '必需': 'Essential',
  '脂肪酸': 'Fatty Acids',
  '蛋白质': 'Protein',
  '蛋白': 'Protein',
  '所有': 'All',
  '的': '',
  '各类': 'Various',
  '真实': 'Real',
  '真': 'Real',
  '口感': 'Taste',
  '鲜美': 'Delicious',
  '丰富': 'Rich',
  '美味': 'Tasty',
  '新鲜': 'Fresh',
  '纯肉': 'Pure Meat',
  '纯': 'Pure',
  '肉': 'Meat',
  '训练': 'Training',
  '奖励': 'Reward',
  '首选': 'First Choice',
  '无': 'No',
  '手工': 'Handmade',
  '制作': 'Made',
  '定时': 'Timed',
  '定量': 'Measured',
  '出差': 'Travel',
  '忧': 'Worry',
  '干': 'Dried',
  '红外': 'Infrared',
  '激光': 'Laser',
  '笔': 'Pen',
  '害': 'Harm',
  '互动': 'Interactive',
  '娱乐': 'Entertainment',
  '消耗': 'Consume',
  '精力': 'Energy',
  '硅胶': 'Silicone',
  '吸水': 'Water Absorption',
  '尘': 'Dust',
  '用量': 'Dosage',
  '省': 'Save',
  '温': 'Warm',
  '和': 'and',
  '擦拭': 'Wipe',
  '随时': 'Anytime',
  '方便': 'Convenient',
  '卫生': 'Hygienic',
  '酒精': 'Alcohol',
  '秋千': 'Swing',
  '铃铛': 'Bell',
  '镜子': 'Mirror',
  '等': 'etc',
  '鸟儿': 'Bird',
  '生活': 'Life',
  '缓解': 'Relieve',
  '聊': 'Boredom',
  '巾': 'Wipe',
  '增进': 'Enhance',
  '感情': 'Relationship',
  '洗护': 'Shampoo & Care',
  '肌肤': 'Skin',
  '循环': 'Circulation',
  '过滤': 'Filter',
  '户外': 'Outdoor',
  '锻炼': 'Exercise',
  '发声': 'Sound',
  '分离': 'Separation',
  '焦虑': 'Anxiety',
  '耐咬': 'Bite-resistant',
  '结实': 'Sturdy',
  '拔河': 'Tug of War',
  '持久': 'Long-lasting',
  '留香': 'Lasting Fragrance',
  '污': 'Dirt',
  '耳部': 'Ear',
  '疼痛': 'Pain',
  '眼部': 'Eye Area',
  '不适': 'Discomfort',
  '眼睛': 'Eyes',
  '感染': 'Infection',
  '项圈': 'Collar',
  '结团': 'Clumping',
  '可冲厕': 'Flushable',
  '豆渣': 'Bean Residue',
  '极少': 'Minimal',
  '甜': 'Sweet',
  '香': 'Fragrance',
  '纸质': 'Paper',
  '轻便': 'Lightweight',
  '术后': 'Post-surgery',
  '运行': 'Operation',
  '粗绳': 'Thick Rope',
  '文鸟': 'Java Sparrow',
  '金丝雀': 'Canary',
  '食': 'Eat',
  '喂食': 'Feed',
  '飞': 'Flying',
  '吸水性': 'Water Absorbency',
  '强': 'Strong',
  '性价比': 'Value',
  '易消化': 'Easy to Digest',
  '易': 'Easy',
  '消化': 'Digest',
  '配制': 'Formulated',
  '低脂': 'Low Fat',
  '防止': 'Prevents',
  '肥胖': 'Obesity',
  '添加': 'Added',
  '特别': 'Specially',
  '研制': 'Formulated',
  '呵护': 'Care for',
  '肠胃': 'Digestive System',
  '美毛': 'Coat Beauty',
  '毛发': 'Coat',
  '梳毛器': 'Grooming Brush',
  '梳毛': 'Grooming',
  '梳': 'Comb',
  '除毛': 'Hair Removal',
  '除': 'Remove',
  '浮毛': 'Loose Hair',
  '浮': 'Loose',
  '掉毛': 'Shedding',
  '掉': 'Shed',
  '神器': 'Tool',
  '减少': 'Reduce',
  '按摩': 'Massage',
  '皮肤': 'Skin',
  '一键': 'One-Click',
  '清理': 'Clean',
  '亮丽': 'Shiny',
  '亮泽': 'Glossy',
  '保持': 'Maintain',
  '体态': 'Body Shape',
  '维持': 'Maintain',
  '理想': 'Ideal',
  '关节': 'Joint',
  '保健': 'Health Care',
  '强化': 'Strengthen',
  '预防': 'Prevent',
  '特殊': 'Special',
  '容易': 'Easy',
  '皮肤': 'Skin',
  '多种': 'Multiple',
  '口味': 'Flavors',
  '款式': 'Styles',
  '材质': 'Material',
  '安全': 'Safe',
  '无毒': 'Non-toxic',
  '柔软': 'Soft',
  '舒适': 'Comfortable',
  '透气': 'Breathable',
  '易清洁': 'Easy to Clean',
  '易清洗': 'Easy to Wash',
  '清洁': 'Clean',
  '清洗': 'Wash',
  '温和': 'Gentle',
  '无刺激': 'Non-irritating',
  '健康': 'Health',
  '成长': 'Growth',
  '发育': 'Development',
  '大脑': 'Brain',
  '反应': 'Response',
  '能力': 'Ability',
  '排出': 'Remove',
  '保护': 'Protects',
  '肠道': 'Digestive Tract',
  '适口性': 'Palatability',
  '适口': 'Palatable',
  '好': 'Good',
  '性': '',
  '身体': 'Body',
  '必备': 'Essential',
  '透气': 'Breathable',
  '网': 'Mesh',
  // Additional description words
  '年': '',
  '岁': 'years',
  '以上': 'and above',
  '个月': 'months',
  '专为': 'Specially for',
  '为': 'for',
  '设计': 'Design',
  '研制': 'Formulated',
  '配制': 'Formulated',
  '特别': 'Specially',
  '特别为': 'Specially for',
  '针对': 'For',
  '适用': 'Suitable',
  '适合': 'Suitable for',
  '的': '',
  '含有': 'Contains',
  '富含': 'Rich in',
  '添加': 'Added',
  '帮助': 'Helps',
  '有效': 'Effective',
  '安全': 'Safe',
  '天然': 'Natural',
  '温和': 'Gentle',
  '易': 'Easy',
  '容易': 'Easy',
  '预防': 'Prevent',
  '促进': 'Promotes',
  '增强': 'Enhances',
  '强化': 'Strengthen',
  '维持': 'Maintain',
  '保持': 'Maintain',
  '改善': 'Improve',
  '修复': 'Repair',
  '调理': 'Regulate',
  '保护': 'Protects',
  '呵护': 'Care for',
  '清洁': 'Clean',
  '清洗': 'Wash',
  '易清洁': 'Easy to Clean',
  '易清洗': 'Easy to Wash',
  '消化': 'Digest',
  '易消化': 'Easy to Digest',
  '营养': 'Nutrition',
  '全面': 'Complete',
  '均衡': 'Balanced',
  '高纤维': 'High Fiber',
  '高': 'High',
  '低脂': 'Low Fat',
  '低': 'Low',
  '抗氧化': 'Antioxidant',
  '抗菌': 'Antibacterial',
  '除臭': 'Deodorizing',
  '防溅': 'Splash-proof',
  '防打翻': 'Non-tip',
  '防滑': 'Non-slip',
  '防水': 'Waterproof',
  '透气': 'Breathable',
  '柔软': 'Soft',
  '舒适': 'Comfortable',
  '耐用': 'Durable',
  '锋利': 'Sharp',
  '静音': 'Quiet',
  '超强': 'Super',
  '强力': 'Strong',
  '快速': 'Fast',
  '长效': 'Long-lasting',
  '安全': 'Safe',
  '无毒': 'Non-toxic',
  '无刺激': 'Non-irritating',
  '无添加': 'No Additives',
  '无泪': 'Tear-free',
  '环保': 'Eco-friendly',
  '可拆洗': 'Removable and Washable',
  '可折叠': 'Foldable',
  '可调节': 'Adjustable',
  '便携': 'Portable',
  '实用': 'Practical',
  '时尚': 'Fashionable',
  '美观': 'Beautiful',
  '可爱': 'Cute',
  '精致': 'Delicate',
  '大容量': 'Large Capacity',
  '大空间': 'Large Space',
  '节省空间': 'Space-saving',
  '多层': 'Multi-layer',
  '多通道': 'Multi-channel',
  '多色可选': 'Multiple Colors',
  '多种': 'Multiple',
  '多': 'Multiple',
  '尺寸': 'Size',
  '尺码': 'Size',
  '尺码可选': 'Multiple Sizes',
  '四季': 'All Season',
  '通用': 'Universal',
  '专用': 'Specialized',
  '专用粮': 'Specialized Food',
  '适用': 'Suitable',
  '全阶段': 'All Life Stages',
  '全': 'All',
  '段': 'Stage',
  '阶段': 'Life Stage',
  '年龄': 'Age',
  '年龄段': 'Age Stage',
  '各类': 'Various',
  '小颗粒': 'Small Kibble',
  '颗粒': 'Kibble',
  '小': 'Small',
  '大型': 'Large',
  '中型': 'Medium',
  '小型': 'Small',
  '浓缩': 'Concentrated',
  '能量': 'Energy',
  '充足': 'Sufficient',
  '足够': 'Sufficient',
  '强健': 'Strengthens',
  '骨骼': 'Bones',
  '肌肉': 'Muscles',
  '关节': 'Joint',
  '体重': 'Weight',
  '控制': 'Controls',
  '减重': 'Weight Loss',
  '减肥': 'Weight Loss',
  '肥胖': 'Obesity',
  '防止': 'Prevents',
  '预防': 'Prevent',
  '免疫力': 'Immunity',
  '免疫力增强': 'Immune System Support',
  '活力': 'Vitality',
  '健康': 'Health',
  '保健': 'Health Care',
  '护理': 'Care',
  '美容': 'Grooming',
  '美毛': 'Coat Beauty',
  '美': 'Beautiful',
  '毛发': 'Coat',
  '亮丽': 'Shiny',
  '亮泽': 'Glossy',
  '亮': 'Shiny',
  '皮肤': 'Skin',
  '心脏': 'Heart',
  '肝脏': 'Liver',
  '肠胃': 'Digestive System',
  '肠道': 'Digestive Tract',
  '泌尿系统': 'Urinary System',
  '代谢': 'Metabolism',
  '牙病': 'Dental Disease',
  '牙结石': 'Dental Calculus',
  '耳螨': 'Ear Mites',
  '寄生虫': 'Parasites',
  '跳蚤': 'Fleas',
  '虱子': 'Lice',
  '驱虫': 'Deworming',
  '体内': 'Internal',
  '体外': 'External',
  '滴剂': 'Spot-on',
  '药': 'Medicine',
  '片': 'Tablets',
  '胶囊': 'Capsules',
  '粉': 'Powder',
  '膏': 'Paste',
  '液': 'Solution',
  '丸': 'Pills',
  '粒': 'pills',
  '支': 'pieces',
  '抽': 'sheets',
  '罐': 'cans',
  '包': 'pack',
  '袋': 'Bag',
  '盒': 'Box',
  '套': 'Set',
  '件': 'piece',
  '个': '',
  '装': 'Pack',
  '克': 'g',
  '千克': 'kg',
  '公斤': 'kg',
  '升': 'L',
  '毫升': 'ml',
  '毫克': 'mg',
};

/**
 * Translate Chinese text to English
 */
function translateText(chineseText: string): string {
  if (!chineseText) return chineseText;
  
  let translated = chineseText;
  
  // Sort by length (longer terms first)
  const sortedTerms = Object.entries(productTerms).sort((a, b) => b[0].length - a[0].length);
  
  // Replace each Chinese term
  for (const [chinese, english] of sortedTerms) {
    if (translated.includes(chinese) && english) {
      translated = translated.replace(new RegExp(chinese, 'g'), english);
    }
  }
  
  // Clean up punctuation and spacing
  translated = translated
    // Replace Chinese punctuation with English
    .replace(/，/g, ', ')
    .replace(/。/g, '. ')
    .replace(/、/g, ', ')
    .replace(/；/g, '; ')
    .replace(/：/g, ': ')
    // Add space between consecutive capitalized words (e.g., AntiScratch -> Anti Scratch)
    .replace(/([A-Z][a-z]+)([A-Z])/g, '$1 $2')
    // Add space between uppercase and lowercase (e.g., NaturalFormula -> Natural Formula)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Add space before capitalized words at start of sentence
    .replace(/^([A-Z][a-z]+)([A-Z][a-z]+)/g, '$1 $2')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Remove leading/trailing spaces
    .trim();
  
  return translated;
}

/**
 * Generate URL-friendly slug from translated text
 */
function generateSlug(text: string): string {
  if (!text) return text;
  
  // First translate the text
  const translated = translateText(text);
  
  // Convert to lowercase and create slug
  return translated
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, '-')         // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')             // Trim hyphens from start
    .replace(/-+$/, '');            // Trim hyphens from end
}

/**
 * Main translation function
 */
async function translateAllProducts() {
  try {
    console.log('🚀 Starting product translation...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/petshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to translate\n`);
    
    let translatedCount = 0;
    let skippedCount = 0;
    
    // Track used slugs to avoid duplicates
    const usedSlugs = new Set<string>();
    
    // Translate each product
    for (const product of products) {
      const originalName = product.name;
      const originalSlug = product.slug;
      const originalDescription = product.description;
      const originalTags = product.tags || [];
      
      // Translate name
      const translatedName = translateText(originalName);
      
      // Generate English slug from translated name
      let translatedSlug = generateSlug(translatedName);
      
      // Ensure slug is unique by appending product ID if duplicate
      if (usedSlugs.has(translatedSlug)) {
        translatedSlug = `${translatedSlug}-${product._id.toString().slice(-6)}`;
      }
      usedSlugs.add(translatedSlug);
      
      // Translate description
      const translatedDescription = originalDescription 
        ? translateText(originalDescription) 
        : '';
      
      // Translate tags
      const translatedTags = originalTags.map(tag => translateText(tag));
      
      // Check if anything changed
      const hasChanges = 
        translatedName !== originalName ||
        translatedSlug !== originalSlug ||
        translatedDescription !== originalDescription ||
        JSON.stringify(translatedTags) !== JSON.stringify(originalTags);
      
      if (hasChanges) {
        // Update product
        product.name = translatedName;
        product.slug = translatedSlug;
        if (translatedDescription) {
          product.description = translatedDescription;
        }
        product.tags = translatedTags;
        
        try {
          await product.save();
          
          console.log(`✅ Translated:`);
          console.log(`   Name: ${originalName} → ${translatedName}`);
          console.log(`   Slug: ${originalSlug} → ${translatedSlug}`);
          if (originalDescription !== translatedDescription) {
            console.log(`   Desc: ${originalDescription.substring(0, 40)}... → ${translatedDescription.substring(0, 40)}...`);
          }
          console.log('');
          translatedCount++;
        } catch (error: any) {
          // If still duplicate slug error, append timestamp
          if (error.code === 11000) {
            translatedSlug = `${translatedSlug}-${Date.now()}`;
            product.slug = translatedSlug;
            await product.save();
            
            console.log(`✅ Translated (with unique suffix):`);
            console.log(`   Name: ${originalName} → ${translatedName}`);
            console.log(`   Slug: ${originalSlug} → ${translatedSlug}`);
            console.log('');
            translatedCount++;
          } else {
            throw error;
          }
        }
      } else {
        skippedCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Translation Complete!');
    console.log('='.repeat(60));
    console.log(`✅ Translated: ${translatedCount} products`);
    console.log(`⏭️  Skipped: ${skippedCount} products (already in English)`);
    console.log(`📊 Total: ${products.length} products`);
    console.log('='.repeat(60) + '\n');
    
    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run translation
translateAllProducts();

