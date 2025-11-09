
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ShoppingCart, Tag } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { useCurrency } from '@/contexts/currency-context';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/hooks/use-auth';
import { translateProductName } from '@/lib/product-translator';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductRecommendations from '@/components/recommendations/product-recommendations';

export default function CartPage() {
  const { state, updateQuantity, removeItem, clearCart, applyCoupon, removeCoupon, getFinalTotal, getShippingFee, getGrandTotal } = useCart();
  const { format } = useCurrency();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isClearing, setIsClearing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  const handleClearCart = () => {
    setIsClearing(true);
    clearCart();
    setTimeout(() => setIsClearing(false), 500);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsCouponLoading(true);
    setCouponError('');

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          orderAmount: state.total
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        const couponToApply = {
          code: data.coupon.code,
          discount: data.coupon.discountAmount,
          discountType: data.coupon.type as 'fixed' | 'percentage' | 'free_delivery'
        };
        console.log('✅ Coupon validated, applying:', JSON.stringify(couponToApply, null, 2));
        applyCoupon(couponToApply);
        setCouponCode('');
        setCouponError('');
        
        // DEBUG: Check if coupon was applied
        setTimeout(() => {
          console.log('🔍 Checking cart state after applying coupon:', JSON.stringify({
            appliedCoupon: state.appliedCoupon
          }, null, 2));
        }, 100);
      } else {
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponError('Failed to validate coupon. Please try again.');
    } finally {
      setIsCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
  };

  // Get membership discount
  const getMembershipDiscount = () => {
    const membership = (user as any)?.membership;
    if (!membership || new Date(membership.expiryDate) <= new Date()) {
      return { percentage: 0, amount: 0, tier: null };
    }

    let percentage = 0;
    switch (membership.tier) {
      case 'Silver Paw': percentage = 5; break;
      case 'Golden Paw': percentage = 10; break;
      case 'Diamond Paw': percentage = 15; break;
    }

    // ✅ Calculate membership discount based on total AFTER coupon discount
    const baseTotal = getFinalTotal();
    const amount = (baseTotal * percentage) / 100;
    return { percentage, amount, tier: membership.tier };
  };

  const membershipDiscount = getMembershipDiscount();
  const finalTotal = getFinalTotal() - membershipDiscount.amount;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="pt-16 md:pt-24 pb-8">
          <div className="max-w-md mx-auto px-4">
            <div className="text-center py-16">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-gray-400" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Your Cart is Empty</h1>
              <p className="text-gray-600 mb-8 text-sm md:text-base">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Button 
                size="lg" 
                className="w-full md:w-auto bg-[#26732d] hover:bg-[#1e5d26]"
                onClick={() => {
                  setLocation('/');
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-16 md:pt-24 pb-8">
        <div className="max-w-md md:max-w-4xl mx-auto px-4">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                Shopping Cart
              </h1>
              <Button 
                variant="outline" 
                onClick={handleClearCart}
                disabled={isClearing}
                className="text-xs md:text-sm bg-black text-white border-black hover:bg-white hover:text-black hover:border-black transition-colors"
                size="sm"
              >
                {isClearing ? 'Clearing...' : 'Clear'}
              </Button>
            </div>
            <p className="text-gray-600 text-sm md:text-base">
              {state.itemCount} {state.itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <div className="md:grid md:grid-cols-3 md:gap-6">
            {/* Cart Items - Mobile First Design */}
            <div className="md:col-span-2 space-y-4 mb-6 md:mb-0">
              {state.items.map((item) => (
                <Card key={item.id} className="shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 group">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex gap-4">
                      {/* Product Image - Enhanced */}
                      <div className="flex-shrink-0">
                        <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                          <img
                            src={item.image}
                            alt={translateProductName(item.name, language)}
                            className="w-full h-full object-contain p-2"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base text-gray-900 line-clamp-2 mb-2 group-hover:text-[#26732d] transition-colors duration-200">
                          {translateProductName(item.name, language)}
                        </h3>
                        <div className="flex items-baseline gap-2 mb-3">
                          <p className="text-[#26732d] font-bold text-base md:text-lg">
                            {format(item.price)}
                          </p>
                          <span className="text-xs text-gray-500">each</span>
                        </div>
                        
                        {/* Quantity and Remove Controls - Enhanced */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1 border border-gray-200">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-1.5 md:p-2 transition-all duration-200 shadow-sm hover:shadow hover:scale-110 disabled:hover:scale-100"
                              >
                                <Minus className="h-3 w-3 md:h-4 md:w-4" />
                              </button>
                              
                              <span className="w-10 text-center text-sm md:text-base font-bold text-gray-900">{item.quantity}</span>
                              
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.maxStock}
                                className="bg-white hover:bg-[#26732d] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-1.5 md:p-2 transition-all duration-200 shadow-sm hover:shadow hover:scale-110 disabled:hover:scale-100"
                              >
                                <Plus className="h-3 w-3 md:h-4 md:w-4" />
                              </button>
                            </div>
                            
                            {item.maxStock && (
                              <Badge variant="secondary" className="text-xs ml-2 bg-blue-50 text-blue-700 border-blue-200">
                                Max: {item.maxStock}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {/* Item Subtotal */}
                            <div className="text-right">
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Subtotal</p>
                              <p className="text-base md:text-lg font-bold text-gray-900">
                                {format(item.price * item.quantity)}
                              </p>
                            </div>
                            
                            <button
                              onClick={() => removeItem(item.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 rounded-full p-2 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary - Mobile Optimized */}
            <div className="md:col-span-1">
              <Card className="sticky top-20 shadow-lg border-2 border-gray-200">
                <CardContent className="p-4 md:p-6 bg-gradient-to-br from-white to-gray-50">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-[#26732d]" />
                    Order Summary
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm md:text-base">
                      <span>Subtotal ({state.itemCount} items)</span>
                      <span className="font-medium">{format(state.total)}</span>
                    </div>
                    
                    {/* Coupon Discount - show product discount */}
                    {state.appliedCoupon && state.appliedCoupon.discountType !== 'free_delivery' && (
                      <div className="flex justify-between text-sm md:text-base text-green-600">
                        <span>Coupon Discount ({state.appliedCoupon.code})</span>
                        <span className="font-medium">-{format(state.appliedCoupon.discount)}</span>
                      </div>
                    )}

                    {membershipDiscount.amount > 0 && (
                      <div className="flex justify-between text-sm md:text-base text-purple-600">
                        <span>Membership ({membershipDiscount.tier} - {membershipDiscount.percentage}%)</span>
                        <span className="font-medium">-{format(membershipDiscount.amount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm md:text-base">
                      <span>Shipping</span>
                      {getShippingFee() === 0 ? (
                        <span className="text-green-600 font-medium">
                          {state.appliedCoupon?.discountType === 'free_delivery' 
                            ? `Free (${state.appliedCoupon.code})` 
                            : 'Free'}
                        </span>
                      ) : (
                        <span className="font-medium">{format(getShippingFee())}</span>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-base md:text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#26732d]">{format(Math.max(0, finalTotal + getShippingFee() - membershipDiscount.amount))}</span>
                    </div>

                    {/* Coupon Section */}
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag size={16} className="text-[#26732d]" />
                        <span className="text-sm font-medium text-gray-700">Have a coupon?</span>
                      </div>
                      
                      {!state.appliedCoupon ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter coupon code"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              className="flex-1 text-sm"
                              onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                            />
                            <Button
                              onClick={handleApplyCoupon}
                              disabled={isCouponLoading || !couponCode.trim()}
                              size="sm"
                              className="bg-[#26732d] hover:bg-[#1e5d26] text-white px-4"
                            >
                              {isCouponLoading ? 'Applying...' : 'Apply'}
                            </Button>
                          </div>
                          {couponError && (
                            <p className="text-xs text-red-500">{couponError}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Enter your coupon code to apply discount
                          </p>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Tag size={14} className="text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                {state.appliedCoupon.code} Applied
                              </span>
                            </div>
                            <button
                              onClick={handleRemoveCoupon}
                              className="text-xs text-green-600 hover:text-green-800 underline"
                            >
                              Remove
                            </button>
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            {state.appliedCoupon.discountType === 'free_delivery' 
                              ? 'Free shipping applied!'
                              : `You saved ${format(state.appliedCoupon.discount)}!`
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                    
                  <div className="space-y-3 mt-8">
                    <Link href="/checkout">
                      <Button 
                        className="w-full bg-[#ffde59] hover:bg-[#e6c950] text-black font-semibold py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                        size="lg"
                        data-testid="proceed-to-checkout-button"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Proceed to Checkout
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-2 border-[#26732d] text-[#26732d] hover:bg-[#26732d] hover:text-white py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-md"
                      size="lg"
                      onClick={() => {
                        setLocation('/');
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Recommended Products for Cart */}
        {state.items.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <ProductRecommendations
              type="frequently_bought_together"
              productId={state.items[0]?.id}
              limit={8}
              excludeProductIds={state.items.map(item => item.id)}
              title="You May Also Like"
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
