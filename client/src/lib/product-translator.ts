// Product content translator
// Translates Chinese product names and descriptions to other languages

type Language = 'en' | 'zh' | 'fr' | 'ja' | 'ko';

interface TranslationMap {
  [key: string]: {
    en: string;
    zh: string;
    fr: string;
    ja: string;
    ko: string;
  };
}

// Common product terms translations
const productTerms: TranslationMap = {
  // Brands (keep as-is, just for reference)
  'Royal Canin': { en: 'Royal Canin', zh: 'Royal Canin', fr: 'Royal Canin', ja: 'Royal Canin', ko: 'Royal Canin' },
  'NEKKO': { en: 'NEKKO', zh: 'NEKKO', fr: 'NEKKO', ja: 'NEKKO', ko: 'NEKKO' },
  'Sheba': { en: 'Sheba', zh: 'Sheba', fr: 'Sheba', ja: 'Sheba', ko: 'Sheba' },
  'ONE': { en: 'ONE', zh: 'ONE', fr: 'ONE', ja: 'ONE', ko: 'ONE' },
  
  // Product types
  '猫粮': { en: 'Cat Food', zh: '猫粮', fr: 'Nourriture pour Chats', ja: 'キャットフード', ko: '고양이 사료' },
  '狗粮': { en: 'Dog Food', zh: '狗粮', fr: 'Nourriture pour Chiens', ja: 'ドッグフード', ko: '강아지 사료' },
  '犬粮': { en: 'Dog Food', zh: '犬粮', fr: 'Nourriture pour Chiens', ja: 'ドッグフード', ko: '강아지 사료' },
  '猫罐头': { en: 'Cat Canned Food', zh: '猫罐头', fr: 'Pâtée pour Chats', ja: '猫缶', ko: '고양이 캔' },
  '狗罐头': { en: 'Dog Canned Food', zh: '狗罐头', fr: 'Pâtée pour Chiens', ja: '犬缶', ko: '강아지 캔' },
  '犬罐头': { en: 'Dog Canned Food', zh: '犬罐头', fr: 'Pâtée pour Chiens', ja: '犬缶', ko: '강아지 캔' },
  '湿粮': { en: 'Wet Food', zh: '湿粮', fr: 'Nourriture Humide', ja: 'ウェットフード', ko: '습식 사료' },
  '干粮': { en: 'Dry Food', zh: '干粮', fr: 'Croquettes', ja: 'ドライフード', ko: '건식 사료' },
  '粮': { en: 'Food', zh: '粮', fr: 'Nourriture', ja: 'フード', ko: '사료' },
  
  // Animal types
  '猫': { en: 'Cat', zh: '猫', fr: 'Chat', ja: '猫', ko: '고양이' },
  '狗': { en: 'Dog', zh: '狗', fr: 'Chien', ja: '犬', ko: '강아지' },
  '犬': { en: 'Dog', zh: '犬', fr: 'Chien', ja: '犬', ko: '강아지' },
  '小猫': { en: 'Kitten', zh: '小猫', fr: 'Chaton', ja: '子猫', ko: '새끼 고양이' },
  '幼猫': { en: 'Kitten', zh: '幼猫', fr: 'Chaton', ja: '子猫', ko: '새끼 고양이' },
  '幼': { en: 'Young', zh: '幼', fr: 'Jeune', ja: '幼', ko: '어린' },
  '成猫': { en: 'Adult Cat', zh: '成猫', fr: 'Chat Adulte', ja: '成猫', ko: '성묘' },
  '小型犬': { en: 'Small Dog', zh: '小型犬', fr: 'Petit Chien', ja: '小型犬', ko: '소형견' },
  '大型犬': { en: 'Large Dog', zh: '大型犬', fr: 'Grand Chien', ja: '大型犬', ko: '대형견' },
  '小狗': { en: 'Puppy', zh: '小狗', fr: 'Chiot', ja: '子犬', ko: '강아지' },
  '小犬': { en: 'Small Dog', zh: '小犬', fr: 'Petit Chien', ja: '小型犬', ko: '소형견' },
  '成': { en: 'Adult', zh: '成', fr: 'Adulte', ja: '成', ko: '성' },
  '中型': { en: 'Medium', zh: '中型', fr: 'Moyen', ja: '中型', ko: '중형' },
  '无谷': { en: 'Grain-Free', zh: '无谷', fr: 'Sans Céréales', ja: 'グレインフリー', ko: '그레인 프리' },
  '泰迪贵宾': { en: 'Poodle', zh: '泰迪贵宾', fr: 'Caniche', ja: 'プードル', ko: '푸들' },
  '泰迪': { en: 'Teddy', zh: '泰迪', fr: 'Teddy', ja: 'テディ', ko: '테디' },
  '贵宾': { en: 'Poodle', zh: '贵宾', fr: 'Caniche', ja: 'プードル', ko: '푸들' },
  '金毛': { en: 'Golden Retriever', zh: '金毛', fr: 'Golden Retriever', ja: 'ゴールデンレトリバー', ko: '골든 리트리버' },
  '法斗': { en: 'French Bulldog', zh: '法斗', fr: 'Bouledogue Français', ja: 'フレンチブルドッグ', ko: '프렌치 불독' },
  '拉布拉多': { en: 'Labrador', zh: '拉布拉多', fr: 'Labrador', ja: 'ラブラドール', ko: '래브라도' },
  '萨摩耶': { en: 'Samoyed', zh: '萨摩耶', fr: 'Samoyède', ja: 'サモエド', ko: '사모예드' },
  
  // Cat breeds
  '波斯猫': { en: 'Persian Cat', zh: '波斯猫', fr: 'Persan', ja: 'ペルシャ猫', ko: '페르시안 고양이' },
  '英国短毛猫': { en: 'British Shorthair', zh: '英国短毛猫', fr: 'British Shorthair', ja: 'ブリティッシュショートヘア', ko: '브리티시 쇼트헤어' },
  '英短': { en: 'British Shorthair', zh: '英短', fr: 'British Shorthair', ja: 'ブリティッシュショートヘア', ko: '브리티시 쇼트헤어' },
  '英国': { en: 'British', zh: '英国', fr: 'Britannique', ja: 'イギリス', ko: '영국' },
  '短毛猫': { en: 'Shorthair', zh: '短毛猫', fr: 'Poil Court', ja: '短毛種', ko: '단모종' },
  '使臣': { en: 'Royal Canin', zh: '使臣', fr: 'Royal Canin', ja: 'ロイヤルカナン', ko: '로얄캐닌' },
  '宠吉喜': { en: 'Happy Leap', zh: '宠吉喜', fr: 'Happy Leap', ja: 'ハッピーリープ', ko: '해피 립' },
  '洁馨': { en: 'Sheba', zh: '洁馨', fr: 'Sheba', ja: 'シーバ', ko: '시바' },
  '洁荷': { en: 'Clean Lotus', zh: '洁荷', fr: 'Lotus Propre', ja: 'クリーンロータス', ko: '클린 로터스' },
  '猫跳进': { en: 'Cat Leap', zh: '猫跳进', fr: 'Saut de Chat', ja: 'キャットリープ', ko: '캣 립' },
  
  // Flavors
  '鸡肉': { en: 'Chicken', zh: '鸡肉', fr: 'Poulet', ja: 'チキン', ko: '치킨' },
  '牛肉': { en: 'Beef', zh: '牛肉', fr: 'Bœuf', ja: 'ビーフ', ko: '소고기' },
  '鱼': { en: 'Fish', zh: '鱼', fr: 'Poisson', ja: '魚', ko: '생선' },
  '金枪鱼': { en: 'Tuna', zh: '金枪鱼', fr: 'Thon', ja: 'ツナ', ko: '참치' },
  '三文鱼': { en: 'Salmon', zh: '三文鱼', fr: 'Saumon', ja: 'サーモン', ko: '연어' },
  '海鲜': { en: 'Seafood', zh: '海鲜', fr: 'Fruits de Mer', ja: 'シーフード', ko: '해산물' },
  '蔬菜': { en: 'Vegetables', zh: '蔬菜', fr: 'Légumes', ja: '野菜', ko: '야채' },
  '绿茶': { en: 'Green Tea', zh: '绿茶', fr: 'Thé Vert', ja: '緑茶', ko: '녹차' },
  '桃子': { en: 'Peach', zh: '桃子', fr: 'Pêche', ja: '桃', ko: '복숭아' },
  '原': { en: 'Original', zh: '原', fr: 'Origine', ja: 'オリジナル', ko: '오리지널' },
  
  // Food characteristics
  '专用粮': { en: 'Specialized Food', zh: '专用粮', fr: 'Alimentation Spécialisée', ja: '専用フード', ko: '전용 사료' },
  '专用': { en: 'Specialized', zh: '专用', fr: 'Spécialisé', ja: '専用', ko: '전용' },
  '主粮': { en: 'Main Food', zh: '主粮', fr: 'Alimentation Principale', ja: '主食', ko: '주식' },
  '零食': { en: 'Treats', zh: '零食', fr: 'Friandises', ja: 'おやつ', ko: '간식' },
  '奶糕': { en: 'Puppy Formula', zh: '奶糕', fr: 'Formule Chiot', ja: 'パピーフォーミュラ', ko: '퍼피 포뮬러' },
  '营养': { en: 'Nutrition', zh: '营养', fr: 'Nutrition', ja: '栄養', ko: '영양' },
  '天然': { en: 'Natural', zh: '天然', fr: 'Naturel', ja: '天然', ko: '천연' },
  '有机': { en: 'Organic', zh: '有机', fr: 'Bio', ja: 'オーガニック', ko: '유기농' },
  '无谷物': { en: 'Grain-Free', zh: '无谷物', fr: 'Sans Céréales', ja: 'グレインフリー', ko: '그레인 프리' },
  '配方': { en: 'Formula', zh: '配方', fr: 'Formule', ja: 'フォーミュラ', ko: '포뮬러' },
  '食材': { en: 'Ingredients', zh: '食材', fr: 'Ingrédients', ja: '食材', ko: '식재료' },
  '适合': { en: 'Suitable for', zh: '适合', fr: 'Convient pour', ja: '適合', ko: '적합' },
  '敏感': { en: 'Sensitive', zh: '敏感', fr: 'Sensible', ja: '敏感', ko: '민감' },
  '狗狗': { en: 'Dogs', zh: '狗狗', fr: 'Chiens', ja: '犬', ko: '강아지들' },
  '低敏': { en: 'Hypoallergenic', zh: '低敏', fr: 'Hypoallergénique', ja: '低アレルギー', ko: '저알레르기' },
  '全面': { en: 'Complete', zh: '全面', fr: 'Complet', ja: '全面的', ko: '완전한' },
  '全阶段': { en: 'All Life Stages', zh: '全阶段', fr: 'Tous les Stades', ja: '全ライフステージ', ko: '전연령' },
  '促进': { en: 'Promotes', zh: '促进', fr: 'Favorise', ja: '促進', ko: '촉진' },
  '活力': { en: 'Vitality', zh: '活力', fr: 'Vitalité', ja: '活力', ko: '활력' },
  '增强': { en: 'Enhances', zh: '增强', fr: 'Renforce', ja: '強化', ko: '강화' },
  '免疫力': { en: 'Immunity', zh: '免疫力', fr: 'Immunité', ja: '免疫力', ko: '면역력' },
  '针对': { en: 'For', zh: '针对', fr: 'Pour', ja: '向け', ko: '대상' },
  '体质': { en: 'Physique', zh: '体质', fr: 'Constitution', ja: '体質', ko: '체질' },
  '研发': { en: 'Developed', zh: '研发', fr: 'Développé', ja: '開発', ko: '개발' },
  '强健': { en: 'Strengthens', zh: '强健', fr: 'Renforce', ja: '強化', ko: '강화' },
  '骨骼': { en: 'Bones', zh: '骨骼', fr: 'Os', ja: '骨格', ko: '골격' },
  '和': { en: 'and', zh: '和', fr: 'et', ja: 'と', ko: '그리고' },
  '肌肉': { en: 'Muscles', zh: '肌肉', fr: 'Muscles', ja: '筋肉', ko: '근육' },
  '控制': { en: 'Controls', zh: '控制', fr: 'Contrôle', ja: 'コントロール', ko: '제어' },
  '控重': { en: 'Weight Control', zh: '控重', fr: 'Contrôle du Poids', ja: '体重管理', ko: '체중 관리' },
  '体重': { en: 'Weight', zh: '体重', fr: 'Poids', ja: '体重', ko: '체중' },
  '减肥': { en: 'Weight Loss', zh: '减肥', fr: 'Perte de Poids', ja: 'ダイエット', ko: '다이어트' },
  '化毛球': { en: 'Hairball Control', zh: '化毛球', fr: 'Contrôle des Boules de Poils', ja: '毛玉ケア', ko: '헤어볼 케어' },
  '化毛': { en: 'Hairball', zh: '化毛', fr: 'Boule de Poils', ja: '毛玉', ko: '헤어볼' },
  '毛球': { en: 'Hairball', zh: '毛球', fr: 'Boule de Poils', ja: '毛玉', ko: '헤어볼' },
  '洁齿': { en: 'Dental Care', zh: '洁齿', fr: 'Soins Dentaires', ja: 'デンタルケア', ko: '치아 관리' },
  '湿': { en: 'Wet', zh: '湿', fr: 'Humide', ja: 'ウェット', ko: '습식' },
  '活干': { en: 'Treats', zh: '活干', fr: 'Friandises', ja: 'おやつ', ko: '간식' },
  '紫薯': { en: 'Purple Sweet Potato', zh: '紫薯', fr: 'Patate Douce Violette', ja: '紫芋', ko: '자색 고구마' },
  
  // Flavors and ingredients
  '鲜味': { en: 'Flavor', zh: '鲜味', fr: 'Saveur', ja: '風味', ko: '맛' },
  '味': { en: 'Flavor', zh: '味', fr: 'Saveur', ja: '味', ko: '맛' },
  '纯肉': { en: 'Pure Meat', zh: '纯肉', fr: 'Viande Pure', ja: '純肉', ko: '순수 고기' },
  '纯': { en: 'Pure', zh: '纯', fr: 'Pur', ja: '純', ko: '순수한' },
  '肉': { en: 'Meat', zh: '肉', fr: 'Viande', ja: '肉', ko: '고기' },
  '训练': { en: 'Training', zh: '训练', fr: 'Entraînement', ja: 'トレーニング', ko: '훈련' },
  '奖励': { en: 'Reward', zh: '奖励', fr: 'Récompense', ja: 'ご褒美', ko: '보상' },
  '首选': { en: 'First Choice', zh: '首选', fr: 'Premier Choix', ja: '第一選択', ko: '최고의 선택' },
  '无': { en: 'No', zh: '无', fr: 'Sans', ja: 'なし', ko: '없음' },
  '洋': { en: 'Ocean', zh: '洋', fr: 'Océan', ja: 'オーシャン', ko: '오션' },
  
  // Quantities and packaging
  '罐装': { en: 'Canned', zh: '罐装', fr: 'En Boîte', ja: '缶詰', ko: '캔' },
  '袋装': { en: 'Bagged', zh: '袋装', fr: 'En Sachet', ja: '袋入り', ko: '봉지' },
  'kg': { en: 'kg', zh: 'kg', fr: 'kg', ja: 'kg', ko: 'kg' },
  'g': { en: 'g', zh: 'g', fr: 'g', ja: 'g', ko: 'g' },
  '罐': { en: 'cans', zh: '罐', fr: 'boîtes', ja: '缶', ko: '캔' },
  '包': { en: 'pack', zh: '包', fr: 'paquet', ja: 'パック', ko: '팩' },
  '布': { en: 'Pouch', zh: '布', fr: 'Sachet', ja: 'パウチ', ko: '파우치' },
  '袋': { en: 'Bag', zh: '袋', fr: 'Sac', ja: '袋', ko: '봉지' },
  
  // Common words
  '喜跃': { en: 'Happy Leap', zh: '喜跃', fr: 'Joyeux Bond', ja: 'ハッピーリープ', ko: '해피 립' },
  '老年': { en: 'Senior', zh: '老年', fr: 'Senior', ja: 'シニア', ko: '시니어' },
  '幼犬': { en: 'Puppy', zh: '幼犬', fr: 'Chiot', ja: '子犬', ko: '강아지' },
  '成犬': { en: 'Adult Dog', zh: '成犬', fr: 'Chien Adulte', ja: '成犬', ko: '성견' },
  '淘': { en: '', zh: '淘', fr: '', ja: '', ko: '' },
  '玩具': { en: 'Toy', zh: '玩具', fr: 'Jouet', ja: 'おもちゃ', ko: '장난감' },
  '球': { en: 'Ball', zh: '球', fr: 'Balle', ja: 'ボール', ko: '공' },
  '棒': { en: 'Wand', zh: '棒', fr: 'Baguette', ja: '棒', ko: '막대' },
  '套装': { en: 'Set', zh: '套装', fr: 'Ensemble', ja: 'セット', ko: '세트' },
  '件套': { en: 'Piece Set', zh: '件套', fr: 'Pièces', ja: 'ピースセット', ko: '피스 세트' },
  '个装': { en: 'Pack', zh: '个装', fr: 'Paquet', ja: 'パック', ko: '팩' },
  '配件': { en: 'Accessories', zh: '配件', fr: 'Accessoires', ja: 'アクセサリー', ko: '액세서리' },
  '用品': { en: 'Supplies', zh: '用品', fr: 'Fournitures', ja: '用品', ko: '용품' },
  '护理': { en: 'Care', zh: '护理', fr: 'Soins', ja: 'ケア', ko: '케어' },
  '梳毛器': { en: 'Grooming Brush', zh: '梳毛器', fr: 'Brosse de Toilettage', ja: 'グルーミングブラシ', ko: '그루밍 브러시' },
  '梳毛': { en: 'Grooming', zh: '梳毛', fr: 'Toilettage', ja: 'グルーミング', ko: '그루밍' },
  '梳': { en: 'Comb', zh: '梳', fr: 'Peigne', ja: '櫛', ko: '빗' },
  '除毛': { en: 'Hair Removal', zh: '除毛', fr: 'Épilation', ja: '除毛', ko: '제모' },
  '除': { en: 'Remove', zh: '除', fr: 'Enlever', ja: '除去', ko: '제거' },
  '浮毛': { en: 'Loose Hair', zh: '浮毛', fr: 'Poils Lâches', ja: '浮き毛', ko: '엉킨 털' },
  '浮': { en: 'Loose', zh: '浮', fr: 'Lâche', ja: '浮く', ko: '느슨한' },
  '掉毛': { en: 'Shedding', zh: '掉毛', fr: 'Perte de Poils', ja: '抜け毛', ko: '털 빠짐' },
  '掉': { en: 'Shed', zh: '掉', fr: 'Tomber', ja: '落ちる', ko: '빠지다' },
  '神器': { en: 'Tool', zh: '神器', fr: 'Outil', ja: 'ツール', ko: '도구' },
  '减少': { en: 'Reduce', zh: '减少', fr: 'Réduire', ja: '減少', ko: '감소' },
  '按摩': { en: 'Massage', zh: '按摩', fr: 'Massage', ja: 'マッサージ', ko: '마사지' },
  '一键': { en: 'One-Click', zh: '一键', fr: 'Un Clic', ja: 'ワンクリック', ko: '원클릭' },
  '健康': { en: 'Health', zh: '健康', fr: 'Santé', ja: '健康', ko: '건강' },
  '成长': { en: 'Growth', zh: '成长', fr: 'Croissance', ja: '成長', ko: '성장' },
  '长': { en: 'Grow', zh: '长', fr: 'Croître', ja: '成長', ko: '성장' },
  '发育': { en: 'Development', zh: '发育', fr: 'Développement', ja: '発育', ko: '발육' },
  '大脑': { en: 'Brain', zh: '大脑', fr: 'Cerveau', ja: '脳', ko: '뇌' },
  '脑': { en: 'Brain', zh: '脑', fr: 'Cerveau', ja: '脳', ko: '뇌' },
  '易消化': { en: 'Easy to Digest', zh: '易消化', fr: 'Facile à Digérer', ja: '消化しやすい', ko: '소화가 쉬운' },
  '易': { en: 'Easy', zh: '易', fr: 'Facile', ja: '簡単', ko: '쉬운' },
  '消化': { en: 'Digest', zh: '消化', fr: 'Digérer', ja: '消化', ko: '소화' },
  '优质': { en: 'Premium', zh: '优质', fr: 'Premium', ja: 'プレミアム', ko: '프리미엄' },
  '室内': { en: 'Indoor', zh: '室内', fr: 'Intérieur', ja: '室内', ko: '실내' },
  '室内猫': { en: 'Indoor Cat', zh: '室内猫', fr: 'Chat d\'Intérieur', ja: '室内猫', ko: '실내 고양이' },
  '咪': { en: 'Cat', zh: '咪', fr: 'Chat', ja: '猫', ko: '고양이' },
  '逗': { en: 'Teaser', zh: '逗', fr: 'Jouet', ja: 'じゃらし', ko: '티저' },
  '薄荷': { en: 'Catnip', zh: '薄荷', fr: 'Herbe à Chat', ja: 'キャットニップ', ko: '캣닢' },
  '猫薄荷': { en: 'Catnip', zh: '猫薄荷', fr: 'Herbe à Chat', ja: 'キャットニップ', ko: '캣닢' },
  '冻干': { en: 'Freeze-Dried', zh: '冻干', fr: 'Lyophilisé', ja: 'フリーズドライ', ko: '동결건조' },
  '小颗粒': { en: 'Small Kibble', zh: '小颗粒', fr: 'Petites Croquettes', ja: '小粒', ko: '소립' },
  '颗粒': { en: 'Kibble', zh: '颗粒', fr: 'Croquettes', ja: '粒', ko: '알갱이' },
  '设计': { en: 'Design', zh: '设计', fr: 'Design', ja: 'デザイン', ko: '디자인' },
  '咀嚼': { en: 'Chewing', zh: '咀嚼', fr: 'Mastication', ja: '咀嚼', ko: '씹기' },
  '浓缩': { en: 'Concentrated', zh: '浓缩', fr: 'Concentré', ja: '濃縮', ko: '농축' },
  '能量': { en: 'Energy', zh: '能量', fr: 'Énergie', ja: 'エネルギー', ko: '에너지' },
  '充足': { en: 'Sufficient', zh: '充足', fr: 'Suffisant', ja: '十分', ko: '충분' },
  '专为': { en: 'Specially for', zh: '专为', fr: 'Spécialement pour', ja: '専用', ko: '전용' },
  '年龄段': { en: 'Age Stage', zh: '年龄段', fr: 'Stade d\'âge', ja: '年齢段階', ko: '연령단계' },
  '均衡': { en: 'Balanced', zh: '均衡', fr: 'Équilibré', ja: 'バランス', ko: '균형' },
  '富含': { en: 'Rich in', zh: '富含', fr: 'Riche en', ja: '豊富に含む', ko: '풍부한' },
  '促进': { en: 'Promotes', zh: '促进', fr: 'Favorise', ja: '促進', ko: '촉진' },
  '帮助': { en: 'Helps', zh: '帮助', fr: 'Aide', ja: '助ける', ko: '돕다' },
  '高品质': { en: 'High Quality', zh: '高品质', fr: 'Haute Qualité', ja: '高品質', ko: '고품질' },
  '高': { en: 'High', zh: '高', fr: 'Haut', ja: '高', ko: '고' },
  '品质': { en: 'Quality', zh: '品质', fr: 'Qualité', ja: '品質', ko: '품질' },
  '含有': { en: 'Contains', zh: '含有', fr: 'Contient', ja: '含む', ko: '포함' },
  '必需': { en: 'Essential', zh: '必需', fr: 'Essentiel', ja: '必須', ko: '필수' },
  '脂肪酸': { en: 'Fatty Acids', zh: '脂肪酸', fr: 'Acides Gras', ja: '脂肪酸', ko: '지방산' },
  '蛋白质': { en: 'Protein', zh: '蛋白质', fr: 'Protéines', ja: 'タンパク質', ko: '단백질' },
  '蛋白': { en: 'Protein', zh: '蛋白', fr: 'Protéine', ja: 'タンパク', ko: '단백' },
  '妙鲜': { en: 'Fresh Delight', zh: '妙鲜', fr: 'Délice Frais', ja: 'フレッシュデライト', ko: '신선한 기쁨' },
  '混合装': { en: 'Mixed Pack', zh: '混合装', fr: 'Pack Mixte', ja: 'ミックスパック', ko: '믹스 팩' },
  '混合': { en: 'Mixed', zh: '混合', fr: 'Mixte', ja: 'ミックス', ko: '믹스' },
  '装': { en: 'Pack', zh: '装', fr: 'Pack', ja: 'パック', ko: '팩' },
  
  // Accessories and Equipment
  '饮水机': { en: 'Water Fountain', zh: '饮水机', fr: 'Fontaine à Eau', ja: '給水器', ko: '급수기' },
  '自动饮水机': { en: 'Automatic Water Fountain', zh: '自动饮水机', fr: 'Fontaine Automatique', ja: '自動給水器', ko: '자동 급수기' },
  '自动': { en: 'Automatic', zh: '自动', fr: 'Automatique', ja: '自動', ko: '자동' },
  '喂食器': { en: 'Feeder', zh: '喂食器', fr: 'Distributeur', ja: '給餌器', ko: '급식기' },
  '自动喂食器': { en: 'Automatic Feeder', zh: '自动喂食器', fr: 'Distributeur Automatique', ja: '自動給餌器', ko: '자동 급식기' },
  '智能版': { en: 'Smart Version', zh: '智能版', fr: 'Version Intelligente', ja: 'スマート版', ko: '스마트 버전' },
  '智能': { en: 'Smart', zh: '智能', fr: 'Intelligent', ja: 'スマート', ko: '스마트' },
  '版': { en: 'Version', zh: '版', fr: 'Version', ja: '版', ko: '버전' },
  '盆': { en: 'Box', zh: '盆', fr: 'Bac', ja: 'ボックス', ko: '박스' },
  '盘': { en: 'Pan', zh: '盘', fr: 'Plateau', ja: 'パン', ko: '팬' },
  '封闭式': { en: 'Enclosed', zh: '封闭式', fr: 'Fermé', ja: '密閉型', ko: '밀폐형' },
  '封闭': { en: 'Closed', zh: '封闭', fr: 'Fermé', ja: '密閉', ko: '밀폐' },
  '大号': { en: 'Large', zh: '大号', fr: 'Grand', ja: 'ラージ', ko: '라지' },
  '中号': { en: 'Medium', zh: '中号', fr: 'Moyen', ja: 'ミディアム', ko: '미디엄' },
  '小号': { en: 'Small', zh: '小号', fr: 'Petit', ja: 'スモール', ko: '스몰' },
  '指甲剪': { en: 'Nail Clipper', zh: '指甲剪', fr: 'Coupe-Ongles', ja: '爪切り', ko: '손톱깎이' },
  '指甲': { en: 'Nail', zh: '指甲', fr: 'Ongle', ja: '爪', ko: '손톱' },
  '剪': { en: 'Clipper', zh: '剪', fr: 'Coupe', ja: '切り', ko: '깎이' },
  '专业级': { en: 'Professional Grade', zh: '专业级', fr: 'Qualité Professionnelle', ja: 'プロ仕様', ko: '프로페셔널' },
  '专业': { en: 'Professional', zh: '专业', fr: 'Professionnel', ja: 'プロ', ko: '프로' },
  '级': { en: 'Grade', zh: '级', fr: 'Niveau', ja: 'グレード', ko: '급' },
  '宠物': { en: 'Pet', zh: '宠物', fr: 'Animal', ja: 'ペット', ko: '반려동물' },
  '绝育': { en: 'Neutered', zh: '绝育', fr: 'Stérilisé', ja: '去勢', ko: '중성화' },
  '白': { en: 'White', zh: '白', fr: 'Blanc', ja: '白', ko: '흰색' },
  '冬季': { en: 'Winter', zh: '冬季', fr: 'Hiver', ja: '冬', ko: '겨울' },
  '冬': { en: 'Winter', zh: '冬', fr: 'Hiver', ja: '冬', ko: '겨울' },
  '保暖': { en: 'Warm', zh: '保暖', fr: 'Chaud', ja: '暖かい', ko: '따뜻한' },
  '窝': { en: 'Bed', zh: '窝', fr: 'Lit', ja: 'ベッド', ko: '침대' },
  '加厚': { en: 'Thickened', zh: '加厚', fr: 'Épaissi', ja: '厚手', ko: '두꺼운' },
  '款': { en: 'Style', zh: '款', fr: 'Style', ja: 'スタイル', ko: '스타일' },
  '外出': { en: 'Outdoor', zh: '外出', fr: 'Extérieur', ja: 'アウトドア', ko: '외출' },
  '背': { en: 'Backpack', zh: '背', fr: 'Sac à Dos', ja: 'リュック', ko: '배낭' },
  '双肩': { en: 'Shoulder', zh: '双肩', fr: 'Épaule', ja: '肩', ko: '어깨' },
  '磨牙': { en: 'Dental', zh: '磨牙', fr: 'Dentaire', ja: '歯磨き', ko: '치아' },
  '礼盒': { en: 'Gift Box', zh: '礼盒', fr: 'Coffret', ja: 'ギフトボックス', ko: '선물상자' },
  '支': { en: 'pieces', zh: '支', fr: 'pièces', ja: '本', ko: '개' },
  '牵引绳': { en: 'Leash', zh: '牵引绳', fr: 'Laisse', ja: 'リード', ko: '리드' },
  '反光': { en: 'Reflective', zh: '反光', fr: 'Réfléchissant', ja: '反射', ko: '반사' },
  '去泪痕液': { en: 'Tear Stain Remover', zh: '去泪痕液', fr: 'Anti-Larmes', ja: '涙やけ除去', ko: '눈물자국 제거제' },
  '去': { en: 'Remove', zh: '去', fr: 'Enlever', ja: '除去', ko: '제거' },
  '泪痕': { en: 'Tear Stain', zh: '泪痕', fr: 'Tache de Larme', ja: '涙やけ', ko: '눈물자국' },
  '液': { en: 'Solution', zh: '液', fr: 'Solution', ja: '液', ko: '액' },
  '洗澡': { en: 'Bath', zh: '洗澡', fr: 'Bain', ja: 'お風呂', ko: '목욕' },
  '防抓': { en: 'Anti-Scratch', zh: '防抓', fr: 'Anti-Griffure', ja: '引っかき防止', ko: '긁힘방지' },
  '固定': { en: 'Fixed', zh: '固定', fr: 'Fixe', ja: '固定', ko: '고정' },
  '旋转': { en: 'Rotating', zh: '旋转', fr: 'Rotatif', ja: '回転', ko: '회전' },
  '轨道': { en: 'Track', zh: '轨道', fr: 'Piste', ja: 'トラック', ko: '트랙' },
  '衣服': { en: 'Clothes', zh: '衣服', fr: 'Vêtements', ja: '服', ko: '옷' },
  '油': { en: 'Oil', zh: '油', fr: 'Huile', ja: 'オイル', ko: '오일' },
  '胶囊': { en: 'Capsules', zh: '胶囊', fr: 'Capsules', ja: 'カプセル', ko: '캡슐' },
  '粒': { en: 'pills', zh: '粒', fr: 'pilules', ja: '粒', ko: '알' },
  '膏': { en: 'Paste', zh: '膏', fr: 'Pâte', ja: 'ペースト', ko: '페이스트' },
  '羽毛': { en: 'Feather', zh: '羽毛', fr: 'Plume', ja: '羽', ko: '깃털' },
  '爬架': { en: 'Climbing Tower', zh: '爬架', fr: 'Arbre à Chat', ja: 'キャットタワー', ko: '캣타워' },
  '抓板': { en: 'Scratching Post', zh: '抓板', fr: 'Griffoir', ja: '爪とぎ', ko: '스크래치' },
  '鸟类': { en: 'Bird', zh: '鸟类', fr: 'Oiseau', ja: '鳥', ko: '새' },
  '滋补丸': { en: 'Supplement Pills', zh: '滋补丸', fr: 'Pilules', ja: 'サプリメント', ko: '보충제' },
  '提摩西草': { en: 'Timothy Hay', zh: '提摩西草', fr: 'Foin Timothy', ja: 'チモシー', ko: '티모시' },
  '提摩西': { en: 'Timothy', zh: '提摩西', fr: 'Timothy', ja: 'チモシー', ko: '티모시' },
  '草': { en: 'Hay', zh: '草', fr: 'Foin', ja: '草', ko: '건초' },
  '兔窝': { en: 'Rabbit Hutch', zh: '兔窝', fr: 'Clapier', ja: 'うさぎ小屋', ko: '토끼집' },
  '兔': { en: 'Rabbit', zh: '兔', fr: 'Lapin', ja: 'うさぎ', ko: '토끼' },
  '笼子': { en: 'Cage', zh: '笼子', fr: 'Cage', ja: 'ケージ', ko: '케이지' },
  '双层': { en: 'Double Layer', zh: '双层', fr: 'Double Couche', ja: '二層', ko: '이층' },
  '海': { en: 'Ocean', zh: '海', fr: 'Océan', ja: '海', ko: '바다' },
  '糙米': { en: 'Brown Rice', zh: '糙米', fr: 'Riz Brun', ja: '玄米', ko: '현미' },
  '米': { en: 'Rice', zh: '米', fr: 'Riz', ja: '米', ko: '쌀' },
  '排出': { en: 'Remove', zh: '排出', fr: 'Éliminer', ja: '排出', ko: '배출' },
  '保护': { en: 'Protects', zh: '保护', fr: 'Protège', ja: '保護', ko: '보호' },
  '肠道': { en: 'Digestive Tract', zh: '肠道', fr: 'Tractus Digestif', ja: '腸管', ko: '소화관' },
  '适口性': { en: 'Palatability', zh: '适口性', fr: 'Appétence', ja: '嗜好性', ko: '식욕' },
  '适口': { en: 'Palatable', zh: '适口', fr: 'Appétissant', ja: '嗜好', ko: '식욕' },
  '好': { en: 'Good', zh: '好', fr: 'Bon', ja: '良い', ko: '좋은' },
  '性': { en: '', zh: '性', fr: '', ja: '', ko: '' },
  '身体': { en: 'Body', zh: '身体', fr: 'Corps', ja: '体', ko: '몸' },
  '必备': { en: 'Essential', zh: '必备', fr: 'Essentiel', ja: '必需', ko: '필수' },
  '透气': { en: 'Breathable', zh: '透气', fr: 'Respirant', ja: '通気性', ko: '통기성' },
  '网': { en: 'Mesh', zh: '网', fr: 'Filet', ja: 'メッシュ', ko: '메쉬' },
  
  // Cat Litter Types
  '膨润土': { en: 'Bentonite', zh: '膨润土', fr: 'Bentonite', ja: 'ベントナイト', ko: '벤토나이트' },
  '豆腐砂': { en: 'Tofu Litter', zh: '豆腐砂', fr: 'Litière Tofu', ja: '豆腐砂', ko: '두부 모래' },
  '豆腐': { en: 'Tofu', zh: '豆腐', fr: 'Tofu', ja: '豆腐', ko: '두부' },
  '水晶砂': { en: 'Crystal Litter', zh: '水晶砂', fr: 'Litière Cristal', ja: 'クリスタル砂', ko: '크리스탈 모래' },
  '水晶': { en: 'Crystal', zh: '水晶', fr: 'Cristal', ja: 'クリスタル', ko: '크리스탈' },
  '松木砂': { en: 'Pine Litter', zh: '松木砂', fr: 'Litière Pin', ja: '松木砂', ko: '소나무 모래' },
  '松木': { en: 'Pine Wood', zh: '松木', fr: 'Pin', ja: '松木', ko: '소나무' },
  '活性炭': { en: 'Activated Carbon', zh: '活性炭', fr: 'Charbon Actif', ja: '活性炭', ko: '활성탄' },
  '砂': { en: 'Litter', zh: '砂', fr: 'Litière', ja: '砂', ko: '모래' },
};



