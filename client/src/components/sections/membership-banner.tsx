import { Button } from '@/components/ui/button';
import { Percent, Truck, Star } from 'lucide-react';
import { Link, useLocation } from 'wouter';
const logoPath = '/logo.png';

export default function MembershipBanner() {
  const [, setLocation] = useLocation();
  
  const handleJoinNow = () => {
    // Store Diamond Paw lifetime membership order for checkout
    const membershipOrder = {
      tier: 'Diamond Paw',
      price: 500,
      duration: 0, // Lifetime
    };
    sessionStorage.setItem('pendingMembership', JSON.stringify(membershipOrder));
    setLocation('/membership-checkout');
  };
  
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-1 shadow-2xl">
      {/* Decorative background patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>
      
      <div className="relative bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center justify-center gap-3 mb-3 animate-fade-in">
              <div className="p-2 bg-gradient-to-br from-[#26732d] to-emerald-600 rounded-2xl shadow-lg">
                <img src={logoPath} alt="PawCart Privilege Club" className="h-10 w-10 md:h-12 md:w-12" />
              </div>
              <h3 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-[#26732d] via-emerald-600 to-[#26732d] bg-clip-text text-transparent">
                PawCart Privilege Club
              </h3>
            </div>
            <p className="text-base md:text-lg text-gray-600 font-medium">
              🎉 Exclusive Membership Program - Join Today!
            </p>
          </div>
          
          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-10">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in border border-yellow-200">
              <div className="bg-gradient-to-br from-[#ffde59] to-amber-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                <Percent size={28} className="text-[#26732d]" />
              </div>
              <h4 className="font-bold text-[#26732d] text-lg md:text-xl mb-2">15% Discount</h4>
              <p className="text-sm text-gray-600">On all purchases, every time you shop</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in border border-green-200" style={{ animationDelay: '0.1s' }}>
              <div className="bg-gradient-to-br from-[#26732d] to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                <Truck size={28} className="text-white" />
              </div>
              <h4 className="font-bold text-[#26732d] text-lg md:text-xl mb-2">Free Delivery</h4>
              <p className="text-sm text-gray-600">On orders above $100, delivered to your door</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in border border-purple-200" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                <Star size={28} className="text-white" />
              </div>
              <h4 className="font-bold text-[#26732d] text-lg md:text-xl mb-2">Priority Support</h4>
              <p className="text-sm text-gray-600">24/7 dedicated support for all your needs</p>
            </div>
          </div>
          
          {/* Price and Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border-2 border-dashed border-[#26732d]/30">
            {/* Price */}
            <div className="bg-gradient-to-br from-[#26732d] to-emerald-600 text-white px-8 py-5 rounded-2xl shadow-xl animate-scale-up text-center hover:scale-105 transition-transform">
              <div className="text-4xl md:text-5xl font-bold mb-1">$500</div>
              <div className="text-sm md:text-base font-medium opacity-90">Lifetime Membership</div>
            </div>
            
            {/* Button */}
            <Button 
              variant="meow" 
              size="lg" 
              className="px-10 py-6 rounded-2xl text-base md:text-lg font-bold btn-bounce whitespace-nowrap shadow-xl hover:shadow-2xl"
              onClick={handleJoinNow}
            >
              Join Club Now →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
