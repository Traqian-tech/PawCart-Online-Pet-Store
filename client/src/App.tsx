import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/contexts/cart-context";
import { LanguageProvider } from "@/contexts/language-context";
import { CurrencyProvider } from "@/contexts/currency-context";
import { WalletProvider } from "@/contexts/wallet-context";
import { ThemeProvider } from "@/hooks/use-theme";
import ScrollToTop from "@/components/scroll-to-top";
import NotFoundPage from "@/pages/not-found";
import Home from "@/pages/home";
import ProductsPage from "@/pages/products";
import PrivilegeClubPage from "@/pages/privilege-club";
import MembershipCheckoutPage from "@/pages/membership-checkout";

import CatFoodPage from "@/pages/cat-food";
import DogFoodPage from "@/pages/dog-food";
import CatToysPage from "@/pages/cat-toys";
import CatLitterPage from "@/pages/cat-litter";
import CatCarePage from "@/pages/cat-care";
import ClothingBedsCarrierPage from "@/pages/clothing-beds-carrier";
import CatAccessoriesPage from "@/pages/cat-accessories";
import DogAccessoriesPage from "@/pages/dog-accessories";
import RabbitPage from "@/pages/rabbit";
import BirdPage from "@/pages/bird";
import ReflexPage from "@/pages/reflex";
import BlogPage from "@/pages/blog";
import BlogDetailPage from "@/pages/blog-detail";
import BulkDiscountsPage from "@/pages/bulk-discounts";
import NekkoPage from "@/pages/brands/nekko";
import PurinaPage from "@/pages/brands/purina";
import OnePage from "@/pages/brands/one";
import ReflexPlusPage from "@/pages/brands/reflex-plus";
import RoyalCaninPage from "@/pages/brands/royal-canin";
import ShebaPage from "@/pages/brands/sheba";
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";

