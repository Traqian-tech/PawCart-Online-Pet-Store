import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, 
  Edit, 
  Save, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Award,
  ShoppingBag,
  Heart,
  TrendingUp,
  Star,
  Gift,
  Crown,
  Package,
  Truck,
  CheckCircle,
  Clock,
  User,
  Lock,
  Bell,
  CreditCard,
  LogOut,
  Settings,
  Activity,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  Shield,
  Wallet,
  History
} from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '@/contexts/currency-context';
import { useWallet } from '@/contexts/wallet-context';
import { useWishlist } from '@/hooks/use-wishlist';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

// Profile Page v3.0 - Complete Redesign with Modern UI
export default function ProfilePage() {
  const { user, signOut, updateProfile, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { format } = useCurrency();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: (user as any)?.phone || '',
    address: (user as any)?.address || '',
  });

  // Use hooks for wallet and wishlist (same as dashboard)
  const { wallet } = useWallet();
  const { items: wishlistItems } = useWishlist();

  // Fetch user orders from the same endpoint as dashboard
  const [orders, setOrders] = useState<any[]>([]);
  
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/orders/user/${user.id}`)
        .then(res => res.json())
        .then(ordersData => {
          const formattedOrders = ordersData.map((order: any) => ({
            id: order._id,
            invoiceId: order.invoiceId || order._id,
            date: new Date(order.createdAt).toISOString().split('T')[0],
            status: order.status.toLowerCase(),
            total: order.total,
            items: order.items || []
          }));
          setOrders(formattedOrders);
        })
        .catch(err => {
          console.error('Failed to fetch orders:', err);
          setOrders([]);
        });
    }
  }, [user?.id]);

  // Fetch coupons (same as dashboard)
  const { data: apiCoupons = [] } = useQuery<any[]>({
    queryKey: ['/api/coupons'],
    queryFn: async () => {
      const response = await fetch('/api/coupons');
      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }
      return response.json();
    },
  });

  // Redirect to sign-in if not authenticated (after all hooks)
  useEffect(() => {
    if (!user) {
      setLocation('/sign-in');
    }
  }, [user, setLocation]);

  // Show loading or redirect state
  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out', description: 'Looking forward to your next visit!' });
    setLocation('/');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image size cannot exceed 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`/api/auth/profile/${user.id}/avatar`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        await refreshUser();
        toast({
          title: 'Success',
          description: 'Avatar updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Avatar upload failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error, please try again',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      setIsEditing(false);
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: (user as any)?.phone || '',
      address: (user as any)?.address || '',
    });
    setIsEditing(false);
  };

  // Get membership tier info
  const membershipTier = (user as any)?.membership?.tier || null;
  const membershipTiers: Record<string, { name: string; color: string; bg: string; icon: any; discount: string; nextTier: string | null; pointsNeeded: number }> = {
    'Silver Paw': { name: 'Silver Paw Member', color: 'text-gray-600', bg: 'bg-gray-50', icon: Star, discount: '5%', nextTier: 'Golden Paw', pointsNeeded: 1000 },
    'Golden Paw': { name: 'Golden Paw Member', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Gift, discount: '10%', nextTier: 'Diamond Paw', pointsNeeded: 2000 },
    'Diamond Paw': { name: 'Diamond Paw Member', color: 'text-blue-600', bg: 'bg-blue-50', icon: Crown, discount: '15%', nextTier: null, pointsNeeded: 0 }
  };

  const currentTier = membershipTier ? membershipTiers[membershipTier] : { name: 'No Membership', color: 'text-gray-400', bg: 'bg-gray-50', icon: Award, discount: '0%', nextTier: 'Silver Paw', pointsNeeded: 500 };
  const TierIcon = currentTier.icon;
  const totalPoints = (user as any)?.loyaltyPoints || 0;
  const progressToNext = currentTier.nextTier ? Math.min((totalPoints / currentTier.pointsNeeded) * 100, 100) : 100;

  // Calculate statistics (same logic as dashboard)
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length;
  const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
  const processingOrders = orders.filter((o: any) => o.status === 'processing').length;
  const totalSpent = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  const wishlistCount = wishlistItems.length;
  const activeCoupons = apiCoupons.filter((c: any) => c.status === 'available').length;
  const walletBalance = wallet?.balance || 0;
  const recentOrders = orders.slice(0, 3);

  // Debug: Log to verify new version is loaded
  useEffect(() => {
    console.log('🚀 Profile Page v3.0 - Complete Redesign Loaded!');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Modern Hero Section with Glass Morphism */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 animate-gradient-x"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          
          {/* Floating Particles Effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                initial={{ 
                  x: Math.random() * 100 + '%', 
                  y: Math.random() * 100 + '%' 
                }}
                animate={{ 
                  y: ['-10%', '110%'],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: Math.random() * 10 + 10, 
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Enhanced Avatar Section with Glow Effect */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative group"
              >
                <div className="relative">
                  {/* Glow Ring */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                  
                  <Avatar className="relative h-36 w-36 border-4 border-white shadow-2xl ring-4 ring-white/50">
                    <AvatarImage src={(user as any).profilePicture} alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-white text-5xl font-bold">
                      {user.firstName?.[0] || user.name?.[0] || user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                  
                  <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                    onClick={handleAvatarClick}
                  >
                    {isUploadingAvatar ? (
                      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-10 h-10 text-white mx-auto mb-1" />
                        <p className="text-xs text-white font-semibold">Change Avatar</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                  />
                </div>
                
                {/* Tier Badge with Animation */}
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="absolute -bottom-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-3 shadow-xl ring-4 ring-white"
                >
                  <TierIcon className="w-7 h-7 text-white" />
                </motion.div>
              </motion.div>

              {/* Enhanced User Info */}
              <div className="flex-1 text-center md:text-left text-white">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.username || 'User'}
                    </h1>
                    <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                  </div>
                  
                  <p className="text-blue-100 mb-6 flex items-center justify-center md:justify-start gap-2 text-lg">
                    <Mail className="w-5 h-5" />
                    {user.email}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-5 py-2.5 text-base font-bold border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <TierIcon className="w-5 h-5 mr-2" />
                      {currentTier.name}
                    </Badge>
                    <Badge className="bg-white/20 text-white px-5 py-2.5 text-base font-bold border-0 backdrop-blur-md hover:bg-white/30 transition-colors">
                      <Star className="w-5 h-5 mr-2 fill-yellow-300 text-yellow-300" />
                      {totalPoints} Points
                    </Badge>
                    <Badge className="bg-white/20 text-white px-5 py-2.5 text-base font-bold border-0 backdrop-blur-md hover:bg-white/30 transition-colors">
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      {totalOrders} Orders
                    </Badge>
                    <Badge className="bg-white/20 text-white px-5 py-2.5 text-base font-bold border-0 backdrop-blur-md hover:bg-white/30 transition-colors">
                      <Gift className="w-5 h-5 mr-2" />
                      {currentTier.discount} Discount
                    </Badge>
                  </div>

                  {/* Enhanced Progress to Next Tier */}
                  {currentTier.nextTier && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-yellow-300" />
                          <span className="font-semibold text-lg">Upgrade to {currentTier.nextTier} Member</span>
                        </div>
                        <span className="font-bold text-lg bg-white/20 px-3 py-1 rounded-full">
                          {totalPoints} / {currentTier.pointsNeeded}
                        </span>
                      </div>
                      <div className="relative">
                        <Progress value={progressToNext} className="h-3 bg-white/20" />
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full opacity-50 blur-sm" style={{ width: `${progressToNext}%` }}></div>
                      </div>
                      <p className="text-sm text-blue-100 mt-2">
                        Need <span className="font-bold text-yellow-300">{currentTier.pointsNeeded - totalPoints}</span> more points to upgrade!
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards with Animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card 
              className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white border-0 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer"
              onClick={() => setActiveTab('orders')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl group-hover:rotate-12 transition-transform duration-300">
                    <Package className="w-8 h-8" />
                  </div>
                  <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Orders</p>
                <p className="text-4xl font-bold mb-1">{totalOrders}</p>
                <div className="flex items-center gap-1 text-xs text-blue-200">
                  <TrendingUp className="w-3 h-3" />
                  <span>Growing</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card 
              className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer"
              onClick={() => setActiveTab('orders')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl group-hover:rotate-12 transition-transform duration-300">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-green-100 text-sm font-medium mb-1">Total Spent</p>
                <p className="text-4xl font-bold mb-1">{format(totalSpent)}</p>
                <div className="flex items-center gap-1 text-xs text-green-200">
                  <BarChart3 className="w-3 h-3" />
                  <span>Thank you for your support</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link href="/wishlist">
              <Card className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-rose-600 to-red-600 text-white border-0 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl group-hover:rotate-12 transition-transform duration-300">
                      <Heart className="w-8 h-8 fill-white" />
                    </div>
                    <Star className="w-5 h-5 text-yellow-300 animate-pulse fill-yellow-300" />
                  </div>
                  <p className="text-pink-100 text-sm font-medium mb-1">Wishlist Items</p>
                  <p className="text-4xl font-bold mb-1">{wishlistCount}</p>
                  <div className="flex items-center gap-1 text-xs text-pink-200">
                    <Heart className="w-3 h-3" />
                    <span>Your Wishlist</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card 
              className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 text-white border-0 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer"
              onClick={() => setActiveTab('profile')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl group-hover:rotate-12 transition-transform duration-300">
                    <Gift className="w-8 h-8" />
                  </div>
                  <Crown className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-orange-100 text-sm font-medium mb-1">Member Discount</p>
                <p className="text-4xl font-bold mb-1">{currentTier.discount}</p>
                <div className="flex items-center gap-1 text-xs text-orange-200">
                  <Award className="w-3 h-3" />
                  <span>Exclusive Benefits</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
              </div>

        {/* Enhanced Tabs with Modern Design */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-4 w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-lg p-2 rounded-2xl shadow-xl border border-gray-200">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-xl transition-all duration-300 py-3"
            >
              <Activity className="w-5 h-5" />
              <span className="hidden sm:inline font-semibold">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-xl transition-all duration-300 py-3"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline font-semibold">Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl transition-all duration-300 py-3"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline font-semibold">Order History</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl transition-all duration-300 py-3"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden sm:inline font-semibold">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders with Modern Design */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50/50 hover:shadow-3xl transition-shadow">
                  <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                        <Truck className="w-6 h-6 text-white" />
                      </div>
                      Recent Orders
                    </CardTitle>
                    <CardDescription className="text-base">Your Recent Purchases</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {(recentOrders as any[]).length > 0 ? (
                      <div className="space-y-4">
                        {(recentOrders as any[]).map((order: any, index: number) => (
                          <Link key={order.id} href={`/track-order/${order.id}`}>
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200 cursor-pointer"
                            >
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl shadow-md ${
                                order.status === 'delivered' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                                order.status === 'processing' ? 'bg-gradient-to-br from-blue-400 to-cyan-500' :
                                'bg-gradient-to-br from-yellow-400 to-orange-500'
                              }`}>
                                {order.status === 'delivered' ? (
                                  <CheckCircle className="w-6 h-6 text-white" />
                                ) : (
                                  <Clock className="w-6 h-6 text-white" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-lg">Order #{order.id.slice(0, 8)}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(order.createdAt).toLocaleDateString('en-US')}
                                </p>
                              </div>
                            </div>
                            <p className="font-bold text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{format(order.total)}</p>
                          </motion.div>
                          </Link>
                        ))}
                        <Button 
                          variant="outline" 
                          className="w-full mt-4 py-6 text-lg font-semibold border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 transition-all"
                          onClick={() => setActiveTab('orders')}
                        >
                          View All Orders
                          <History className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-gray-600 text-lg font-medium">No Orders</p>
                        <p className="text-gray-500 text-sm mt-2 mb-6">Start shopping and create your first order!</p>
                        <Link href="/">
                          <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            Start Shopping
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Activity Timeline with Modern Design */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50/50 hover:shadow-3xl transition-shadow">
                  <CardHeader className="border-b border-purple-100 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      Activity Timeline
                    </CardTitle>
                    <CardDescription className="text-base">Your Account Activity</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg"></div>
                          <div className="w-1 h-full bg-gradient-to-b from-green-200 to-blue-200"></div>
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                            <p className="font-bold text-base flex items-center gap-2">
                              <Shield className="w-4 h-4 text-green-600" />
                              Account Created
                            </p>
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date((user as any).createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                      
                      {deliveredOrders > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex gap-4"
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full shadow-lg"></div>
                            <div className="w-1 h-full bg-gradient-to-b from-blue-200 to-purple-200"></div>
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                              <p className="font-bold text-base flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                Completed {deliveredOrders} order{deliveredOrders !== 1 ? 's' : ''}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">Thank you for your support and trust!</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full shadow-lg"></div>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                            <p className="font-bold text-base flex items-center gap-2">
                              <Crown className="w-4 h-4 text-purple-600" />
                              Current Level: {currentTier.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">Continue shopping to upgrade your membership level and enjoy more benefits!</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Enhanced Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-emerald-50/50">
                <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                  <div className="flex items-center justify-between">
                <div>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        Personal Information
                      </CardTitle>
                      <CardDescription className="text-base mt-2">Manage your profile information</CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={() => setIsEditing(true)}
                        className="border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400 transition-all"
                      >
                        <Edit className="w-5 h-5 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          size="lg" 
                          onClick={handleCancelEdit}
                          className="border-2 border-gray-200 hover:bg-gray-50"
                        >
                          <X className="w-5 h-5 mr-2" />
                          Cancel
                        </Button>
                        <Button 
                          size="lg" 
                          onClick={handleSaveProfile} 
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
                        >
                          <Save className="w-5 h-5 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-base font-semibold flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600" />
                        First Name
                      </Label>
                  <Input
                    id="firstName"
                        value={isEditing ? formData.firstName : user.firstName || ''}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={!isEditing}
                        className={`h-12 text-lg ${isEditing ? 'border-2 border-emerald-300 focus:border-emerald-500 bg-emerald-50/50' : 'bg-gray-50'}`}
                        placeholder="Enter your first name"
                  />
                </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-base font-semibold flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600" />
                        Last Name
                      </Label>
                  <Input
                    id="lastName"
                        value={isEditing ? formData.lastName : user.lastName || ''}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={!isEditing}
                        className={`h-12 text-lg ${isEditing ? 'border-2 border-emerald-300 focus:border-emerald-500 bg-emerald-50/50' : 'bg-gray-50'}`}
                        placeholder="Enter your last name"
                  />
                </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                          className="pl-12 h-12 text-lg bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Email address cannot be changed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-base font-semibold flex items-center gap-2">
                        <Phone className="w-4 h-4 text-purple-600" />
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="phone"
                          value={isEditing ? formData.phone : (user as any)?.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          disabled={!isEditing}
                          className={`pl-12 h-12 text-lg ${isEditing ? 'border-2 border-emerald-300 focus:border-emerald-500 bg-emerald-50/50' : 'bg-gray-50'}`}
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address" className="text-base font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        Shipping Address
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <Input
                          id="address"
                          value={isEditing ? formData.address : (user as any)?.address || ''}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          disabled={!isEditing}
                          className={`pl-12 h-12 text-lg ${isEditing ? 'border-2 border-emerald-300 focus:border-emerald-500 bg-emerald-50/50' : 'bg-gray-50'}`}
                          placeholder="Enter your complete shipping address"
                  />
                </div>
              </div>
                  </div>

                  <Separator className="my-8" />

                  <div>
                    <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      Membership Benefits
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-200/30 rounded-full -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                          <p className="text-sm text-gray-600 mb-2 font-medium">Membership Level</p>
                          <p className={`text-2xl font-bold ${currentTier.color} flex items-center gap-2`}>
                            <TierIcon className="w-6 h-6" />
                            {currentTier.name}
                          </p>
                        </div>
                      </div>
                      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                          <p className="text-sm text-gray-600 mb-2 font-medium">Total Points</p>
                          <p className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                            <Star className="w-6 h-6 fill-blue-600" />
                            {totalPoints}
                          </p>
                        </div>
                      </div>
                      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                          <p className="text-sm text-gray-600 mb-2 font-medium">Exclusive Discount</p>
                          <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                            <Gift className="w-6 h-6" />
                            {currentTier.discount} OFF
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Enhanced Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50/50">
                <CardHeader className="border-b border-purple-100 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    Order History
                  </CardTitle>
                  <CardDescription className="text-base">View all your order details</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {(orders as any[]).length > 0 ? (
                    <div className="space-y-4">
                      {(orders as any[]).map((order: any, index: number) => (
                        <Link key={order.id} href={`/track-order/${order.id}`}>
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative overflow-hidden border-2 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30 hover:border-purple-300 cursor-pointer"
                          >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/30 rounded-full -mr-16 -mt-16"></div>
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl shadow-lg ${
                                  order.status === 'delivered' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                                  order.status === 'processing' ? 'bg-gradient-to-br from-blue-400 to-cyan-500' :
                                  order.status === 'shipped' ? 'bg-gradient-to-br from-purple-400 to-pink-500' :
                                  'bg-gradient-to-br from-yellow-400 to-orange-500'
                                }`}>
                                  {order.status === 'delivered' ? (
                                    <CheckCircle className="w-7 h-7 text-white" />
                                  ) : order.status === 'shipped' ? (
                                    <Truck className="w-7 h-7 text-white" />
                                  ) : (
                                    <Clock className="w-7 h-7 text-white" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-xl">Order #{order.id.slice(0, 8)}</p>
                                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}
                                  </p>
                                </div>
                              </div>
                              <Badge className={`px-4 py-2 text-sm font-bold ${
                                order.status === 'delivered' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                                order.status === 'processing' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                                order.status === 'shipped' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                                'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                              }`}>
                                {order.status === 'delivered' ? '✓ Delivered' :
                                 order.status === 'processing' ? '⏳ Processing' :
                                 order.status === 'shipped' ? '🚚 Shipped' : '📦 Pending'}
                              </Badge>
                            </div>
                            <Separator className="my-4" />
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Package className="w-5 h-5" />
                                <span className="font-medium">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                              </div>
                              <p className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {format(order.total)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-16 h-16 text-purple-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h3>
                      <p className="text-gray-600 mb-6 text-lg">Start shopping and create your first order!</p>
                      <Link href="/">
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                          <ShoppingBag className="w-5 h-5 mr-2" />
                          Start Shopping
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Enhanced Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50/50">
                  <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                        <Bell className="w-5 h-5 text-white" />
                      </div>
                      Notification Settings
                    </CardTitle>
                    <CardDescription className="text-base">Manage your notification preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold">Order Updates</p>
                          <p className="text-sm text-gray-600">Receive order status notifications</p>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-6 h-6 rounded accent-blue-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <Gift className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold">Promotions</p>
                          <p className="text-sm text-gray-600">Receive offers and promotion notifications</p>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-6 h-6 rounded accent-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500 rounded-lg">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold">New Product Recommendations</p>
                          <p className="text-sm text-gray-600">Receive new product recommendations</p>
                        </div>
                      </div>
                      <input type="checkbox" className="w-6 h-6 rounded accent-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-orange-50/50">
                  <CardHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-500/10 to-red-500/10">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      Security Settings
                    </CardTitle>
                    <CardDescription className="text-base">Protect your account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <Button variant="outline" className="w-full justify-start h-14 text-base border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                      <Lock className="w-5 h-5 mr-3 text-blue-600" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-14 text-base border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                      <Phone className="w-5 h-5 mr-3 text-green-600" />
                      Link Phone Number
                    </Button>
                <Button 
                      variant="outline" 
                      className="w-full justify-start h-14 text-base border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all"
                  onClick={handleSignOut}
                >
                      <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="shadow-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
                <CardHeader className="border-b border-red-200 bg-red-100/50">
                  <CardTitle className="text-red-600 flex items-center gap-3 text-xl">
                    <div className="p-2 bg-red-500 rounded-xl">
                      <X className="w-5 h-5 text-white" />
                    </div>
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-base">Please be careful with the following options, this operation is irreversible</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Button variant="destructive" className="w-full md:w-auto px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all">
                    <X className="w-5 h-5 mr-2" />
                    Permanently Delete Account
                </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
        >
          <Link href="/dashboard">
            <Card className="cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border-0 bg-gradient-to-br from-blue-500 to-cyan-500 text-white group">
              <CardContent className="p-8 text-center">
                <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                  <Activity className="w-8 h-8" />
                </div>
                <p className="font-bold text-lg">Dashboard</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/wishlist">
            <Card className="cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border-0 bg-gradient-to-br from-pink-500 to-red-500 text-white group">
              <CardContent className="p-8 text-center">
                <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                  <Heart className="w-8 h-8 fill-white" />
                </div>
                <p className="font-bold text-lg">Wishlist</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/cart">
            <Card className="cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border-0 bg-gradient-to-br from-purple-500 to-indigo-500 text-white group">
              <CardContent className="p-8 text-center">
                <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-bold text-lg">Shopping Cart</p>
              </CardContent>
            </Card>
          </Link>
          <Card className="cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border-0 bg-gradient-to-br from-gray-500 to-slate-600 text-white group" onClick={handleSignOut}>
            <CardContent className="p-8 text-center">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                <LogOut className="w-8 h-8" />
              </div>
              <p className="font-bold text-lg">Sign Out</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
