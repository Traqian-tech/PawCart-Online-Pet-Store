import { Cat } from 'lucide-react';
import ProductCard from '@/components/ui/product-card';
import { useQuery } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';

function BestsellerDisplay({ products }: { products: any[] }) {
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
            className="flex-shrink-0 animate-fade-in hover:scale-105 transition-transform duration-300"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BestsellersCats() {
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  const catCategories = ['cat-food', 'cat-toys', 'cat-litter', 'cat-care', 'cat-accessories'];
  const products = (allProducts as any[]).filter((product: any) => 
    product.isBestseller && 
    catCategories.includes(product.category)
  );

  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-white to-green-50 rounded-3xl p-6 md:p-8 shadow-lg border border-emerald-100">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-200/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="mb-6 md:mb-8">
          {/* Title */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#26732d] to-emerald-600 rounded-xl shadow-lg">
                <Cat className="text-white w-6 h-6 md:w-7 md:h-7" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[#26732d] to-emerald-600 bg-clip-text text-transparent">
                BESTSELLERS FOR CATS
              </h2>
            </div>
            
            {/* View More Link */}
            <a 
              href="/cat-best-seller" 
              className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-[#26732d] hover:text-emerald-700 font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-sm md:text-base border border-emerald-200 w-fit"
            >
              View All Cat Products
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </a>
          </div>
        </div>
        {isLoading ? (
          <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
            <div className="flex gap-4 md:gap-5 pb-2" style={{ width: 'max-content' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-md h-80 animate-pulse border border-gray-100">
                  <div className="bg-gray-200 h-48 rounded-t-2xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="bg-gray-200 h-4 rounded"></div>
                    <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                    <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <Cat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No bestselling cat products available at the moment.</p>
          </div>
        ) : (
          <BestsellerDisplay products={products.slice(0, 15)} />
        )}
      </div>
    </section>
  );
}
