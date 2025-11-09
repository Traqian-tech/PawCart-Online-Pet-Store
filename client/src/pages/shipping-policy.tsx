import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, MapPin, Clock, Package, DollarSign, Mail } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--meow-green)] to-[var(--meow-green-dark)] rounded-full mb-4">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Shipping Policy</h1>
            <p className="text-gray-600">Fast and reliable delivery to your door</p>
          </div>

          {/* Content */}
          <Card className="shadow-lg">
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Overview */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                <p className="text-gray-700 leading-relaxed">
                  We're committed to delivering your pet supplies quickly and safely. This policy outlines our shipping methods, delivery times, and costs to help you plan your purchase.
                </p>
              </section>

              {/* Delivery Areas */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Delivery Areas
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-[var(--meow-green-pale)] p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2 text-[var(--meow-green)]">Hong Kong Island</h3>
                    <p className="text-sm text-gray-700">All districts covered</p>
                  </div>
                  <div className="bg-[var(--meow-green-pale)] p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2 text-[var(--meow-green)]">Kowloon</h3>
                    <p className="text-sm text-gray-700">All districts covered</p>
                  </div>
                  <div className="bg-[var(--meow-green-pale)] p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2 text-[var(--meow-green)]">New Territories</h3>
                    <p className="text-sm text-gray-700">Most areas covered</p>
                  </div>
                  <div className="bg-[var(--meow-green-pale)] p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2 text-[var(--meow-green)]">Outlying Islands</h3>
                    <p className="text-sm text-gray-700">Selected areas (contact us)</p>
                  </div>
                </div>
              </section>

              {/* Shipping Methods */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Package className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Shipping Methods
                </h2>
                <div className="space-y-4">
                  <div className="border-2 border-[var(--meow-green)] rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-[var(--meow-green)]">Standard Delivery</h3>
                      <span className="bg-[var(--meow-green)] text-white px-3 py-1 rounded-full text-sm font-semibold">
                        FREE
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">Free shipping on orders over $300</p>
                    <p className="text-gray-600 text-sm">Delivery: 3-5 business days</p>
                  </div>

                  <div className="border-2 border-gray-300 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">Express Delivery</h3>
                      <span className="bg-[var(--meow-yellow)] text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                        $50
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">Next-day delivery for urgent orders</p>
                    <p className="text-gray-600 text-sm">Delivery: 1-2 business days</p>
                  </div>

                  <div className="border-2 border-gray-300 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">Same-Day Delivery</h3>
                      <span className="bg-[var(--meow-error)] text-white px-3 py-1 rounded-full text-sm font-semibold">
                        $80
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">Order before 12 PM for same-day delivery</p>
                    <p className="text-gray-600 text-sm">Available in selected areas only</p>
                  </div>
                </div>
              </section>

              {/* Shipping Costs */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Shipping Costs
                </h2>
                <div className="bg-gradient-to-r from-[var(--meow-green-pale)] to-[var(--meow-yellow-pale)] p-6 rounded-lg">
                  <div className="space-y-3 text-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Orders under $300:</span>
                      <span className="text-xl font-bold text-[var(--meow-green)]">$30</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Orders $300 and above:</span>
                      <span className="text-xl font-bold text-[var(--meow-green)]">FREE</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Processing Time */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Order Processing Time
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Orders are typically processed within 1-2 business days</li>
                  <li>Orders placed on weekends/holidays are processed the next business day</li>
                  <li>You'll receive a tracking number via email once your order ships</li>
                  <li>Large or bulk orders may require additional processing time</li>
                </ul>
              </section>

              {/* Tracking */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Tracking</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Once your order ships, you'll receive:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Shipping confirmation email with tracking number</li>
                  <li>Real-time tracking updates</li>
                  <li>Estimated delivery date</li>
                  <li>Delivery notifications</li>
                </ul>
              </section>

              {/* Special Items */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Special Items</h2>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <h3 className="font-semibold mb-2">Large or Heavy Items:</h3>
                    <p>Items like pet carriers, large bags of food, or furniture may require special handling and additional delivery time.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Perishable Items:</h3>
                    <p>Fresh food items are shipped with ice packs and require immediate attention upon delivery.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Temperature-Sensitive Products:</h3>
                    <p>Medications and supplements are packaged appropriately to maintain quality during transit.</p>
                  </div>
                </div>
              </section>

              {/* Delivery Issues */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Issues</h2>
                <div className="bg-yellow-50 border-l-4 border-[var(--meow-yellow)] p-4 rounded">
                  <p className="text-gray-700 leading-relaxed mb-3">
                    If you experience any delivery issues:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Missing packages: Contact us within 48 hours</li>
                    <li>Damaged items: Report within 24 hours of delivery</li>
                    <li>Wrong items: Contact us immediately</li>
                    <li>Delivery delays: We'll work with carriers to resolve</li>
                  </ul>
                </div>
              </section>

              {/* Contact Us */}
              <section className="bg-[var(--meow-green-pale)] p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Shipping Questions?
                </h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Our team is here to help with your shipping inquiries:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> boqianjlu@gmail.com</p>
                  <p><strong>Phone:</strong> 852-6214-6811</p>
                  <p><strong>Hours:</strong> Daily 10 AM - 10 PM</p>
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

