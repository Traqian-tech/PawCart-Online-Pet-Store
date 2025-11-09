import { Flame } from 'lucide-react';
import ProductCard from '@/components/ui/product-card';
import { useQuery } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';

export default function FlashSale() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userInteractedRef = useRef(false);

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  const flashSaleProducts = (allProducts as any[]).filter((product: any) => product.isOnSale);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || flashSaleProducts.length === 0 || userInteractedRef.current) return;

    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        if (userInteractedRef.current) {
          if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
          }
          return;
        }

        const maxScroll = container.scrollWidth - container.clientWidth;
        const currentScroll = container.scrollLeft;

        if (currentScroll >= maxScroll) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: 200, behavior: 'smooth' });
        }
      }, 3000);
    };

    const handleUserInteraction = () => {
      userInteractedRef.current = true;
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };

    container.addEventListener('touchstart', handleUserInteraction);
    container.addEventListener('mousedown', handleUserInteraction);
    container.addEventListener('wheel', handleUserInteraction);

    startAutoScroll();

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      container.removeEventListener('touchstart', handleUserInteraction);
      container.removeEventListener('mousedown', handleUserInteraction);
      container.removeEventListener('wheel', handleUserInteraction);
    };
  }, [flashSaleProducts.length]);

  if (isLoading) {
    return (
      <section className="section-spacing bg-red-50">
        <div className="responsive-container">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 sm:gap-4 bg-red-100 px-6 sm:px-8 py-3 rounded-lg mb-6 w-full max-w-md mx-auto border-2 border-red-200 animate-scale-up">
              <Flame className="text-red-600 md:w-8 md:h-8" size={20} />
              <span className="text-red-600 font-bold text-lg md:text-3xl">FLASH SALE</span>
              <span className="text-sm text-red-600 font-medium hidden sm:inline">Limited Time Offers</span>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1" style={{ width: 'max-content' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-[320px] w-[160px] animate-pulse flex-shrink-0">
                <div className="bg-gray-200 h-28 rounded-t-lg"></div>
                <div className="p-2 space-y-1">
                  <div className="bg-gray-200 h-2 rounded"></div>
                  <div className="bg-gray-200 h-2 w-3/4 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (flashSaleProducts.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-gradient-to-br from-red-50 via-orange-50 to-red-50 rounded-3xl p-6 md:p-8 shadow-lg border border-red-100">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-200/20 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl -z-0"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-6 md:mb-8">
          {/* Title Badge */}
          <div className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-orange-600 px-6 sm:px-10 py-4 rounded-2xl mb-4 shadow-xl animate-scale-up">
            <Flame className="text-white animate-pulse w-6 h-6 md:w-8 md:h-8" />
            <span className="text-white font-bold text-xl md:text-4xl tracking-wide">FLASH SALE</span>
            <Flame className="text-white animate-pulse w-6 h-6 md:w-8 md:h-8" />
          </div>
          
          <p className="text-red-700 font-semibold text-sm md:text-lg mb-4">
            ⚡ Limited Time Offers - Don't Miss Out!
          </p>
          
          {/* View More Link */}
          <div className="flex justify-center md:justify-end mb-4">
            <a 
              href="/flash-sale-products" 
              className="inline-flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-sm md:text-base border border-red-200"
            >
              View All Flash Deals
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Products Carousel */}
        <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide -mx-2 px-2">
          <div className="flex gap-4 md:gap-5 pb-2" style={{ width: 'max-content' }}>
            {flashSaleProducts.slice(0, 15).map((product: any, index: number) => (
              <div 
                key={product.id} 
                className="flex-shrink-0 animate-fade-in hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
