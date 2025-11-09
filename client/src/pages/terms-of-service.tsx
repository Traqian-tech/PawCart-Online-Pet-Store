import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, UserCheck, ShieldCheck, AlertTriangle, Mail } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--meow-green)] to-[var(--meow-green-dark)] rounded-full mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
            <p className="text-gray-600">Last Updated: November 2025</p>
          </div>

          {/* Content */}
          <Card className="shadow-lg">
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using PawCart Online Pet Store ("we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.
                </p>
              </section>

              {/* User Account */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <UserCheck className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  User Accounts
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p>When you create an account with us, you must:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain and promptly update your account information</li>
                    <li>Keep your password confidential and secure</li>
                    <li>Notify us immediately of any unauthorized use of your account</li>
                    <li>Be responsible for all activities under your account</li>
                  </ul>
                </div>
              </section>

              {/* Product Information */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Information & Pricing</h2>
                <div className="space-y-3 text-gray-700">
                  <p>We strive to provide accurate product descriptions and pricing. However:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Product images are for illustration purposes and may vary slightly from actual items</li>
                    <li>Prices are subject to change without notice</li>
                    <li>We reserve the right to correct pricing errors</li>
                    <li>Product availability may vary and is not guaranteed</li>
                    <li>We reserve the right to limit quantities purchased</li>
                  </ul>
                </div>
              </section>

              {/* Orders & Payment */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Orders & Payment</h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>Order Acceptance:</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li>All orders are subject to acceptance and availability</li>
                    <li>We reserve the right to refuse or cancel any order</li>
                    <li>Order confirmation does not guarantee acceptance</li>
                  </ul>
                  <p><strong>Payment:</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Payment must be received before order fulfillment</li>
                    <li>We accept various payment methods as displayed on our site</li>
                    <li>You authorize us to charge your payment method for all fees incurred</li>
                  </ul>
                </div>
              </section>

              {/* Shipping & Delivery */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping & Delivery</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Delivery times are estimates and not guaranteed</li>
                  <li>We are not responsible for delays beyond our control</li>
                  <li>Risk of loss transfers to you upon delivery</li>
                  <li>You must provide accurate shipping information</li>
                </ul>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <ShieldCheck className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Intellectual Property
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  All content on our website, including text, graphics, logos, images, and software, is our property or our licensors' property and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
                </p>
              </section>

              {/* Prohibited Uses */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2 text-[var(--meow-error)]" />
                  Prohibited Uses
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p>You agree not to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Use the site for any unlawful purpose</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with the proper functioning of the site</li>
                    <li>Impersonate any person or entity</li>
                    <li>Upload viruses or malicious code</li>
                    <li>Harvest or collect user information</li>
                    <li>Engage in any automated use of the system</li>
                  </ul>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
                <div className="bg-yellow-50 border-l-4 border-[var(--meow-yellow)] p-4 rounded">
                  <p className="text-gray-700 leading-relaxed">
                    To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our service.
                  </p>
                </div>
              </section>

              {/* Indemnification */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree to indemnify and hold harmless PawCart Online Pet Store and its affiliates, officers, agents, and employees from any claim, demand, loss, or damages, including reasonable attorneys' fees, arising out of your use of our site or violation of these Terms.
                </p>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of Hong Kong, without regard to its conflict of law provisions.
                </p>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to our website. Your continued use of the site after changes constitutes acceptance of the modified Terms.
                </p>
              </section>

              {/* Contact Us */}
              <section className="bg-[var(--meow-green-pale)] p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Contact Us
                </h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> boqianjlu@gmail.com</p>
                  <p><strong>Phone:</strong> 852-6214-6811</p>
                  <p><strong>Address:</strong> 11 Yuk Choi Road, Hung Hom, Kowloon, Hong Kong</p>
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