import AdminPage from "@/pages/admin";
import DashboardPage from "@/pages/dashboard";
import CartPage from "@/pages/cart";
import CheckoutPage from './pages/checkout';
import PaymentSuccessPage from './pages/payment-success';
import InvoicePage from './pages/invoice';
import TrackOrderPage from "@/pages/track-order";
import MessengerPage from './pages/messenger';
import ContactPage from "@/pages/contact";
import FlashSaleProductsPage from "@/pages/flash-sale-products";
import BulkProductsPage from "@/pages/bulk-products";
import NewlyLaunchedPage from "@/pages/newly-launched";
import RepackProductsPage from "@/pages/repack-products";
import CatBestSellerPage from "@/pages/cat-best-seller";
import DogBestSellerPage from "@/pages/dog-best-seller";
import ProductDetailPage from "@/pages/product-detail";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import ReturnPolicyPage from "@/pages/return-policy";
import TermsOfServicePage from "@/pages/terms-of-service";
import ShippingPolicyPage from "@/pages/shipping-policy";
import QualityGuaranteePage from "@/pages/quality-guarantee";
import HelplinePage from "@/pages/helpline";
import HelpCenterPage from "@/pages/help-center";
import CallToOrderPage from "@/pages/call-to-order";
import CustomerSupportPage from "@/pages/customer-support";
import WalletPage from "@/pages/wallet";
import WalletCheckInPage from "@/pages/wallet-check-in";
import WalletGamesPage from "@/pages/wallet-games";
import WalletTasksPage from "@/pages/wallet-tasks";
import FeedPetGame from "@/pages/games/feed-pet";
import LuckyWheelGame from "@/pages/games/lucky-wheel";
import MatchThreeGame from "@/pages/games/match-three";
import PetQuizGame from "@/pages/games/pet-quiz";
import DebugClearQuiz from "@/pages/debug-clear-quiz";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { ChatProvider } from "@/contexts/chat-context";
import { FloatingCart } from "@/components/ui/floating-cart";
import FloatingSupportButton from "@/components/floating-support-button";
import MobileBottomNav from "@/components/layout/mobile-bottom-nav";

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/product/:id" component={ProductDetailPage} />
        <Route path="/privilege-club" component={PrivilegeClubPage} />
        <Route path="/membership-checkout" component={MembershipCheckoutPage} />
        <Route path="/cat-food" component={CatFoodPage} />
        <Route path="/dog-food" component={DogFoodPage} />
        <Route path="/cat-toys" component={CatToysPage} />
        <Route path="/cat-litter" component={CatLitterPage} />
        <Route path="/cat-care" component={CatCarePage} />
        <Route path="/cat-accessories" component={CatAccessoriesPage} />
        <Route path="/clothing-beds-carrier" component={ClothingBedsCarrierPage} />
        <Route path="/dog-accessories" component={DogAccessoriesPage} />
        <Route path="/rabbit" component={RabbitPage} />
        <Route path="/bird" component={BirdPage} />
        <Route path="/brands/reflex" component={ReflexPage} />
        <Route path="/brands/nekko" component={NekkoPage} />
        <Route path="/brands/purina" component={PurinaPage} />
        <Route path="/brands/one" component={OnePage} />
        <Route path="/brands/reflex-plus" component={ReflexPlusPage} />
        <Route path="/brands/royal-canin" component={RoyalCaninPage} />
        <Route path="/brands/sheba" component={ShebaPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:slug" component={BlogDetailPage} />
        <Route path="/bulk-discounts" component={BulkDiscountsPage} />
        <Route path="/sign-in" component={SignInPage} />
        <Route path="/sign-up" component={SignUpPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />

        <Route path="/admin" component={AdminPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/payment-success" component={PaymentSuccessPage} />
        <Route path="/invoice/:id" component={InvoicePage} />
        <Route path="/track-order/:orderId" component={TrackOrderPage} />
        <Route path="/track-order" component={TrackOrderPage} />
        <Route path="/profile">
          {() => {
            const [, setLocation] = useLocation();
            useEffect(() => {
              setLocation('/dashboard?section=profile');
            }, []);
            return null;
          }}
        </Route>
        <Route path="/wishlist">
          {() => {
            const [, setLocation] = useLocation();
            useEffect(() => {
              setLocation('/dashboard?section=wishlist');
            }, []);
            return null;
          }}
        </Route>
        <Route path="/messenger" component={MessengerPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/flash-sale-products" component={FlashSaleProductsPage} />
        <Route path="/bulk-products" component={BulkProductsPage} />
        <Route path="/newly-launched" component={NewlyLaunchedPage} />
        <Route path="/repack-products" component={RepackProductsPage} />
        <Route path="/cat-best-seller" component={CatBestSellerPage} />
        <Route path="/dog-best-seller" component={DogBestSellerPage} />
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/return-policy" component={ReturnPolicyPage} />
        <Route path="/terms-of-service" component={TermsOfServicePage} />
        <Route path="/shipping-policy" component={ShippingPolicyPage} />
        <Route path="/quality-guarantee" component={QualityGuaranteePage} />
        <Route path="/helpline" component={HelplinePage} />
        <Route path="/help-center" component={HelpCenterPage} />
        <Route path="/call-to-order" component={CallToOrderPage} />
        <Route path="/customer-support" component={CustomerSupportPage} />
        <Route path="/wallet" component={WalletPage} />
        <Route path="/wallet/check-in" component={WalletCheckInPage} />
        <Route path="/wallet/games" component={WalletGamesPage} />
        <Route path="/wallet/tasks" component={WalletTasksPage} />
        <Route path="/wallet/games/feed-pet" component={FeedPetGame} />
        <Route path="/wallet/games/lucky-wheel" component={LuckyWheelGame} />
        <Route path="/wallet/games/match-three" component={MatchThreeGame} />
        <Route path="/wallet/games/quiz" component={PetQuizGame} />
        <Route path="/debug/clear-quiz" component={DebugClearQuiz} />
        <Route component={NotFoundPage} />
      </Switch>
      <MobileBottomNav />
      <FloatingSupportButton />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <AuthProvider>
              <WalletProvider>
                <CartProvider>
                  <ChatProvider>
                    <TooltipProvider>
                      <SidebarProvider>
                        <div className="min-h-screen bg-white mobile-safe-bottom">
                          <AppRoutes />
                          <FloatingCart />
                          <Toaster />
                        </div>
                      </SidebarProvider>
                    </TooltipProvider>
                  </ChatProvider>
                </CartProvider>
              </WalletProvider>
            </AuthProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
