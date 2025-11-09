import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRecommendations } from '@/hooks/use-recommendations';
import ProductCard from '@/components/ui/product-card';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendationsTabsProps {
  limit?: number;
  className?: string;
  defaultTab?: 'personalized' | 'trending' | 'smart';
}

function ProductDisplay({ products }: { products: any[] }) {
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

export default function RecommendationsTabs({
  limit = 12,
  className,
  defaultTab = 'smart'
}: RecommendationsTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  
  // Fetch both types for smart recommendation
  const { data: personalizedProducts = [], isLoading: isLoadingPersonalized } = useRecommendations({
    type: 'personalized',
    limit,
    enabled: activeTab === 'smart' || activeTab === 'personalized'
  });
  
  const { data: trendingProducts = [], isLoading: isLoadingTrending } = useRecommendations({
    type: 'trending',
    limit,
    enabled: activeTab === 'smart' || activeTab === 'trending'
  });

  // Smart recommendation: use personalized if available, otherwise use trending
  const smartProducts = personalizedProducts.length > 0 ? personalizedProducts : trendingProducts;
  const isLoadingSmart = activeTab === 'smart' && (isLoadingPersonalized || (personalizedProducts.length === 0 && isLoadingTrending));

  const renderProducts = (products: any[], isLoading: boolean) => {
    if (isLoading) {
      return (
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
      );
    }

    if (!products || products.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No recommendations available at the moment.</p>
        </div>
      );
    }

    return <ProductDisplay products={products} />;
  };

  return (
    <section className={cn("relative bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-3xl p-6 md:p-8 shadow-lg border border-purple-100", className)}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6 md:mb-8">
            {/* Title */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="inline-flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg">
                  <Sparkles className="text-white w-6 h-6 md:w-7 md:h-7" />
                </div>
                <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  DISCOVER PRODUCTS
                </h2>
              </div>
              
              {/* Tabs */}
              <TabsList className="bg-white/90 backdrop-blur-sm border border-purple-200 rounded-xl p-1 h-auto shadow-md">
                <TabsTrigger
                  value="smart"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all font-semibold text-sm md:text-base"
                >
                  <Zap className="w-4 h-4" />
                  <span>Smart</span>
                </TabsTrigger>
                <TabsTrigger
                  value="personalized"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all font-semibold text-sm md:text-base"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>For You</span>
                </TabsTrigger>
                <TabsTrigger
                  value="trending"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all font-semibold text-sm md:text-base"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="smart" className="mt-0">
            {personalizedProducts.length > 0 && (
              <div className="mb-4">
                <p className="text-sm md:text-base text-purple-700 font-medium ml-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Personalized recommendations based on your activity
                </p>
              </div>
            )}
            {personalizedProducts.length === 0 && !isLoadingPersonalized && (
              <div className="mb-4">
                <p className="text-sm md:text-base text-indigo-700 font-medium ml-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending products this week
                </p>
              </div>
            )}
            {renderProducts(smartProducts, isLoadingSmart)}
          </TabsContent>

          <TabsContent value="personalized" className="mt-0">
            <div className="mb-4">
              <p className="text-sm md:text-base text-purple-700 font-medium ml-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Based on your browsing and purchase history
              </p>
            </div>
            {renderProducts(personalizedProducts, isLoadingPersonalized)}
          </TabsContent>

          <TabsContent value="trending" className="mt-0">
            <div className="mb-4">
              <p className="text-sm md:text-base text-indigo-700 font-medium ml-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Popular products this week
              </p>
            </div>
            {renderProducts(trendingProducts, isLoadingTrending)}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

