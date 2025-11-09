import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, PackageCheck, Clock, AlertCircle, Mail } from 'lucide-react';

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--meow-green)] to-[var(--meow-green-dark)] rounded-full mb-4">
              <RotateCcw className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Return Policy</h1>
            <p className="text-gray-600">Your satisfaction is our priority</p>
          </div>

          {/* Content */}
          <Card className="shadow-lg">
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Overview */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                <p className="text-gray-700 leading-relaxed">
                  We want you and your pets to be completely satisfied with your purchase. If you're not happy with your order, we offer a straightforward return and exchange policy to ensure your peace of mind.
                </p>
              </section>

              {/* Return Window */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Return Window
                </h2>
                <div className="bg-[var(--meow-yellow-pale)] p-4 rounded-lg">
                  <p className="text-gray-800 font-semibold">
                    You have <span className="text-[var(--meow-green)] text-xl">7 days</span> from the date of delivery to initiate a return.
                  </p>
                </div>
              </section>

              {/* Eligible Items */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <PackageCheck className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Eligible Items
                </h2>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-green-700">✓ Returnable Items:</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Unopened pet food packages</li>
                      <li>Unused toys and accessories in original packaging</li>
                      <li>Grooming tools in original condition</li>
                      <li>Pet carriers and crates (unused)</li>
                      <li>Defective or damaged products</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-red-700">✗ Non-Returnable Items:</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Opened pet food or treats</li>
                      <li>Used or worn items</li>
                      <li>Prescription medications</li>
                      <li>Personalized or customized products</li>
                      <li>Items marked as "Final Sale"</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Return Process */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Return</h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--meow-green)] text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Contact Us</h3>
                      <p className="text-gray-700">
                        Email us at boqianjlu@gmail.com or call 852-6214-6811 within 7 days of delivery to request a return authorization.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--meow-green)] text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Pack Your Items</h3>
                      <p className="text-gray-700">
                        Securely package the items in their original packaging with all accessories and documentation.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--meow-green)] text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Ship the Return</h3>
                      <p className="text-gray-700">
                        Send the package to the address we provide. You're responsible for return shipping costs unless the item is defective or incorrect.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--meow-green)] text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Receive Your Refund</h3>
                      <p className="text-gray-700">
                        Once we receive and inspect your return, we'll process your refund within 5-7 business days to your original payment method.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Exchanges */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Exchanges</h2>
                <p className="text-gray-700 leading-relaxed">
                  We're happy to exchange items for a different size, color, or product. Contact us to arrange an exchange, and we'll guide you through the process.
                </p>
              </section>

              {/* Important Notes */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-2 text-[var(--meow-yellow)]" />
                  Important Notes
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Returns must be in new, unused condition with all original tags and packaging</li>
                  <li>Refunds will be issued to the original payment method</li>
                  <li>Shipping costs are non-refundable unless the return is due to our error</li>
                  <li>We recommend using a trackable shipping service for returns</li>
                  <li>Sale items may have different return conditions</li>
                </ul>
              </section>

              {/* Contact Us */}
              <section className="bg-[var(--meow-green-pale)] p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Need Help?
                </h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Our customer service team is here to help with your return:
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

