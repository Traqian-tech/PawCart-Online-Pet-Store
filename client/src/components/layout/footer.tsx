import { Facebook, Instagram, Youtube, MessageCircle, MapPin, Phone, Mail, Clock, Twitter } from 'lucide-react';
import { Link } from 'wouter';
import MobileFooter from './mobile-footer';
const logoPath = '/logo.png';

export default function Footer() {
  return (
    <>
      {/* Mobile Footer */}
      <MobileFooter />
      
      {/* Desktop Footer - Enhanced */}
      <footer className="hidden md:block gradient-brand text-white py-12 relative z-40 w-full overflow-hidden">
        {/* Decorative top border with gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--meow-yellow)] via-[var(--meow-orange)] to-[var(--meow-yellow)] shadow-lg"></div>
        
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[var(--meow-yellow)] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-[var(--meow-orange)] rounded-full blur-3xl"></div>
        </div>
        
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Company Info - Enhanced */}
          <div className="min-w-0 lg:col-span-1">
            <div className="flex items-center mb-5 group cursor-pointer">
              <div className="relative">
                <img src={logoPath} alt="PawCart Pet Shop Logo" className="h-12 w-12 mr-3 flex-shrink-0 rounded-full ring-2 ring-[var(--meow-yellow)]/40 group-hover:ring-[var(--meow-yellow)] transition-all duration-300 shadow-lg" />
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[var(--meow-yellow)] rounded-full animate-pulse shadow-lg"></div>
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-extrabold text-[var(--meow-yellow)] tracking-tight">PawCart</h3>
                <p className="text-xs text-[var(--meow-yellow-light)] font-semibold">Pet Shop</p>
              </div>
            </div>
            <p className="text-gray-200/90 mb-6 text-sm leading-relaxed">Your trusted partner for premium pet food and accessories in Hong Kong. We care for your pets like family.</p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-2.5">
              <a href="https://x.com/PawCartShop?t=u9x_Kolz8awQv5adUIvBlw&s=05" target="_blank" rel="noopener noreferrer" 
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm text-[var(--meow-yellow)] hover:bg-[var(--meow-yellow)] hover:text-[var(--meow-green-dark)] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[var(--meow-yellow)]/30">
                <Twitter size={16} />
              </a>
              <a href="#" 
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm text-[var(--meow-yellow)] hover:bg-[var(--meow-yellow)] hover:text-[var(--meow-green-dark)] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[var(--meow-yellow)]/30">
                <Instagram size={16} />
              </a>
              <a href="#" 
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm text-[var(--meow-yellow)] hover:bg-[var(--meow-yellow)] hover:text-[var(--meow-green-dark)] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[var(--meow-yellow)]/30">
                <Youtube size={16} />
              </a>
              <a href="https://wa.me/85262146811" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm text-[var(--meow-yellow)] hover:bg-[var(--meow-yellow)] hover:text-[var(--meow-green-dark)] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[var(--meow-yellow)]/30">
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links - Enhanced */}
          <div className="min-w-0">
            <h4 className="font-bold text-[var(--meow-yellow)] mb-4 text-base flex items-center">
              <span className="mr-2 text-lg">🔗</span>
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/"><a className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-all duration-200 text-sm hover:translate-x-1 inline-block hover:pl-1">→ Home</a></Link></li>
              <li><Link href="/privilege-club"><a className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-all duration-200 text-sm hover:translate-x-1 inline-block hover:pl-1">→ Privilege Club</a></Link></li>
              <li><Link href="/cat-food"><a className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-all duration-200 text-sm hover:translate-x-1 inline-block hover:pl-1">→ Cat Food</a></Link></li>
              <li><Link href="/dog-food"><a className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-all duration-200 text-sm hover:translate-x-1 inline-block hover:pl-1">→ Dog Food</a></Link></li>
              <li><Link href="/cat-toys"><a className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-all duration-200 text-sm hover:translate-x-1 inline-block hover:pl-1">→ Cat Toys</a></Link></li>
              <li><Link href="/cat-litter"><a className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-all duration-200 text-sm hover:translate-x-1 inline-block hover:pl-1">→ Cat Litter</a></Link></li>
              <li><Link href="/bird"><a className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-all duration-200 text-sm hover:translate-x-1 inline-block hover:pl-1">→ Bird</a></Link></li>
              <li><Link href="/rabbit"><a className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-all duration-200 text-sm hover:translate-x-1 inline-block hover:pl-1">→ Rabbit</a></Link></li>
              <li><Link href="/brands/reflex"><a className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-all duration-200 text-sm hover:translate-x-1 inline-block hover:pl-1">→ Reflex</a></Link></li>
              <li><Link href="/blog"><a className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-all duration-200 text-sm hover:translate-x-1 inline-block hover:pl-1">→ Blog</a></Link></li>
            </ul>
          </div>

          {/* Policies - Enhanced */}
          <div className="min-w-0">
            <h4 className="font-bold text-[var(--meow-yellow)] mb-4 text-base flex items-center">
              <span className="mr-2 text-lg">📋</span>
              Policies
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/privacy-policy"><a className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-all duration-200 text-sm hover:translate-x-1 inline-block hover:pl-1">→ Privacy Policy</a></Link></li>
              <li><Link href="/return-policy"><a className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-all duration-200 text-sm hover:translate-x-1 inline-block hover:pl-1">→ Return Policy</a></Link></li>
              <li><Link href="/terms-of-service"><a className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-all duration-200 text-sm hover:translate-x-1 inline-block hover:pl-1">→ Terms of Service</a></Link></li>
              <li><Link href="/shipping-policy"><a className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-all duration-200 text-sm hover:translate-x-1 inline-block hover:pl-1">→ Shipping Policy</a></Link></li>
              <li><Link href="/quality-guarantee"><a className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-all duration-200 text-sm hover:translate-x-1 inline-block hover:pl-1">→ Quality Guarantee</a></Link></li>
              <li><Link href="/helpline"><a className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-all duration-200 text-sm hover:translate-x-1 inline-block hover:pl-1">→ Helpline</a></Link></li>
            </ul>
          </div>

          {/* Contact Info - Enhanced */}
          <div className="min-w-0">
            <h4 className="font-bold text-[var(--meow-yellow)] mb-4 text-base flex items-center">
              <span className="mr-2 text-lg">📞</span>
              Contact Info
            </h4>
            <div className="space-y-3.5">
              <div className="flex items-start group">
                <MapPin size={16} className="mr-2.5 text-[var(--meow-yellow)] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-gray-200/90 text-sm break-words leading-relaxed">11 Yuk Choi Road, Hung Hom, Kowloon, Hong Kong</span>
              </div>
              <div className="flex items-center group">
                <Phone size={16} className="mr-2.5 text-[var(--meow-yellow)] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="tel:85262146811" className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-colors text-sm">852-6214-6811</a>
              </div>
              <div className="flex items-center group">
                <Mail size={16} className="mr-2.5 text-[var(--meow-yellow)] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a 
                  href="mailto:boqianjlu@gmail.com" 
                  className="text-gray-200/90 hover:text-[var(--meow-yellow)] transition-colors text-sm break-all"
                >
                  boqianjlu@gmail.com
                </a>
              </div>
              <div className="flex items-center group">
                <Clock size={16} className="mr-2.5 text-[var(--meow-yellow)] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-gray-200/90 text-sm">Daily: 9 AM - 9 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom - Enhanced */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <div className="text-center space-y-3">
            {/* Made with love */}
            <div className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm">
              <span className="text-xl">🐾</span>
              <span className="text-sm font-medium text-[var(--meow-yellow)]">Made with love for pets</span>
              <span className="text-xl">🐾</span>
            </div>
            
            {/* Copyright */}
            <p className="text-gray-300/80 text-sm">&copy; 2025 PawCart Pet Shop. All rights reserved.</p>
            
            {/* Powered by */}
            <p className="text-gray-400/80 text-xs">
              Powered By: 
              <a href="https://znforge.com" target="_blank" rel="noopener noreferrer" 
                className="text-[var(--meow-yellow)] hover:text-[var(--meow-yellow-light)] transition-colors ml-1 font-semibold hover:underline">
                ZnForge
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}