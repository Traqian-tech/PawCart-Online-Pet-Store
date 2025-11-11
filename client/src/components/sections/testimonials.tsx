import { Star, MessageCircle } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Rahman',
      role: 'Cat Parent, Hong Kong',
      image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
      text: 'PawCart Online Pet Store has the best quality pet food in Hong Kong! My cat Luna loves their premium kibble and the delivery is always on time. Highly recommended!',
      rating: 5
    },
    {
      id: 2,
      name: 'Ahmed Hassan',
      role: 'Dog Parent, Hong Kong',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
      text: 'Amazing service and products! I\'ve been buying dog food and toys from here for 2 years. The staff is knowledgeable and always helps me choose the right products for Max.',
      rating: 5
    },
    {
      id: 3,
      name: 'Maria Sultana',
      role: 'Professional Groomer, Dhaka',
      image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
      text: 'As a professional pet groomer, I only recommend the best. PawCart has excellent grooming supplies and their bulk pricing helps my business. Great quality!',
      rating: 5
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star 
        key={index} 
        size={16} 
        className={index < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'} 
      />
    ));
  };

  return (
    <section className="relative pt-12 md:pt-16 pb-10 md:pb-16 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-20 -left-16 w-56 h-56 md:w-80 md:h-80 rounded-full bg-[#ffde59]/30 blur-3xl" />
        <div className="absolute -bottom-10 -right-16 w-56 h-56 md:w-80 md:h-80 rounded-full bg-[#26732d]/10 blur-3xl" />
      </div>

      <div className="responsive-container relative">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3">
            <MessageCircle size={20} className="text-[#26732d] md:w-8 md:h-8" />
            <h2 className="text-xl md:text-4xl font-extrabold tracking-tight text-[#1f2d1f]">
              WHAT OUR CUSTOMERS SAY
            </h2>
          </div>
          <p className="text-xs md:text-base text-gray-600">
            Real stories from happy pet parents across Asia
          </p>
          <div className="mt-4 flex justify-center">
            <span className="inline-block h-1 w-20 md:w-28 rounded-full bg-gradient-to-r from-[#ffde59] to-[#26732d]" />
          </div>
        </div>
        {/* Mobile/Tablet Scrollable View */}
        <div className="lg:hidden overflow-x-auto">
          <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className="flex-shrink-0 w-72 sm:w-80 flex flex-col items-center text-center bg-white rounded-2xl p-5 sm:p-6 shadow-md ring-1 ring-gray-100 hover:shadow-xl transition-shadow duration-300 relative animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Quote Icon */}
                <div className="absolute -top-3 -left-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffde59] text-[#1f2d1f] font-extrabold shadow-sm">
                    “
                  </span>
                </div>
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4 object-cover object-center ring-4 ring-[#ffde59]/70 hover:scale-110 transition-transform duration-300" 
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex justify-center mb-2 sm:mb-3">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-gray-700 mb-3 sm:mb-4 italic text-xs sm:text-sm leading-relaxed line-clamp-4">
                  “{testimonial.text}”
                </p>
                <div className="font-bold text-[#1f2d1f] text-sm sm:text-lg">{testimonial.name}</div>
                <div className="text-[10px] sm:text-xs text-gray-500">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className="group relative flex flex-col items-center text-center bg-white rounded-2xl p-8 shadow-md ring-1 ring-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.06}s`, transform: `translateY(${index % 2 === 0 ? 0 : 4}px)` }}
            >
              {/* Accent corner */}
              <div className="absolute -top-2 -right-2 h-10 w-10 rounded-xl bg-[#ffde59] blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
              <div className="absolute top-3 right-3 text-3xl text-[#ffde59] select-none">”</div>
              <img 
                src={testimonial.image} 
                alt={testimonial.name} 
                className="w-16 h-16 rounded-full mb-4 object-cover object-center ring-4 ring-[#ffde59]/70 group-hover:ring-[#ffde59] transition-all duration-300" 
                loading="lazy"
                decoding="async"
              />
              <div className="flex justify-center mb-3">
                {renderStars(testimonial.rating)}
              </div>
              <p className="text-gray-700 mb-5 italic text-base leading-relaxed max-w-[46ch]">
                “{testimonial.text}”
              </p>
              <div className="font-extrabold text-[#1f2d1f] text-lg">{testimonial.name}</div>
              <div className="text-sm text-gray-500">{testimonial.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}