import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import NavigationSidebar from '@/components/layout/sidebar';
import ProductCard from '@/components/product/product-card';
import AnalyticsBar from '@/components/product/analytics-bar';
import ModernFilter, { type FilterOptions } from '@/components/product/modern-filter';
import { useProducts, type Product } from '@/hooks/use-products';
import { Card } from '@/components/ui/card';

export default function ClothingBedsCarrierPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [1, 20000],
    sortBy: 'relevance'
  });

  const { loading, error, getProductsByCategory } = useProducts()

  // Get dynamic products from API
  const allProducts = getProductsByCategory('clothing-beds-carrier');

  // Filter and sort products based on search, price range, and sort option
  const filteredProducts = allProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (product.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'latest':
          return 0; // No createdAt available
        case 'a-z':
          return a.name.localeCompare(b.name);
        case 'z-a':
          return b.name.localeCompare(a.name);
        case 'price-high-low':
          return b.price - a.price;
        case 'price-low-high':
          return a.price - b.price;
        default:
          return 0;
      }
    });

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading clothing, beds & carrier products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading products: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NavigationSidebar />

      {/* Hero Section */}
      <section className="pt-6 pb-6 px-4 md:pt-10 md:pb-10 md:px-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-4 text-white">
            Clothing, Beds & Carrier
          </h1>
          <p className="text-sm md:text-lg mb-4 md:mb-6 text-white">
            Comfort and style for your beloved pets
          </p>

          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search clothing, beds & carrier..."
              className="h-10 sm:h-11 rounded-full pl-11 pr-4 text-sm bg-white text-gray-900 shadow-md border-0 focus:ring-2 focus:ring-purple-400 placeholder:text-gray-500"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              data-testid="input-search-clothing-beds-carrier"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-4 px-4 md:py-8 md:px-8">
        <div className="max-w-7xl mx-auto lg:flex lg:gap-6">
          {/* Modern Filter Sidebar */}
          <aside className="lg:w-1/4 mb-4 md:mb-8 lg:mb-0">
            <ModernFilter
              onFilterChange={handleFilterChange}
              maxPrice={20000}
            />
          </aside>

          {/* Main Content Area */}
          <main className="lg:w-3/4 space-y-4">
            {/* Analytics Bar */}
            <AnalyticsBar categoryId="clothing-beds-carrier" className="" />

            <div className="flex justify-between items-center">
              <h2 className="text-lg md:text-2xl font-bold text-black">
                Clothing, Beds & Carrier
              </h2>
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                {filteredProducts.length} products
              </div>
            </div>

            {/* No Products Message */}
            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4 text-gray-900 border-gray-400 bg-white hover:bg-gray-100 hover:border-gray-500 hover:text-black shadow-sm"
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ priceRange: [1, 20000], sortBy: 'relevance' });
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {!loading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </section>

      <Footer />
    </div>
  );
}