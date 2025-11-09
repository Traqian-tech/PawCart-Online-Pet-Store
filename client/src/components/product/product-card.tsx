import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Star, Check, Crown } from "lucide-react";
import { Product } from "@/lib/product-data";
import { Product as HookProduct } from "@/hooks/use-products";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/hooks/use-wishlist";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/currency-context";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/hooks/use-auth";
import { translateProductName } from "@/lib/product-translator";
import { cn } from "@/lib/utils";
// Removed getProductSlug import - using persisted slug from server

interface ProductCardProps {
  product: Product | HookProduct;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem, getItemQuantity } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const { format } = useCurrency();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const isLiked = isInWishlist(product.id);
  
  // Translate product name based on current language
  const translatedName = translateProductName(product.name, language);

  // Use the persisted product slug from server
  const productSlug = (product as any).slug || "product";

  const itemQuantity = getItemQuantity(product.id);
  const isInCart = itemQuantity > 0;

  // Check if user has active membership
  const hasActiveMembership = () => {
    const membership = (user as any)?.membership;
    return membership && new Date(membership.expiryDate) > new Date();
  };

  const handleAddToCart = async () => {
    if (product.stock === 0) return;

    // Check if product is member-exclusive and user doesn't have membership
    if ((product as any).isMemberExclusive && !hasActiveMembership()) {
      toast({
        title: "👑 Member-Only Product",
        description: "This product is exclusive to our Privilege Club members. Upgrade now to unlock!",
        action: (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setLocation('/privilege-club')}
            className="mt-2"
          >
            Join Club
          </Button>
        ),
      });
      return;
    }

    setIsAddingToCart(true);

    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        maxStock: product.stock,
      });

      toast({
        title: t('cart.addedToCart'),
        description: `${translatedName} ${t('cart.itemAdded')}`,
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={10}
        className={
          index < rating ? "text-yellow-500 fill-current" : "text-gray-300"
        }
      />
    ));
  };

  const getBadgeColor = (product: Product) => {
    if (product.isMemberExclusive) return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
    if (product.isBestSeller) return "bg-yellow-500 text-white";
    if (product.isNew) return "bg-blue-500 text-white";
    if (product.isLowStock) return "bg-red-500 text-white";
    return "bg-gray-500 text-white";
  };

  const getBadgeText = (product: Product) => {
    if (product.isMemberExclusive) return "👑 Member Only";
    if (product.isBestSeller) return t('product.bestSeller');
    if (product.isNew) return t('product.new');
    if (product.isLowStock) return t('product.lowStock');
    return null;
  };

  const badgeText = getBadgeText(product);
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;

  return (
    <Link href={`/product/${productSlug}`}>
      <Card
        className={cn(
          "group card-brand hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 relative overflow-hidden bg-white rounded-2xl w-full max-w-[200px] mx-auto h-[280px] sm:h-[280px] md:h-[280px] lg:h-[280px] flex flex-col cursor-pointer",
          className,
        )}
      >
      {/* Discount Badge - Enhanced with Animation */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-extrabold bg-gradient-to-br from-[var(--meow-error)] to-[var(--meow-pink)] text-white shadow-lg z-10 pulse-soft">
          -{format(Math.round(product.originalPrice! - product.price))}
        </div>
      )}

      {/* Other Badges - Enhanced */}
      {badgeText && !hasDiscount && (
        <div
          className={cn(
            "absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-extrabold z-10 shadow-lg backdrop-blur-sm",
            getBadgeColor(product),
          )}
        >
          {badgeText}
        </div>
      )}

      {/* Like Button - Enhanced with Heartbeat */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isLiked) {
              removeFromWishlist(product.id);
              toast({
                title: "Removed from wishlist",
                description: `${translatedName} has been removed from your wishlist.`,
              });
            } else {
              addToWishlist({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                slug: productSlug || undefined,
              });
              toast({
                title: "Added to wishlist",
                description: `${translatedName} has been added to your wishlist.`,
              });
            }
          }}
          className={cn(
            "bg-white/95 backdrop-blur-md p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 btn-bounce",
            isLiked ? "text-red-500 scale-110" : "text-gray-400 hover:text-red-500"
          )}
        >
          <Heart
            size={16}
            className={cn(
              "transition-all duration-300",
              isLiked ? "fill-current animate-heartbeat" : "",
            )}
          />
        </button>
      </div>

      {/* Product Image - Enhanced with Zoom */}
      <div className="relative image-zoom bg-gradient-to-br from-[var(--meow-gray-50)] via-white to-[var(--meow-yellow-pale)] rounded-t-2xl h-28 sm:h-28 md:h-28 lg:h-28 flex-shrink-0">
        <img
          src={product.image}
          alt={translatedName}
          className="w-full h-full object-contain p-3 transition-all duration-500"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--meow-green)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 ring-1 ring-inset ring-gray-100 rounded-t-2xl opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
      </div>

      <CardContent className="px-3 pt-2 pb-3 flex flex-col flex-1">
        <div className="space-y-1.5">
          {/* Category Tag - Enhanced */}
          {product.tags && product.tags.length > 0 && (
            <div className="inline-block text-xs text-[var(--meow-green)] font-semibold uppercase tracking-wider bg-[var(--meow-green-pale)] px-2 py-0.5 rounded-md">
              {translateProductName(product.tags[0], language)}
            </div>
          )}

          {/* Product Name - Enhanced */}
          <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-2 group-hover:text-[var(--meow-green)] transition-all duration-300 text-left">
            {translatedName}
          </h3>

          {/* Rating - Enhanced */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {renderStars(product.rating)}
              </div>
              <span className="text-xs font-semibold text-[var(--meow-gray-600)]">({product.reviews})</span>
            </div>
          )}

          {/* Price Section - Enhanced */}
          <div className="text-left mt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-[var(--meow-green)] tracking-tight">
                {format(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[var(--meow-gray-400)] line-through font-medium">
                  {format(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Add to Cart Button - Enhanced */}
        <div className="mt-auto mb-2">
          <Button
            variant={isInCart ? "meowGreen" : "meowOutline"}
            size="sm"
            className={cn(
              "w-full rounded-xl py-2.5 text-sm font-bold transition-all duration-300 shadow-md hover:shadow-xl btn-bounce",
              isInCart && "hover:scale-105"
            )}
            disabled={product.stock === 0 || isAddingToCart}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            {isAddingToCart ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isInCart ? (
              <>
                <Check size={16} className="mr-1.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} className="mr-1.5" />
                <span>{t('product.addToCart')}</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
