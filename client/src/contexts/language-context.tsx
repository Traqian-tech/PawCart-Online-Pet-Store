import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Header & Navigation
    'nav.home': 'Home',
    'nav.privilegeClub': 'Privilege Club',
    'nav.catFood': 'Cat Food',
    'nav.dogFood': 'Dog Food',
    'nav.catToys': 'Cat Toys',
    'nav.catLitter': 'Cat Litter',
    'nav.bird': 'Bird',
    'nav.rabbit': 'Rabbit',
    'nav.blog': 'Blog',
    'nav.categories': 'Categories',
    
    // Search
    'search.placeholder': 'Search for pet food, toys, accessories...',
    'search.mobilePlaceholder': 'What can we help you find?',
    'search.noResults': 'No products found for',
    
    // User Actions
    'user.signIn': 'Sign In',
    'user.signUp': 'Sign Up',
    'user.signOut': 'Sign Out',
    'user.viewDashboard': 'Click to view dashboard',
    'user.viewAdmin': 'Click to view admin panel',
    
    // Cart
    'cart.title': 'Cart',
    'cart.addedToCart': 'Added to Cart',
    'cart.itemAdded': 'has been added to your cart',
    'cart.empty': 'Your cart is empty',
    'cart.checkout': 'Checkout',
    'cart.addMore': 'Add More',
    
    // Product
    'product.addToCart': 'Add to Cart',
    'product.buyNow': 'Buy Now',
    'product.inStock': 'In Stock',
    'product.outOfStock': 'Out of Stock',
    'product.lowStock': 'Low Stock',
    'product.bestSeller': 'Best Seller',
    'product.new': 'New',
    'product.rating': 'Rating',
    'product.reviews': 'Reviews',
    'product.description': 'Description',
    'product.specifications': 'Specifications',
    'product.features': 'Features',
    'product.quantity': 'Quantity',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.more': 'More',
    'common.less': 'Less',
    
    // Categories
    'category.catFood': 'Cat Food',
    'category.dogFood': 'Dog Food',
    'category.toys': 'Toys',
    'category.grooming': 'Grooming',
    'category.healthcare': 'Healthcare',
    'category.accessories': 'Accessories',
    
    // Footer
    'footer.customerService': 'Customer Service',
    'footer.aboutUs': 'About Us',
    'footer.contact': 'Contact',
    'footer.termsConditions': 'Terms & Conditions',
    'footer.privacyPolicy': 'Privacy Policy',
    'footer.followUs': 'Follow Us',
    'footer.copyright': '© 2025 PawCart Online Pet Store. All rights reserved.',
  },
  zh: {
    // Header & Navigation
    'nav.home': '首页',
    'nav.privilegeClub': '会员俱乐部',
    'nav.catFood': '猫粮',
    'nav.dogFood': '狗粮',
    'nav.catToys': '猫玩具',
    'nav.catLitter': '猫砂',
    'nav.bird': '鸟类',
    'nav.rabbit': '兔子',
    'nav.blog': '博客',
    'nav.categories': '分类',
    
    // Search
    'search.placeholder': '搜索宠物食品、玩具、配件...',
    'search.mobilePlaceholder': '我能帮你找什么？',
    'search.noResults': '未找到相关产品',
    
    // User Actions
    'user.signIn': '登录',
    'user.signUp': '注册',
    'user.signOut': '退出',
    'user.viewDashboard': '点击查看仪表板',
    'user.viewAdmin': '点击查看管理面板',
    
    // Cart
    'cart.title': '购物车',
    'cart.addedToCart': '已加入购物车',
    'cart.itemAdded': '已添加到您的购物车',
    'cart.empty': '购物车是空的',
    'cart.checkout': '结账',
    'cart.addMore': '添加更多',
    
    // Product
    'product.addToCart': '加入购物车',
    'product.buyNow': '立即购买',
    'product.inStock': '有货',
    'product.outOfStock': '缺货',
    'product.lowStock': '库存不足',
    'product.bestSeller': '畅销商品',
    'product.new': '新品',
    'product.rating': '评分',
    'product.reviews': '评价',
    'product.description': '描述',
    'product.specifications': '规格',
    'product.features': '特点',
    'product.quantity': '数量',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.view': '查看',
    'common.more': '更多',
    'common.less': '更少',
    
    // Categories
    'category.catFood': '猫粮',
    'category.dogFood': '狗粮',
    'category.toys': '玩具',
    'category.grooming': '美容',
    'category.healthcare': '医疗保健',
    'category.accessories': '配件',
    
    // Footer
    'footer.customerService': '客户服务',
    'footer.aboutUs': '关于我们',
    'footer.contact': '联系我们',
    'footer.termsConditions': '条款和条件',
    'footer.privacyPolicy': '隐私政策',
    'footer.followUs': '关注我们',
    'footer.copyright': '© 2025 喵喵宠物店。版权所有。',
  },
  ja: {
    // Header & Navigation (Japanese)
    'nav.home': 'ホーム',
    'nav.privilegeClub': '特典クラブ',
    'nav.catFood': 'キャットフード',
    'nav.dogFood': 'ドッグフード',
    'nav.catToys': '猫用おもちゃ',
    'nav.catLitter': '猫砂',
    'nav.bird': '鳥',
    'nav.rabbit': 'ウサギ',
    'nav.blog': 'ブログ',
    'nav.categories': 'カテゴリー',
    
    // Search
    'search.placeholder': 'ペットフード、おもちゃ、アクセサリーを検索...',
    'search.mobilePlaceholder': 'お探しのものは？',
    'search.noResults': '商品が見つかりませんでした',
    
    // User Actions
    'user.signIn': 'ログイン',
    'user.signUp': '新規登録',
    'user.signOut': 'ログアウト',
    'user.viewDashboard': 'ダッシュボードを表示',
    'user.viewAdmin': '管理パネルを表示',
    
    // Cart
    'cart.title': 'カート',
    'cart.addedToCart': 'カートに追加',
    'cart.itemAdded': 'がカートに追加されました',
    'cart.empty': 'カートは空です',
    'cart.checkout': 'レジに進む',
    'cart.addMore': 'さらに追加',
    
    // Product
    'product.addToCart': 'カートに入れる',
    'product.buyNow': '今すぐ購入',
    'product.inStock': '在庫あり',
    'product.outOfStock': '在庫切れ',
    'product.lowStock': '残りわずか',
    'product.bestSeller': 'ベストセラー',
    'product.new': '新着',
    'product.rating': '評価',
    'product.reviews': 'レビュー',
    'product.description': '説明',
    'product.specifications': '仕様',
    'product.features': '特徴',
    'product.quantity': '数量',
    
    // Common
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.success': '成功',
    'common.cancel': 'キャンセル',
    'common.confirm': '確認',
    'common.save': '保存',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.view': '表示',
    'common.more': 'もっと見る',
    'common.less': '閉じる',
    
    // Categories
    'category.catFood': 'キャットフード',
    'category.dogFood': 'ドッグフード',
    'category.toys': 'おもちゃ',
    'category.grooming': 'グルーミング',
    'category.healthcare': 'ヘルスケア',
    'category.accessories': 'アクセサリー',
    
    // Footer
    'footer.customerService': 'カスタマーサービス',
    'footer.aboutUs': '会社概要',
    'footer.contact': 'お問い合わせ',
    'footer.termsConditions': '利用規約',
    'footer.privacyPolicy': 'プライバシーポリシー',
    'footer.followUs': 'フォロー',
    'footer.copyright': '© 2025 PawCart Online Pet Store. All rights reserved.',
  },
  ko: {
    // Header & Navigation (Korean)
    'nav.home': '홈',
    'nav.privilegeClub': '프리미엄 클럽',
    'nav.catFood': '고양이 사료',
    'nav.dogFood': '강아지 사료',
    'nav.catToys': '고양이 장난감',
    'nav.catLitter': '고양이 모래',
    'nav.bird': '조류',
    'nav.rabbit': '토끼',
    'nav.blog': '블로그',
    'nav.categories': '카테고리',
    
    // Search
    'search.placeholder': '반려동물 사료, 장난감, 액세서리 검색...',
    'search.mobilePlaceholder': '무엇을 찾으시나요?',
    'search.noResults': '제품을 찾을 수 없습니다',
    
    // User Actions
    'user.signIn': '로그인',
    'user.signUp': '회원가입',
    'user.signOut': '로그아웃',
    'user.viewDashboard': '대시보드 보기',
    'user.viewAdmin': '관리자 패널 보기',
    
    // Cart
    'cart.title': '장바구니',
    'cart.addedToCart': '장바구니에 추가됨',
    'cart.itemAdded': '장바구니에 추가되었습니다',
    'cart.empty': '장바구니가 비어있습니다',
    'cart.checkout': '결제하기',
    'cart.addMore': '더 추가',
    
    // Product
    'product.addToCart': '장바구니에 담기',
    'product.buyNow': '바로 구매',
    'product.inStock': '재고 있음',
    'product.outOfStock': '품절',
    'product.lowStock': '재고 부족',
    'product.bestSeller': '베스트셀러',
    'product.new': '신상품',
    'product.rating': '평점',
    'product.reviews': '리뷰',
    'product.description': '설명',
    'product.specifications': '사양',
    'product.features': '특징',
    'product.quantity': '수량',
    
    // Common
    'common.loading': '로딩 중...',
    'common.error': '오류',
    'common.success': '성공',
    'common.cancel': '취소',
    'common.confirm': '확인',
    'common.save': '저장',
    'common.delete': '삭제',
    'common.edit': '편집',
    'common.view': '보기',
    'common.more': '더보기',
    'common.less': '접기',
    
    // Categories
    'category.catFood': '고양이 사료',
    'category.dogFood': '강아지 사료',
    'category.toys': '장난감',
    'category.grooming': '그루밍',
    'category.healthcare': '건강관리',
    'category.accessories': '액세서리',
    
    // Footer
    'footer.customerService': '고객 서비스',
    'footer.aboutUs': '회사 소개',
    'footer.contact': '연락처',
    'footer.termsConditions': '이용 약관',
    'footer.privacyPolicy': '개인정보 보호정책',
    'footer.followUs': '팔로우',
    'footer.copyright': '© 2025 PawCart Online Pet Store. All rights reserved.',
  },
  fr: {
    // Header & Navigation (French)
    'nav.home': 'Accueil',
    'nav.privilegeClub': 'Club Privilège',
    'nav.catFood': 'Nourriture pour Chats',
    'nav.dogFood': 'Nourriture pour Chiens',
    'nav.catToys': 'Jouets pour Chats',
    'nav.catLitter': 'Litière pour Chats',
    'nav.bird': 'Oiseaux',
    'nav.rabbit': 'Lapins',
    'nav.blog': 'Blog',
    'nav.categories': 'Catégories',
    
    // Search
    'search.placeholder': 'Rechercher nourriture, jouets, accessoires...',
    'search.mobilePlaceholder': 'Que cherchez-vous?',
    'search.noResults': 'Aucun produit trouvé pour',
    
    // User Actions
    'user.signIn': 'Se Connecter',
    'user.signUp': 'S\'inscrire',
    'user.signOut': 'Se Déconnecter',
    'user.viewDashboard': 'Voir le tableau de bord',
    'user.viewAdmin': 'Voir le panneau d\'administration',
    
    // Cart
    'cart.title': 'Panier',
    'cart.addedToCart': 'Ajouté au Panier',
    'cart.itemAdded': 'a été ajouté à votre panier',
    'cart.empty': 'Votre panier est vide',
    'cart.checkout': 'Commander',
    'cart.addMore': 'Ajouter Plus',
    
    // Product
    'product.addToCart': 'Ajouter au Panier',
    'product.buyNow': 'Acheter Maintenant',
    'product.inStock': 'En Stock',
    'product.outOfStock': 'Rupture de Stock',
    'product.lowStock': 'Stock Faible',
    'product.bestSeller': 'Meilleure Vente',
    'product.new': 'Nouveau',
    'product.rating': 'Note',
    'product.reviews': 'Avis',
    'product.description': 'Description',
    'product.specifications': 'Spécifications',
    'product.features': 'Caractéristiques',
    'product.quantity': 'Quantité',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.more': 'Plus',
    'common.less': 'Moins',
    
    // Categories
    'category.catFood': 'Nourriture pour Chats',
    'category.dogFood': 'Nourriture pour Chiens',
    'category.toys': 'Jouets',
    'category.grooming': 'Toilettage',
    'category.healthcare': 'Soins de Santé',
    'category.accessories': 'Accessoires',
    
    // Footer
    'footer.customerService': 'Service Client',
    'footer.aboutUs': 'À Propos',
    'footer.contact': 'Contact',
    'footer.termsConditions': 'Conditions Générales',
    'footer.privacyPolicy': 'Politique de Confidentialité',
    'footer.followUs': 'Suivez-nous',
    'footer.copyright': '© 2025 PawCart Online Pet Store. Tous droits réservés.',
  },
};

const languageNames = {
  en: 'English',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languageNames: typeof languageNames;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  useEffect(() => {
    // Update document language attribute
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageNames }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

