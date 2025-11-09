import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MessageCircle, Clock, HelpCircle, Headphones, MapPin, Package, Truck, RotateCcw, Twitter } from 'lucide-react';
import { Link } from 'wouter';

export default function Helpline() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--meow-green)] to-[var(--meow-green-dark)] rounded-full mb-4">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Customer Helpline</h1>
            <p className="text-gray-600">We're here to help you and your pets</p>
          </div>

          {/* Quick Contact */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => window.location.href = 'tel:+85262146811'}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[var(--meow-green)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Call Us</h3>
                <p className="text-[var(--meow-green)] font-semibold text-xl">852-6214-6811</p>
                <p className="text-sm text-gray-600 mt-2">Speak with our team</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => window.location.href = 'mailto:boqianjlu@gmail.com'}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[var(--meow-yellow)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-gray-900" />
                </div>
                <h3 className="font-bold text-lg mb-2">Email Us</h3>
                <p className="text-gray-700 font-semibold text-sm break-all">boqianjlu@gmail.com</p>
                <p className="text-sm text-gray-600 mt-2">Get detailed assistance</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => window.open('https://x.com/PawCartShop?t=u9x_Kolz8awQv5adUIvBlw&s=05', '_blank')}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Twitter className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Follow Us</h3>
                <p className="text-sky-600 font-semibold">Twitter @PawCartShop</p>
                <p className="text-sm text-gray-600 mt-2">Stay connected</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="shadow-lg mb-8">
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Support Hours */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Support Hours
                </h2>
                <div className="bg-gradient-to-r from-[var(--meow-green-pale)] to-[var(--meow-yellow-pale)] p-6 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4 text-gray-800">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
                      <p className="text-2xl font-bold text-[var(--meow-green)]">Daily 10 AM - 10 PM</p>
                      <p className="text-sm mt-1">Hong Kong Time (GMT+8)</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Email & Chat</h3>
                      <p className="text-2xl font-bold text-[var(--meow-green)]">24/7</p>
                      <p className="text-sm mt-1">Response within 2-4 hours</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* How We Can Help */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <HelpCircle className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  How We Can Help
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-[var(--meow-green)] rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">🛍️ Order Assistance</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Track your order</li>
                      <li>• Modify or cancel orders</li>
                      <li>• Payment issues</li>
                      <li>• Order confirmation</li>
                    </ul>
                  </div>
                  <div className="border-2 border-[var(--meow-green)] rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">📦 Delivery Support</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Shipping inquiries</li>
                      <li>• Delivery scheduling</li>
                      <li>• Address changes</li>
                      <li>• Delivery issues</li>
                    </ul>
                  </div>
                  <div className="border-2 border-[var(--meow-green)] rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">🔄 Returns & Exchanges</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Return requests</li>
                      <li>• Exchange products</li>
                      <li>• Refund status</li>
                      <li>• Damaged items</li>
                    </ul>
                  </div>
                  <div className="border-2 border-[var(--meow-green)] rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">🐾 Product Guidance</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Product recommendations</li>
                      <li>• Nutrition advice</li>
                      <li>• Usage instructions</li>
                      <li>• Pet care tips</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Quick Actions */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  <Link href="/track-order">
                    <Button variant="outline" className="w-full justify-start h-auto py-3 text-gray-900">
                      <Package className="w-5 h-5 mr-3" />
                      Track My Order
                    </Button>
                  </Link>
                  <Link href="/return-policy">
                    <Button variant="outline" className="w-full justify-start h-auto py-3 text-gray-900">
                      <RotateCcw className="w-5 h-5 mr-3" />
                      Return Policy
                    </Button>
                  </Link>
                  <Link href="/shipping-policy">
                    <Button variant="outline" className="w-full justify-start h-auto py-3 text-gray-900">
                      <Truck className="w-5 h-5 mr-3" />
                      Shipping Info
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" className="w-full justify-start h-auto py-3 text-gray-900">
                      <Mail className="w-5 h-5 mr-3" />
                      Contact Form
                    </Button>
                  </Link>
                </div>
              </section>

              {/* FAQ */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  <details className="bg-gray-50 p-4 rounded-lg">
                    <summary className="font-semibold cursor-pointer">How long does delivery take?</summary>
                    <p className="mt-2 text-gray-700 text-sm">Standard delivery takes 3-5 business days. Express and same-day options are also available.</p>
                  </details>
                  <details className="bg-gray-50 p-4 rounded-lg">
                    <summary className="font-semibold cursor-pointer">What's your return policy?</summary>
                    <p className="mt-2 text-gray-700 text-sm">You can return unopened items within 7 days of delivery for a full refund or exchange.</p>
                  </details>
                  <details className="bg-gray-50 p-4 rounded-lg">
                    <summary className="font-semibold cursor-pointer">Do you offer free shipping?</summary>
                    <p className="mt-2 text-gray-700 text-sm">Yes! Orders over $300 qualify for free standard shipping.</p>
                  </details>
                  <details className="bg-gray-50 p-4 rounded-lg">
                    <summary className="font-semibold cursor-pointer">How can I track my order?</summary>
                    <p className="mt-2 text-gray-700 text-sm">You'll receive a tracking number via email once your order ships. You can also check your order status in your account.</p>
                  </details>
                </div>
              </section>

              {/* Visit Us */}
              <section className="bg-[var(--meow-green-pale)] p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Visit Our Store
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Address:</strong> 11 Yuk Choi Road, Hung Hom, Kowloon, Hong Kong</p>
                  <p><strong>Store Hours:</strong> Daily 10 AM - 9 PM</p>
                  <p className="text-sm italic">Walk-ins welcome! Our friendly staff can assist you in person.</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

