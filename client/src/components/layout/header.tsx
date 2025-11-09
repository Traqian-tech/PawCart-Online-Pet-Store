import { useState, useRef, useEffect } from 'react';
import { Search, User, ShoppingCart, Phone, Truck, Shield, Facebook, Instagram, LogOut, Menu, ChevronDown, LogIn, Speaker, Twitter, Wallet, Cat, Dog, Gamepad2, Package, Bird, Rabbit, BookOpen, Sparkles, Home as HomeIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/cart-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { useLanguage } from '@/contexts/language-context';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { type SearchableProduct } from '@/lib/search-data';
import { LanguageCurrencySwitcher, MobileLanguageCurrencySwitcher } from '@/components/language-currency-switcher';
const logoPath = '/logo.png';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchableProduct[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, signOut: authSignOut, loading } = useAuth();
  const { toast } = useToast();
  const { state: cartState } = useCart();
  const { toggle: toggleSidebar } = useSidebar();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  // Fetch current announcement
  const { data: announcements } = useQuery({
    queryKey: ['/api/announcements'],
    queryFn: async () => {
      const response = await fetch('/api/announcements');
      if (!response.ok) throw new Error('Failed to fetch announcements');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const currentAnnouncement = announcements?.[0];

  // Function to parse bold text formatting
  const parseAnnouncementText = (text: string) => {
    if (!text) return text;

    // Replace **text** with bold
    let parsed = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Replace *text* with bold
    parsed = parsed.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');

    return parsed;
  };

  const handleSignOut = async () => {
    // Use the auth context's signOut function for consistency
    authSignOut();
    
    // Regular Supabase sign out for users with Supabase accounts
    try {
      const { error } = await signOut();
      if (error && error.message !== 'Invalid session') {
        // Only show error if it's not an invalid session error
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } catch (error) {
      // Ignore Supabase errors for users who don't have Supabase accounts
      console.log('Supabase signout failed (this is normal for non-Supabase users):', error);
    }
    
    toast({ title: 'Signed out successfully', description: 'Come back soon!' });
  };

  // Fetch products for search
  const { data: allProducts = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  // Shop by Category items that should be searchable
  const shopByCategoryItems: SearchableProduct[] = [
    { id: 'adult-food', name: 'Adult Food', category: 'Adult Food', brand: 'Various', price: 'From $10+', page: 'Shop by Category', route: '/products?category=adult-food', keywords: ['adult', 'food', 'premium', 'quality'] },
    { id: 'kitten-food', name: 'Kitten Food', category: 'Kitten Food', brand: 'Various', price: 'From $8+', page: 'Shop by Category', route: '/products?category=kitten-food', keywords: ['kitten', 'food', 'growing', 'nutrition'] },
    { id: 'collar', name: 'Collar', category: 'Collar', brand: 'Various', price: 'From $3+', page: 'Shop by Category', route: '/products?category=collar', keywords: ['collar', 'style', 'safety'] },
    { id: 'clumping-cat-litter', name: 'Clumping Cat Litter', category: 'Clumping Cat Litter', brand: 'Various', price: 'From $6+', page: 'Shop by Category', route: '/products?category=clumping-cat-litter', keywords: ['clumping', 'cat', 'litter', 'easy', 'clean'] },
    { id: 'cat-litter-accessories', name: 'Cat Litter Accessories', category: 'Cat Litter Accessories', brand: 'Various', price: 'From $2+', page: 'Shop by Category', route: '/products?category=cat-litter-accessories', keywords: ['cat', 'litter', 'accessories', 'complete', 'care'] },
    { id: 'harness', name: 'Harness', category: 'Harness', brand: 'Various', price: 'From $5+', page: 'Shop by Category', route: '/products?category=harness', keywords: ['harness', 'secure', 'walking'] },
    { id: 'cat-tick-flea-control', name: 'Cat Tick & Flea Control', category: 'Cat Tick & Flea Control', brand: 'Various', price: 'From $4+', page: 'Shop by Category', route: '/products?category=cat-tick-flea-control', keywords: ['cat', 'tick', 'flea', 'control', 'health', 'protection'] },
    { id: 'deworming-tablet', name: 'Deworming Tablet', category: 'Deworming Tablet', brand: 'Various', price: 'From $3+', page: 'Shop by Category', route: '/products?category=deworming-tablet', keywords: ['deworming', 'tablet', 'wellness', 'care'] },
    { id: 'cat-pouches', name: 'Cat Pouches', category: 'Cat Pouches', brand: 'Various', price: 'From $2+', page: 'Shop by Category', route: '/products?category=cat-pouches', keywords: ['cat', 'pouches', 'wet', 'food'] },
    { id: 'sunglass', name: 'Sunglass', category: 'Sunglass', brand: 'Various', price: 'From $8+', page: 'Shop by Category', route: '/products?category=sunglass', keywords: ['sunglass', 'pet', 'fashion'] }
  ];

  const searchAllProducts = (query: string): SearchableProduct[] => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase().trim();
    const results: SearchableProduct[] = [];
    
    // Search through real products from API
    (allProducts as any[]).forEach(product => {
      const searchableText = [
        product.name,
        product.categoryName || product.category,
        product.brandName || product.brand,
        product.description || '',
        ...(product.tags || [])
      ].join(' ').toLowerCase();
      
      if (searchableText.includes(searchTerm)) {
        // Use slug for the route if available, otherwise use id
        const productSlug = product.slug || product.id || product._id;
        results.push({
          id: product.id || product._id,
          name: product.name,
          category: product.categoryName || product.category,
          brand: product.brandName || product.brand,
          price: `$${product.price}`,
          page: product.categoryName || product.category,
          route: `/product/${productSlug}`,
          keywords: product.tags || []
        });
      }
    });
    
    // Search through Shop by Category items
    shopByCategoryItems.forEach(item => {
      const searchableText = [
        item.name,
        item.category,
        item.brand || '',
        ...item.keywords
      ].join(' ').toLowerCase();
      
      if (searchableText.includes(searchTerm)) {
        results.push(item);
      }
    });
    
    return results.slice(0, 10); // Limit to 10 results
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchAllProducts(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  const handleSearchSelect = (route: string) => {
    console.log('Search select clicked, navigating to:', route);
    // Navigate immediately
    setLocation(route);
    // Then close search and clear query
    setTimeout(() => {
      setSearchQuery('');
      setShowSearchResults(false);
    }, 100);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is on a search result link
      const target = event.target as HTMLElement;
      const isSearchResultClick = target.closest('[data-testid^="search-result-"]');
      
      if (searchRef.current && !searchRef.current.contains(event.target as Node) && !isSearchResultClick) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keep announcement bar always visible - no scroll hiding behavior

  const navigationItems = [
    { name: t('nav.home'), path: '/', icon: HomeIcon, color: 'from-blue-500 to-blue-600' },
    { name: t('nav.privilegeClub'), path: '/privilege-club', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
    { name: t('nav.catFood'), path: '/cat-food', icon: Cat, color: 'from-orange-500 to-orange-600' },
    { name: t('nav.dogFood'), path: '/dog-food', icon: Dog, color: 'from-amber-500 to-amber-600' },
    { name: t('nav.catToys'), path: '/cat-toys', icon: Gamepad2, color: 'from-green-500 to-green-600' },
    { name: t('nav.catLitter'), path: '/cat-litter', icon: Package, color: 'from-cyan-500 to-cyan-600' },
    { name: t('nav.bird'), path: '/bird', icon: Bird, color: 'from-sky-500 to-sky-600' },
    { name: t('nav.rabbit'), path: '/rabbit', icon: Rabbit, color: 'from-pink-500 to-rose-500' },
    { name: 'Reflex', path: '/brands/reflex', icon: Sparkles, color: 'from-indigo-500 to-indigo-600' },
    { name: t('nav.blog'), path: '/blog', icon: BookOpen, color: 'from-slate-500 to-slate-600' }
  ];

  const categories = [
    { label: 'Cat Food', href: '/cat-food', hasSubCategories: true },
    { label: 'Cat Toys', href: '/cat-toys', hasSubCategories: false },
    { label: 'Cat Litter', href: '/cat-litter', hasSubCategories: true },
    { label: 'Cat Care & Health', href: '/cat-care', hasSubCategories: false },
    { label: 'Clothing, Beds & Carrier', href: '/cat-accessories', hasSubCategories: true },
    { label: 'Cat Accessories', href: '/cat-accessories', hasSubCategories: true },
    { label: 'Dog Health & Accessories', href: '/dog-accessories', hasSubCategories: true },
    { label: 'Dog Food', href: '/dog-food', hasSubCategories: true },
    { label: 'Rabbit Food & Accessories', href: '/rabbit', hasSubCategories: true },
    { label: 'Bird Food & Accessories', href: '/bird', hasSubCategories: true },
  ];

  return (
    <>
      {/* Top Announcement Bar - Enhanced & Beautiful */}
      <div className="gradient-brand text-white py-2 md:py-3 text-sm overflow-hidden relative shadow-md">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile: Announcement and controls */}
            <div className="md:hidden flex-1 flex justify-center items-center relative min-h-[24px] overflow-hidden">
              {currentAnnouncement && (
                <div className="animate-marquee whitespace-nowrap absolute inset-0 flex items-center" style={{ width: 'max-content' }}>
                  <div className="inline-flex items-center text-white text-xs font-semibold">
                    <Speaker size={12} className="mr-2 flex-shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: parseAnnouncementText(currentAnnouncement.text) }} />
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile: Language/Currency + Social media */}
            <div className="md:hidden flex items-center gap-2">
              <MobileLanguageCurrencySwitcher />
              <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
                <a href="https://x.com/PawCartShop?t=u9x_Kolz8awQv5adUIvBlw&s=05" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-300 transition-all duration-200 hover:scale-110">
                  <Twitter size={14} />
                </a>
                <a href="#" className="text-white hover:text-yellow-300 transition-all duration-200 hover:scale-110">
                  <Instagram size={14} />
                </a>
              </div>
            </div>
            
            {/* Desktop: Full layout with better spacing */}
            <div className="hidden md:flex items-center justify-between gap-6 w-full">
              {/* Left: Contact Info */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium hover:bg-white/25 transition-all duration-200 shadow-sm">
                  <Phone size={14} className="mr-2" />
                  <span className="font-semibold">852-6214-6811</span>
                </div>
                <Link href="/contact">
                  <div className="flex items-center bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-white/25 transition-all duration-200 shadow-sm">
                    <Truck size={14} className="mr-2" />
                    <span>Our location</span>
                  </div>
                </Link>
                <div className="flex items-center bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-white/25 transition-all duration-200 shadow-sm">
                  <Shield size={14} className="mr-2" />
                  <span>Track Your Order</span>
                </div>
              </div>

              {/* Center: Announcement */}
              <div className="flex-1 flex justify-center items-center relative min-h-[28px] overflow-hidden max-w-2xl mx-auto">
                {currentAnnouncement && (
                  <div className="animate-marquee whitespace-nowrap absolute inset-0 flex items-center" style={{ width: 'max-content' }}>
                    <div className="inline-flex items-center text-white text-sm font-bold bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full">
                      <Speaker size={14} className="mr-2 flex-shrink-0" />
                      <span dangerouslySetInnerHTML={{ __html: parseAnnouncementText(currentAnnouncement.text) }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Language/Currency + Social */}
              <div className="flex items-center gap-3">
                <LanguageCurrencySwitcher />
                <div className="h-5 w-px bg-white/30"></div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-xs">{t('footer.followUs')}:</span>
                  <div className="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-full px-2 py-1">
                    <a href="https://x.com/PawCartShop?t=u9x_Kolz8awQv5adUIvBlw&s=05" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-300 transition-all duration-200 hover:scale-110 p-1">
                      <Twitter size={16} />
                    </a>
                    <a href="#" className="text-white hover:text-yellow-300 transition-all duration-200 hover:scale-110 p-1">
                      <Instagram size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Enhanced & Beautiful */}
      <header className="bg-white shadow-lg sticky top-0 z-[1000] border-b border-gray-200 transition-all duration-300 w-full backdrop-blur-md bg-white/95">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3 md:gap-6">
            {/* Mobile: Hamburger + Logo + Cart */}
            <div className="md:hidden flex items-center justify-between w-full">
              {/* Hamburger Menu */}
              <Button 
                variant="ghost" 
                size="sm"
                className="p-2 hover:bg-gradient-to-br hover:from-[#26732d]/10 hover:to-[#ffde59]/10 rounded-lg transition-all duration-200"
                onClick={toggleSidebar}
                data-testid="button-mobile-menu"
              >
                <Menu size={22} className="text-[#26732d]" />
              </Button>
              
              {/* Logo */}
              <Link href="/" className="flex items-center hover:scale-105 transition-transform duration-200">
                <div className="relative">
                  <img src={logoPath} alt="PawCart Online Pet Store Logo" className="h-9 w-9 mr-2 drop-shadow-md" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ffde59] rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#26732d] tracking-tight">PawCart</h1>
                  <p className="text-xs text-gray-600 font-medium">Pet Shop</p>
                </div>
              </Link>
              
              {/* Cart */}
              <Link href="/cart">
                <div className="relative p-2 hover:bg-gradient-to-br hover:from-[#26732d]/10 hover:to-[#ffde59]/10 rounded-lg transition-all duration-200 cursor-pointer" data-testid="button-cart-mobile">
                  <ShoppingCart size={22} className="text-[#26732d]" />
                  {cartState.items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md animate-bounce">
                      {cartState.items.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </div>
              </Link>
            </div>
            
            {/* Desktop: Logo + Search + Account + Cart */}
            <div className="hidden md:flex md:flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 w-full">
              {/* Logo + Search */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6 w-full">
                <Link href="/" className="flex items-center hover:scale-105 transition-transform duration-200 flex-shrink-0">
                  <div className="relative">
                    <img src={logoPath} alt="PawCart Online Pet Store Logo" className="h-12 w-12 mr-3 drop-shadow-lg" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#ffde59] rounded-full animate-pulse shadow-md"></div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-[#26732d] tracking-tight">PawCart</h1>
                    <p className="text-sm text-gray-600 font-medium">Pet Shop</p>
                  </div>
                </Link>

                <div className="flex-1 mt-4 lg:mt-0 max-w-2xl" ref={searchRef}>
                  <div className="relative group">
                    <Input 
                      type="text" 
                      placeholder={t('search.placeholder')}
                      value={searchQuery} 
                      onChange={handleSearchChange} 
                      className="w-full py-3.5 px-6 pr-16 border-2 border-gray-300 rounded-2xl focus:border-[#26732d] focus:ring-4 focus:ring-[#26732d]/10 focus:outline-none text-sm text-black shadow-md hover:shadow-lg transition-all duration-200 bg-white placeholder:text-gray-400" 
                      data-testid="input-global-search" 
                    />
                    <Button 
                      size="sm" 
                      variant="meow"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-2.5 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105" 
                      data-testid="button-search"
                    >
                      <Search size={18} />
                    </Button>

                  {showSearchResults && searchResults.length > 0 && (
                    <Card className="absolute top-full left-0 right-0 mt-2 z-[9999] max-h-96 overflow-y-auto shadow-xl rounded-xl border-2 border-gray-100">
                      <CardContent className="p-0">
                        {searchResults.map((product, index) => (
                          <Link 
                            key={product.id} 
                            href={product.route}
                            onClick={(e) => {
                              e.stopPropagation();
                              setTimeout(() => {
                                setSearchQuery('');
                                setShowSearchResults(false);
                              }, 100);
                            }}
                          >
                            <div 
                              className={`p-4 hover:bg-gradient-to-r hover:from-[var(--meow-yellow-pale)] hover:to-white cursor-pointer border-b last:border-b-0 transition-all duration-200 ${index === 0 ? 'rounded-t-xl' : ''} ${index === searchResults.length - 1 ? 'rounded-b-xl' : ''}`}
                              data-testid={`search-result-${product.id}`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm text-gray-900 mb-1">{product.name}</h4>
                                  <p className="text-xs text-gray-600 mb-1">{product.brand} • {product.category}</p>
                                  <p className="text-xs text-[var(--meow-blue)] font-medium">{product.page}</p>
                                </div>
                                <span className="text-base font-bold text-[var(--meow-green)] ml-3">{product.price}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </CardContent>
                    </Card>
                  )}

            {showSearchResults && searchResults.length === 0 && searchQuery.trim() && (
              <Card className="absolute top-full left-0 right-0 mt-1 z-[9999]">
                <CardContent className="p-4 text-center text-gray-500 text-sm">
                  {t('search.noResults')} "{searchQuery}"
                </CardContent>
              </Card>
            )}
                </div>
              </div>
            </div>

              {/* Account + Cart - Desktop only */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {!loading && user ? (
                  <div className="flex items-center gap-3">
                    {/* Wallet Button */}
                    <Link href="/wallet">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#26732d] border-2 border-[#26732d] hover:bg-[#26732d] hover:text-white transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                      >
                        <Wallet size={18} className="mr-2" />
                        Wallet
                      </Button>
                    </Link>
                    
                    {/* Circular Avatar with enhanced styling */}
                    <div className="relative group">
                      <Link href={user.email === 'admin@meowmeowpetshop.com' ? '/admin' : '/dashboard'}>
                        {(user as any).profilePicture ? (
                          <Avatar className="w-11 h-11 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-110 ring-2 ring-[#26732d]/20 hover:ring-[#26732d]/40">
                            <AvatarImage src={(user as any).profilePicture} alt="Profile" />
                            <AvatarFallback className="bg-gradient-to-br from-[#26732d] to-[#1d5624] text-white font-bold text-base">
                              {(user.firstName?.[0] || user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#26732d] to-[#1d5624] flex items-center justify-center text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-110 ring-2 ring-[#26732d]/20 hover:ring-[#26732d]/40">
                            {(user.firstName?.[0] || user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                          </div>
                        )}
                      </Link>
                      {/* Enhanced Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-xl">
                        <div className="font-semibold">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.name || user.email?.split('@')[0]}
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                          {user.email === 'admin@meowmeowpetshop.com' ? 'Click to view dashboard' : 'Click to view dashboard'}
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>

                    {/* Sign Out Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSignOut} 
                      className="text-red-600 border-2 border-red-300 hover:bg-red-50 hover:text-red-700 hover:border-red-400 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                      data-testid="button-sign-out"
                    >
                      <LogOut size={16} className="mr-2" />
                      {t('user.signOut')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/sign-in">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-[#26732d] border-2 border-[#26732d] hover:bg-[#26732d] hover:text-white transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                        data-testid="button-sign-in"
                      >
                        <LogIn size={16} className="mr-2" />
                        {t('user.signIn')}
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-[#ffde59] to-[#ffd73e] text-[#010000] hover:from-[#ffd73e] hover:to-[#ffce1f] transition-all duration-200 font-bold shadow-md hover:shadow-lg hover:scale-105"
                        data-testid="button-sign-up"
                      >
                        {t('user.signUp')}
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Cart - Desktop with enhanced styling */}
                <Link href="/cart">
                  <div className="relative p-2.5 hover:bg-gradient-to-br hover:from-[#26732d]/10 hover:to-[#ffde59]/10 rounded-xl transition-all duration-200 cursor-pointer group" data-testid="button-cart">
                    <ShoppingCart size={24} className="text-[#26732d] group-hover:scale-110 transition-transform duration-200" />
                    {cartState.items.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                        {cartState.items.reduce((total, item) => total + item.quantity, 0)}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu - Categories + Grid Layout for Desktop */}
        <nav className="hidden md:block border-t border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50 relative z-[100] shadow-sm">
          <div className="container mx-auto px-4 py-2">
            <div className="flex gap-3 max-w-7xl mx-auto">
              {/* Categories Toggle - Left Column */}
              <div className="relative group flex-shrink-0">
                <div 
                  className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 px-4 py-3 cursor-pointer group-hover:scale-105 h-full"
                  style={{
                    background: 'linear-gradient(to bottom right, var(--meow-green), var(--meow-green-dark))',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to bottom right, var(--meow-green-light), var(--meow-green))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to bottom right, var(--meow-green), var(--meow-green-dark))';
                  }}
                  onClick={toggleSidebar}
                  data-testid="button-categories-toggle"
                >
                  <div className="flex flex-col items-center gap-2 justify-center h-full min-w-[100px]">
                    {/* Icon - Three horizontal lines (hamburger menu style) */}
                    <div className="flex flex-col gap-1 group-hover:gap-1.5 transition-all duration-300">
                      <div className="w-8 h-0.5 bg-white group-hover:bg-[#ffde59] rounded-full transition-colors duration-300"></div>
                      <div className="w-8 h-0.5 bg-white group-hover:bg-[#ffde59] rounded-full transition-colors duration-300"></div>
                      <div className="w-8 h-0.5 bg-white group-hover:bg-[#ffde59] rounded-full transition-colors duration-300"></div>
                    </div>
                    {/* Text */}
                    <span className="text-sm font-bold text-white group-hover:text-[#ffde59] transition-colors duration-300 whitespace-nowrap">
                      {t('nav.categories')}
                    </span>
                  </div>
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </div>
              </div>

              {/* Main Navigation Items - Right Grid (5 columns x 2 rows) */}
              <div className="grid grid-cols-5 gap-2 flex-1">
                {navigationItems.map((item) => (
                  <div key={item.name} className="relative group">
                    <Link href={item.path}>
                      <div 
                        className="relative overflow-hidden rounded-lg bg-white hover:bg-gradient-to-br hover:from-[#26732d]/5 hover:to-[#ffde59]/10 border border-gray-200 hover:border-[#ffde59] shadow-sm hover:shadow-md transition-all duration-300 px-3 py-2 cursor-pointer group-hover:scale-105 h-full"
                        data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <div className="flex items-center gap-2 justify-center">
                          {/* Icon with gradient background */}
                          <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon size={14} className="text-white" />
                          </div>
                          {/* Text */}
                          <span className="text-sm font-semibold text-gray-700 group-hover:text-[#26732d] transition-colors duration-300 whitespace-nowrap">
                            {item.name}
                          </span>
                        </div>
                        {/* Bottom highlight on hover */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#26732d] to-[#ffde59] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </nav>
        
        {/* Mobile Search Bar */}
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3" ref={searchRef}>
          <div className="relative">
            <Input 
              type="text" 
              placeholder={t('search.mobilePlaceholder')}
              value={searchQuery} 
              onChange={handleSearchChange} 
              className="w-full py-2 px-4 pr-12 border-2 border-gray-200 rounded-lg focus:border-[#ffde59] focus:outline-none text-sm text-black" 
              data-testid="input-mobile-search" 
            />
            <Button 
              size="sm" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#ffde59] text-black px-3 py-1 rounded-md hover:bg-[#ffd73e] transition-colors" 
              data-testid="button-mobile-search"
            >
              <Search size={14} />
            </Button>

            {showSearchResults && searchResults.length > 0 && (
              <Card className="absolute top-full left-0 right-0 mt-1 z-[9999] max-h-96 overflow-y-auto">
                <CardContent className="p-0">
                  {searchResults.map((product) => (
                    <Link 
                      key={product.id} 
                      href={product.route}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTimeout(() => {
                          setSearchQuery('');
                          setShowSearchResults(false);
                        }, 100);
                      }}
                    >
                      <div 
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0" 
                        data-testid={`search-result-${product.id}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-sm">{product.name}</h4>
                            <p className="text-xs text-gray-600">{product.brand} • {product.category}</p>
                            <p className="text-xs text-blue-600">{product.page}</p>
                          </div>
                          <span className="text-sm font-bold text-green-600">{product.price}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {showSearchResults && searchResults.length === 0 && searchQuery.trim() && (
              <Card className="absolute top-full left-0 right-0 mt-1 z-[9999]">
                <CardContent className="p-4 text-center text-gray-500 text-sm">
                  {t('search.noResults')} "{searchQuery}"
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Mobile Mini Navigation - Two Rows (5 items per row) */}
        <div className="md:hidden bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200 px-2 py-2 shadow-inner">
          <div className="grid grid-cols-5 gap-1.5">
            {navigationItems.map((item) => (
              <Link key={item.name} href={item.path}>
                <div className="flex flex-col items-center gap-0.5 px-1 py-1.5 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 active:scale-95">
                  <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                    <item.icon size={10} className="text-white" />
                  </div>
                  <span className="text-[9px] font-medium text-gray-700 leading-tight truncate w-full text-center">
                    {item.name === t('nav.privilegeClub') ? 'VIP' : item.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}