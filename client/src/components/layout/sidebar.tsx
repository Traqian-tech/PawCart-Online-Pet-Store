import { X, Cat, Dog, Rabbit, Bird, Package, Stethoscope, Shirt, Gem, Bone, Gamepad2, ChevronRight, Facebook, Instagram, Twitter, Youtube, Linkedin, Phone } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/sidebar-context';
import { useLanguage } from '@/contexts/language-context';

const logoPath = '/logo.png';

export default function NavigationSidebar() {
  const { isVisible, setIsVisible, isHomePage } = useSidebar();
  const { t } = useLanguage();

  // Mobile categories (simple list)
  const mobileCategories = [
    { label: t('nav.catFood'), href: '/cat-food' },
    { label: t('nav.dogFood'), href: '/dog-food' },
    { label: t('nav.catToys'), href: '/cat-toys' },
    { label: t('nav.catLitter'), href: '/cat-litter' },
    { label: 'Cat Care & Health', href: '/cat-care' },
    { label: 'Cat Accessories', href: '/cat-accessories' },
    { label: 'Dog Health & Accessories', href: '/dog-accessories' },
    { label: t('nav.rabbit'), href: '/rabbit' },
    { label: t('nav.bird'), href: '/bird' },
  ];

  // Desktop categories (with icons and subcategories)
  const desktopCategories = [
    { icon: Cat, label: t('nav.catFood'), href: '/cat-food', hasSubCategories: true },
    { icon: Dog, label: t('nav.dogFood'), href: '/dog-food', hasSubCategories: true },
    { icon: Gamepad2, label: t('nav.catToys'), href: '/cat-toys', hasSubCategories: false },
    { icon: Package, label: t('nav.catLitter'), href: '/cat-litter', hasSubCategories: true },
    { icon: Stethoscope, label: 'Cat Care & Health', href: '/cat-care', hasSubCategories: false },
    { icon: Shirt, label: 'Cat Accessories', href: '/cat-accessories', hasSubCategories: true },
    { icon: Bone, label: 'Dog Health & Accessories', href: '/dog-accessories', hasSubCategories: true },
    { icon: Rabbit, label: t('nav.rabbit'), href: '/rabbit', hasSubCategories: true },
    { icon: Bird, label: t('nav.bird'), href: '/bird', hasSubCategories: true },
  ];

  const handleCloseSidebar = () => {
    setIsVisible(false);
  };

  const handleBackdropClick = () => {
    if (!isHomePage) {
      setIsVisible(false);
    }
  };

  const handleSidebarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Mobile Sidebar (md and below) */}
      <div className="md:hidden">
        {/* Backdrop overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[1100]" 
          onClick={handleBackdropClick}
        />
        
        {/* Mobile Sidebar */}
        <div 
          className={cn(
            "fixed left-0 top-0 w-80 max-w-[85vw] h-full shadow-2xl z-[1101] transform transition-transform duration-300 ease-in-out overflow-hidden",
            isVisible ? "translate-x-0" : "-translate-x-full"
          )}
          style={{ background: 'linear-gradient(to bottom, white, rgb(240 253 244 / 0.2), white)' }}
          onClick={handleSidebarClick}
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl" style={{ backgroundColor: 'var(--meow-green-pale)' }}></div>
          <div className="absolute bottom-20 left-0 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: 'rgb(254 252 232 / 0.5)' }}></div>
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Header with gradient */}
            <div className="p-5 shadow-lg" style={{ background: 'linear-gradient(to right, var(--meow-green), var(--meow-green-dark))' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <img src={logoPath} alt="PawCart Logo" className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">PawCart</h2>
                    <p className="text-xs text-white/80">Browse Menu</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseSidebar}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                  data-testid="close-sidebar-button"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto">
              <div className="py-4">
                {/* Categories header */}
                <div className="px-4 pb-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'var(--meow-green-pale)' }}>
                      <Package className="w-4 h-4" style={{ color: 'var(--meow-green)' }} />
                    </div>
                    <h3 className="text-base font-bold text-gray-800">Categories</h3>
                  </div>
                </div>
                
                {/* Categories grid */}
                <nav className="px-3 pb-4">
                  <div className="grid grid-cols-2 gap-2.5">
                    {mobileCategories.map((category, index) => (
                      <Link 
                        key={`${category.label}-${index}`} 
                        href={category.href}
                        onClick={handleCloseSidebar}
                        className="block animate-fade-in"
                        style={{ animationDelay: `${index * 0.04}s` }}
                      >
                        <div className="relative group h-full">
                          {/* Hover effect background */}
                          <div className="absolute inset-0 rounded-xl opacity-0 group-active:opacity-100 transition-opacity duration-200" style={{ background: 'linear-gradient(to bottom right, var(--meow-green), var(--meow-green-dark))' }}></div>
                          
                          {/* Card Content */}
                          <div className="relative flex flex-col items-center justify-center p-3 text-center text-gray-700 group-active:text-white rounded-xl transition-all duration-200 bg-white group-active:bg-transparent border border-gray-100 shadow-sm group-active:shadow-md cursor-pointer h-full min-h-[85px]">
                            <span className="text-xs font-bold leading-tight group-active:scale-105 transition-transform duration-200">
                              {category.label}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </nav>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 p-5 space-y-4" style={{ borderColor: 'var(--meow-green-pale)', backgroundImage: 'linear-gradient(to right, var(--meow-green-pale), rgb(254 252 232))' }}>
              {/* Contact Info */}
              <div className="bg-white rounded-xl p-4 shadow-md border" style={{ borderColor: 'var(--meow-green-pale)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4" style={{ color: 'var(--meow-green)' }} />
                  <div className="text-xs font-semibold" style={{ color: 'var(--meow-green-dark)' }}>Our Hotline</div>
                </div>
                <div className="text-sm font-bold text-gray-800">Live For App Up</div>
                <div className="text-sm font-semibold" style={{ color: 'var(--meow-green)' }}>01 4050-45-023</div>
              </div>

              {/* Social Media */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <Gem className="w-4 h-4" style={{ color: 'var(--meow-green)' }} />
                  Follow Us
                </div>
                <div className="flex items-center gap-2">
                  <a href="https://x.com/PawCartShop?t=u9x_Kolz8awQv5adUIvBlw&s=05" target="_blank" rel="noopener noreferrer" className="flex-1 p-2.5 bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-500 group">
                    <Twitter size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                  </a>
                  <a href="#" className="flex-1 p-2.5 bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:to-pink-600 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md border border-gray-200 hover:border-pink-500 group">
                    <Instagram size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                  </a>
                  <a href="#" className="flex-1 p-2.5 bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md border border-gray-200 hover:border-red-500 group">
                    <Youtube size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                  </a>
                  <a href="#" className="flex-1 p-2.5 bg-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-600 group">
                    <Linkedin size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar (md and above) */}
      <div className="hidden md:block">
        {/* Backdrop overlay for non-home pages */}
        {!isHomePage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40" 
            onClick={handleBackdropClick}
          />
        )}
        
        {/* Desktop Sidebar */}
        <div className={cn(
          "fixed left-0 top-[120px] w-80 bg-gradient-to-b from-white via-[var(--meow-green-pale)]/30 to-white shadow-2xl border-r-2 border-[var(--meow-green-pale)] h-[calc(100vh-120px)] flex-shrink-0 flex flex-col overflow-hidden",
          isHomePage ? "z-10" : "z-50"
        )}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--meow-green-light)]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-200/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Header with gradient */}
            <div className="px-6 pt-6 pb-5 shadow-lg" style={{ background: 'linear-gradient(to right, var(--meow-green), var(--meow-green-dark))' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Categories</h2>
                  <p className="text-white/80 text-xs mt-0.5">Browse by pet type</p>
                </div>
              </div>
            </div>
            
            {/* Categories grid with card layout */}
            <nav className="flex-1 px-4 py-5 overflow-y-auto scrollbar-thin scrollbar-track-transparent" style={{ scrollbarColor: 'var(--meow-green-light) transparent' }}>
              <div className="grid grid-cols-2 gap-3">
                {desktopCategories.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <Link 
                      key={category.label} 
                      href={category.href}
                      className="block animate-fade-in"
                      style={{ animationDelay: `${index * 0.04}s` }}
                    >
                      <div className="relative group h-full">
                        {/* Hover background effect */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg" style={{ background: 'linear-gradient(to bottom right, var(--meow-green), var(--meow-green-dark))' }}></div>
                        
                        {/* Card Content */}
                        <div className="relative flex flex-col items-center justify-center p-4 text-center text-gray-700 group-hover:text-white rounded-2xl transition-all duration-300 bg-white group-hover:bg-transparent border-2 border-gray-100 shadow-sm group-hover:shadow-xl group-hover:scale-105 h-full min-h-[100px]" style={{ '--tw-border-opacity': '1', borderColor: 'rgba(243, 244, 246, var(--tw-border-opacity))' } as React.CSSProperties & { '--tw-border-opacity': string }}>
                          {/* Icon with background */}
                          <div className="p-3 rounded-xl mb-2.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:from-white/20 group-hover:to-white/10" style={{ background: 'linear-gradient(to bottom right, var(--meow-green-pale), var(--meow-green-light))' }}>
                            <IconComponent className="w-6 h-6 group-hover:text-white transition-colors duration-300" style={{ color: 'var(--meow-green)' }} />
                          </div>
                          
                          {/* Label */}
                          <span className="font-bold text-xs leading-tight group-hover:scale-105 transition-transform duration-300">
                            {category.label}
                          </span>
                          
                          {/* Decorative dot indicator */}
                          {category.hasSubCategories && (
                            <div className="absolute top-2 right-2 w-2 h-2 group-hover:bg-white rounded-full animate-pulse" style={{ backgroundColor: 'var(--meow-green-light)' }}></div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
            
            {/* Footer section */}
            <div className="px-6 py-4 border-t-2 bg-gradient-to-r to-yellow-50" style={{ borderColor: 'var(--meow-green-pale)', backgroundImage: 'linear-gradient(to right, var(--meow-green-pale), rgb(254 252 232))' }}>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Gem className="w-4 h-4 animate-pulse" style={{ color: 'var(--meow-green)' }} />
                <span className="font-medium">Premium Pet Products</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}