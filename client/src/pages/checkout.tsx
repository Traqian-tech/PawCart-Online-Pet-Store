
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/contexts/wallet-context';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ChevronDown, ChevronUp, CreditCard, Truck, User, MapPin, MessageSquare, ShoppingBag, Tag, Plus, Wallet, Phone } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import PaymentMethodSelector from '@/components/ui/payment-method-selector';
import { useCurrency } from '@/contexts/currency-context';
import { getAllCountries, getStatesByCountry, getCitiesByState, getCountryByCode, getStateByCode } from '@/lib/global-address-data';

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  createAccount: boolean;
}

interface BillingDetails {
  firstName: string;
  lastName: string;
  phone: string;
  alternativePhone: string;
  country: string;
  province: string; // Now serves as Region/Province (merged field)
  city: string;
  postCode: string;
  address: string;
  email: string;
}

interface SavedAddress {
  _id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  province?: string;
  postCode: string;
  country: string;
  isDefault: boolean;
  label?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CheckoutPage() {
  const { state: cartState, clearCart, applyCoupon, removeCoupon, getFinalTotal, getShippingFee, getGrandTotal } = useCart();
  const { user } = useAuth();
  const { wallet, refreshWallet } = useWallet();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { format, currency } = useCurrency();

  // Form states - MUST BE DECLARED FIRST
  const [showLogin, setShowLogin] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '', remember: false });
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    createAccount: false
  });
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    firstName: '',
    lastName: '',
    phone: '',
    alternativePhone: '',
    country: '',
    province: '', // Serves as Region/Province
    city: '',
    postCode: '',
    address: '',
    email: ''
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [freeDeliveryCode, setFreeDeliveryCode] = useState('');

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

  // Calculate shipping fee (memoized to react to freeDeliveryCode changes)
  const shippingInfo = useMemo(() => {
    const baseShippingFee = getShippingFee(); // Use cart context's shipping fee calculation
    const freeShippingThreshold = 100; // $100 free shipping threshold
    
    // Free shipping conditions:
    // 1. Free delivery voucher code applied (independent input)
    if (freeDeliveryCode && freeDeliveryCode.trim().startsWith('FREEDEL')) {
      return { fee: 0, reason: `Free shipping (${freeDeliveryCode})` };
    }
    
    // 2. Free delivery coupon applied (from cart context)
    if (cartState.appliedCoupon?.discountType === 'free_delivery') {
      return { fee: 0, reason: `Free shipping (${cartState.appliedCoupon.code})` };
    }
    
    // 3. Order total >= $100
    if (cartState.total >= freeShippingThreshold) {
      return { fee: 0, reason: `Free shipping on orders over ${format(freeShippingThreshold)}` };
    }
    
    // 4. User has active membership
    if (membershipDiscount.tier) {
      return { fee: 0, reason: `Free shipping for ${membershipDiscount.tier} members` };
    }
    
    // Otherwise, charge shipping fee
    return { fee: baseShippingFee, reason: null };
  }, [freeDeliveryCode, cartState.appliedCoupon, cartState.total, membershipDiscount.tier, getShippingFee, format]);

  // Calculate final total with membership discount and shipping
  const calculateFinalTotal = () => {
    const baseTotal = getFinalTotal(); // This includes coupon discount
    const afterMembershipDiscount = Math.max(0, baseTotal - membershipDiscount.amount);
    const finalTotal = afterMembershipDiscount + shippingInfo.fee;
    return Math.max(0, finalTotal);
  };
  
  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showSavedAddresses, setShowSavedAddresses] = useState(true);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartState.items.length === 0) {
      setLocation('/');
    }
  }, [cartState.items.length, setLocation]);

  // Helper functions to convert codes to names for display
  const getCountryName = (code: string) => {
    const country = getCountryByCode(code);
    return country ? country.name : code;
  };

  const getStateName = (countryCode: string, stateCode: string) => {
    const state = getStateByCode(countryCode, stateCode);
    return state ? state.name : stateCode;
  };

  // Function to handle address selection
  const handleSelectAddress = (address: SavedAddress) => {
    setSelectedAddressId(address._id);
    
    // Parse full name into first and last name
    const nameParts = address.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Map country name to country code
    const getCountryCode = (countryName: string) => {
      const allCountries = getAllCountries();
      const country = allCountries.find(c => 
        c.name.toLowerCase() === countryName.toLowerCase() || 
        c.code.toLowerCase() === countryName.toLowerCase()
      );
      return country ? country.code : countryName;
    };
    
    // Get country code
    const countryCode = getCountryCode(address.country);
    
    // Use province or region field (backward compatible)
    const provinceCode = address.province || address.region || '';
    
    // Populate billing details
    setBillingDetails({
      firstName,
      lastName,
      phone: address.phone,
      alternativePhone: '',
      country: countryCode,
      province: provinceCode,
      city: address.city,
      postCode: address.postCode,
      address: address.addressLine2 
        ? `${address.addressLine1}, ${address.addressLine2}` 
        : address.addressLine1,
      email: user?.email || ''
    });
    
    toast({
      title: "Address Selected",
      description: `Using ${address.label || 'saved'} address`,
    });
  };

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        email: user.email || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim()
      }));
      setBillingDetails(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      }));
      
      // Fetch saved addresses - use consistent userId format
      const userId = String((user as any)?._id || (user as any)?.id || user?.id || '');
      if (userId && userId !== 'undefined' && userId !== 'null') {
        console.log('[Checkout] Fetching addresses for user:', userId);
        fetch(`/api/addresses/user/${userId}`)
          .then(res => {
            if (!res.ok) {
              console.error('[Checkout] Failed to fetch addresses - HTTP status:', res.status);
              return res.json().then(err => {
                throw new Error(err.message || `HTTP ${res.status}`);
              });
            }
            return res.json();
          })
          .then(data => {
            console.log('[Checkout] Fetched addresses response:', data);
            if (Array.isArray(data)) {
              console.log(`[Checkout] Found ${data.length} addresses for user ${userId}`);
              setSavedAddresses(data);
              // Auto-select default address if available
              const defaultAddress = data.find(addr => addr.isDefault);
              if (defaultAddress) {
                handleSelectAddress(defaultAddress);
              }
            } else {
              console.warn('[Checkout] Addresses response is not an array:', data);
              setSavedAddresses([]);
            }
          })
          .catch(err => {
            console.error('[Checkout] Failed to fetch addresses:', err);
            setSavedAddresses([]);
          });
      }
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login functionality
    toast({
      title: "Login functionality coming soon",
      description: "Please proceed as guest for now.",
      variant: "default",
    });
    setShowLogin(false);
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
          orderAmount: cartState.total
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        applyCoupon({
          code: data.coupon.code,
          discount: data.coupon.discountAmount,
          discountType: data.coupon.type as 'fixed' | 'percentage' | 'free_delivery'
        });
        setCouponCode('');
        setCouponError('');
        
        const savedAmount = data.coupon.type === 'free_delivery' 
          ? getShippingFee() 
          : data.coupon.discountAmount;
        
        toast({
          title: "Coupon applied successfully!",
          description: data.coupon.type === 'free_delivery' 
            ? `Free shipping applied!` 
            : `You saved ${format(savedAmount)}`,
        });
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
    toast({
      title: "Coupon removed",
      description: "Discount has been removed from your order.",
    });
  };

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      return response;
    },
    onSuccess: async (data) => {
      // If payment method is wallet, process payment immediately
      if (paymentMethod === 'my-wallet') {
        try {
          // Get userId safely (try multiple possible fields)
          const userMongoId = (user as any)?._id || (user as any)?.id || user?.id;
          if (!userMongoId) {
            throw new Error('User ID not found. Please login again.');
          }
          console.log('Processing wallet payment for invoice:', data.invoice._id);
          console.log('User MongoDB ID:', userMongoId);
          console.log('User Auth ID:', user?.id);
          
          const paymentResponse = await apiRequest(`/api/orders/${data.invoice._id}/pay-with-wallet`, {
            method: 'POST',
            body: JSON.stringify({
              userId: userMongoId
            }),
          });
          
          console.log('Wallet payment response:', paymentResponse);
          
          clearCart();
          toast({
            title: "Order placed successfully!",
            description: "Payment completed using your wallet.",
          });
          
          // Redirect to success page with payment info
          const successUrl = new URLSearchParams({
            transactionId: data.invoice._id,
            orderId: data.invoice._id,
            amount: data.invoice.total.toString(),
            status: 'COMPLETED'
          });
          setLocation(`/payment-success?${successUrl.toString()}`);
        } catch (error: any) {
          console.error('Wallet payment error:', error);
          const errorMessage = error?.message || 'Failed to process wallet payment. Please try again.';
          toast({
            title: "Payment failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        // All other payment methods require online payment processing
        setCreatedOrderId(data.invoice._id);
        setShowPayment(true);
        toast({
          title: "Order created successfully!",
          description: "Please complete your payment to confirm the order.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Order failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to place an order.",
        variant: "destructive",
      });
      setShowLogin(true);
      return;
    }

    // Get userId safely (try multiple possible fields)
    const userId = (user as any)?._id || (user as any)?.id || user?.id;
    if (!userId) {
      console.error('❌ User ID not found in user object:', user);
      toast({
        title: "Authentication Error",
        description: "Unable to identify user. Please login again.",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ User ID found:', userId);
    
    // Comprehensive form validation
    const missingFields = [];
    if (!billingDetails.firstName.trim()) missingFields.push("First Name");
    if (!billingDetails.phone.trim()) missingFields.push("Phone Number");
    if (!billingDetails.email.trim()) missingFields.push("Email Address");
    if (!billingDetails.address.trim()) missingFields.push("Full Address");
    if (!billingDetails.country.trim()) missingFields.push("Country");
    if (!billingDetails.province.trim()) missingFields.push("Region/Province");

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Information",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingDetails.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Phone validation (International format)
    // Remove spaces, dashes, parentheses, dots for validation
    const cleanedPhone = billingDetails.phone.replace(/[\s\-\(\)\.]/g, '');
    // Must start with optional + and contain 8-15 digits
    const phoneRegex = /^\+?\d{8,15}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number (8-15 digits, optionally starting with +).",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // ===== CRITICAL FIX: Refresh wallet data before payment check =====
    // The frontend wallet context might have stale data
    // Force refresh from backend to get the latest balance
    console.log('🔄 Refreshing wallet data from server...');
    let freshWalletData = null;
    try {
      // Directly fetch the latest wallet data instead of relying on context state
      const response = await fetch(`/api/wallet?userId=${userId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch wallet data' }));
        throw new Error(errorData.message || 'Failed to fetch wallet data');
      }
      const data = await response.json();
      freshWalletData = data.wallet;
      console.log('✅ Wallet data refreshed directly from API:');
      console.log('   Balance:', freshWalletData.balance);
      console.log('   User ID:', freshWalletData.userId);
      
      // Also refresh context for UI consistency
      await refreshWallet();
    } catch (error) {
      console.error('❌ Failed to refresh wallet:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet data. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }
    // =================================================================

    const finalTotal = calculateFinalTotal();

    // Count member-exclusive items in cart
    const memberExclusiveItemsCount = cartState.items.filter((item: any) => item.isMemberExclusive).length;

    // ===== DETAILED DEBUGGING =====
    console.group('💳 Wallet Payment Detailed Debugging');
    console.log('🌍 Selected Currency:', currency);
    console.log('💰 Fresh Wallet Balance (USD):', freshWalletData?.balance);
    console.log('💰 Context Wallet Balance (USD):', wallet?.balance);
    console.log('💰 Wallet Balance (Display):', format(freshWalletData?.balance || 0));
    console.log('');
    console.log('🛒 Cart Info:');
    console.log('   Cart Total (USD):', cartState.total);
    console.log('   Applied Coupon:', cartState.appliedCoupon);
    console.log('   After Coupon (USD):', getFinalTotal());
    console.log('');
    console.log('💎 Membership Discount:');
    console.log('   Tier:', membershipDiscount.tier);
    console.log('   Percentage:', membershipDiscount.percentage + '%');
    console.log('   Amount (USD):', membershipDiscount.amount);
    console.log('   Amount (Display):', format(membershipDiscount.amount));
    console.log('');
    console.log('🚚 Shipping:');
    console.log('   Fee (USD):', shippingInfo.fee);
    console.log('   Reason:', shippingInfo.reason);
    console.log('');
    console.log('💵 Final Calculation:');
    console.log('   Base Total (after coupon):', getFinalTotal());
    console.log('   - Membership Discount:', membershipDiscount.amount);
    console.log('   + Shipping Fee:', shippingInfo.fee);
    console.log('   = Final Total (USD):', finalTotal);
    console.log('   = Final Total (Display):', format(finalTotal));
    console.log('');
    console.log('✅ Balance Check:');
    console.log('   Fresh Wallet:', freshWalletData?.balance, 'USD');
    console.log('   Order:', finalTotal, 'USD');
    console.log('   Sufficient?', (freshWalletData?.balance || 0) >= finalTotal ? '✅ YES' : '❌ NO');
    console.groupEnd();
    // ================================

    // Check if user has sufficient wallet balance for wallet payment
    // NOTE: All amounts are in USD for calculation purposes
    // freshWalletData.balance is in USD, finalTotal is in USD
    // format() is only used for display (converts to selected currency)
    if (paymentMethod === 'my-wallet') {
      const walletBalance = freshWalletData?.balance || 0;
      
      if (walletBalance < finalTotal) {
        console.log('❌ Insufficient wallet balance');
        console.log(`   Wallet balance (USD): $${walletBalance}`);
        console.log(`   Order total (USD): $${finalTotal}`);
        console.log(`   Selected currency: ${currency || 'USD'}`);
        
        toast({
          title: "Insufficient Balance",
          description: `Your wallet balance (${format(walletBalance)}) is less than the order total (${format(finalTotal)}). Please add funds to your wallet or choose a different payment method.`,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      console.log('✅ Sufficient wallet balance');
      console.log(`   Wallet balance (USD): $${walletBalance}`);
      console.log(`   Order total (USD): $${finalTotal}`);
    }

    const orderData = {
      userId: userId || 'guest',
      customerInfo: {
        name: `${billingDetails.firstName} ${billingDetails.lastName}`.trim(),
        email: billingDetails.email,
        phone: billingDetails.phone,
        alternativePhone: billingDetails.alternativePhone,
        address: {
          address: billingDetails.address,
          country: billingDetails.country,
          province: billingDetails.province,
          city: billingDetails.city,
          postCode: billingDetails.postCode
        }
      },
      items: cartState.items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      discountCode: cartState.appliedCoupon ? cartState.appliedCoupon.code : null,
      freeDeliveryCode: freeDeliveryCode || null,
      shippingFee: shippingInfo.fee,
      paymentMethod,
      shippingAddress: {
        address: billingDetails.address,
        country: billingDetails.country,
        province: billingDetails.province,
        city: billingDetails.city,
        postCode: billingDetails.postCode
      },
      orderNotes,
      // Membership information
      membershipDiscount: membershipDiscount.amount,
      membershipTier: membershipDiscount.tier,
      memberExclusiveItemsCount
    };

    try {
      await createOrderMutation.mutateAsync(orderData);
    } catch (error) {
      console.error('Order creation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (transactionDetails: any) => {
    clearCart();
    setShowPayment(false);
    
    // Invalidate coupons cache to refresh the list in Dashboard
    queryClient.invalidateQueries({ queryKey: ['/api/coupons'] });
    
    toast({
      title: "Payment successful!",
      description: `Payment completed successfully. Transaction ID: ${transactionDetails.transactionId}`,
    });
    setLocation(`/invoice/${createdOrderId}`); // createdOrderId now stores invoice._id
  };

  if (cartState.items.length === 0) {
    return null; // Will redirect via useEffect
  }

  // Show payment processor if payment is required
  if (showPayment && createdOrderId) {
    const finalTotal = calculateFinalTotal(); // Fixed: Use calculateFinalTotal to include membership discount
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[var(--meow-green)]">Complete Payment</h1>
              <p className="text-gray-600 mt-2">
                Your order has been created. Please complete the payment to confirm.
              </p>
            </div>
            
            <PaymentMethodSelector
              orderId={createdOrderId}
              amount={finalTotal}
              customerInfo={{
                fullname: `${billingDetails.firstName} ${billingDetails.lastName}`.trim(),
                email: billingDetails.email,
                phone: billingDetails.phone,
                address: billingDetails.address,
              }}
              onPaymentComplete={handlePaymentSuccess}
              onClose={() => {
                setShowPayment(false);
                setCreatedOrderId(null);
              }}
              metadata={{
                orderType: 'ecommerce',
                items: cartState.items.length,
                coupon: cartState.appliedCoupon?.code || null,
              }}
              preselectedMethod={
                paymentMethod === 'credit-card' ? 'bank-transfer' :
                paymentMethod === 'mobile-payment' ? 'mobile-payment' :
                paymentMethod === 'international-payment' ? 'international-banking' :
                undefined
              }
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[var(--meow-green)]/5">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header with logo and phone - Compact */}
          <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-white via-white to-[#ffde59]/10 rounded-xl p-4 shadow-lg border border-[var(--meow-green)]/10 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src="/logo.png" alt="PawCart Online Pet Store" className="w-10 h-10 md:w-12 md:h-12 drop-shadow-lg" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#ffde59] rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-[var(--meow-green)] tracking-tight">Checkout</h1>
                <p className="text-gray-600 text-xs hidden md:block font-medium">Complete your order</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-br from-[var(--meow-green)] to-[var(--meow-green-dark)] text-white px-3 py-2 md:px-4 md:py-2.5 rounded-lg shadow-md">
              <Phone className="h-4 w-4 md:h-5 md:w-5" />
              <div>
                <p className="text-xs md:text-sm font-bold">852-6214-6811</p>
                <p className="text-[10px] font-medium opacity-90 hidden md:block">Support</p>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Login Section - Enhanced */}
              {!user && (
                <Card className="border-[#ffde59] border-2 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-[#ffde59]/20 via-[#ffde59]/10 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--meow-green)] rounded-lg">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-lg md:text-xl text-[var(--meow-green)] font-bold">Already have an account?</CardTitle>
                      </div>
                      <Button 
                        variant="link" 
                        onClick={() => setShowLogin(!showLogin)}
                        className="text-[var(--meow-green)] hover:text-[var(--meow-green-hover)] font-semibold hover:scale-105 transition-transform"
                      >
                        Click here to login
                        {showLogin ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {showLogin && (
                    <CardContent className="pt-6">
                      <p className="text-gray-600 mb-4">
                        Welcome back! Sign in to your account.
                      </p>
                      
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <Label htmlFor="email" className="text-[var(--meow-green)] font-medium">Username or email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={loginData.email}
                            onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                            required
                            className="mt-1 border-gray-300 focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)]"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="password" className="text-[var(--meow-green)] font-medium">Password *</Label>
                          <Input
                            id="password"
                            type="password"
                            value={loginData.password}
                            onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                            required
                            className="mt-1 border-gray-300 focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)]"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="remember"
                            checked={loginData.remember}
                            onCheckedChange={(checked) => setLoginData(prev => ({ ...prev, remember: checked as boolean }))}
                            className="border-[var(--meow-green)] data-[state=checked]:bg-[var(--meow-green)]"
                          />
                          <Label htmlFor="remember" className="text-sm text-gray-600">Remember me</Label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Button type="submit" className="bg-[#ffde59] hover:bg-[#e6c950] text-black font-medium">
                            Sign In
                          </Button>
                          <Button variant="link" className="text-[var(--meow-green)] hover:text-[var(--meow-green-hover)]">
                            Lost your password?
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  )}
                </Card>
              )}

              

              {/* Saved Addresses - Enhanced */}
              {user && savedAddresses.length > 0 && (
                <Card className="border-[var(--meow-green)]/30 shadow-lg hover:shadow-xl transition-all duration-300 border-2">
                  <CardHeader className="bg-gradient-to-r from-[var(--meow-green)]/10 via-[var(--meow-green)]/5 to-transparent cursor-pointer hover:from-[var(--meow-green)]/15 hover:via-[var(--meow-green)]/10 transition-all" onClick={() => setShowSavedAddresses(!showSavedAddresses)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--meow-green)] rounded-lg shadow-md">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-xl md:text-2xl text-[var(--meow-green)] font-bold">
                          My Saved Addresses 
                          <Badge className="ml-3 bg-[#ffde59] text-black hover:bg-[#e6c950] font-bold">{savedAddresses.length}</Badge>
                        </CardTitle>
                      </div>
                      <div className="p-2 hover:bg-[var(--meow-green)]/10 rounded-lg transition-colors">
                        {showSavedAddresses ? (
                          <ChevronUp className="h-6 w-6 text-[var(--meow-green)]" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-[var(--meow-green)]" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {showSavedAddresses && (
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                          <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Select a saved address to auto-fill the form below
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {savedAddresses.map((address) => (
                            <div
                              key={address._id}
                              onClick={() => handleSelectAddress(address)}
                              className={`
                                relative p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02]
                                ${selectedAddressId === address._id
                                  ? 'border-[var(--meow-green)] bg-gradient-to-br from-[var(--meow-green)]/10 to-[var(--meow-green)]/5 shadow-lg'
                                  : 'border-gray-200 hover:border-[var(--meow-green)]/50 hover:bg-gray-50 shadow-md hover:shadow-lg'
                                }
                              `}
                            >
                              {/* Selected indicator */}
                              {selectedAddressId === address._id && (
                                <div className="absolute top-3 right-3">
                                  <div className="bg-gradient-to-br from-[var(--meow-green)] to-[var(--meow-green-dark)] text-white rounded-full p-1.5 shadow-lg animate-pulse">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                              
                              {/* Address badge */}
                              <div className="flex items-center gap-2 mb-3">
                                <Badge 
                                  variant={address.isDefault ? "default" : "outline"}
                                  className={address.isDefault ? "bg-gradient-to-r from-[var(--meow-green)] to-[var(--meow-green-dark)] text-white font-bold" : "border-[var(--meow-green)] text-[var(--meow-green)] font-semibold"}
                                >
                                  {address.label || 'Home'}
                                </Badge>
                                {address.isDefault && (
                                  <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold shadow-sm">✓ Default</Badge>
                                )}
                              </div>
                              
                              {/* Address details */}
                              <div className="space-y-1">
                                <p className="font-semibold text-gray-900">{address.fullName}</p>
                                <p className="text-sm text-gray-600">{address.phone}</p>
                                <p className="text-sm text-gray-700">
                                  {address.addressLine1}
                                  {address.addressLine2 && <>, {address.addressLine2}</>}
                                </p>
                                <p className="text-sm text-gray-700">
                                  {/* Display city name */}
                                  {address.city}
                                  {/* Display province/state name */}
                                  {address.province || address.region ? (
                                    <>, {getStateName(address.country, address.province || address.region || '')}</>
                                  ) : null}
                                  {address.postCode && <>, {address.postCode}</>}
                                </p>
                                <p className="text-sm text-gray-700">{getCountryName(address.country)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Manual entry button */}
                        <div className="pt-4 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setSelectedAddressId(null);
                              setBillingDetails({
                                firstName: user?.firstName || '',
                                lastName: user?.lastName || '',
                                phone: '',
                                alternativePhone: '',
                                country: '',
                                province: '',
                                city: '',
                                postCode: '',
                                address: '',
                                email: user?.email || ''
                              });
                              toast({
                                title: "Cleared Selection",
                                description: "Enter address details manually below",
                              });
                            }}
                            className="w-full border-[var(--meow-green)] text-[var(--meow-green)] hover:bg-[var(--meow-green)]/5"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Use a Different Address (Enter Manually)
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Customer Information - Enhanced */}
              <Card className="border-[var(--meow-green)]/30 shadow-lg hover:shadow-xl transition-all duration-300 border-2">
                <CardHeader className="bg-gradient-to-r from-[var(--meow-green)]/10 via-[var(--meow-green)]/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--meow-green)] rounded-lg shadow-md">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl text-[var(--meow-green)] font-bold">Customer Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customer-first-name" className="text-[var(--meow-green)] font-medium">First Name *</Label>
                        <Input
                          id="customer-first-name"
                          value={billingDetails.firstName}
                          onChange={(e) => setBillingDetails(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="Enter your first name"
                          required
                          className="mt-1 border-gray-300 focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)]"
                          data-testid="input-first-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customer-last-name" className="text-[var(--meow-green)] font-medium">Last Name</Label>
                        <Input
                          id="customer-last-name"
                          value={billingDetails.lastName}
                          onChange={(e) => setBillingDetails(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Enter your last name"
                          className="mt-1 border-gray-300 focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)]"
                          data-testid="input-last-name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customer-phone" className="text-[var(--meow-green)] font-medium">Phone *</Label>
                        <Input
                          id="customer-phone"
                          type="tel"
                          value={billingDetails.phone}
                          onChange={(e) => setBillingDetails(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Ex: +1-234-567-8900 or 852-6214-6811"
                          required
                          className="mt-1 border-gray-300 focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)]"
                          data-testid="input-phone"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customer-alt-phone" className="text-[var(--meow-green)] font-medium">Alternative Phone</Label>
                        <Input
                          id="customer-alt-phone"
                          type="tel"
                          value={billingDetails.alternativePhone}
                          onChange={(e) => setBillingDetails(prev => ({ ...prev, alternativePhone: e.target.value }))}
                          placeholder="Ex: +1-234-567-8900 or 852-6214-6811"
                          className="mt-1 border-gray-300 focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)]"
                          data-testid="input-alternative-phone"
                        />
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Select Location - Enhanced */}
              <Card className="border-[var(--meow-green)]/30 shadow-lg hover:shadow-xl transition-all duration-300 border-2">
                <CardHeader className="bg-gradient-to-r from-[var(--meow-green)]/10 via-[var(--meow-green)]/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--meow-green)] rounded-lg shadow-md">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl text-[var(--meow-green)] font-bold">Select Location</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="billing-country" className="text-[var(--meow-green)] font-medium">Country *</Label>
                        <select 
                          className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)] bg-white"
                          value={billingDetails.country}
                          onChange={(e) => {
                            setBillingDetails(prev => ({ 
                              ...prev, 
                              country: e.target.value,
                              province: '',
                              city: ''
                            }));
                          }}
                          data-testid="select-country"
                        >
                          <option value="">Select Country</option>
                          {getAllCountries().map(country => (
                            <option key={country.code} value={country.code}>{country.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="billing-province" className="text-[var(--meow-green)] font-medium">State/Province *</Label>
                        {(() => {
                          const states = billingDetails.country ? getStatesByCountry(billingDetails.country) : [];
                          
                          // If no states available, show text input
                          if (states.length === 0 && billingDetails.country) {
                            return (
                              <div>
                                <Input
                                  id="billing-province"
                                  value={billingDetails.province}
                                  onChange={(e) => setBillingDetails(prev => ({ ...prev, province: e.target.value, city: '' }))}
                                  placeholder="Enter state/province/region"
                                  className="mt-1 border-gray-300 focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)]"
                                  data-testid="input-province"
                                />
                                <p className="text-xs text-gray-500 mt-1">Please enter your state/province manually</p>
                              </div>
                            );
                          }
                          
                          // Otherwise show select dropdown
                          return (
                            <select 
                              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)] bg-white"
                              value={billingDetails.province}
                              onChange={(e) => {
                                setBillingDetails(prev => ({ 
                                  ...prev, 
                                  province: e.target.value,
                                  city: ''
                                }));
                              }}
                              disabled={!billingDetails.country}
                              data-testid="select-province"
                            >
                              <option value="">Select State/Province</option>
                              {states.map(state => (
                                <option key={state.code} value={state.code}>{state.name}</option>
                              ))}
                            </select>
                          );
                        })()}
                      </div>

                      <div>
                        <Label htmlFor="billing-city" className="text-[var(--meow-green)] font-medium">City/District *</Label>
                        {(() => {
                          // Check if country has states
                          const states = billingDetails.country ? getStatesByCountry(billingDetails.country) : [];
                          const hasStatesData = states.length > 0;
                          
                          // If country has no states data, always show text input
                          if (!hasStatesData && billingDetails.country) {
                            return (
                              <div>
                                <Input
                                  id="billing-city"
                                  value={billingDetails.city}
                                  onChange={(e) => setBillingDetails(prev => ({ ...prev, city: e.target.value }))}
                                  placeholder="Enter city/district name"
                                  className="mt-1 border-gray-300 focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)]"
                                  data-testid="input-city"
                                />
                                <p className="text-xs text-gray-500 mt-1">Please enter your city/district name manually</p>
                              </div>
                            );
                          }
                          
                          // If country has states, check if selected state has cities
                          const cities = billingDetails.province && billingDetails.country 
                            ? getCitiesByState(billingDetails.country, billingDetails.province)
                            : [];
                          
                          // If no cities available for selected state, show text input
                          if (cities.length === 0 && billingDetails.province) {
                            return (
                              <div>
                                <Input
                                  id="billing-city"
                                  value={billingDetails.city}
                                  onChange={(e) => setBillingDetails(prev => ({ ...prev, city: e.target.value }))}
                                  placeholder="Enter city/district name"
                                  className="mt-1 border-gray-300 focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)]"
                                  data-testid="input-city"
                                />
                                <p className="text-xs text-gray-500 mt-1">Please enter your city/district name manually</p>
                              </div>
                            );
                          }
                          
                          // Otherwise show select dropdown
                          return (
                            <select 
                              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)] bg-white"
                              value={billingDetails.city}
                              onChange={(e) => setBillingDetails(prev => ({ ...prev, city: e.target.value }))}
                              disabled={!billingDetails.province}
                              data-testid="select-city"
                            >
                              <option value="">Select City/District</option>
                              {cities.map(city => (
                                <option key={city.name} value={city.name}>{city.name}</option>
                              ))}
                            </select>
                          );
                        })()}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="billing-postcode" className="text-[var(--meow-green)] font-medium">Post Code</Label>
                      <Input
                        id="billing-postcode"
                        value={billingDetails.postCode}
                        onChange={(e) => setBillingDetails(prev => ({ ...prev, postCode: e.target.value }))}
                        placeholder="Enter post code"
                        className="mt-1 border-gray-300 focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)]"
                        data-testid="input-postcode"
                      />
                    </div>

                    <div>
                      <Label htmlFor="billing-address" className="text-[var(--meow-green)] font-medium">Full Address *</Label>
                      <Textarea
                        id="billing-address"
                        value={billingDetails.address}
                        onChange={(e) => setBillingDetails(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Your full address"
                        className="mt-1 border-gray-300 focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)]"
                        rows={3}
                        data-testid="input-address"
                      />
                    </div>

                    <div>
                      <Label htmlFor="billing-email" className="text-[var(--meow-green)] font-medium">Email *</Label>
                      <Input
                        id="billing-email"
                        type="email"
                        value={billingDetails.email}
                        onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                        required
                        className="mt-1 border-gray-300 focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)]"
                        data-testid="input-email"
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Order Notes - Enhanced */}
              <Card className="border-[var(--meow-green)]/30 shadow-lg hover:shadow-xl transition-all duration-300 border-2">
                <CardHeader className="bg-gradient-to-r from-[var(--meow-green)]/10 via-[var(--meow-green)]/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--meow-green)] rounded-lg shadow-md">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl text-[var(--meow-green)] font-bold">Order Notes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <Textarea
                    placeholder="Notes about your order, e.g. special notes for delivery."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="border-gray-300 focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)]"
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary - Enhanced */}
            <div className="space-y-6">
              <Card className="border-[var(--meow-green)]/30 sticky top-4 shadow-xl hover:shadow-2xl transition-all duration-300 border-2">
                <CardHeader className="bg-gradient-to-br from-[var(--meow-green)] via-[var(--meow-green)] to-[var(--meow-green-dark)] text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg">
                      <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-extrabold">Order Overview</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {/* Shipping Fee Notice - Enhanced */}
                  {shippingInfo.fee > 0 && !freeDeliveryCode && cartState.total < 200 && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 text-sm shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Truck className="h-5 w-5 text-white flex-shrink-0" />
                        </div>
                        <div>
                          <p className="text-blue-900 font-bold mb-2 text-base">🎁 Get Free Shipping!</p>
                          <p className="text-blue-800 text-xs leading-relaxed space-y-1">
                            <span className="block">• Add {format(200 - cartState.total)} more to get free shipping</span>
                            <span className="block">• Or join Privilege Club for free shipping on all orders</span>
                            <span className="block">• Or use a Free Delivery voucher code</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between font-bold border-b-2 pb-3 text-[var(--meow-green)] text-lg">
                    <span>Product</span>
                    <span>Total</span>
                  </div>

                  {cartState.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-200 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
                        <span className="text-gray-600 ml-2 font-medium bg-gray-100 px-2 py-0.5 rounded-full text-xs">× {item.quantity}</span>
                      </div>
                      <span className="font-bold text-[var(--meow-green)] text-base">{format(item.price * item.quantity)}</span>
                    </div>
                  ))}

                  <Separator className="my-4" />

                  <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-700 font-medium">SubTotal</span>
                      <span className="font-bold text-gray-900">{format(cartState.total)}</span>
                    </div>

                    <div className="flex justify-between py-2">
                      <div className="flex flex-col">
                        <span className="text-gray-700 font-medium">Delivery</span>
                        {shippingInfo.reason && (
                          <span className="text-xs text-green-700 mt-1 font-semibold bg-green-100 px-2 py-0.5 rounded-full inline-block w-fit">{shippingInfo.reason}</span>
                        )}
                      </div>
                      <span className={`font-bold ${shippingInfo.fee === 0 ? 'text-green-600 text-lg' : 'text-gray-900'}`}>
                        {shippingInfo.fee === 0 ? '✓ FREE' : format(shippingInfo.fee)}
                      </span>
                    </div>

                    {cartState.appliedCoupon && cartState.appliedCoupon.discountType !== 'free_delivery' && (
                      <div className="flex justify-between py-2 bg-green-50 -mx-4 px-4 rounded-lg">
                        <span className="text-green-700 font-semibold flex items-center gap-1">
                          🏷️ Coupon Discount ({cartState.appliedCoupon.code})
                        </span>
                        <span className="font-bold text-green-700">-{format(cartState.appliedCoupon.discount)}</span>
                      </div>
                    )}

                    {membershipDiscount.amount > 0 && (
                      <div className="flex justify-between py-2 bg-purple-50 -mx-4 px-4 rounded-lg">
                        <span className="text-purple-700 font-semibold flex items-center gap-1">
                          💎 Membership ({membershipDiscount.tier} - {membershipDiscount.percentage}%)
                        </span>
                        <span className="font-bold text-purple-700">-{format(membershipDiscount.amount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between py-4 text-xl font-extrabold text-white bg-gradient-to-r from-[var(--meow-green)] to-[var(--meow-green-dark)] -mx-6 px-6 rounded-xl shadow-lg mt-4">
                    <span>Grand Total</span>
                    <span>{format(calculateFinalTotal())}</span>
                  </div>

                  <Separator className="my-4" />

                  {/* Coupon Section - Enhanced */}
                  <div className="space-y-3 bg-gradient-to-r from-[#ffde59]/10 to-[#ffde59]/5 p-4 rounded-xl border-2 border-[#ffde59]/30">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[var(--meow-green)] text-lg flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Have a coupon?
                      </h4>
                      <Button 
                        variant="link" 
                        onClick={() => setShowCoupon(!showCoupon)}
                        className="text-[var(--meow-green)] hover:text-[var(--meow-green-hover)] font-bold p-0 hover:scale-105 transition-transform"
                        data-testid="button-toggle-coupon"
                      >
                        {showCoupon ? 'Hide' : 'Apply coupon'}
                        {showCoupon ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {showCoupon && (
                      <div className="space-y-3">
                        {!cartState.appliedCoupon ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter coupon code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="flex-1 text-sm border-gray-300 focus:border-[var(--meow-green)] focus:ring-[var(--meow-green)]"
                                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                data-testid="input-coupon-code"
                              />
                              <Button
                                onClick={handleApplyCoupon}
                                disabled={isCouponLoading || !couponCode.trim()}
                                size="sm"
                                className="bg-[var(--meow-green)] hover:bg-[var(--meow-green-hover)] text-white px-4"
                                data-testid="button-apply-coupon"
                              >
                                {isCouponLoading ? 'Applying...' : 'Apply'}
                              </Button>
                            </div>
                            {couponError && (
                              <p className="text-xs text-red-500" data-testid="text-coupon-error">{couponError}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              Enter your coupon code to apply discount
                            </p>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-4 shadow-md">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">🏷️</span>
                                <span className="text-sm font-bold text-green-800" data-testid="text-applied-coupon">
                                  {cartState.appliedCoupon.code} Applied
                                </span>
                              </div>
                              <button
                                onClick={handleRemoveCoupon}
                                className="text-xs text-green-700 hover:text-green-900 underline font-semibold hover:scale-105 transition-transform"
                                data-testid="button-remove-coupon"
                              >
                                Remove
                            </button>
                          </div>
                          <p className="text-xs text-green-700 mt-2 font-semibold">
                            {cartState.appliedCoupon.discountType === 'free_delivery' 
                              ? '✓ Free shipping applied!'
                              : `✓ You saved ${format(cartState.appliedCoupon.discount)}!`
                            }
                          </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  {/* Free Delivery Voucher Section */}
                  {shippingInfo.fee > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-orange-600 flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Free Delivery Voucher
                        </h4>
                      </div>
                      
                      {!freeDeliveryCode ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter free delivery code (e.g. FREEDEL1234)"
                              value={freeDeliveryCode}
                              onChange={(e) => setFreeDeliveryCode(e.target.value.toUpperCase())}
                              className="flex-1 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  if (freeDeliveryCode.trim().startsWith('FREEDEL')) {
                                    toast({
                                      title: "Free Delivery Applied! 🚚",
                                      description: `Shipping fee waived. You saved ${format(shippingInfo.fee)}!`,
                                    })
                                  } else {
                                    toast({
                                      title: "Invalid Code",
                                      description: "Please enter a valid free delivery voucher code.",
                                      variant: "destructive",
                                    })
                                    setFreeDeliveryCode('')
                                  }
                                }
                              }}
                            />
                            <Button
                              onClick={() => {
                                if (freeDeliveryCode.trim().startsWith('FREEDEL')) {
                                  toast({
                                    title: "Free Delivery Applied! 🚚",
                                    description: `Shipping fee waived. You saved ${format(shippingInfo.fee)}!`,
                                  })
                                } else {
                                  toast({
                                    title: "Invalid Code",
                                    description: "Please enter a valid free delivery voucher code.",
                                    variant: "destructive",
                                  })
                                  setFreeDeliveryCode('')
                                }
                              }}
                              disabled={!freeDeliveryCode.trim()}
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700 text-white px-4"
                            >
                              Apply
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            Have a free delivery voucher? Enter code to waive shipping fee
                          </p>
                        </div>
                      ) : (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-orange-600" />
                              <span className="text-sm font-medium text-orange-800">
                                {freeDeliveryCode} Applied
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setFreeDeliveryCode('')
                                toast({
                                  title: "Voucher Removed",
                                  description: "Free delivery voucher has been removed.",
                                })
                              }}
                              className="text-xs text-orange-600 hover:text-orange-800 underline"
                            >
                              Remove
                            </button>
                          </div>
                          <p className="text-xs text-orange-600 mt-1">
                            You saved {format(getShippingFee())} on shipping!
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <Separator className="my-4" />

                  {/* Payment Methods - Enhanced */}
                  <div className="space-y-4 bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border-2 border-gray-200">
                    <h4 className="font-bold text-[var(--meow-green)] text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Select Payment Method
                    </h4>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                      {/* My Wallet */}
                      {user && (
                        <div className="flex items-center space-x-3 border-2 border-[var(--meow-green)]/30 rounded-xl p-4 hover:bg-[var(--meow-green)]/5 hover:border-[var(--meow-green)] cursor-pointer transition-all duration-200 hover:shadow-md">
                          <RadioGroupItem value="my-wallet" id="my-wallet" className="border-[var(--meow-green)]" />
                          <Label htmlFor="my-wallet" className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--meow-green)]/10 rounded-lg">
                                  <Wallet className="h-5 w-5 text-[var(--meow-green)]" />
                                </div>
                                <span className="font-semibold text-gray-900">My Wallet</span>
                              </div>
                              <span className="text-sm font-bold text-[var(--meow-green)] bg-[#ffde59]/30 px-3 py-1 rounded-full">
                                Balance: {format(wallet?.balance || 0)}
                              </span>
                            </div>
                          </Label>
                        </div>
                      )}

                      {/* Credit/Debit Card */}
                      <div className="flex items-center space-x-3 border-2 border-gray-300 rounded-xl p-4 hover:bg-gray-50 hover:border-[var(--meow-green)] cursor-pointer transition-all duration-200 hover:shadow-md">
                        <RadioGroupItem value="credit-card" id="credit-card" className="border-[var(--meow-green)]" />
                        <Label htmlFor="credit-card" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <CreditCard className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="font-semibold text-gray-900">Credit/Debit Card</span>
                          </div>
                        </Label>
                      </div>

                      {/* Mobile Payment */}
                      <div className="flex items-center space-x-3 border-2 border-gray-300 rounded-xl p-4 hover:bg-gray-50 hover:border-[var(--meow-green)] cursor-pointer transition-all duration-200 hover:shadow-md">
                        <RadioGroupItem value="mobile-payment" id="mobile-payment" className="border-[var(--meow-green)]" />
                        <Label htmlFor="mobile-payment" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="font-semibold text-gray-900">Mobile Payment</span>
                          </div>
                        </Label>
                      </div>

                      {/* International Payment */}
                      <div className="flex items-center space-x-3 border-2 border-gray-300 rounded-xl p-4 hover:bg-gray-50 hover:border-[var(--meow-green)] cursor-pointer transition-all duration-200 hover:shadow-md">
                        <RadioGroupItem value="international-payment" id="international-payment" className="border-[var(--meow-green)]" />
                        <Label htmlFor="international-payment" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Wallet className="h-5 w-5 text-purple-600" />
                            </div>
                            <span className="font-semibold text-gray-900">International Payment</span>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button 
                    onClick={handlePlaceOrder}
                    className="w-full bg-gradient-to-r from-[#ffde59] via-[#ffde59] to-[#f5d549] hover:from-[#e6c950] hover:via-[#e6c950] hover:to-[#d9b945] text-black font-extrabold py-6 text-xl border-3 border-[var(--meow-green)] rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    disabled={isProcessing || cartState.items.length === 0}
                    data-testid="button-place-order"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Processing Order...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        🛒 Place Order
                      </span>
                    )}
                  </Button>

                  {/* Bottom Info - Enhanced */}
                  <div className="mt-6 p-6 bg-gradient-to-br from-[var(--meow-green)]/10 via-[var(--meow-green)]/5 to-transparent rounded-2xl border-2 border-[var(--meow-green)]/20 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <img src="/logo.png" alt="PawCart" className="w-10 h-10" />
                      <h5 className="font-extrabold text-[var(--meow-green)] text-lg">PawCart Online Pet Store</h5>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-[var(--meow-green)] mt-0.5 flex-shrink-0" />
                        <span><strong>ADDRESS:</strong> 11 Yuk Choi Road, Hung Hom, Kowloon, Hong Kong</span>
                      </p>
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="text-base">📞</span>
                        <span><strong>Hotline:</strong> 852-6214-6811</span>
                      </p>
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="text-base">📧</span>
                        <span><strong>Email:</strong> boqianjlu@gmail.com</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

