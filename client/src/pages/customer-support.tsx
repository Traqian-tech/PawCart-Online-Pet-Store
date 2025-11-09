import { useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  MapPin,
  Headphones,
  Package,
  Truck,
  RotateCcw,
  CreditCard,
  HelpCircle,
  FileText,
  ShieldCheck,
  Award,
  Users,
  Globe,
  Twitter,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'wouter';

export default function CustomerSupport() {
  const [activeTab, setActiveTab] = useState('contact');

  const contactMethods = [
    {
      icon: Phone,
      title: 'Phone Support',
      subtitle: '852-6214-6811',
      description: 'Speak with our team directly',
      hours: 'Daily: 10:00 AM - 10:00 PM',
      action: 'Call Now',
      link: 'tel:+85262146811',
      color: 'from-green-400 to-green-600',
      available: true
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      subtitle: 'Instant messaging',
      description: 'Get real-time assistance online',
      hours: '24/7 Available',
      action: 'Start Chat',
      link: '/messenger',
      color: 'from-blue-400 to-blue-600',
      available: true
    },
    {
      icon: Mail,
      title: 'Email Support',
      subtitle: 'boqianjlu@gmail.com',
      description: 'Detailed inquiries welcome',
      hours: 'Response within 2-4 hours',
      action: 'Send Email',
      link: '/contact',
      color: 'from-purple-400 to-purple-600',
      available: true
    },
    {
      icon: Twitter,
      title: 'Social Media',
      subtitle: '@PawCartShop',
      description: 'Follow us on Twitter',
      hours: 'Updates & Support',
      action: 'Follow Us',
      link: 'https://x.com/PawCartShop?t=u9x_Kolz8awQv5adUIvBlw&s=05',
      color: 'from-sky-400 to-sky-600',
      available: true
    }
  ];

  const supportCategories = [
    {
      icon: Package,
      title: 'Orders & Tracking',
      description: 'Track orders, modify or cancel',
      topics: ['Order status', 'Modify order', 'Cancel order', 'Invoice & receipt'],
      link: '/track-order'
    },
    {
      icon: Truck,
      title: 'Shipping & Delivery',
      description: 'Delivery options and schedules',
      topics: ['Shipping rates', 'Delivery times', 'Address change', 'Delivery issues'],
      link: '/shipping-policy'
    },
    {
      icon: RotateCcw,
      title: 'Returns & Refunds',
      description: 'Return policy and procedures',
      topics: ['Return request', 'Refund status', 'Exchange items', 'Damaged products'],
      link: '/return-policy'
    },
    {
      icon: CreditCard,
      title: 'Payment & Billing',
      description: 'Payment methods and issues',
      topics: ['Payment options', 'Failed payment', 'Installments', 'Invoices'],
      link: '/help-center'
    },
    {
      icon: Award,
      title: 'Membership & Rewards',
      description: 'Privilege Club benefits',
      topics: ['Join membership', 'Tier benefits', 'Points & rewards', 'Exclusive offers'],
      link: '/privilege-club'
    },
    {
      icon: HelpCircle,
      title: 'Product Information',
      description: 'Product details and guidance',
      topics: ['Product recommendations', 'Ingredients', 'Usage instructions', 'Authenticity'],
      link: '/help-center'
    }
  ];

  const whyChooseUs = [
    {
      icon: Headphones,
      title: 'Expert Support Team',
      description: 'Trained pet care specialists ready to help'
    },
    {
      icon: Clock,
      title: 'Fast Response Time',
      description: 'Average response time under 2 minutes'
    },
    {
      icon: Globe,
      title: 'Multilingual Service',
      description: 'Support in 6+ languages including English, Cantonese, Mandarin'
    },
    {
      icon: ShieldCheck,
      title: 'Secure & Confidential',
      description: 'Your information is always protected'
    },
    {
      icon: Users,
      title: '10,000+ Happy Customers',
      description: '98% customer satisfaction rate'
    },
    {
      icon: CheckCircle2,
      title: 'Problem Resolution',
      description: '95% of issues resolved on first contact'
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
              <Headphones className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Customer Support Center</h1>
            <p className="text-lg md:text-xl mb-8 text-green-100">
              We're here to help you and your pets every step of the way
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl md:text-3xl font-bold text-[var(--meow-yellow)]">24/7</div>
                <div className="text-xs md:text-sm text-green-100">Support Available</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl md:text-3xl font-bold text-[var(--meow-yellow)]">&lt;2min</div>
                <div className="text-xs md:text-sm text-green-100">Response Time</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl md:text-3xl font-bold text-[var(--meow-yellow)]">98%</div>
                <div className="text-xs md:text-sm text-green-100">Satisfaction</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl md:text-3xl font-bold text-[var(--meow-yellow)]">10K+</div>
                <div className="text-xs md:text-sm text-green-100">Happy Customers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
              <TabsTrigger value="contact" className="text-sm md:text-base py-3">
                <Phone className="w-4 h-4 mr-2" />
                Contact Us
              </TabsTrigger>
              <TabsTrigger value="categories" className="text-sm md:text-base py-3">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help Topics
              </TabsTrigger>
              <TabsTrigger value="about" className="text-sm md:text-base py-3">
                <Users className="w-4 h-4 mr-2" />
                Why Choose Us
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-sm md:text-base py-3">
                <FileText className="w-4 h-4 mr-2" />
                Resources
              </TabsTrigger>
            </TabsList>

            {/* Contact Methods Tab */}
            <TabsContent value="contact" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Get in Touch</h2>
                <p className="text-lg text-gray-600">Choose your preferred way to reach us</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  const isExternal = method.link.startsWith('http');
                  
                  const cardContent = (
                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                      <CardContent className="p-6">
                        <div className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                        <p className="text-[#26732d] font-semibold mb-2">{method.subtitle}</p>
                        <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <Clock className="w-4 h-4" />
                          <span>{method.hours}</span>
                        </div>
                        <Button className={`w-full bg-gradient-to-r ${method.color} hover:opacity-90 text-white`}>
                          {method.action}
                        </Button>
                      </CardContent>
                    </Card>
                  );

                  if (isExternal) {
                    return (
                      <a key={index} href={method.link} target="_blank" rel="noopener noreferrer">
                        {cardContent}
                      </a>
                    );
                  }

                  return (
                    <Link key={index} href={method.link}>
                      {cardContent}
                    </Link>
                  );
                })}
              </div>

              {/* Visit Our Store */}
              <Card className="shadow-lg bg-gradient-to-r from-amber-50 to-orange-50">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <MapPin className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Visit Our Physical Store</h3>
                      <p className="text-gray-700 mb-2">
                        <strong>Address:</strong> 11 Yuk Choi Road, Hung Hom, Kowloon, Hong Kong
                      </p>
                      <p className="text-gray-700 mb-4">
                        <strong>Store Hours:</strong> Daily 10:00 AM - 9:00 PM
                      </p>
                      <Button 
                        onClick={() => window.open('https://www.google.com/maps/dir//11+Yuk+Choi+Road,+Hung+Hom,+Kowloon,+Hong+Kong/@22.304596,114.182586,17z', '_blank')}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Help Categories Tab */}
            <TabsContent value="categories" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">How Can We Help?</h2>
                <p className="text-lg text-gray-600">Browse support topics or search for answers</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supportCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <Link key={index} href={category.link}>
                      <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardContent className="p-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#26732d] to-[#1e5d26] rounded-xl flex items-center justify-center mb-4">
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{category.title}</h3>
                          <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                          <ul className="space-y-1">
                            {category.topics.map((topic, idx) => (
                              <li key={idx} className="text-xs text-gray-500 flex items-center gap-2">
                                <span className="w-1 h-1 bg-[#26732d] rounded-full"></span>
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Link href="/track-order">
                      <Button variant="outline" className="w-full justify-start h-auto py-4 text-left text-gray-900">
                        <Package className="w-5 h-5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Track My Order</div>
                          <div className="text-xs text-gray-500">Check order status and delivery</div>
                        </div>
                      </Button>
                    </Link>
                    <Link href="/return-policy">
                      <Button variant="outline" className="w-full justify-start h-auto py-4 text-left text-gray-900">
                        <RotateCcw className="w-5 h-5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Start a Return</div>
                          <div className="text-xs text-gray-500">Return or exchange items</div>
                        </div>
                      </Button>
                    </Link>
                    <Link href="/help-center">
                      <Button variant="outline" className="w-full justify-start h-auto py-4 text-left text-gray-900">
                        <HelpCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Browse FAQ</div>
                          <div className="text-xs text-gray-500">Find answers to common questions</div>
                        </div>
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button variant="outline" className="w-full justify-start h-auto py-4 text-left text-gray-900">
                        <Mail className="w-5 h-5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Contact Form</div>
                          <div className="text-xs text-gray-500">Send us a detailed message</div>
                        </div>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Why Choose Us Tab */}
            <TabsContent value="about" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Customers Love Our Support</h2>
                <p className="text-lg text-gray-600">Dedicated to providing the best service experience</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {whyChooseUs.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Card key={index} className="shadow-md">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#26732d] to-[#1e5d26] rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Testimonials */}
              <Card className="shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="text-center">What Our Customers Say</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-xl">★</span>
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm mb-3 italic">
                        "The customer service team helped me choose the perfect food for my senior cat. Very knowledgeable and patient!"
                      </p>
                      <p className="text-xs text-gray-500 font-semibold">- Sarah L.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-xl">★</span>
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm mb-3 italic">
                        "Quick response on live chat and my issue was resolved immediately. Best pet shop support in Hong Kong!"
                      </p>
                      <p className="text-xs text-gray-500 font-semibold">- Michael C.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-xl">★</span>
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm mb-3 italic">
                        "They handled my return so professionally and even gave me product recommendations. Truly care about customers!"
                      </p>
                      <p className="text-xs text-gray-500 font-semibold">- Emily W.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Helpful Resources</h2>
                <p className="text-lg text-gray-600">Guides, policies, and useful information</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Link href="/help-center">
                  <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <HelpCircle className="w-10 h-10 text-[#26732d] mb-3" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Help Center & FAQ</h3>
                      <p className="text-gray-600 text-sm">Browse frequently asked questions and detailed guides</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/shipping-policy">
                  <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <Truck className="w-10 h-10 text-[#26732d] mb-3" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Shipping Policy</h3>
                      <p className="text-gray-600 text-sm">Learn about delivery options, times, and fees</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/return-policy">
                  <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <RotateCcw className="w-10 h-10 text-[#26732d] mb-3" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Return Policy</h3>
                      <p className="text-gray-600 text-sm">Understand our return and refund procedures</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/privacy-policy">
                  <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <ShieldCheck className="w-10 h-10 text-[#26732d] mb-3" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Privacy Policy</h3>
                      <p className="text-gray-600 text-sm">How we protect and handle your information</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/terms-of-service">
                  <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <FileText className="w-10 h-10 text-[#26732d] mb-3" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Terms of Service</h3>
                      <p className="text-gray-600 text-sm">Our terms and conditions for using our services</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/quality-guarantee">
                  <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <Award className="w-10 h-10 text-[#26732d] mb-3" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Guarantee</h3>
                      <p className="text-gray-600 text-sm">Our commitment to product quality and authenticity</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </TabsContent>
          </Tabs>

          {/* Final CTA */}
          <Card className="mt-12 bg-gradient-to-r from-[#26732d] to-[#1e5d26] text-white shadow-xl">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-lg text-green-100 mb-6 max-w-2xl mx-auto">
                Our support team is always ready to assist you. Reach out anytime!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.location.href = 'tel:+85262146811'}
                  className="bg-[var(--meow-yellow)] hover:bg-yellow-500 text-gray-900 px-8 py-6 text-lg font-bold"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call 852-6214-6811
                </Button>
                <Link href="/messenger">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-bold">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start Live Chat
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

