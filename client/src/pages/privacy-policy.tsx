import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, UserCheck, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--meow-green)] to-[var(--meow-green-dark)] rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
            <p className="text-gray-600">Last Updated: November 2025</p>
          </div>

          {/* Content */}
          <Card className="shadow-lg">
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  At PawCart Online Pet Store, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase from us.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <UserCheck className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Information We Collect
                </h2>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Name and contact information (email, phone number, address)</li>
                      <li>Billing and shipping addresses</li>
                      <li>Payment information (processed securely through our payment providers)</li>
                      <li>Order history and preferences</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Automatically Collected Information</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Browser type and device information</li>
                      <li>IP address and location data</li>
                      <li>Cookies and similar tracking technologies</li>
                      <li>Pages visited and time spent on our website</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Lock className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  How We Use Your Information
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Process and fulfill your orders</li>
                  <li>Communicate with you about your orders and account</li>
                  <li>Send promotional emails (with your consent)</li>
                  <li>Improve our website and services</li>
                  <li>Prevent fraud and enhance security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-3">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Withdraw consent for data processing</li>
                  <li>Lodge a complaint with relevant authorities</li>
                </ul>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies to enhance your browsing experience, analyze website traffic, and personalize content. You can manage cookie preferences through your browser settings, but disabling cookies may affect website functionality.
                </p>
              </section>

              {/* Third-Party Services */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may share your information with trusted third-party service providers who assist us in operating our website, conducting our business, or serving you. These parties are obligated to keep your information confidential and use it only for the purposes we specify.
                </p>
              </section>

              {/* Contact Us */}
              <section className="bg-[var(--meow-green-pale)] p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Contact Us
                </h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  If you have any questions or concerns about this Privacy Policy, please contact us:
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

