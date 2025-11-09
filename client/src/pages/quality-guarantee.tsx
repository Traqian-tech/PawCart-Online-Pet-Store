import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Shield, CheckCircle, Star, ThumbsUp, Mail } from 'lucide-react';

export default function QualityGuarantee() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--meow-green)] to-[var(--meow-green-dark)] rounded-full mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Quality Guarantee</h1>
            <p className="text-gray-600">Your pet's health and happiness are our top priority</p>
          </div>

          {/* Content */}
          <Card className="shadow-lg">
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Our Promise */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Our Quality Promise
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  At PawCart Online Pet Store, we're committed to providing only the highest quality products for your beloved pets. Every item in our store undergoes rigorous quality checks to ensure it meets our strict standards for safety, nutrition, and durability.
                </p>
              </section>

              {/* What We Guarantee */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  What We Guarantee
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-4 bg-[var(--meow-green-pale)] p-4 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-[var(--meow-green)] rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">100% Authentic Products</h3>
                      <p className="text-gray-700">
                        All our products are sourced directly from authorized distributors and manufacturers. We guarantee authenticity and never sell counterfeit items.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 bg-[var(--meow-green-pale)] p-4 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-[var(--meow-green)] rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Fresh & Safe Food Products</h3>
                      <p className="text-gray-700">
                        Pet food and treats are stored in optimal conditions and have minimum 6 months expiry date from purchase. We check every batch for freshness.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 bg-[var(--meow-green-pale)] p-4 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-[var(--meow-green)] rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Quality-Tested Accessories</h3>
                      <p className="text-gray-700">
                        All toys, accessories, and equipment are tested for safety, durability, and pet-friendliness. We only stock items that meet international safety standards.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 bg-[var(--meow-green-pale)] p-4 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-[var(--meow-green)] rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Proper Storage & Handling</h3>
                      <p className="text-gray-700">
                        Our warehouse maintains controlled temperature and humidity levels. Products are handled with care from storage to delivery.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Our Standards */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Star className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Our Quality Standards
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-[var(--meow-green)] rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 text-[var(--meow-green)]">Premium Brands Only</h3>
                    <p className="text-gray-700 text-sm">We partner with trusted, reputable brands known for quality and safety.</p>
                  </div>
                  <div className="border-2 border-[var(--meow-green)] rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 text-[var(--meow-green)]">Regular Inspections</h3>
                    <p className="text-gray-700 text-sm">Our quality control team inspects products regularly to maintain standards.</p>
                  </div>
                  <div className="border-2 border-[var(--meow-green)] rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 text-[var(--meow-green)]">Expert Selection</h3>
                    <p className="text-gray-700 text-sm">Products are chosen by pet care experts and veterinary consultants.</p>
                  </div>
                  <div className="border-2 border-[var(--meow-green)] rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 text-[var(--meow-green)]">Customer Feedback</h3>
                    <p className="text-gray-700 text-sm">We continuously improve based on customer reviews and pet parent experiences.</p>
                  </div>
                </div>
              </section>

              {/* If You're Not Satisfied */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <ThumbsUp className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  If You're Not Satisfied
                </h2>
                <div className="bg-gradient-to-r from-[var(--meow-yellow-pale)] to-[var(--meow-green-pale)] p-6 rounded-lg">
                  <p className="text-gray-800 font-semibold mb-4 text-lg">
                    We stand behind our products 100%. If you're not completely satisfied:
                  </p>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-start gap-3">
                      <span className="text-[var(--meow-green)] font-bold text-xl">✓</span>
                      <p><strong>Free Replacement:</strong> We'll replace defective or damaged items at no cost</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-[var(--meow-green)] font-bold text-xl">✓</span>
                      <p><strong>Full Refund:</strong> Get your money back if the product doesn't meet expectations</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-[var(--meow-green)] font-bold text-xl">✓</span>
                      <p><strong>Expert Support:</strong> Our team will help find the right alternative for your pet</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-[var(--meow-green)] font-bold text-xl">✓</span>
                      <p><strong>No Questions Asked:</strong> We trust your judgment as a pet parent</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quality Certifications */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Quality Certifications</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our commitment to quality is reflected in our partnerships and certifications:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Authorized distributor for major pet food brands</li>
                  <li>ISO-compliant storage and handling procedures</li>
                  <li>Regular health and safety audits</li>
                  <li>Member of Hong Kong Pet Industry Association</li>
                  <li>Compliance with international pet product safety standards</li>
                </ul>
              </section>

              {/* Our Commitment */}
              <section className="bg-[var(--meow-green)] text-white p-6 rounded-lg -mx-2">
                <h2 className="text-2xl font-bold mb-4">Our Commitment to You</h2>
                <p className="leading-relaxed text-lg">
                  "We treat every pet product as if it were for our own beloved companions. Your trust in us drives our unwavering commitment to quality, safety, and excellence in everything we do."
                </p>
                <p className="mt-4 font-semibold">— The PawCart Team</p>
              </section>

              {/* Contact Us */}
              <section className="bg-[var(--meow-green-pale)] p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-6 h-6 mr-2 text-[var(--meow-green)]" />
                  Quality Concerns?
                </h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  If you have any concerns about product quality, please contact us immediately:
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

