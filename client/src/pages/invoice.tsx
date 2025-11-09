import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Download, Printer, ArrowLeft, CheckCircle, Crown } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '@/contexts/currency-context';

interface InvoiceItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  orderId: string;
  userId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: any;
  };
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  discountCode?: string;
  membershipDiscount?: number;
  membershipTier?: string;
  shippingFee?: number;
  freeDeliveryCode?: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
}

export default function InvoicePage() {
  const [match, params] = useRoute('/invoice/:invoiceId');
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const { format } = useCurrency();

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: [`/api/invoices/${params?.invoiceId}`],
    enabled: !!params?.invoiceId,
  });

  const handleDownload = async () => {
    if (!invoice) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/invoices/download/${invoice._id}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "Your invoice is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.querySelector('.print-invoice');
    if (!printContent) return;
    
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.outerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h1>
            <p className="text-gray-600 mb-6">The invoice you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => window.history.back()} className="bg-[#26732d] hover:bg-[#1e5d26]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Backward compatibility: Calculate missing fields for old invoices
  const invoiceDiscount = invoice.discount || 0;
  const invoiceMembershipDiscount = invoice.membershipDiscount || 0;
  let invoiceShippingFee = invoice.shippingFee;
  
  // If shippingFee is missing (old invoice), calculate it from total
  if (invoiceShippingFee === undefined || invoiceShippingFee === null) {
    // Formula: shippingFee = total - subtotal + discount + membershipDiscount
    invoiceShippingFee = Math.max(0, invoice.total - invoice.subtotal + invoiceDiscount + invoiceMembershipDiscount);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Success Message */}
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-green-800">Order Placed Successfully!</h2>
                  <p className="text-green-600">
                    Thank you for your order. Your invoice #{invoice.invoiceNumber} has been generated.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-1 mb-6">
            <Button 
              onClick={() => window.history.back()}
              className="bg-[#26732d] hover:bg-[#1e5d26] text-white hover:text-white flex items-center space-x-2"
              data-testid="button-back-shopping"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Shopping</span>
            </Button>
            
            <Button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-[#26732d] hover:bg-[#1e5d26] text-white hover:text-white flex items-center space-x-2"
              data-testid="button-download-invoice"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloading ? 'Downloading...' : 'Download Invoice'}</span>
            </Button>
            
            <Button 
              onClick={handlePrint}
              className="bg-[#26732d] hover:bg-[#1e5d26] text-white hover:text-white flex items-center space-x-2"
              data-testid="button-print-invoice"
            >
              <Printer className="h-4 w-4" />
              <span>Print Invoice</span>
            </Button>
          </div>

          {/* Invoice */}
          <Card className="print-invoice print:shadow-none print:border-none">
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-3">
                    <img src="/logo.png" alt="PawCart Online Pet Store Logo" className="h-12 w-12 mr-3" />
                    <CardTitle className="text-3xl font-bold text-[#26732d]">
                      PawCart Online Pet Store
                    </CardTitle>
                  </div>
                  <p className="text-gray-600 mt-2">
                    11 Yuk Choi Road, Hung Hom<br />
                    Kowloon, Hong Kong<br />
                    Email: boqianjlu@gmail.com<br />
                    Phone: 852-6214-6811
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                  <p className="text-lg font-semibold text-[#26732d]">
                    #{invoice.invoiceNumber}
                  </p>
                  <p className="text-gray-600">
                    Date: {new Date(invoice.orderDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Customer Information */}
              <div className="grid md:grid-cols-2 gap-1 mb-8">
                <div>
                  <h3 className="font-bold text-lg mb-3">Bill To:</h3>
                  <div className="space-y-1">
                    <p className="font-semibold">{invoice.customerInfo.name}</p>
                    <p>{invoice.customerInfo.email}</p>
                    <p>{invoice.customerInfo.phone}</p>
                    {invoice.customerInfo.address && (
                      <div className="text-gray-600 space-y-1">
                        {typeof invoice.customerInfo.address === 'string' ? (
                          <p>{invoice.customerInfo.address}</p>
                        ) : (
                          <>
                            <p>{invoice.customerInfo.address.address}</p>
                            <p>
                              {[
                                invoice.customerInfo.address.city,
                                invoice.customerInfo.address.province,
                                invoice.customerInfo.address.region,
                                invoice.customerInfo.address.country
                              ].filter(Boolean).join(', ')}
                              {invoice.customerInfo.address.postCode && ` - ${invoice.customerInfo.address.postCode}`}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-3">Order Details:</h3>
                  <div className="space-y-1">
                    <p><span className="font-medium">Order ID:</span> {invoice.orderId}</p>
                    <p><span className="font-medium">Payment Method:</span> {invoice.paymentMethod}</p>
                    <p>
                      <span className="font-medium">Payment Status:</span>
                      <Badge 
                        variant={invoice.paymentStatus === 'Paid' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {invoice.paymentStatus}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <h3 className="font-bold text-lg mb-4">Items Ordered:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left">Product</th>
                        <th className="border border-gray-300 p-3 text-center">Quantity</th>
                        <th className="border border-gray-300 p-3 text-right">Price</th>
                        <th className="border border-gray-300 p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, index) => {
                        const isMembership = (item as any).type === 'membership' || item.name?.includes('Membership');
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-3">
                              <div className="flex items-center space-x-3">
                                {isMembership ? (
                                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded flex items-center justify-center">
                                    <Crown className="h-6 w-6 text-white" />
                                  </div>
                                ) : (
                                  <img 
                                    src={item.image} 
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                )}
                                <span className="font-medium">{item.name}</span>
                              </div>
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              {item.quantity}
                            </td>
                            <td className="border border-gray-300 p-3 text-right">
                              {format(item.price)}
                            </td>
                            <td className="border border-gray-300 p-3 text-right font-medium">
                              {format(item.price * item.quantity)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full md:w-1/2 lg:w-1/3 space-y-2">
                  <Separator />
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{format(invoice.subtotal)}</span>
                  </div>
                  
                  {/* Coupon Discount */}
                  {invoiceDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Discount
                        {invoice.discountCode && <span className="text-xs ml-1">({invoice.discountCode})</span>}
                      </span>
                      <span>-{format(invoiceDiscount)}</span>
                    </div>
                  )}
                  
                  {/* Membership Discount */}
                  {invoiceMembershipDiscount > 0 && (
                    <div className="flex justify-between text-[#26732d]">
                      <span className="flex items-center gap-1">
                        <Crown className="h-4 w-4" />
                        Membership Discount
                        {invoice.membershipTier && <span className="text-xs ml-1">({invoice.membershipTier})</span>}
                      </span>
                      <span>-{format(invoiceMembershipDiscount)}</span>
                    </div>
                  )}
                  
                  {/* Shipping Fee */}
                  <div className="flex justify-between">
                    <span>
                      Shipping Fee
                      {invoice.freeDeliveryCode && <span className="text-xs ml-1 text-green-600">(FREE: {invoice.freeDeliveryCode})</span>}
                    </span>
                    <span className={invoiceShippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                      {invoiceShippingFee === 0 ? 'FREE' : format(invoiceShippingFee)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-[#26732d]">{format(invoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t text-center text-gray-600">
                <p>Thank you for shopping with PawCart Online Pet Store!</p>
                <p className="text-sm mt-2">
                  For any queries, please contact us at boqianjlu@gmail.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}