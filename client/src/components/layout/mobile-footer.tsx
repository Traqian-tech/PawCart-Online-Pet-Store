
import { Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'wouter';

const logoPath = '/logo.png';

export default function MobileFooter() {
  return (
    <footer className="md:hidden meow-green text-white py-6 mt-8 pb-4 relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--meow-yellow)] via-[var(--meow-orange)] to-[var(--meow-yellow)]"></div>
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-5 left-5 w-20 h-20 bg-[var(--meow-yellow)] rounded-full blur-2xl"></div>
        <div className="absolute bottom-5 right-5 w-24 h-24 bg-[var(--meow-orange)] rounded-full blur-2xl"></div>
      </div>
      
      <div className="container mx-auto px-5 relative z-10">
        {/* Logo and Company Info */}
        <div className="text-left mb-4">
          <div className="flex items-center mb-2.5 group">
            <div className="relative">
              <img src={logoPath} alt="PawCart Pet Shop Logo" className="h-9 w-9 mr-2.5 rounded-full ring-2 ring-[var(--meow-yellow)]/40 group-hover:ring-[var(--meow-yellow)] transition-all duration-300 shadow-md" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--meow-yellow)] rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[var(--meow-yellow)] tracking-tight">PawCart</h3>
              <p className="text-xs text-[var(--meow-yellow-light)] font-semibold">Pet Shop</p>
            </div>
          </div>
          <p className="text-xs text-gray-200/90 leading-relaxed">
            Your trusted partner for premium pet food and accessories in Hong Kong.
          </p>
        </div>

        {/* Contact Info - Compact */}
        <div className="text-left space-y-2 mb-4 bg-white/5 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center text-xs text-gray-200/90">
            <Phone size={13} className="mr-2 text-[var(--meow-yellow)]" />
            <a href="tel:85262146811" className="hover:text-[var(--meow-yellow)] transition-colors">852-6214-6811</a>
          </div>
          <div className="flex items-center text-xs text-gray-200/90">
            <Mail size={13} className="mr-2 text-[var(--meow-yellow)]" />
            <a href="mailto:boqianjlu@gmail.com" className="hover:text-[var(--meow-yellow)] transition-colors break-all">boqianjlu@gmail.com</a>
          </div>
        </div>

        {/* Essential Links - 2 columns */}
        <div className="grid grid-cols-2 gap-5 mb-4 text-xs">
          <div>
            <h4 className="font-bold text-[var(--meow-yellow)] mb-2.5 text-sm">Quick Links</h4>
            <ul className="space-y-1.5">
              <li><Link href="/contact" className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-colors">→ Contact Us</Link></li>
              <li><Link href="/about" className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-colors">→ About Us</Link></li>
              <li><Link href="/track-order" className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-colors">→ Track Order</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[var(--meow-yellow)] mb-2.5 text-sm">Policies</h4>
            <ul className="space-y-1.5">
              <li><Link href="/privacy" className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-colors">→ Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-colors">→ Terms</Link></li>
              <li><Link href="/return-policy" className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-colors">→ Return Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center border-t border-white/10 pt-3 space-y-2">
          {/* Made with love */}
          <div className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm mb-2">
            <span className="text-base">🐾</span>
            <span className="text-xs font-medium text-[var(--meow-yellow)]">Made with love for pets</span>
            <span className="text-base">🐾</span>
          </div>
          
          <p className="text-xs text-gray-300/80">
            © 2025 PawCart Pet Shop. All rights reserved.
          </p>
          <p className="text-xs text-gray-400/80 mb-8">
            Powered By: <a href="https://znforge.com" target="_blank" rel="noopener noreferrer" className="text-[var(--meow-yellow)] hover:text-[var(--meow-yellow-light)] transition-colors font-semibold">ZnForge</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
