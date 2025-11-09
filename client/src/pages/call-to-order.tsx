import { useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Clock, 
  CheckCircle, 
  Headphones, 
  ShoppingCart,
  Package,
  CreditCard,
  Truck,
  MessageCircle,
  Mail
} from 'lucide-react';
import { Link } from 'wouter';

export default function CallToOrder() {
  const [isCalling, setIsCalling] = useState(false);

  const handleCall = () => {
    setIsCalling(true);
    window.location.href = 'tel:+85262146811';
    setTimeout(() => setIsCalling(false), 3000);
  };

  const benefits = [
    {
      icon: Headphones,
      title: 'Personal Assistance',
      description: 'Speak directly with our pet care experts who can help you choose the perfect products'
    },
    {
      icon: ShoppingCart,
      title: 'Easy Ordering',
      description: 'Simply tell us what you need, and we\'ll process your order over the phone'
    },
    {
      icon: Package,
      title: 'Product Recommendations',
      description: 'Get personalized suggestions based on your pet\'s specific needs and preferences'
    },
    {
      icon: CreditCard,
      title: 'Secure Payment',
      description: 'Multiple payment options available with secure processing'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Same delivery options as online orders - standard, express, or same-day'
    },
    {
      icon: CheckCircle,
      title: 'Order Confirmation',
      description: 'Receive instant confirmation via SMS and email after placing your order'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Call Our Hotline',
      description: 'Dial 852-6214-6811 during business hours',
      color: 'from-green-400 to-green-600'
    },
    {
      step: '2',
      title: 'Tell Us What You Need',
      description: 'Our team will help you find the right products',
      color: 'from-blue-400 to-blue-600'
    },
    {
      step: '3',
      title: 'Provide Delivery Details',
      description: 'Share your address and preferred delivery time',
      color: 'from-purple-400 to-purple-600'
    },
    {
      step: '4',
      title: 'Complete Payment',
      description: 'Choose your payment method and confirm',
      color: 'from-orange-400 to-orange-600'
    },
    {
      step: '5',
      title: 'Receive Your Order',
      description: 'Get your pet supplies delivered to your door',
      color: 'from-pink-400 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#26732d] to-[#1e5d26] text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <Phone className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Call to Order</h1>
            <p className="text-lg md:text-xl mb-8 text-green-100">
              Prefer to order by phone? Our friendly team is ready to help!
            </p>
            
            {/* Main Call Button */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Phone className="w-8 h-8 text-[var(--meow-yellow)]" />
                <a href="tel:+85262146811" className="text-4xl md:text-5xl font-bold text-white hover:text-[var(--meow-yellow)] transition-colors">
                  852-6214-6811
                </a>
              </div>
              <Button
                onClick={handleCall}
                disabled={isCalling}
                className="bg-[var(--meow-yellow)] hover:bg-yellow-500 text-gray-900 px-12 py-6 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {isCalling ? (
                  <>
                    <div className="w-5 h-5 border-3 border-gray-900 border-t-transparent rounded-full animate-spin mr-3" />
                    Calling...
                  </>
                ) : (
                  <>
                    <Phone className="w-6 h-6 mr-3" />
                    Call Now
                  </>
                )}
              </Button>
              
              {/* Business Hours */}
              <div className="mt-6 flex items-center justify-center gap-2 text-green-100">
                <Clock className="w-5 h-5" />
                <span className="text-lg">Daily: 10:00 AM - 10:00 PM (Hong Kong Time)</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold text-[var(--meow-yellow)]">24/7</div>
                <div className="text-sm text-green-100">Emergency Line</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold text-[var(--meow-yellow)]">&lt;2min</div>
                <div className="text-sm text-green-100">Avg. Wait Time</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold text-[var(--meow-yellow)]">98%</div>
                <div className="text-sm text-green-100">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Why Call to Order */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Order by Phone?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience personalized service and expert guidance for all your pet care needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#26732d] to-[#1e5d26] rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* How It Works */}
          <Card className="shadow-lg mb-12">
            <CardHeader className="bg-gradient-to-r from-[#26732d] to-[#1e5d26] text-white">
              <CardTitle className="text-2xl text-center">How Phone Ordering Works</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {howItWorks.map((item, index) => (
                  <div key={index} className="flex items-start gap-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <span className="text-2xl font-bold text-white">{item.step}</span>
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* What You Can Order */}
          <Card className="shadow-lg mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">What You Can Order by Phone</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">✅ Available Products</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>All pet food brands (dry, wet, treats)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Pet accessories and toys</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Health and grooming products</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Cat litter and cleaning supplies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Beds, carriers, and furniture</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Bulk and repack orders</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">💡 Special Services</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Personalized product recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Subscription and recurring orders</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Corporate and wholesale inquiries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Gift wrapping and special requests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Membership enrollment and upgrades</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Order modifications and tracking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Languages Supported */}
          <Card className="shadow-lg mb-12 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🌏 Languages We Speak</h3>
              <p className="text-lg text-gray-700 mb-4">
                Our multilingual team can assist you in:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {['English', 'Cantonese', 'Mandarin', 'Japanese', 'Korean', 'French'].map((lang) => (
                  <span key={lang} className="px-6 py-2 bg-white rounded-full shadow-md font-semibold text-gray-800">
                    {lang}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alternative Contact Methods */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Prefer Other Contact Methods?</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/messenger">
                  <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Live Chat</h3>
                      <p className="text-sm text-gray-600 mb-3">Get instant replies online</p>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Start Chat
                      </Button>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/contact">
                  <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Email Us</h3>
                      <p className="text-sm text-gray-600 mb-3">Detailed inquiries welcome</p>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Send Email
                      </Button>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/">
                  <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Shop Online</h3>
                      <p className="text-sm text-gray-600 mb-3">Browse and order anytime</p>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Start Shopping
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Final CTA */}
          <div className="mt-12 text-center bg-gradient-to-r from-[#26732d] to-[#1e5d26] text-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
            <p className="text-lg text-green-100 mb-6 max-w-2xl mx-auto">
              Our pet care experts are standing by to help you find exactly what your furry friends need
            </p>
            <Button
              onClick={handleCall}
              className="bg-[var(--meow-yellow)] hover:bg-yellow-500 text-gray-900 px-12 py-6 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Phone className="w-6 h-6 mr-3" />
              Call 852-6214-6811 Now
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

