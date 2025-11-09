import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import NavigationSidebar from "@/components/layout/sidebar";
import HeroBanner from "@/components/hero-banner";
import CategoriesGrid from "@/components/sections/categories-grid";
import FlashSale from "@/components/sections/flash-sale";
import BestsellersCats from "@/components/sections/bestsellers-cats";
import BestsellersDogs from "@/components/sections/bestsellers-dogs";
import RepackFood from "@/components/sections/repack-food";
import FeaturedBrands from "@/components/sections/featured-brands";
import NewlyLaunched from "@/components/sections/newly-launched";
import MembershipBanner from "@/components/sections/membership-banner";
import BlogPreview from "@/components/sections/blog-preview";
import Testimonials from "@/components/sections/testimonials";
import PopupPoster from "@/components/popup-poster";
import { useSidebar } from "@/contexts/sidebar-context";
import RecommendationsTabs from "@/components/recommendations/recommendations-tabs";

export default function Home() {
  const { isVisible: sidebarVisible } = useSidebar();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Fixed Sidebar */}
      <NavigationSidebar />

      {/* Main content - adjusted for desktop sidebar and mobile bottom nav */}
      <main className={`transition-all duration-300 ${sidebarVisible ? 'md:ml-80' : 'md:ml-0'} overflow-x-hidden pb-20 md:pb-0`}>
        <HeroBanner />
        
        {/* Main Content Container with improved spacing */}
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-8">
          {/* Categories - Top Priority */}
          <div className="py-8 md:py-12">
            <CategoriesGrid />
          </div>

          {/* Flash Sale - High Priority */}
          <div className="py-6 md:py-10">
            <FlashSale />
          </div>

          {/* Product Sections - Grouped with consistent spacing */}
          <div className="space-y-10 md:space-y-14 py-6">
            <BestsellersCats />
            <BestsellersDogs />
            <RepackFood />
          </div>

          {/* Brands Section - Visual Break */}
          <div className="py-8 md:py-12">
            <FeaturedBrands />
          </div>

          {/* New Products */}
          <div className="py-6 md:py-10">
            <NewlyLaunched />
          </div>

          {/* Smart Recommendations with Tabs */}
          <div className="py-6 md:py-10">
            <RecommendationsTabs
              limit={12}
              defaultTab="smart"
            />
          </div>

          {/* Membership - Call to Action */}
          <div className="py-8 md:py-12">
            <MembershipBanner />
          </div>

          {/* Content Sections - Bottom Priority */}
          <div className="space-y-10 md:space-y-14 py-6 md:py-10">
            <BlogPreview />
            <Testimonials />
          </div>
        </div>
      </main>

      {/* Footer - Full width, overlays sidebar */}
      <div className="relative z-30 w-full">
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      {/* This component is now globally available in the App component */}

      {/* Popup Poster */}
      <PopupPoster />
    </div>
  );
}