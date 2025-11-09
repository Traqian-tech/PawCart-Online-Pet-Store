import { useQuery } from '@tanstack/react-query';
import { getOrCreateSessionId } from '@/lib/session-utils';
import { useAuth } from '@/hooks/use-auth';

export interface RecommendationProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  category: string;
  categoryName: string;
  subcategory: string;
  brandId: string;
  brandName: string;
  brandSlug: string;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  stock: number;
  stockStatus: string;
  tags: string[];
  features: string[];
  isNew: boolean;
  isBestseller: boolean;
  isOnSale: boolean;
  discount: number;
  description: string;
  specifications: any;
  recommendationScore?: number;
  recommendationReason?: string;
}

interface UseRecommendationsOptions {
  type: 'personalized' | 'similar' | 'frequently_bought_together' | 'trending';
  productId?: string;
  limit?: number;
  excludeProductIds?: string[];
  enabled?: boolean;
}

export function useRecommendations(options: UseRecommendationsOptions) {
  const { type, productId, limit = 12, excludeProductIds = [], enabled = true } = options;
  const { user } = useAuth();
  const sessionId = getOrCreateSessionId();

  const queryKey = [
    '/api/recommendations',
    type,
    user?.id,
    sessionId,
    productId,
    limit,
    excludeProductIds.join(',')
  ];

  const queryFn = async (): Promise<RecommendationProduct[]> => {
    let url = '';
    
    switch (type) {
      case 'personalized':
        url = `/api/recommendations/personalized?limit=${limit}`;
        if (user?.id) url += `&userId=${user.id}`;
        if (sessionId) url += `&sessionId=${sessionId}`;
        if (excludeProductIds.length > 0) {
          url += `&exclude=${excludeProductIds.join(',')}`;
        }
        break;
      case 'similar':
        if (!productId) throw new Error('productId is required for similar recommendations');
        url = `/api/recommendations/similar/${productId}?limit=${limit}`;
        if (excludeProductIds.length > 0) {
          url += `&exclude=${excludeProductIds.join(',')}`;
        }
        break;
      case 'frequently_bought_together':
        if (!productId) throw new Error('productId is required for frequently bought together');
        url = `/api/recommendations/frequently-bought-together/${productId}?limit=${limit}`;
        if (excludeProductIds.length > 0) {
          url += `&exclude=${excludeProductIds.join(',')}`;
        }
        break;
      case 'trending':
        url = `/api/recommendations/trending?limit=${limit}`;
        break;
      default:
        throw new Error(`Unknown recommendation type: ${type}`);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch recommendations');
    }
    const data = await response.json();
    return data.products || [];
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled: enabled && (type !== 'similar' && type !== 'frequently_bought_together' ? true : !!productId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Track user behavior for recommendations
 */
export async function trackBehavior(
  productId: string,
  behaviorType: 'view' | 'click' | 'add_to_cart' | 'purchase' | 'wishlist',
  userId?: string,
  metadata?: any
): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();
    
    await fetch('/api/recommendations/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        sessionId,
        productId,
        behaviorType,
        metadata
      }),
    });
  } catch (error) {
    console.error('Error tracking behavior:', error);
    // Don't throw - tracking should not break the app
  }
}

