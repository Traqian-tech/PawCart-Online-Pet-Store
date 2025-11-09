import { Sparkles } from 'lucide-react';
import ProductCard from '@/components/ui/product-card';
import { useQuery } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';

function NewlyLaunchedDisplay({ products }: { products: any[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userInteractedRef = useRef(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || products.length === 0 || userInteractedRef.current) return;

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
  }, [products.length]);

  if (products.length === 0) {
    return null;
  }

  return (
    <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide -mx-2 px-2">
      <div className="flex gap-4 md:gap-5 pb-2" style={{ width: 'max-content' }}>
        {products.slice(0, 15).map((product: any, index: number) => (
          <div 
            key={product.id || product._id} 
            className="flex-shrink-0 relative animate-fade-in hover:scale-105 transition-transform duration-300"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="absolute top-2 left-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 z-10 shadow-lg animate-pulse">
              <Sparkles size={14} />
              JUST IN
            </div>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NewlyLaunched() {
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  const products = (allProducts as any[]).filter((product: any) => product.isNew);

  if (isLoading) {
    return (
      <section className="py-12 bg-[#f0f8ff]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-lg font-bold text-[#26732d] mb-4 flex items-center justify-center gap-2">
              <Sparkles size={20} className="text-[#26732d]" />
              NEWLY LAUNCHED
            </h2>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 pb-1" style={{ width: 'max-content' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-[160px] h-[320px] bg-white rounded-lg shadow-md animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                  <div className="p-4 space-y-2">
                    <div className="bg-gray-200 h-4 rounded"></div>
                    <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-3xl p-6 md:p-8 shadow-lg border border-pink-100">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-pink-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="mb-6 md:mb-8">
          {/* Title */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl shadow-lg">
                <Sparkles className="text-white w-6 h-6 md:w-7 md:h-7" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                NEWLY LAUNCHED
              </h2>
            </div>
            
            {/* View More Link */}
            <a 
              href="/newly-launched" 
              className="inline-flex items-center gap-2 bg-white hover:bg-pink-50 text-pink-700 hover:text-purple-700 font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-sm md:text-base border border-pink-200 w-fit"
            >
              View All New Products
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </a>
          </div>
        </div>
        <NewlyLaunchedDisplay products={products.slice(0, 15)} />
      </div>
    </section>
  );
}
