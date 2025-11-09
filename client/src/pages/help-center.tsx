import { useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Package, 
  CreditCard,
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  MapPin
} from 'lucide-react';
import { Link } from 'wouter';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Orders & Payment
  {
    id: '1',
    question: 'How do I place an order?',
    answer: 'To place an order, browse our products, add items to your cart, and proceed to checkout. You can checkout as a guest or create an account for faster future purchases. Fill in your delivery details and payment information to complete your order.',
    category: 'orders'
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We accept various payment methods including Credit/Debit Cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and Bank Transfer. All payments are processed securely through our encrypted payment gateway.',
    category: 'payment'
  },
  {
    id: '3',
    question: 'Can I modify or cancel my order?',
    answer: 'You can modify or cancel your order within 2 hours of placing it. After this time, your order may have already been processed for shipping. Please contact our customer support immediately if you need to make changes.',
    category: 'orders'
  },
  {
    id: '4',
    question: 'Do you offer installment payments?',
    answer: 'Yes! We offer installment payment options through selected credit cards and payment partners. You can choose to split your payment into 3, 6, or 12 monthly installments at checkout.',
    category: 'payment'
  },
  
  // Shipping & Delivery
  {
    id: '5',
    question: 'How long does delivery take?',
    answer: 'Standard delivery takes 3-5 business days. Express delivery (1-2 days) and Same-Day delivery options are available for orders placed before 12 PM. Delivery times may vary during peak seasons or public holidays.',
    category: 'shipping'
  },
  {
    id: '6',
    question: 'Do you offer free shipping?',
    answer: 'Yes! We offer FREE standard shipping on all orders over HK$300. Orders below this amount will have a shipping fee of HK$50. Express and same-day delivery have additional charges.',
    category: 'shipping'
  },
  {
    id: '7',
    question: 'Can I track my order?',
    answer: 'Absolutely! Once your order ships, you\'ll receive a tracking number via email and SMS. You can track your order in real-time using our Track Order page or through your account dashboard.',
    category: 'shipping'
  },
  {
    id: '8',
    question: 'What if I\'m not home during delivery?',
    answer: 'Our delivery partner will attempt delivery 2-3 times. If unsuccessful, they will leave a notice with instructions. You can also arrange for delivery to a neighbor or specify a safe place to leave the package.',
    category: 'shipping'
  },
  
  // Returns & Refunds
  {
    id: '9',
    question: 'What is your return policy?',
    answer: 'We accept returns of unopened, unused products within 7 days of delivery. Items must be in their original packaging with all tags attached. Opened food items cannot be returned for hygiene reasons, unless defective.',
    category: 'returns'
  },
  {
    id: '10',
    question: 'How do I return a product?',
    answer: 'To initiate a return, contact our customer support or visit your account dashboard. Select the order and items you wish to return, choose a reason, and we\'ll provide a return shipping label. Pack the items securely and ship them back to us.',
    category: 'returns'
  },
  {
    id: '11',
    question: 'When will I receive my refund?',
    answer: 'Refunds are processed within 5-7 business days after we receive and inspect your returned items. The refund will be credited to your original payment method. Bank transfers may take an additional 3-5 days.',
    category: 'returns'
  },
  {
    id: '12',
    question: 'Can I exchange a product?',
    answer: 'Yes! If you received the wrong item or want a different size/variant, we offer free exchanges. Contact our support team within 7 days of delivery to arrange an exchange.',
    category: 'returns'
  },
  
  // Products & Quality
  {
    id: '13',
    question: 'Are your products authentic?',
    answer: 'Yes! We are authorized distributors for all brands we carry. Every product is 100% authentic and sourced directly from manufacturers or official distributors. We provide authenticity guarantees and product certifications.',
    category: 'products'
  },
  {
    id: '14',
    question: 'How do I know which product is right for my pet?',
    answer: 'Each product page includes detailed descriptions, ingredients, and feeding guidelines. You can also use our product filters to find items by pet type, age, size, and dietary needs. Our customer support team is happy to provide personalized recommendations!',
    category: 'products'
  },
  {
    id: '15',
    question: 'Do you check expiry dates?',
    answer: 'Absolutely! We maintain strict quality control. All products have at least 6 months until expiry when shipped. We regularly rotate stock and remove expired items. Expiry dates are clearly marked on all products.',
    category: 'products'
  },
  {
    id: '16',
    question: 'What if I receive a damaged or defective product?',
    answer: 'We\'re sorry if this happens! Please contact us within 48 hours of delivery with photos of the damaged item. We\'ll arrange for a replacement or full refund immediately, including return shipping costs.',
    category: 'products'
  },
  
  // Account & Membership
  {
    id: '17',
    question: 'Do I need an account to shop?',
    answer: 'No, you can checkout as a guest. However, creating an account allows you to track orders, save addresses, earn rewards points, and access exclusive member discounts and promotions.',
    category: 'account'
  },
  {
    id: '18',
    question: 'What are the membership benefits?',
    answer: 'Our Privilege Club offers 4 tiers: Bronze (5% off), Silver (8% off), Gold (12% off), and Diamond Paw (15% off). Members also get early access to sales, birthday rewards, free shipping on all orders, and exclusive products.',
    category: 'account'
  },
  {
    id: '19',
    question: 'How do I reset my password?',
    answer: 'Click on "Forgot Password" on the login page. Enter your registered email address, and we\'ll send you a password reset link. Follow the link to create a new password. If you don\'t receive the email, check your spam folder.',
    category: 'account'
  },
  {
    id: '20',
    question: 'Can I change my delivery address?',
    answer: 'Yes! You can update your delivery address in your account settings. For orders already placed, contact customer support within 2 hours to update the address before shipping.',
    category: 'account'
  }
];

