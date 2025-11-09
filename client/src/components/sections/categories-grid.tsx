import {
  Cat,
  Dog,
  Heart,
  Gift,
  ShoppingBag,
  Pill,
  Shield,
  Glasses,
  Shirt,
} from "lucide-react";
import { Link } from "wouter";

export default function CategoriesGrid() {
  const categories = [
    {
      id: "adult-food",
      name: "Adult Food",
      icon: Cat,
      image:
        "https://media.mewmewshopbd.com/uploads/media-manager/2025/05/adult-food-2-1747499026.png",
      count: "Premium Quality",
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "kitten-food",
      name: "Kitten Food",
      icon: Cat,
      image:
        "https://media.mewmewshopbd.com/uploads/media-manager/2025/05/kitten-food-2-1747508016.png",
      count: "Growing Nutrition",
      color: "bg-pink-100 text-pink-600",
    },
    {
      id: "collar",
      name: "Collar",
      icon: Shirt,
      image:
        "https://media.mewmewshopbd.com/uploads/media-manager/2025/05/collar-1747508281.png",
      count: "Style & Safety",
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "clumping-cat-litter",
      name: "Clumping Cat Litter",
      icon: Gift,
      image: "https://www.petwarehouse.ph/23275/simple-pets-baby-powder-clumping-cat-litter.jpg",
      count: "Easy Clean",
      color: "bg-gray-100 text-gray-600",
    },
    {
      id: "cat-litter-accessories",
      name: "Cat Litter Accessories",
      icon: Heart,
      image:
        "https://media.mewmewshopbd.com/uploads/media-manager/2025/05/cat-litter-accessaries-1747508179.png",
      count: "Complete Care",
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      id: "harness",
      name: "Harness",
      icon: Shield,
      image:
        "https://media.mewmewshopbd.com/uploads/media-manager/2025/05/harness-2-1747508347.png",
      count: "Secure Walking",
      color: "bg-red-100 text-red-600",
    },
    {
      id: "cat-tick-flea-control",
      name: "Cat Tick & Flea Control",
      icon: Pill,
      image:
        "https://th.bing.com/th/id/OIP.xfYYBbKuW0RiyMbqu325RQHaHa?w=208&h=208&c=7&r=0&o=7&dpr=1.3&pid=1.7",
      count: "Health Protection",
      color: "bg-green-100 text-green-600",
    },
    {
      id: "deworming-tablet",
      name: "Deworming Tablet",
      icon: Pill,
      image: "https://tse4.mm.bing.net/th/id/OIP.jDMy78NPL2PmX_c16yk7JAHaHa?rs=1&pid=ImgDetMain",
      count: "Wellness Care",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      id: "cat-pouches",
      name: "Cat Pouches",
      icon: Gift,
      image:
        "https://media.mewmewshopbd.com/uploads/media-manager/2025/05/pouches-1-1747508038.png",
      count: "Wet Food",
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: "sunglass",
      name: "Sunglass",
      icon: Glasses,
      image:
        "https://media.mewmewshopbd.com/uploads/media-manager/2025/05/sunglass-1747508365.png",
      count: "Pet Fashion",
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white via-gray-50/30 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-[#26732d] to-emerald-600 rounded-lg shadow-lg">
              <ShoppingBag className="text-white w-5 h-5 md:w-7 md:h-7" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[#26732d] to-emerald-600 bg-clip-text text-transparent">
              SHOP BY CATEGORY
            </h2>
          </div>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Discover everything your pet needs in one place
          </p>
        </div>

        {/* Categories Grid */}
        {/* Mobile/Tablet view: Show first 9 categories in 3 columns (3 rows × 3 columns) */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:hidden px-2 sm:px-4">
          {categories.slice(0, 9).map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.id}
                href={`/products?subcategory=${category.id}`}
                className="group cursor-pointer animate-fade-in block"
                style={
                  { animationDelay: `${index * 0.05}s` } as React.CSSProperties
                }
                data-testid={`link-category-${category.id}`}
              >
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden h-40 sm:h-44 flex flex-col transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4 flex-1 flex items-center justify-center">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 max-h-16 sm:max-h-20"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#26732d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-2 sm:p-3 text-center bg-gradient-to-b from-white to-gray-50/50">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-800 leading-tight line-clamp-2">
                      {category.name}
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5 hidden sm:block">{category.count}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Desktop/Laptop view: Show all 10 categories */}
        <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-5 lg:gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.id}
                href={`/products?subcategory=${category.id}`}
                className="group cursor-pointer animate-fade-in block"
                style={
                  { animationDelay: `${index * 0.05}s` } as React.CSSProperties
                }
                data-testid={`link-category-${category.id}`}
              >
                <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white p-6 h-48 lg:h-52 flex-shrink-0">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#26732d]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Decorative element */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                        <IconComponent className={`w-4 h-4 ${category.color.split(' ')[1]}`} />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 text-center flex-grow flex flex-col justify-center min-h-[90px] bg-gradient-to-b from-white to-gray-50/50">
                    <h3 className="text-sm lg:text-base font-bold text-gray-800 mb-2 leading-tight group-hover:text-[#26732d] transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-600 font-medium">
                      {category.count}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
