import { useRecommendations, RecommendationProduct } from '@/hooks/use-recommendations';
import ProductCard from '@/components/ui/product-card';
import { Sparkles, TrendingUp, ShoppingBag, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductRecommendationsProps {
  type: 'personalized' | 'similar' | 'frequently_bought_together' | 'trending';
  productId?: string;
  title?: string;
  limit?: number;
  excludeProductIds?: string[];
  className?: string;
  showTitle?: boolean;
}

const typeConfig = {
  personalized: {
    icon: Sparkles,
    defaultTitle: 'Recommended for You',
    description: 'Based on your browsing and purchase history'
  },
  similar: {
    icon: ShoppingBag,
    defaultTitle: 'Similar Products',
    description: 'You might also like'
  },
  frequently_bought_together: {
    icon: ShoppingBag,
    defaultTitle: 'Frequently Bought Together',
    description: 'Customers also bought'
  },
  trending: {
    icon: TrendingUp,
    defaultTitle: 'Trending Now',
    description: 'Popular products this week'
  }
};

export default function ProductRecommendations({
  type,
  productId,
  title,
  limit = 12,
  excludeProductIds = [],
  className,
  showTitle = true
}: ProductRecommendationsProps) {
  const { data: products = [], isLoading, error } = useRecommendations({
    type,
    productId,
    limit,
    excludeProductIds,
    enabled: true
  });

  const config = typeConfig[type];
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;

  if (error) {
    console.error('Recommendation error:', error);
    return null; // Fail silently
  }

  if (isLoading) {
    return (
      <div className={cn("py-8", className)}>
        {showTitle && (
          <div className="flex items-center gap-2 mb-6">
            <Icon className="w-5 h-5 text-[#26732d]" />
            <h2 className="text-xl font-bold text-gray-900">{displayTitle}</h2>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-2xl h-[240px] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null; // Don't show empty sections
  }

  return (
    <div className={cn("py-8", className)}>
      {showTitle && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-5 h-5 text-[#26732d]" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {displayTitle}
            </h2>
          </div>
          {config.description && (
            <p className="text-sm text-gray-600 ml-7">{config.description}</p>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