const categories = [
  { id: 'all', name: 'All Topics', icon: HelpCircle },
  { id: 'orders', name: 'Orders & Payment', icon: Package },
  { id: 'payment', name: 'Payment Methods', icon: CreditCard },
  { id: 'shipping', name: 'Shipping & Delivery', icon: Truck },
  { id: 'returns', name: 'Returns & Refunds', icon: RotateCcw },
  { id: 'products', name: 'Products & Quality', icon: ShieldCheck },
  { id: 'account', name: 'Account & Membership', icon: HelpCircle }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#26732d] to-[#1e5d26] text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Help Center</h1>
            <p className="text-lg md:text-xl mb-8 text-green-100">
              Find answers to your questions and get the support you need
            </p>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search for help... (e.g., 'shipping', 'return policy', 'payment')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-6 text-lg rounded-xl border-0 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Quick Contact Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = 'tel:+85262146811'}>
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-[#26732d]" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Call Us</h3>
                <p className="text-xs text-gray-600">852-6214-6811</p>
              </CardContent>
            </Card>

            <Link href="/contact">
              <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Email Support</h3>
                  <p className="text-xs text-gray-600">Get detailed help</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/messenger">
              <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Live Chat</h3>
                  <p className="text-xs text-gray-600">Instant replies</p>
                </CardContent>
              </Card>
            </Link>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Support Hours</h3>
                <p className="text-xs text-gray-600">Daily 10AM-10PM</p>
              </CardContent>
            </Card>
          </div>

          {/* Category Filters */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse by Topic</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    className={`h-auto py-4 flex flex-col items-center gap-2 ${
                      selectedCategory === category.id 
                        ? 'bg-[#26732d] hover:bg-[#1e5d26] text-white' 
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Icon size={20} />
                    <span className="text-xs text-center leading-tight">{category.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* FAQ Section */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">
                {searchQuery ? `Search Results (${filteredFAQs.length})` : 'Frequently Asked Questions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-6">
                    Try different keywords or browse by category
                  </p>
                  <Button onClick={() => setSearchQuery('')} variant="outline">
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFAQs.map((faq) => (
                    <div
                      key={faq.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#26732d] transition-colors"
                    >
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                        {expandedFAQ === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-[#26732d] flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {expandedFAQ === faq.id && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Still Need Help Section */}
          <Card className="mt-8 bg-gradient-to-r from-[#26732d] to-[#1e5d26] text-white shadow-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">Still Need Help?</h2>
              <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our friendly customer support team is here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="bg-white text-[#26732d] hover:bg-gray-100 px-8 py-6 text-lg">
                    <Mail className="w-5 h-5 mr-2" />
                    Contact Support
                  </Button>
                </Link>
                <Link href="/messenger">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start Live Chat
                  </Button>
                </Link>
              </div>
              
              {/* Store Visit Info */}
              <div className="mt-8 pt-6 border-t border-green-600">
                <div className="flex items-center justify-center gap-2 text-green-100">
                  <MapPin size={18} />
                  <span className="text-sm">Visit our store: 11 Yuk Choi Road, Hung Hom, Kowloon, Hong Kong</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

