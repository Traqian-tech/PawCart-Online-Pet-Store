
import { useState } from 'react';
import { MapPin, Phone, Clock, Facebook, Instagram, MessageCircle, Send, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import emailjs from '@emailjs/browser';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and message.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Initialize EmailJS (you can also do this once in your app initialization)
      emailjs.init("public-4_2EJeuoHymsGSC0t"); // Your public key

      const templateParams = {
        from_name: formData.name,
        from_phone: formData.phone,
        from_email: formData.email || 'Not provided',
        subject: formData.subject,
        message: formData.message,
        to_name: 'PawCart Online Pet Store',
        time: new Date().toLocaleString('en-US', { 
          timeZone: 'Asia/Hong_Kong',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) + ' (Hong Kong Time)',
      };

      await emailjs.send(
        'service_lygzcpc', // Your service ID
        'template_j90cwmp', // Your template ID
        templateParams
      );

      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('EmailJS error:', error);
      
      // Show error with direct contact information
      toast({
        title: "Unable to Send Message Automatically",
        description: (
          <div className="space-y-2">
            <p>Please contact us directly:</p>
            <p className="font-semibold">📧 boqianjlu@gmail.com</p>
            <p className="font-semibold">📞 852-6214-6811</p>
          </div>
        ) as any,
        variant: "destructive",
        duration: 10000, // Show for 10 seconds
      });
      
      // Also try to open email client as backup
      const mailtoLink = `mailto:boqianjlu@gmail.com?subject=${encodeURIComponent(formData.subject || 'Contact Form Message from ' + formData.name)}&body=${encodeURIComponent(
        `Name: ${formData.name}\n` +
        `Phone: ${formData.phone || 'Not provided'}\n` +
        `Email: ${formData.email || 'Not provided'}\n\n` +
        `Message:\n${formData.message}\n\n` +
        `---\nSent from PawCart Online Pet Store Contact Form`
      )}`;
      
      // Delay opening email client to let user see the toast message first
      setTimeout(() => {
        window.open(mailtoLink, '_blank');
      }, 1000);
      
      // Store the message locally for reference
      console.log('Contact form submission (not sent via EmailJS):', formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12 px-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">Contact Us</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            Get in touch with our friendly team
          </p>
        </div>

        {/* Mobile: Contact Info Cards in Row */}
        <div className="lg:hidden mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Get In Touch</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Store Address */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-3">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg mb-2">
                    <MapPin className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-xs">Store Address</h3>
                  <p className="text-gray-600 text-[10px] leading-relaxed">
                    11 Yuk Choi Road<br />
                    Hung Hom, Kowloon, Hong Kong
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-3">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg mb-2">
                    <Phone className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-xs">Phone</h3>
                  <a href="tel:+85262146811" className="text-gray-600 text-[10px] hover:text-emerald-600 transition-colors">
                    852-6214-6811
                  </a>
                  <p className="text-gray-500 text-[9px] mt-0.5">Call us for orders and inquiries</p>
                </div>
              </CardContent>
            </Card>

            {/* Twitter */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-3">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg mb-2">
                    <Twitter className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-xs">Twitter</h3>
                  <p className="text-gray-600 text-[10px] mb-2">@PawCartShop</p>
                  <Button
                    className="w-full bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white shadow-md text-[10px] py-2 h-auto min-h-[36px]"
                    onClick={() => window.open('https://x.com/PawCartShop?t=u9x_Kolz8awQv5adUIvBlw&s=05', '_blank')}
                  >
                    <Twitter className="w-3 h-3 mr-1" />
                    Follow Us
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Opening Hours */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-3">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg mb-2">
                    <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-xs">Opening Hours</h3>
                  <div className="text-gray-600 text-[10px] space-y-0.5">
                    <p>Every Day: 10:00 AM - 10:00 PM</p>
                    <p className="text-gray-500 text-[9px]">We're always here for your pets!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Follow Us */}
          <div className="mt-4 px-1">
            <h3 className="font-semibold text-gray-900 mb-2.5 text-sm">Follow Us</h3>
            <div className="flex space-x-2.5 justify-center">
              <a
                href="https://x.com/PawCartShop?t=u9x_Kolz8awQv5adUIvBlw&s=05"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-sky-600 rounded-full flex items-center justify-center text-white hover:bg-sky-700 transition-colors active:scale-95"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="w-11 h-11 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-700 transition-colors active:scale-95"
              >
                <Instagram size={20} />
              </a>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('toggleChat'))}
                className="w-11 h-11 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors active:scale-95"
              >
                <MessageCircle size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: Original Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-7xl mx-auto">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6 px-1">Get In Touch</h2>

            {/* Store Address */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-3.5 sm:p-4 lg:p-6">
                <div className="flex items-start space-x-3 sm:space-x-3.5 lg:space-x-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-1.5 lg:mb-2 text-sm sm:text-base">Store Address</h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed break-words">
                      11 Yuk Choi Road, Hung Hom,<br />
                      Kowloon, Hong Kong
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-3.5 sm:p-4 lg:p-6">
                <div className="flex items-start space-x-3 sm:space-x-3.5 lg:space-x-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-1.5 lg:mb-2 text-sm sm:text-base">Phone</h3>
                    <a href="tel:+85262146811" className="text-gray-600 text-xs sm:text-sm hover:text-emerald-600 transition-colors">
                      +852-6214-6811
                    </a>
                    <p className="text-gray-500 text-[11px] sm:text-xs mt-0.5 sm:mt-1">Call us for orders and inquiries</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Twitter */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-3.5 sm:p-4 lg:p-6">
                <div className="flex items-start space-x-3 sm:space-x-3.5 lg:space-x-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Twitter className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-1.5 lg:mb-2 text-sm sm:text-base">Twitter</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-2.5 lg:mb-3 break-words">@PawCartShop</p>
                    <Button
                      className="w-full bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white shadow-md text-xs sm:text-sm py-2 sm:py-2.5 h-auto min-h-[44px] sm:min-h-0"
                      onClick={() => window.open('https://x.com/PawCartShop?t=u9x_Kolz8awQv5adUIvBlw&s=05', '_blank')}
                    >
                      <Twitter className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Follow Us
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opening Hours */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-3.5 sm:p-4 lg:p-6">
                <div className="flex items-start space-x-3 sm:space-x-3.5 lg:space-x-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-1.5 lg:mb-2 text-sm sm:text-base">Opening Hours</h3>
                    <div className="text-gray-600 text-xs sm:text-sm space-y-0.5 sm:space-y-1">
                      <p>Every Day: 10:00 AM - 10:00 PM</p>
                      <p className="text-gray-500 text-[11px] sm:text-xs">We're always here for your pets!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Follow Us */}
            <div className="px-1">
              <h3 className="font-semibold text-gray-900 mb-2.5 sm:mb-3 lg:mb-4 text-sm sm:text-base">Follow Us</h3>
              <div className="flex space-x-2.5 sm:space-x-3">
                <a
                  href="https://x.com/PawCartShop?t=u9x_Kolz8awQv5adUIvBlw&s=05"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-10 sm:h-10 bg-sky-600 rounded-full flex items-center justify-center text-white hover:bg-sky-700 transition-colors active:scale-95"
                >
                  <Twitter size={20} className="sm:w-5 sm:h-5" />
                </a>
                <a
                  href="#"
                  className="w-11 h-11 sm:w-10 sm:h-10 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-700 transition-colors active:scale-95"
                >
                  <Instagram size={20} className="sm:w-5 sm:h-5" />
                </a>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('toggleChat'))}
                  className="w-11 h-11 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors active:scale-95"
                >
                  <MessageCircle size={20} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader className="p-3.5 sm:p-4 lg:p-6">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 sm:p-4 lg:p-6">
                <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 lg:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full text-sm sm:text-base h-11 sm:h-10 touch-manipulation"
                        placeholder="Enter your full name"
                        required
                        data-testid="input-contact-name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full text-sm sm:text-base h-11 sm:h-10 touch-manipulation"
                        placeholder="01700-000000"
                        required
                        data-testid="input-contact-phone"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Email (Optional)
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full text-sm sm:text-base h-11 sm:h-10 touch-manipulation"
                      placeholder="your.email@example.com"
                      data-testid="input-contact-email"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <Select onValueChange={(value) => handleInputChange('subject', value)} required>
                      <SelectTrigger className="w-full h-11 sm:h-10 text-sm sm:text-base touch-manipulation" data-testid="select-contact-subject">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="order">Order Support</SelectItem>
                        <SelectItem value="product">Product Question</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="wholesale">Wholesale Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="w-full h-32 sm:h-28 lg:h-32 resize-none text-sm sm:text-base touch-manipulation"
                      placeholder="Tell us how we can help you..."
                      required
                      data-testid="textarea-contact-message"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#26732d] hover:bg-[#1e5d26] text-white py-3 sm:py-2.5 lg:py-3 text-sm sm:text-base lg:text-lg font-medium min-h-[48px] sm:min-h-0 touch-manipulation active:scale-[0.98] transition-transform"
                    data-testid="button-send-message"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                  
                  {/* Alternative Contact Information */}
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-amber-800 font-medium mb-2">
                      💡 Prefer direct contact?
                    </p>
                    <div className="space-y-1 text-xs sm:text-sm text-amber-700">
                      <p>📧 Email: <a href="mailto:boqianjlu@gmail.com" className="font-semibold hover:underline">boqianjlu@gmail.com</a></p>
                      <p>📞 Phone: <a href="tel:+85262146811" className="font-semibold hover:underline">852-6214-6811</a></p>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-6 sm:mt-8 lg:mt-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-4 sm:mb-6 lg:mb-8 px-2">Find Our Store</h2>
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-56 sm:h-64 lg:h-96 bg-gray-200 relative">
              {/* Embedded Google Map */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.5234567890!2d114.18258600000001!3d22.304596!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x340400e6a1234567%3A0x1234567890abcdef!2s11%20Yuk%20Choi%20Rd%2C%20Hung%20Hom%2C%20Hong%20Kong!5e0!3m2!1sen!2shk!4v1700000000000!5m2!1sen!2shk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="PawCart Online Pet Store Location - 11 Yuk Choi Road, Hung Hom, Kowloon, Hong Kong"
              />
              
              {/* Directions Button */}
              <Button
                className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-lg z-10 text-xs sm:text-sm h-9 sm:h-auto min-h-[44px] sm:min-h-0 px-3 sm:px-4 touch-manipulation active:scale-95"
                onClick={() => window.open('https://www.google.com/maps/dir//11+Yuk+Choi+Road,+Hung+Hom,+Kowloon,+Hong+Kong/@22.304596,114.182586,17z', '_blank')}
              >
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Directions
              </Button>
            </div>
          </Card>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-3 gap-3 lg:gap-6 mt-4 sm:mt-6 lg:mt-8">
            <Card 
              className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group active:scale-[0.98]"
              onClick={() => window.open('https://www.google.com/maps/dir//11+Yuk+Choi+Road,+Hung+Hom,+Kowloon,+Hong+Kong/@22.304596,114.182586,17z', '_blank')}
            >
              <CardContent className="p-3 lg:p-6 text-center">
                <div className="w-12 h-12 lg:w-20 lg:h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-2 lg:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 lg:w-10 lg:h-10 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 lg:mb-2 text-xs lg:text-lg">Visit Our Store</h3>
                <p className="text-gray-600 text-[10px] lg:text-sm">11 Yuk Choi Road, Hung Hom</p>
                <p className="text-gray-500 text-[9px] lg:text-xs">Kowloon, Hong Kong</p>
              </CardContent>
            </Card>

            <Card 
              className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group active:scale-[0.98]"
              onClick={() => window.location.href = 'tel:+85262146811'}
            >
              <CardContent className="p-3 lg:p-6 text-center">
                <div className="w-12 h-12 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-2 lg:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-6 h-6 lg:w-10 lg:h-10 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 lg:mb-2 text-xs lg:text-lg">Call Us</h3>
                <p className="text-gray-600 text-[10px] lg:text-sm">
                  852-6214-6811
                </p>
                <p className="text-gray-500 text-[9px] lg:text-xs">Daily 10 AM - 10 PM</p>
              </CardContent>
            </Card>

            <Card 
              className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group active:scale-[0.98]"
              onClick={() => window.open('https://x.com/PawCartShop?t=u9x_Kolz8awQv5adUIvBlw&s=05', '_blank')}
            >
              <CardContent className="p-3 lg:p-6 text-center">
                <div className="w-12 h-12 lg:w-20 lg:h-20 bg-gradient-to-br from-sky-400 to-sky-600 rounded-3xl flex items-center justify-center mx-auto mb-2 lg:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Twitter className="w-6 h-6 lg:w-10 lg:h-10 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 lg:mb-2 text-xs lg:text-lg">Follow Us</h3>
                <p className="text-gray-600 text-[10px] lg:text-sm">Twitter</p>
                <p className="text-gray-500 text-[9px] lg:text-xs">@PawCartShop</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
