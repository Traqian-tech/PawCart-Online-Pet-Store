import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/contexts/wallet-context';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Crown, CheckCircle, ArrowLeft, CreditCard, Wallet } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import PaymentMethodSelector from '@/components/ui/payment-method-selector';
import { useCurrency } from '@/contexts/currency-context';

interface MembershipOrder {
  tier: string;
  price: number;
  duration: number;
}

export default function MembershipCheckoutPage() {
  const { user, refreshUser } = useAuth();
  const { wallet } = useWallet();
  const { toast } = useToast();
  const { format } = useCurrency();
  const [, setLocation] = useLocation();
  const [membershipOrder, setMembershipOrder] = useState<MembershipOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    // Load pending membership from sessionStorage
    const pending = sessionStorage.getItem('pendingMembership');
    if (pending) {
      setMembershipOrder(JSON.parse(pending));
    } else {
      // No pending membership, redirect to privilege club
      setLocation('/privilege-club');
    }
  }, [setLocation]);

  const handlePaymentClick = async () => {
    console.log('Payment click - paymentMethod:', paymentMethod);
    console.log('Payment click - user:', user);
    console.log('Payment click - membershipOrder:', membershipOrder);
    
    if (!paymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      });
      return;
    }

    // If wallet payment, check balance first
    if (paymentMethod === 'my-wallet') {
      if (!wallet || wallet.balance < (membershipOrder?.price || 0)) {
        toast({
          title: "Insufficient Balance",
          description: `Your wallet balance (${format(wallet?.balance || 0)}) is less than the membership price (${format(membershipOrder?.price || 0)}).`,
          variant: "destructive",
        });
        return;
      }

      // Process wallet payment immediately
      setIsProcessing(true);
      try {
        if (!membershipOrder || !user) {
          throw new Error('Missing order or user data');
        }

        const userId = (user as any)?._id || (user as any)?.id || user?.id;
        const userEmail = (user as any)?.email;

        const response = await fetch('/api/membership/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId, 
            userEmail,
            tier: membershipOrder.tier,
            paymentMethod: 'my-wallet',
            amount: membershipOrder.price
          }),
        });

        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.error || responseData.message || 'Failed to activate membership');
        }

        sessionStorage.removeItem('pendingMembership');
        await refreshUser();
        
        toast({
          title: "Success! 🎉",
          description: `Your membership has been activated! Payment completed using wallet.`,
        });

        setTimeout(() => {
          setLocation('/dashboard');
        }, 2000);
      } catch (error: any) {
        toast({
          title: "Payment failed",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // For other payment methods, show payment selector
    const newOrderId = `MEM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    console.log('Generated order ID:', newOrderId);
    setOrderId(newOrderId);

    console.log('Showing payment for:', paymentMethod);
    setShowPaymentSelector(true);
  };

  const handlePaymentSuccess = async (transactionDetails: any) => {
    setIsProcessing(true);
    
    try {
      if (!membershipOrder || !user) {
        throw new Error('Missing order or user data');
      }

      const userId = (user as any)?._id || (user as any)?.id || user?.id;
      const userEmail = (user as any)?.email;

      // Activate membership after successful payment
      console.log('Sending membership purchase request:', {
        userId,
        userEmail,
        tier: membershipOrder.tier,
        paymentDetails: transactionDetails
      });

      const response = await fetch('/api/membership/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          userEmail,
          tier: membershipOrder.tier,
          paymentDetails: transactionDetails
        }),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Server error - invalid response format');
      }
      
      console.log('Membership purchase response:', responseData);

      if (!response.ok) {
        const errorMessage = responseData.error || responseData.message || 'Failed to activate membership';
        console.error('Server error details:', responseData.details);
        throw new Error(errorMessage);
      }

      // Clear pending membership
      sessionStorage.removeItem('pendingMembership');
      
      // Refresh user data to show new membership
      await refreshUser();
      
      toast({
        title: "Success! 🎉",
        description: `Your membership has been activated! Order: ${responseData.invoice?.invoiceNumber || 'Created'}`,
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        setLocation('/dashboard');
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Activation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!membershipOrder) {
    return null;
  }

  const getMembershipColor = (tier: string) => {
    switch (tier) {
      case 'Silver Paw': return 'from-gray-400 to-gray-600';
      case 'Golden Paw': return 'from-yellow-400 to-yellow-600';
      case 'Diamond Paw': return 'from-blue-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getMembershipDiscount = (tier: string) => {
    switch (tier) {
      case 'Silver Paw': return '5%';
      case 'Golden Paw': return '10%';
      case 'Diamond Paw': return '15%';
      default: return '0%';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setLocation('/privilege-club')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Privilege Club
          </Button>

          <h1 className="text-3xl font-bold mb-8">Complete Your Membership Purchase</h1>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Membership Details */}
            <div>
              <Card className={`bg-gradient-to-r ${getMembershipColor(membershipOrder.tier)} text-white border-none`}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Crown className="h-12 w-12 mr-4" />
                    <div>
                      <h2 className="text-2xl font-bold">{membershipOrder.tier}</h2>
                      <p className="text-sm opacity-90">Premium Membership</p>
                    </div>
                  </div>
                  
                  <Separator className="bg-white/30 my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Duration</span>
                      <span className="font-bold">{membershipOrder.duration} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount on all products</span>
                      <span className="font-bold">{getMembershipDiscount(membershipOrder.tier)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Membership Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{getMembershipDiscount(membershipOrder.tier)} discount on all products</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Free delivery on eligible orders</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Priority customer support</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Early access to new products</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Payment Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader className="bg-gray-50">
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Membership</span>
                      <span className="font-medium">{membershipOrder.tier}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{membershipOrder.duration} Days</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#26732d]">${membershipOrder.price.toFixed(2)}</span>
                    </div>

                    <Separator />

                    {/* Payment Method Selection */}
                    <div className="pt-4">
                      <Label className="text-base font-semibold mb-3 block">Select Payment Method</Label>
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                        {/* My Wallet */}
                        {user && (
                          <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value="my-wallet" id="my-wallet" />
                            <Label htmlFor="my-wallet" className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Wallet className="h-5 w-5 text-[#26732d]" />
                                  <span>My Wallet</span>
                                </div>
                                <span className="text-sm text-gray-600">
                                  Balance: {format(wallet?.balance || 0)}
                                </span>
                              </div>
                            </Label>
                          </div>
                        )}

                        {/* Credit/Debit Card */}
                        <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                          <RadioGroupItem value="credit-card" id="credit-card" />
                          <Label htmlFor="credit-card" className="flex-1 cursor-pointer">
                            <div className="flex items-center">
                              <CreditCard className="h-5 w-5 mr-2 text-[#26732d]" />
                              <span>Credit/Debit Card</span>
                            </div>
                          </Label>
                        </div>

                        {/* Mobile Payment */}
                        <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                          <RadioGroupItem value="mobile-payment" id="mobile-payment" />
                          <Label htmlFor="mobile-payment" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <svg className="h-5 w-5 text-[#26732d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span>Mobile Payment</span>
                            </div>
                          </Label>
                        </div>

                        {/* International Payment */}
                        <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                          <RadioGroupItem value="international-payment" id="international-payment" />
                          <Label htmlFor="international-payment" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <Wallet className="h-5 w-5 text-[#26732d]" />
                              <span>International Payment</span>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3 pt-4">
                      <Button
                        onClick={handlePaymentClick}
                        disabled={isProcessing || !paymentMethod}
                        className="w-full bg-[#26732d] hover:bg-[#1e5d26] text-white py-6 text-lg"
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                      </Button>

                      <p className="text-xs text-center text-gray-500">
                        By proceeding, you agree to our terms and conditions
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <h4 className="font-medium text-blue-900 mb-2">Payment Process</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ Select your preferred payment method</li>
                        <li>✓ Complete the secure payment</li>
                        <li>✓ Membership activates automatically</li>
                        <li>✓ Start enjoying exclusive benefits</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Payment Selector Modal */}
      {showPaymentSelector && membershipOrder && user && orderId && (
        <div className="fixed inset-0 bg-black/50 z-[10000] flex items-start justify-center overflow-y-auto py-8">
          <div className="relative w-full max-w-md mx-auto">
            <button
              onClick={() => {
                console.log('Closing payment selector');
                setShowPaymentSelector(false);
              }}
              className="sticky top-0 float-right -mr-3 -mt-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <PaymentMethodSelector
              orderId={orderId}
              amount={membershipOrder.price}
              customerInfo={{
                fullname: `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || (user as any).username || (user as any).name || 'Member',
                email: (user as any).email || '',
                phone: (user as any).phone || '',
                address: (user as any).address || ''
              }}
              onPaymentComplete={handlePaymentSuccess}
              onClose={() => setShowPaymentSelector(false)}
              metadata={{
                type: 'membership',
                tier: membershipOrder.tier,
                duration: membershipOrder.duration
              }}
              preselectedMethod={
                paymentMethod === 'credit-card' 
                  ? 'bank-transfer' 
                  : paymentMethod === 'mobile-payment'
                  ? 'mobile-payment'
                  : 'international-banking'
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

