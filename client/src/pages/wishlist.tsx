import { useState } from 'react';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCart } from '@/contexts/cart-context';
import { useCurrency } from '@/contexts/currency-context';
import { useLanguage } from '@/contexts/language-context';
import { translateProductName } from '@/lib/product-translator';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Link } from 'wouter';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  ArrowLeft, 
  Package,
  Sparkles,
  Star,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { format } = useCurrency();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = (id: string, name: string) => {
    setRemovingId(id);
    setTimeout(() => {
      removeItem(id);
      toast({
        title: 'Removed',
        description: `${name} has been removed from wishlist`,
      });
      setRemovingId(null);
    }, 300);
  };

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      maxStock: 100,
    });
    toast({
      title: 'Added to Cart',
      description: `${translateProductName(item.name, language)} has been added to cart`,
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all wishlist items?')) {
      clearWishlist();
      toast({
        title: 'Cleared',
        description: 'Wishlist has been cleared',
      });
    }
  };

  // Floating particles background
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Header />
      
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-br from-pink-300 to-purple-300 opacity-30"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-pink-100">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                  <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-pulse" />
                  My Wishlist
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  You have {items.length} item{items.length !== 1 ? 's' : ''} in your wishlist
                </p>
              </div>
            </div>
            {items.length > 0 && (
              <Button
                onClick={handleClearAll}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清空收藏
              </Button>
            )}
          </div>
        </motion.div>

        {/* Empty State */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="w-32 h-32 text-gray-300 stroke-[1.5]" />
              </motion.div>
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-8 h-8 text-purple-400" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mt-6 mb-2">
              收藏夹空空如也
            </h2>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              快去挑选您喜欢的商品吧！点击商品上的爱心图标即可收藏
            </p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all">
                <ShoppingBag className="w-4 h-4 mr-2" />
                去逛逛
              </Button>
            </Link>
          </motion.div>
        ) : (
          /* Wishlist Grid */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ 
                    opacity: removingId === item.id ? 0 : 1, 
                    scale: removingId === item.id ? 0.8 : 1,
                    y: 0 
                  }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.05 
                  }}
                >
                  <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-0">
                      {/* Product Image */}
                      <Link href={`/product/${item.slug || item.id}`}>
                        <div className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Floating badge */}
                          <motion.div
                            className="absolute top-3 left-3 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Heart className="w-3 h-3 inline mr-1 fill-white" />
                            收藏
                          </motion.div>
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="p-4">
                        <Link href={`/product/${item.slug || item.id}`}>
                          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-pink-600 transition-colors cursor-pointer min-h-[3rem]">
                            {translateProductName(item.name, language)}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                              {format(item.price)}
                            </span>
                          </div>
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAddToCart(item)}
                            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            加入购物车
                          </Button>
                          <Button
                            onClick={() => handleRemove(item.id, item.name)}
                            variant="outline"
                            size="icon"
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Summary Card */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="border-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 text-white shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                      <Heart className="w-8 h-8 fill-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">收藏总数</p>
                      <p className="text-3xl font-bold">{items.length} 件商品</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-sm">总价值</p>
                    <p className="text-3xl font-bold">
                      {format(items.reduce((sum, item) => sum + item.price, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
























