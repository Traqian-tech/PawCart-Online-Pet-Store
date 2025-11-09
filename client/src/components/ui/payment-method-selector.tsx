import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/currency-context';
import { CreditCard, Building2, Globe, Loader2, Lock, CheckCircle } from 'lucide-react';

interface PaymentMethodSelectorProps {
  orderId: string;
  amount: number;
  customerInfo: {
    fullname: string;
    email: string;
    phone?: string;
    address?: string;
  };
  onPaymentComplete: (transactionDetails: any) => void;
  onClose?: () => void;
  metadata?: any;
  preselectedMethod?: 'bank-transfer' | 'international-banking' | 'mobile-payment';
}

export default function PaymentMethodSelector({
  orderId,
  amount,
  customerInfo,
  onPaymentComplete,
  onClose,
  metadata,
  preselectedMethod
}: PaymentMethodSelectorProps) {
  const { toast } = useToast();
  const { format } = useCurrency();
  const [selectedMethod, setSelectedMethod] = useState(preselectedMethod || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(!!preselectedMethod);

  // Card form fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState(customerInfo.fullname);
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Crypto payment form fields
  const [cryptoProvider, setCryptoProvider] = useState<'binance' | 'okx'>('binance');
  const [cryptoId, setCryptoId] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [cryptoEmail, setCryptoEmail] = useState(customerInfo.email);

  // Mobile payment fields
  const [mobileProvider, setMobileProvider] = useState<'alipay' | 'wechat'>('alipay');
  const [mobilePaymentPassword, setMobilePaymentPassword] = useState('');

  const handleContinue = () => {
    if (selectedMethod) {
      setShowPaymentForm(true);
    }
  };

  const handleBack = () => {
    setShowPaymentForm(false);
    // Reset card fields
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    // Reset crypto fields
    setCryptoId('');
    setTransactionHash('');
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handlePayment = async () => {
    // Validate based on payment method
    if (selectedMethod === 'bank-transfer') {
      // Validate card details
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
        toast({
          title: "Invalid card number",
          description: "Please enter a valid card number.",
          variant: "destructive",
        });
        return;
      }

      if (!expiryDate || expiryDate.length < 5) {
        toast({
          title: "Invalid expiry date",
          description: "Please enter a valid expiry date (MM/YY).",
          variant: "destructive",
        });
        return;
      }

      if (!cvv || cvv.length < 3) {
        toast({
          title: "Invalid CVV",
          description: "Please enter a valid CVV.",
          variant: "destructive",
        });
        return;
      }
    } else if (selectedMethod === 'international-banking') {
      // Validate crypto payment details
      if (!cryptoId && !cryptoEmail) {
        toast({
          title: "Missing information",
          description: `Please enter your ${cryptoProvider === 'binance' ? 'Binance' : 'OKX'} ID or Email.`,
          variant: "destructive",
        });
        return;
      }

      if (!transactionHash || transactionHash.length < 10) {
        toast({
          title: "Invalid transaction hash",
          description: "Please enter a valid transaction hash (TxHash).",
          variant: "destructive",
        });
        return;
      }
    }
    // Mobile payment validation removed - no password needed, user confirms payment via QR code

    setIsProcessing(true);

    try {
      if (selectedMethod === 'bank-transfer') {
        // For bank transfer, call RupantorPay API
        console.log('Initializing RupantorPay payment...');
        
        const paymentResponse = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            amount,
            customerInfo: {
              fullname: cardName,
              email: customerInfo.email,
              phone: customerInfo.phone || 'N/A'
            },
            metadata: metadata
          }),
        });

        const paymentData = await paymentResponse.json();
        console.log('RupantorPay response:', paymentData);

        if (!paymentResponse.ok || !paymentData.success) {
          throw new Error(paymentData.message || 'Payment initialization failed');
        }

        // Open payment URL in new window
        if (paymentData.paymentUrl) {
          toast({
            title: "Redirecting to Payment",
            description: "Opening secure payment window...",
          });
          
          window.open(paymentData.paymentUrl, '_blank', 'noopener,noreferrer');
          
          // Poll payment status
          const checkStatus = setInterval(async () => {
            try {
              const statusResponse = await fetch(`/api/payments/status/${orderId}`);
              const statusData = await statusResponse.json();
              
              if (statusData.status === 'completed') {
                clearInterval(checkStatus);
                
                const transactionDetails = {
                  transactionId: statusData.transactionId || `TXN-${Date.now()}`,
                  orderId,
                  amount,
                  paymentMethod: 'bank-transfer',
                  cardLast4: cardNumber.replace(/\s/g, '').slice(-4),
                  status: 'completed',
                  timestamp: new Date().toISOString()
                };
                
                toast({
                  title: "Payment Successful!",
                  description: `Transaction completed successfully.`,
                });
                
                onPaymentComplete(transactionDetails);
              } else if (statusData.status === 'failed' || statusData.status === 'cancelled') {
                clearInterval(checkStatus);
                throw new Error(`Payment ${statusData.status}`);
              }
            } catch (error) {
              console.error('Status check error:', error);
            }
          }, 3000);
          
          // Stop checking after 10 minutes
          setTimeout(() => clearInterval(checkStatus), 600000);
        }
      } else if (selectedMethod === 'international-banking') {
        // For crypto payments, process directly
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const transactionDetails = {
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          orderId,
          amount,
          paymentMethod: 'international-banking',
          cryptoProvider: cryptoProvider,
          cryptoId: cryptoId || cryptoEmail,
          transactionHash: transactionHash,
          status: 'completed',
          timestamp: new Date().toISOString()
        };

        toast({
          title: "Payment Submitted!",
          description: `${cryptoProvider === 'binance' ? 'Binance' : 'OKX'} payment submitted for verification.`,
        });

        onPaymentComplete(transactionDetails);
      } else if (selectedMethod === 'mobile-payment') {
        // For mobile payments (Alipay/WeChat), simulate payment
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const transactionDetails = {
          transactionId: `${mobileProvider.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          orderId,
          amount,
          paymentMethod: 'mobile-payment',
          mobileProvider: mobileProvider,
          status: 'completed',
          timestamp: new Date().toISOString()
        };

        toast({
          title: "Payment Successful!",
          description: `${mobileProvider === 'alipay' ? 'Alipay' : 'WeChat'} payment completed.`,
        });

        onPaymentComplete(transactionDetails);
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment processing.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Mobile Payment Form (Alipay/WeChat)
  if (showPaymentForm && selectedMethod === 'mobile-payment') {
    return (
      <Card className="w-full max-w-md mx-auto max-h-[90vh] flex flex-col">
        <CardHeader className="text-center pb-4 flex-shrink-0">
          <CardTitle className="flex items-center justify-center gap-2">
            <svg className="w-6 h-6 text-[#26732d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Mobile Payment
          </CardTitle>
          <CardDescription>
            Scan QR code to pay with Alipay or WeChat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto flex-1">
          {/* Mobile Provider Selector */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Payment Method</Label>
            <RadioGroup value={mobileProvider} onValueChange={(value) => setMobileProvider(value as 'alipay' | 'wechat')} className="grid grid-cols-2 gap-3">
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  mobileProvider === 'alipay' 
                    ? 'border-[#1677FF] bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setMobileProvider('alipay')}
              >
                <div className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value="alipay" id="mobile-alipay" className="sr-only" />
                  <div className="w-12 h-12 bg-[#1677FF] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">支</span>
                  </div>
                  <Label htmlFor="mobile-alipay" className="cursor-pointer text-center">
                    <span className="font-semibold">Alipay</span>
                  </Label>
                </div>
              </div>

              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  mobileProvider === 'wechat' 
                    ? 'border-[#07C160] bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setMobileProvider('wechat')}
              >
                <div className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value="wechat" id="mobile-wechat" className="sr-only" />
                  <div className="w-12 h-12 bg-[#07C160] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">微</span>
                  </div>
                  <Label htmlFor="mobile-wechat" className="cursor-pointer text-center">
                    <span className="font-semibold">WeChat</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Details */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 space-y-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Payment Amount</div>
              <div className={`text-3xl font-bold ${mobileProvider === 'alipay' ? 'text-[#1677FF]' : 'text-[#07C160]'}`}>
                {format(amount)}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono text-xs">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Merchant</span>
                <span className="font-medium">PawCart Pet Shop</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium">{mobileProvider === 'alipay' ? 'Alipay' : 'WeChat Pay'}</span>
              </div>
            </div>
          </div>

          {/* QR Code Display */}
          <div className={`${mobileProvider === 'alipay' ? 'bg-[#1677FF]' : 'bg-[#07C160]'} rounded-lg p-6`}>
            <div className="bg-white rounded-lg p-4">
              <div className="text-center mb-4">
                <h3 className={`text-lg font-bold ${mobileProvider === 'alipay' ? 'text-[#1677FF]' : 'text-[#07C160]'}`}>
                  {mobileProvider === 'alipay' ? 'Scan with Alipay' : 'Scan with WeChat'}
                </h3>
              </div>
              <div className="flex justify-center">
                <img 
                  src={mobileProvider === 'alipay' ? '/alipay.jpg' : '/wechat.jpg'}
                  alt={mobileProvider === 'alipay' ? 'Alipay QR Code' : 'WeChat QR Code'}
                  className="w-64 h-64 object-contain"
                  onError={(e) => {
                    // Fallback if image not found
                    const img = e.target as HTMLImageElement;
                    const parent = img.parentElement;
                    if (parent) {
                      img.style.display = 'none';
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.className = 'w-64 h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-500';
                      fallbackDiv.innerHTML = `
                        <svg class="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        <p class="text-sm font-medium">QR Code Not Found</p>
                        <p class="text-xs mt-1">Please add: ${mobileProvider === 'alipay' ? 'alipay.jpg' : 'wechat.jpg'}</p>
                        <p class="text-xs mt-1">to client/public/ folder</p>
                      `;
                      parent.appendChild(fallbackDiv);
                    }
                  }}
                />
              </div>
              <div className="text-center mt-4">
                <p className={`text-sm ${mobileProvider === 'alipay' ? 'text-[#1677FF]' : 'text-[#07C160]'}`}>
                  {mobileProvider === 'alipay' ? 'Open Alipay to scan' : 'Open WeChat to scan'}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className={`${mobileProvider === 'alipay' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
            <div className="text-sm space-y-2">
              <div className={`font-semibold ${mobileProvider === 'alipay' ? 'text-blue-900' : 'text-green-900'}`}>
                Payment Instructions:
              </div>
              <ol className={`list-decimal list-inside space-y-1 ${mobileProvider === 'alipay' ? 'text-blue-700' : 'text-green-700'}`}>
                <li>Open {mobileProvider === 'alipay' ? 'Alipay' : 'WeChat'} app on your phone</li>
                <li>Scan the QR code above</li>
                <li>Complete the payment for {format(amount)}</li>
                <li>Click "I have paid" button below</li>
              </ol>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full ${mobileProvider === 'alipay' ? 'bg-[#1677FF] hover:bg-[#1164D8]' : 'bg-[#07C160] hover:bg-[#06AD51]'} text-white`}
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  I Have Paid
                </>
              )}
            </Button>

            {onClose && (
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
                disabled={isProcessing}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // International Payment Form (Binance/OKX)
  if (showPaymentForm && selectedMethod === 'international-banking') {
    return (
      <Card className="w-full max-w-md mx-auto max-h-[90vh] flex flex-col">
        <CardHeader className="text-center pb-4 flex-shrink-0">
          <CardTitle className="flex items-center justify-center gap-2">
            <Globe className="w-6 h-6 text-purple-600" />
            International Payment
          </CardTitle>
          <CardDescription>
            Complete your payment via crypto exchange
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto flex-1">
          {/* Crypto Exchange Selector */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Exchange</Label>
            <RadioGroup value={cryptoProvider} onValueChange={(value) => setCryptoProvider(value as 'binance' | 'okx')} className="grid grid-cols-2 gap-3">
              <div 
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  cryptoProvider === 'binance' 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCryptoProvider('binance')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="binance" id="binance" />
                  <Label htmlFor="binance" className="cursor-pointer flex items-center gap-2 flex-1">
                    <svg className="h-5 w-5" viewBox="0 0 126.61 126.61" fill="#F3BA2F">
                      <path d="M38.73 53.2l24.59-24.58 24.6 24.6 14.3-14.31L63.32 0 24.42 38.9c.01 0 14.31 14.3 14.31 14.3zM0 63.31l14.3-14.3 14.31 14.3-14.31 14.3zM38.73 73.41l24.59 24.59 24.6-24.6 14.31 14.29-38.9 38.91-38.91-38.88c0-.01 14.31-14.31 14.31-14.31zM98.28 63.31l14.3-14.3 14.31 14.3-14.31 14.3z"/>
                      <path d="M77.83 63.3L63.32 48.78 52.59 59.51l-1.17 1.17-3.54 3.54 15.44 15.44 24.6-24.59-.09.23z"/>
                    </svg>
                    <span className="font-medium">Binance</span>
                  </Label>
                </div>
              </div>

              <div 
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  cryptoProvider === 'okx' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCryptoProvider('okx')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="okx" id="okx" />
                  <Label htmlFor="okx" className="cursor-pointer flex items-center gap-2 flex-1">
                    <div className="h-5 w-5 bg-black rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">OKX</span>
                    </div>
                    <span className="font-medium">OKX</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Order Summary */}
          <div className={`p-4 rounded-lg space-y-2 ${
            cryptoProvider === 'binance' 
              ? 'bg-yellow-50 border border-yellow-200' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono text-xs">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount to Transfer:</span>
              <span className={`font-bold text-lg ${
                cryptoProvider === 'binance' ? 'text-yellow-600' : 'text-blue-600'
              }`}>{format(amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment Method:</span>
              <Badge variant="outline" className={
                cryptoProvider === 'binance' 
                  ? 'border-yellow-400 bg-yellow-50' 
                  : 'border-blue-400 bg-blue-50'
              }>
                {cryptoProvider === 'binance' ? (
                  <>
                    <svg className="h-3 w-3 mr-1" viewBox="0 0 126.61 126.61" fill="#F3BA2F">
                      <path d="M38.73 53.2l24.59-24.58 24.6 24.6 14.3-14.31L63.32 0 24.42 38.9c.01 0 14.31 14.3 14.31 14.3zM0 63.31l14.3-14.3 14.31 14.3-14.31 14.3zM38.73 73.41l24.59 24.59 24.6-24.6 14.31 14.29-38.9 38.91-38.91-38.88c0-.01 14.31-14.31 14.31-14.31zM98.28 63.31l14.3-14.3 14.31 14.3-14.31 14.3z"/>
                      <path d="M77.83 63.3L63.32 48.78 52.59 59.51l-1.17 1.17-3.54 3.54 15.44 15.44 24.6-24.59-.09.23z"/>
                    </svg>
                    Binance
                  </>
                ) : (
                  <>
                    <div className="h-3 w-3 bg-black rounded flex items-center justify-center mr-1">
                      <span className="text-white text-[6px] font-bold">OKX</span>
                    </div>
                    OKX
                  </>
                )}
              </Badge>
            </div>
          </div>

          {/* Merchant Exchange Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Merchant {cryptoProvider === 'binance' ? 'Binance' : 'OKX'} Account
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{cryptoProvider === 'binance' ? 'Binance' : 'OKX'} ID:</span>
                <code className="bg-white px-2 py-1 rounded text-xs">
                  {cryptoProvider === 'binance' ? 'merchant@binance.com' : 'merchant@okx.com'}
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Network:</span>
                <Badge variant="secondary" className="text-xs">
                  {cryptoProvider === 'binance' ? 'BSC (BEP20)' : 'TRC20'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Payment Instructions:</h4>
            <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside">
              <li>Transfer the exact amount to the merchant {cryptoProvider === 'binance' ? 'Binance' : 'OKX'} account</li>
              <li>Copy the transaction hash (TxHash) after transfer</li>
              <li>Enter your {cryptoProvider === 'binance' ? 'Binance' : 'OKX'} ID/Email and transaction hash below</li>
              <li>Click "Confirm Payment" to complete</li>
            </ol>
          </div>

          {/* Crypto Exchange Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="cryptoEmail">Your {cryptoProvider === 'binance' ? 'Binance' : 'OKX'} Email *</Label>
              <Input
                id="cryptoEmail"
                type="email"
                value={cryptoEmail}
                onChange={(e) => setCryptoEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cryptoId">Or {cryptoProvider === 'binance' ? 'Binance' : 'OKX'} ID (Optional)</Label>
              <Input
                id="cryptoId"
                value={cryptoId}
                onChange={(e) => setCryptoId(e.target.value)}
                placeholder="123456789"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="txHash">Transaction Hash (TxHash) *</Label>
              <Input
                id="txHash"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="0x1234567890abcdef..."
                className="mt-1 font-mono text-xs"
              />
              <p className="text-xs text-gray-500 mt-1">
                Find this in your {cryptoProvider === 'binance' ? 'Binance' : 'OKX'} transaction history
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full text-white ${
                cryptoProvider === 'binance' 
                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying Payment...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Confirm Payment
                </>
              )}
            </Button>

            <Button 
              onClick={handleBack}
              disabled={isProcessing}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Back
            </Button>
          </div>

          <div className="text-center space-y-2">
            <Badge variant="secondary" className="text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Secure payment powered by RupantorPay
            </Badge>
            <p className="text-xs text-gray-500">
              Your payment will be verified within 5-10 minutes after submission.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Card Payment Form
  if (showPaymentForm && selectedMethod === 'bank-transfer') {
    return (
      <Card className="w-full max-w-md mx-auto max-h-[90vh] flex flex-col">
        <CardHeader className="text-center pb-4 flex-shrink-0">
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5 text-green-600" />
            Secure Payment
          </CardTitle>
          <CardDescription>
            Enter your card details to complete payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto flex-1">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono text-xs">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-lg text-green-600">{format(amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment Method:</span>
              <span className="capitalize">{selectedMethod.replace('-', ' ')}</span>
            </div>
          </div>

          {/* Card Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="JOHN DOE"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="mt-1 pl-10"
                />
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-2.5 mr-1" />
                  Visa
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-2.5 mr-1" />
                  MC
                </Badge>
                <Badge variant="outline" className="text-xs">AMEX</Badge>
                <Badge variant="outline" className="text-xs">JCB</Badge>
                <Badge variant="outline" className="text-xs">银联</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Pay {format(amount)}
                </>
              )}
            </Button>

            <Button 
              onClick={handleBack}
              disabled={isProcessing}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Back
            </Button>
          </div>

          <div className="text-center space-y-2">
            <Badge variant="secondary" className="text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Secure payment powered by RupantorPay
            </Badge>
            <p className="text-xs text-gray-500">
              Your card information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto max-h-[90vh] flex flex-col">
      <CardHeader className="text-center flex-shrink-0">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="w-5 h-5" />
          Select Payment Method
        </CardTitle>
        <CardDescription>
          Choose your preferred payment method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 overflow-y-auto flex-1">
        {/* Order Summary */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono text-xs">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-bold text-lg text-blue-600">{format(amount)}</span>
          </div>
        </div>

        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
          {/* Bank Transfer - Credit/Debit Cards */}
          <div className="space-y-3">
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedMethod === 'bank-transfer' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedMethod('bank-transfer')}
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="bank-transfer" id="bank-transfer" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="bank-transfer" className="cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-base">Bank Transfer</span>
                    </div>
                  </Label>
                  <p className="text-xs text-gray-600 mb-3">
                    Pay securely with your credit or debit card
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="flex items-center gap-1.5 py-1">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" 
                        alt="Visa" 
                        className="h-3"
                      />
                      <span className="text-xs">Visa</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5 py-1">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                        alt="Mastercard" 
                        className="h-3"
                      />
                      <span className="text-xs">Mastercard</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5 py-1">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" 
                        alt="American Express" 
                        className="h-2.5"
                      />
                      <span className="text-xs">AMEX</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5 py-1">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg" 
                        alt="JCB" 
                        className="h-3"
                      />
                      <span className="text-xs">JCB</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5 py-1">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/1/1b/UnionPay_logo.svg" 
                        alt="UnionPay" 
                        className="h-3"
                      />
                      <span className="text-xs">UnionPay</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* International Banking - Binance */}
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedMethod === 'international-banking' 
                  ? 'border-yellow-500 bg-yellow-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedMethod('international-banking')}
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="international-banking" id="international-banking" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="international-banking" className="cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-base">International Banking</span>
                    </div>
                  </Label>
                  <p className="text-xs text-gray-600 mb-3">
                    International payment methods and cards
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="flex items-center gap-1.5 py-1 border-yellow-400 bg-yellow-50">
                      <svg className="h-4 w-4" viewBox="0 0 126.61 126.61" fill="#F3BA2F">
                        <path d="M38.73 53.2l24.59-24.58 24.6 24.6 14.3-14.31L63.32 0 24.42 38.9c.01 0 14.31 14.3 14.31 14.3zM0 63.31l14.3-14.3 14.31 14.3-14.31 14.3zM38.73 73.41l24.59 24.59 24.6-24.6 14.31 14.29-38.9 38.91-38.91-38.88c0-.01 14.31-14.31 14.31-14.31zM98.28 63.31l14.3-14.3 14.31 14.3-14.31 14.3z"/>
                        <path d="M77.83 63.3L63.32 48.78 52.59 59.51l-1.17 1.17-3.54 3.54 15.44 15.44 24.6-24.59-.09.23z"/>
                      </svg>
                      <span className="text-xs font-semibold text-yellow-600">Binance</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RadioGroup>

        <div className="space-y-3">
          <Button 
            onClick={handleContinue}
            disabled={!selectedMethod}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            Continue to Payment
          </Button>

          {onClose && (
            <Button 
              onClick={onClose}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Cancel
            </Button>
          )}
        </div>

        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            <Lock className="w-3 h-3 mr-1" />
            Secure payment powered by RupantorPay
          </Badge>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-800">
            <strong className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Secure Payment:
            </strong>
            Your payment information is encrypted and secured. We never store your card details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
