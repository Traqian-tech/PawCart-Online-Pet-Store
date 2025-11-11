import { Product, Order, UserBehavior, ProductRecommendation, Pet } from '../shared/models';
import mongoose from 'mongoose';

export interface RecommendationOptions {
  userId?: string;
  sessionId?: string;
  productId?: string;
  categoryId?: string;
  limit?: number;
  excludeProductIds?: string[];
}

export interface RecommendedProduct {
  product: any;
  score: number;
  reason: string;
}

/**
 * Smart Product Recommendation Service
 * Implements multiple recommendation strategies:
 * 1. Personalized recommendations (based on user behavior)
 * 2. Similar products (based on category, brand, tags)
 * 3. Frequently bought together
 * 4. Trending products
 * 5. Popular in category
 */
export class RecommendationService {
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly DEFAULT_LIMIT = 12;

  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(options: RecommendationOptions): Promise<RecommendedProduct[]> {
    const { userId, sessionId, limit = this.DEFAULT_LIMIT, excludeProductIds = [] } = options;

    // Check cache first
    const cacheKey = userId || sessionId;
    if (cacheKey) {
      const cached = await this.getCachedRecommendations(cacheKey, 'personalized');
      if (cached) {
        return cached;
      }
    }

    const recommendations: RecommendedProduct[] = [];

    // Strategy 1: Based on browsing history
    if (userId || sessionId) {
      const browsingRecs = await this.getRecommendationsFromBrowsingHistory(userId, sessionId, limit, excludeProductIds);
      recommendations.push(...browsingRecs);
    }

    // Strategy 2: Based on purchase history
    if (userId) {
      const purchaseRecs = await this.getRecommendationsFromPurchaseHistory(userId, limit, excludeProductIds);
      recommendations.push(...purchaseRecs);
    }

    // Strategy 3: Collaborative filtering (users who bought similar items)
    if (userId) {
      const collaborativeRecs = await this.getCollaborativeFilteringRecommendations(userId, limit, excludeProductIds);
      recommendations.push(...collaborativeRecs);
    }

    // Strategy 4: Popular products in user's preferred categories
    if (userId || sessionId) {
      const categoryRecs = await this.getCategoryBasedRecommendations(userId, sessionId, limit, excludeProductIds);
      recommendations.push(...categoryRecs);
    }

    // Strategy 5: Based on pet profiles
    if (userId) {
      const petRecs = await this.getRecommendationsFromPetProfiles(userId, limit, excludeProductIds);
      recommendations.push(...petRecs);
    }

    // Merge and deduplicate recommendations
    const merged = this.mergeAndDeduplicate(recommendations, limit);

    // Cache the results
    if (cacheKey) {
      await this.cacheRecommendations(cacheKey, 'personalized', merged);
    }

    return merged;
  }

  /**
   * Get similar products based on a product
   */
  async getSimilarProducts(options: RecommendationOptions): Promise<RecommendedProduct[]> {
    const { productId, limit = this.DEFAULT_LIMIT, excludeProductIds = [] } = options;

    if (!productId) {
      return [];
    }

    // Check cache
    const cached = await this.getCachedRecommendations(productId, 'similar');
    if (cached) {
      return cached;
    }

    const product = await Product.findById(productId);
    if (!product) {
      return [];
    }

    const recommendations: RecommendedProduct[] = [];

    // Find products in same category
    if (product.categoryId) {
      const categoryProducts = await Product.find({
        categoryId: product.categoryId,
        _id: { $ne: productId, $nin: excludeProductIds },
        isActive: true,
        stockQuantity: { $gt: 0 }
      })
        .limit(limit * 2)
        .lean();

      for (const p of categoryProducts) {
        let score = 0.5; // Base score for same category

        // Same brand gets higher score
        if (p.brandId === product.brandId) {
          score += 0.3;
        }

        // Similar price range gets higher score
        const priceDiff = Math.abs((p.price - product.price) / product.price);
        if (priceDiff < 0.2) {
          score += 0.2;
        }

        // Higher rating gets higher score
        if (p.rating > 4) {
          score += 0.1;
        }

        recommendations.push({
          product: p,
          score,
          reason: 'Similar category and features'
        });
      }
    }

    // Find products with similar tags
    if (product.tags && product.tags.length > 0) {
      const tagProducts = await Product.find({
        tags: { $in: product.tags },
        _id: { $ne: productId, $nin: excludeProductIds },
        isActive: true,
        stockQuantity: { $gt: 0 }
      })
        .limit(limit)
        .lean();

      for (const p of tagProducts) {
        const commonTags = p.tags?.filter((tag: string) => product.tags?.includes(tag)).length || 0;
        const score = 0.3 + (commonTags / (product.tags?.length || 1)) * 0.4;

        recommendations.push({
          product: p,
          score,
          reason: `Similar tags (${commonTags} common)`
        });
      }
    }

    // Sort by score and limit
    const sorted = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Cache results
    await this.cacheRecommendations(productId, 'similar', sorted);

    return sorted;
  }

