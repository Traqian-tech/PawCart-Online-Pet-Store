import { Facebook, Instagram, Youtube, MessageCircle, MapPin, Phone, Mail, Clock } from 'lucide-react';
import MobileFooter from './mobile-footer';
const logoPath = '/logo.png';

export default function Footer() {
  return (
    <>
      {/* Mobile Footer */}
      <MobileFooter />
      
      {/* Desktop Footer */}
      <footer className="hidden md:block meow-green text-white py-12 relative z-40 w-full overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6">
          {/* Company Info */}
          <div className="min-w-0">
            <div className="flex items-center mb-4">
              <img src={logoPath} alt="Meow Meow Pet Shop Logo" className="h-12 w-12 mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-meow-yellow">Meow Meow</h3>
                <p className="text-sm">Pet Shop</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">Your trusted partner for premium pet food and accessories in Savar, Bangladesh. We care for your pets like family.</p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/meow.meow.pet.shop1" target="_blank" rel="noopener noreferrer" className="text-meow-yellow hover:text-yellow-300 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-meow-yellow hover:text-yellow-300 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-meow-yellow hover:text-yellow-300 transition-colors">
                <Youtube size={20} />
              </a>
              <a href="https://wa.me/8801838511583" className="text-meow-yellow hover:text-yellow-300 transition-colors">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="min-w-0 lg:pl-4">
            <h4 className="font-bold text-meow-yellow mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-meow-yellow transition-colors text-sm">Home</a></li>
              <li><a href="#" className="text-gray-300 hover:text-meow-yellow transition-colors text-sm">Cat Food</a></li>
              <li><a href="#" className="text-gray-300 hover:text-meow-yellow transition-colors text-sm">Dog Food</a></li>
              <li><a href="#" className="text-gray-300 hover:text-meow-yellow transition-colors text-sm">Toys & Accessories</a></li>
              <li><a href="#" className="text-gray-300 hover:text-meow-yellow transition-colors text-sm">Grooming</a></li>
              <li><a href="#" className="text-gray-300 hover:text-meow-yellow transition-colors text-sm">Health Care</a></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="min-w-0 lg:pl-2">
            <h4 className="font-bold text-meow-yellow mb-4">Policies</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-meow-yellow transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-meow-yellow transition-colors text-sm">Return Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-meow-yellow transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-meow-yellow transition-colors text-sm">Shipping Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-meow-yellow transition-colors text-sm">Quality Guarantee</a></li>
              <li><a href="#" className="text-gray-300 hover:text-meow-yellow transition-colors text-sm">Helpline</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="min-w-0">
            <h4 className="font-bold text-meow-yellow mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin size={16} className="mr-2 text-meow-yellow flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm break-words">Savar, Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center">
                <Phone size={16} className="mr-2 text-meow-yellow flex-shrink-0" />
                <span className="text-gray-300 text-sm">01405-045023</span>
              </div>
              <div className="flex items-center">
                <Mail size={16} className="mr-2 text-meow-yellow flex-shrink-0" />
                <a 
                  href="mailto:meowmeowpetshop1@gmail.com" 
                  className="text-gray-300 hover:text-meow-yellow transition-colors text-sm"
                >
                  meowmeowpetshop1@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-2 text-meow-yellow flex-shrink-0" />
                <span className="text-gray-300 text-sm">Daily: 9 AM - 9 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 pt-8">
          <div className="text-center text-gray-400 text-sm pt-4">
            <p>&copy; 2025 Meow Meow Pet Shop. All rights reserved.</p>
            <p className="mt-1 mb-8">Powered By: <a href="https://znforge.com" target="_blank" rel="noopener noreferrer" className="text-meow-yellow hover:text-yellow-300 transition-colors">ZnForge</a></p>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}