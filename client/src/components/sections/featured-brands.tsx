import { Link } from "wouter";
import { Award } from "lucide-react";

export default function FeaturedBrands() {
  const brands = [
    { name: "NEKKO", slug: "nekko" },
    { name: "PURINA", slug: "purina" },
    { name: "ONE", slug: "one" },
    { name: "Reflex", slug: "reflex" },
    { name: "Reflex Plus", slug: "reflex-plus" },
    { name: "ROYAL CANIN", slug: "royal-canin" },
    { name: "Sheba", slug: "sheba" },
  ];

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 md:p-10 shadow-lg border border-blue-100">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-200/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="mb-8 md:mb-10 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Award className="text-white w-6 h-6 md:w-7 md:h-7" />
            </div>
            <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              FEATURED BRANDS
            </h3>
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            Trusted brands for your beloved pets
          </p>
        </div>
        
        <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
          <div className="flex justify-center items-center gap-4 md:gap-6 lg:gap-8 min-w-max">
            {brands.map((brand, index) => (
              <Link
                key={index}
                href={
                  brand.slug.startsWith("/")
                    ? brand.slug
                    : `/brands/${brand.slug}`
                }
                className="flex-shrink-0 cursor-pointer transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-28 h-24 sm:w-32 sm:h-26 md:w-36 md:h-28 lg:w-40 lg:h-32 bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border-2 border-gray-200 group-hover:border-[#26732d] transition-all flex items-center justify-center group-hover:-translate-y-2">
                  <div className="text-center p-4">
                    <p className="text-gray-800 group-hover:text-[#26732d] font-bold text-sm sm:text-base md:text-lg lg:text-xl leading-tight transition-colors">
                      {brand.name}
                    </p>
                  </div>
                  
                  {/* Decorative corner */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-[#26732d] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