  /**
   * Get frequently bought together products
   */
  async getFrequentlyBoughtTogether(options: RecommendationOptions): Promise<RecommendedProduct[]> {
    const { productId, limit = 6, excludeProductIds = [] } = options;

    if (!productId) {
      return [];
    }

    // Check cache
    const cached = await this.getCachedRecommendations(productId, 'frequently_bought_together');
    if (cached) {
      return cached;
    }

    // Find orders that contain this product
    const orders = await Order.find({
      'items.productId': productId,
      status: { $ne: 'Cancelled' }
    })
      .limit(1000)
      .lean();

    // Count how often other products appear with this product
    const productCounts = new Map<string, number>();

    for (const order of orders) {
      const items = order.items || [];
      for (const item of items) {
        const otherProductId = item.productId?.toString();
        if (otherProductId && otherProductId !== productId && !excludeProductIds.includes(otherProductId)) {
          productCounts.set(otherProductId, (productCounts.get(otherProductId) || 0) + 1);
        }
      }
    }

    // Get top products
    const topProductIds = Array.from(productCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    if (topProductIds.length === 0) {
      // Fallback to similar products
      return this.getSimilarProducts({ productId, limit, excludeProductIds });
    }

    const products = await Product.find({
      _id: { $in: topProductIds },
      isActive: true
    }).lean();

    // Create recommendations with scores based on frequency
    const recommendations: RecommendedProduct[] = products.map((product) => {
      const frequency = productCounts.get(product._id.toString()) || 0;
      const score = Math.min(frequency / orders.length, 1.0);

      return {
        product,
        score,
        reason: `Frequently bought together (${frequency} times)`
      };
    });

    // Sort by score
    recommendations.sort((a, b) => b.score - a.score);

    // Cache results
    await this.cacheRecommendations(productId, 'frequently_bought_together', recommendations);

    return recommendations;
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(limit: number = this.DEFAULT_LIMIT): Promise<RecommendedProduct[]> {
    // Check cache
    const cached = await this.getCachedRecommendations('global', 'trending');
    if (cached) {
      return cached;
    }

    // Get products with high recent activity (views, purchases in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Count recent views
    const recentViews = await UserBehavior.aggregate([
      {
        $match: {
          behaviorType: { $in: ['view', 'click', 'purchase'] },
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: '$productId',
          count: { $sum: 1 },
          purchaseCount: {
            $sum: { $cond: [{ $eq: ['$behaviorType', 'purchase'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1, purchaseCount: -1 }
      },
      {
        $limit: limit * 2
      }
    ]);

    const productIds = recentViews.map((v) => v._id);

    if (productIds.length === 0) {
      // Fallback to bestsellers
      const products = await Product.find({
        isActive: true,
        isBestseller: true,
        stockQuantity: { $gt: 0 }
      })
        .sort({ rating: -1, reviews: -1 })
        .limit(limit)
        .lean();

      return products.map((product) => ({
        product,
        score: 0.8,
        reason: 'Popular bestseller'
      }));
    }

    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
      stockQuantity: { $gt: 0 }
    }).lean();

    // Create recommendations with scores
    const viewCountMap = new Map(recentViews.map((v) => [v._id, v.count]));
    const purchaseCountMap = new Map(recentViews.map((v) => [v._id, v.purchaseCount]));

    const recommendations: RecommendedProduct[] = products.map((product) => {
      const views = viewCountMap.get(product._id.toString()) || 0;
      const purchases = purchaseCountMap.get(product._id.toString()) || 0;
      const score = Math.min((views * 0.3 + purchases * 0.7) / 100, 1.0);

      return {
        product,
        score,
        reason: `Trending (${views} views, ${purchases} purchases this week)`
      };
    });

    recommendations.sort((a, b) => b.score - a.score);
    const result = recommendations.slice(0, limit);

    // Cache results
    await this.cacheRecommendations('global', 'trending', result);

    return result;
  }

  /**
   * Track user behavior
   */
  async trackBehavior(
    userId: string | undefined,
    sessionId: string,
    productId: string,
    behaviorType: 'view' | 'click' | 'add_to_cart' | 'purchase' | 'wishlist',
    metadata?: any
  ): Promise<void> {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return;
      }

      await UserBehavior.create({
        userId,
        sessionId,
        productId,
        behaviorType,
        categoryId: product.categoryId,
        brandId: product.brandId,
        metadata
      });

      // Invalidate cache for this user
      if (userId || sessionId) {
        await this.invalidateCache(userId || sessionId);
      }
    } catch (error) {
      console.error('Error tracking behavior:', error);
      // Don't throw - tracking should not break the app
    }
  }

  // Private helper methods

  private async getRecommendationsFromBrowsingHistory(
    userId: string | undefined,
    sessionId: string | undefined,
    limit: number,
    excludeProductIds: string[]
  ): Promise<RecommendedProduct[]> {
    if (!userId && !sessionId) {
      return [];
    }

    const query: any = {};
    if (userId) {
      query.userId = userId;
    } else {
      query.sessionId = sessionId;
    }

    // Get recently viewed products
    const recentBehaviors = await UserBehavior.find({
      ...query,
      behaviorType: { $in: ['view', 'click'] },
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    if (recentBehaviors.length === 0) {
      return [];
    }

    // Get categories and brands from browsing history
    const categoryIds = [...new Set(recentBehaviors.map((b) => b.categoryId).filter(Boolean))];
    const brandIds = [...new Set(recentBehaviors.map((b) => b.brandId).filter(Boolean))];

    // Find products in similar categories/brands
    const products = await Product.find({
      $or: [
        { categoryId: { $in: categoryIds } },
        { brandId: { $in: brandIds } }
      ],
      _id: { $nin: excludeProductIds },
      isActive: true,
      stockQuantity: { $gt: 0 }
    })
      .limit(limit * 2)
      .lean();

    return products.map((product) => ({
      product,
      score: 0.6,
      reason: 'Based on your browsing history'
    }));
  }

  private async getRecommendationsFromPurchaseHistory(
    userId: string,
    limit: number,
    excludeProductIds: string[]
  ): Promise<RecommendedProduct[]> {
    const orders = await Order.find({
      userId,
      status: { $ne: 'Cancelled' }
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    if (orders.length === 0) {
      return [];
    }

    // Get categories and brands from purchase history
    const categoryIds = new Set<string>();
    const brandIds = new Set<string>();

    for (const order of orders) {
      for (const item of order.items || []) {
        if (item.categoryId) categoryIds.add(item.categoryId);
        if (item.brandId) brandIds.add(item.brandId);
      }
    }

    // Find products in similar categories/brands
    const products = await Product.find({
      $or: [
        { categoryId: { $in: Array.from(categoryIds) } },
        { brandId: { $in: Array.from(brandIds) } }
      ],
      _id: { $nin: excludeProductIds },
      isActive: true,
      stockQuantity: { $gt: 0 }
    })
      .limit(limit)
      .lean();

    return products.map((product) => ({
      product,
      score: 0.8,
      reason: 'Based on your purchase history'
    }));
  }

  private async getCollaborativeFilteringRecommendations(
    userId: string,
    limit: number,
    excludeProductIds: string[]
  ): Promise<RecommendedProduct[]> {
    // Get user's purchased products
    const userOrders = await Order.find({
      userId,
      status: { $ne: 'Cancelled' }
    }).lean();

    const userProductIds = new Set<string>();
    for (const order of userOrders) {
      for (const item of order.items || []) {
        userProductIds.add(item.productId?.toString() || '');
      }
    }

    if (userProductIds.size === 0) {
      return [];
    }

    // Find other users who bought similar products
    const similarUserOrders = await Order.find({
      userId: { $ne: userId },
      'items.productId': { $in: Array.from(userProductIds) },
      status: { $ne: 'Cancelled' }
    })
      .limit(100)
      .lean();

    // Count products bought by similar users
    const productCounts = new Map<string, number>();
    for (const order of similarUserOrders) {
      for (const item of order.items || []) {
        const productId = item.productId?.toString();
        if (productId && !userProductIds.has(productId) && !excludeProductIds.includes(productId)) {
          productCounts.set(productId, (productCounts.get(productId) || 0) + 1);
        }
      }
    }

    if (productCounts.size === 0) {
      return [];
    }

    // Get top recommended products
    const topProductIds = Array.from(productCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    const products = await Product.find({
      _id: { $in: topProductIds },
      isActive: true,
      stockQuantity: { $gt: 0 }
    }).lean();

    return products.map((product) => ({
      product,
      score: 0.7,
      reason: 'Users with similar preferences also bought'
    }));
  }

  private async getCategoryBasedRecommendations(
    userId: string | undefined,
    sessionId: string | undefined,
    limit: number,
    excludeProductIds: string[]
  ): Promise<RecommendedProduct[]> {
    const query: any = {};
    if (userId) {
      query.userId = userId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    } else {
      return [];
    }

    // Get user's preferred categories
    const behaviors = await UserBehavior.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const categoryCounts = new Map<string, number>();
    for (const behavior of behaviors) {
      if (behavior.categoryId) {
        categoryCounts.set(behavior.categoryId, (categoryCounts.get(behavior.categoryId) || 0) + 1);
      }
    }

    if (categoryCounts.size === 0) {
      return [];
    }

    // Get top categories
    const topCategories = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    // Get popular products in these categories
    const products = await Product.find({
      categoryId: { $in: topCategories },
      _id: { $nin: excludeProductIds },
      isActive: true,
      stockQuantity: { $gt: 0 }
    })
      .sort({ rating: -1, reviews: -1 })
      .limit(limit)
      .lean();

    return products.map((product) => ({
      product,
      score: 0.5,
      reason: 'Popular in your preferred categories'
    }));
  }

  /**
   * Get recommendations based on user's pet profiles
   */
  private async getRecommendationsFromPetProfiles(
    userId: string,
    limit: number,
    excludeProductIds: string[]
  ): Promise<RecommendedProduct[]> {
    try {
      // Get user's pets
      const pets = await Pet.find({ userId, isActive: true }).lean();
      
      if (pets.length === 0) {
        return [];
      }

      // Map species to category slugs/names
      const speciesToCategoryMap: Record<string, string[]> = {
        cat: ['cat-food', 'cat-toys', 'cat-litter', 'cat-care', 'cat-accessories'],
        dog: ['dog-food', 'dog-accessories'],
        rabbit: ['rabbit'],
        bird: ['bird'],
        hamster: ['hamster'],
        other: []
      };

      // Collect all relevant categories
      const relevantCategories = new Set<string>();
      pets.forEach(pet => {
        const categories = speciesToCategoryMap[pet.species] || [];
        categories.forEach(cat => relevantCategories.add(cat));
      });

      if (relevantCategories.size === 0) {
        return [];
      }

      // Find products in relevant categories
      // Note: This assumes category slugs match. You may need to adjust based on your category structure
      const products = await Product.find({
        isActive: true,
        stockQuantity: { $gt: 0 },
        _id: { $nin: excludeProductIds.map(id => new mongoose.Types.ObjectId(id)) }
      })
        .lean();

      // Filter products by category (you may need to join with Category collection)
      // For now, we'll use a simple approach based on product tags or subcategory
      const recommendedProducts = products
        .filter(product => {
          // Check if product matches any pet's species
          const productCategory = product.subcategory?.toLowerCase() || '';
          const productTags = (product.tags || []).map(t => t.toLowerCase());
          
          return pets.some(pet => {
            const categories = speciesToCategoryMap[pet.species] || [];
            return categories.some(cat => 
              productCategory.includes(cat.replace('-', '')) ||
              productTags.some(tag => tag.includes(pet.species))
            );
          });
        })
        .slice(0, limit);

      return recommendedProducts.map((product) => ({
        product,
        score: 0.8,
        reason: `Recommended for your ${pets.map(p => p.name).join(', ')}`
      }));
    } catch (error) {
      console.error('Error getting pet-based recommendations:', error);
      return [];
    }
  }

  private mergeAndDeduplicate(
    recommendations: RecommendedProduct[],
    limit: number
  ): RecommendedProduct[] {
    const productMap = new Map<string, RecommendedProduct>();

    for (const rec of recommendations) {
      const productId = rec.product._id?.toString() || rec.product.id?.toString();
      if (!productId) continue;

      const existing = productMap.get(productId);
      if (!existing || rec.score > existing.score) {
        productMap.set(productId, rec);
      } else {
        // Merge scores
        existing.score = (existing.score + rec.score) / 2;
      }
    }

    return Array.from(productMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async getCachedRecommendations(
    key: string,
    type: 'personalized' | 'trending' | 'similar' | 'frequently_bought_together'
  ): Promise<RecommendedProduct[] | null> {
    try {
      const cached = await ProductRecommendation.findOne({
        $or: [{ userId: key }, { sessionId: key }, { userId: undefined, sessionId: undefined }],
        recommendationType: type,
        expiresAt: { $gt: new Date() }
      })
        .sort({ updatedAt: -1 })
        .lean();

      if (!cached || !cached.productIds || cached.productIds.length === 0) {
        return null;
      }

      const products = await Product.find({
        _id: { $in: cached.productIds },
        isActive: true
      }).lean();

      if (products.length === 0) {
        return null;
      }

      // Reconstruct recommendations with scores
      const recommendations: RecommendedProduct[] = products.map((product, index) => ({
        product,
        score: cached.scores?.[index] || 0.5,
        reason: `Cached ${type} recommendation`
      }));

      return recommendations;
    } catch (error) {
      console.error('Error getting cached recommendations:', error);
      return null;
    }
  }

  private async cacheRecommendations(
    key: string,
    type: 'personalized' | 'trending' | 'similar' | 'frequently_bought_together',
    recommendations: RecommendedProduct[]
  ): Promise<void> {
    try {
      const productIds = recommendations.map((rec) => rec.product._id?.toString() || rec.product.id?.toString()).filter(Boolean);
      const scores = recommendations.map((rec) => rec.score);

      const expiresAt = new Date(Date.now() + this.CACHE_DURATION);

      const query: any = {
        recommendationType: type,
        expiresAt: { $gt: new Date() }
      };

      if (type === 'trending') {
        query.userId = undefined;
        query.sessionId = undefined;
      } else {
        query.$or = [{ userId: key }, { sessionId: key }];
      }

      await ProductRecommendation.findOneAndUpdate(
        query,
        {
          userId: type === 'trending' ? undefined : key,
          sessionId: type === 'trending' ? undefined : key,
          recommendationType: type,
          productIds,
          scores,
          expiresAt
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error caching recommendations:', error);
      // Don't throw - caching is not critical
    }
  }

  private async invalidateCache(key: string): Promise<void> {
    try {
      await ProductRecommendation.deleteMany({
        $or: [{ userId: key }, { sessionId: key }],
        recommendationType: 'personalized'
      });
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService();