export function translateProductName(chineseName: string, targetLang: Language = 'en'): string {
  if (!chineseName) {
    return chineseName;
  }

  // Always translate to English
  let translated = chineseName;

  // Sort by length (longer terms first to avoid partial replacements)
  const sortedTerms = Object.entries(productTerms).sort((a, b) => b[0].length - a[0].length);

  // Replace each Chinese term with English translation
  for (const [chinese, translations] of sortedTerms) {
    if (translated.includes(chinese)) {
      const replacement = translations.en;
      if (replacement) {
        // Add space before replacement if it's preceded by a letter/number
        // Add space after replacement if it's followed by a letter/number
        translated = translated.replace(new RegExp(chinese, 'g'), (match, offset) => {
          let result = replacement;
          const prevChar = translated[offset - 1];
          const nextChar = translated[offset + chinese.length];
          
          if (prevChar && /[a-zA-Z0-9]/.test(prevChar)) {
            result = ' ' + result;
          }
          if (nextChar && /[a-zA-Z]/.test(nextChar)) {
            result = result + ' ';
          }
          
          return result;
        });
      }
    }
  }

  // Clean up extra spaces
  translated = translated.replace(/\s+/g, ' ').trim();

  return translated;
}

export function translateProductDescription(chineseDesc: string, targetLang: Language = 'en'): string {
  if (!chineseDesc) {
    return chineseDesc;
  }

  // Always translate to English
  let translated = chineseDesc;
  
  // Sort by length (longer terms first to avoid partial replacements)
  const sortedTerms = Object.entries(productTerms).sort((a, b) => b[0].length - a[0].length);
  
  for (const [chinese, translations] of sortedTerms) {
    if (translated.includes(chinese)) {
      const replacement = translations.en;
      if (replacement) {
        translated = translated.replace(new RegExp(chinese, 'g'), replacement);
      }
    }
  }
  
  // Clean up Chinese punctuation and replace with English equivalents
  translated = translated.replace(/，/g, ', ');
  translated = translated.replace(/。/g, '. ');
  translated = translated.replace(/、/g, ', ');
  translated = translated.replace(/；/g, '; ');
  translated = translated.replace(/：/g, ': ');
  // Add space between consecutive capitalized words (e.g., AntiScratch -> Anti Scratch)
  translated = translated.replace(/([A-Z][a-z]+)([A-Z])/g, '$1 $2');
  // Add space between uppercase and lowercase (e.g., NaturalFormula -> Natural Formula)
  translated = translated.replace(/([a-z])([A-Z])/g, '$1 $2');
  translated = translated.replace(/\s+/g, ' ');

  return translated.trim();
}

// Translate stock status - Always return English
export function translateStockStatus(status: string, targetLang: Language = 'en'): string {
  const statusMap: Record<string, string> = {
    'In Stock': 'In Stock',
    'Low Stock': 'Low Stock',
    'Out of Stock': 'Out of Stock',
    '有货': 'In Stock',
    '库存不足': 'Low Stock',
    '缺货': 'Out of Stock',
  };

  return statusMap[status] || status;
}

