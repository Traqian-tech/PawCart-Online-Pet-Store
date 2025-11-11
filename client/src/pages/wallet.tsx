import { useState } from 'react';
import { useWallet } from '@/contexts/wallet-context';
import { useAuth } from '@/hooks/use-auth';
import { useCurrency } from '@/contexts/currency-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  TrendingDown, 
  Gift,
  Clock,
  Gamepad2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { Link } from 'wouter';

export default function WalletPage() {
  const { user } = useAuth();
  const { wallet, limits, membership, transactions, loading, refreshWallet } = useWallet();
  const { format } = useCurrency();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'earn'>('overview');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Please sign in to access your wallet</p>
            <Link href="/sign-in">
              <Button className="bg-[#26732d] hover:bg-[#1e5d26]">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && !wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26732d] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  const getMembershipBadge = () => {
    if (!membership) return null;
    
    const badges = {
      'Silver Paw': { color: 'bg-gray-200 text-gray-700', icon: '🥈' },
      'Golden Paw': { color: 'bg-yellow-100 text-yellow-700', icon: '🥇' },
      'Diamond Paw': { color: 'bg-blue-100 text-blue-700', icon: '💎' },
    };
    
    const badge = badges[membership as keyof typeof badges];
    if (!badge) return null;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <span>{badge.icon}</span>
        {membership}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getTransactionIcon = (type: string, source: string) => {
    if (type === 'EARN') {
      if (source.includes('GAME')) return <Gamepad2 className="w-5 h-5 text-green-600" />;
      if (source.includes('CHECKIN')) return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
      return <Gift className="w-5 h-5 text-purple-600" />;
    }
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  const getTransactionLabel = (source: string) => {
    const labels: Record<string, string> = {
      'GAME_FEED_PET': 'Feed Pet Game',
      'GAME_MATCH_THREE': 'Match Three Game',
      'GAME_LUCKY_WHEEL': 'Lucky Wheel',
      'GAME_QUIZ': 'Pet Quiz',
      'DAILY_CHECKIN': 'Daily Check-in',
      'ORDER_PAYMENT': 'Order Payment',
      'REFUND': 'Refund',
    };
    return labels[source] || source;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50 py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="tracking-wide">Back</span>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                My Wallet
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {membership && (
                <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                  <span className="text-xs text-gray-500 font-medium">Membership:</span>
                  {getMembershipBadge()}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshWallet}
                disabled={loading}
                className="font-medium tracking-wide border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
          {membership && (
            <div className="flex sm:hidden items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 w-fit">
              <span className="text-sm text-gray-600 font-medium">Membership:</span>
              {getMembershipBadge()}
            </div>
          )}
        </div>

        {/* Balance Card */}
        <Card className="mb-6 md:mb-8 bg-gradient-to-br from-[#26732d] via-[#2d8535] to-[#1e5d26] text-white border-0 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          <CardContent className="p-6 md:p-8 relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <p className="text-green-100 text-xs md:text-sm mb-2 font-medium tracking-wide">Available Balance</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
                  {format(wallet?.balance || 0)}
                </h2>
                {wallet && wallet.frozenBalance > 0 && (
                  <p className="text-green-200 text-xs md:text-sm bg-white/10 px-2 py-1 rounded-md inline-block">
                    Frozen: {format(wallet.frozenBalance)}
                  </p>
                )}
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-lg">
                <WalletIcon className="w-6 h-6 md:w-8 md:h-8" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 text-green-100 text-xs md:text-sm mb-2 font-medium">
                  <TrendingUp className="w-4 h-4" />
                  Total Earned
                </div>
                <p className="text-lg md:text-xl font-bold">{format(wallet?.totalEarned || 0)}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 text-green-100 text-xs md:text-sm mb-2 font-medium">
                  <TrendingDown className="w-4 h-4" />
                  Total Spent
                </div>
                <p className="text-lg md:text-xl font-bold">{format(wallet?.totalSpent || 0)}</p>
              </div>
            </div>

            {limits && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between text-xs md:text-sm mb-2">
                  <span className="text-green-100 font-medium">Daily Earning Remaining</span>
                  <span className="font-bold text-white">{format(limits.dailyEarningRemaining)} / {format(limits.maxDailyEarning)}</span>
                </div>
                <div className="bg-white/20 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.min((limits.dailyEarningRemaining / limits.maxDailyEarning) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-2.5 font-semibold text-sm transition-all rounded-md ${
              activeTab === 'overview'
                ? 'text-[#26732d] bg-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 px-4 py-2.5 font-semibold text-sm transition-all rounded-md ${
              activeTab === 'transactions'
                ? 'text-[#26732d] bg-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('earn')}
            className={`flex-1 px-4 py-2.5 font-semibold text-sm transition-all rounded-md ${
              activeTab === 'earn'
                ? 'text-[#26732d] bg-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              Earn More <Sparkles className="w-4 h-4" />
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {/* Quick Actions */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Sparkles className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/wallet/games">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-md hover:shadow-lg transition-all h-12">
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Play Games
                  </Button>
                </Link>
                <Link href="/wallet/check-in">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-md hover:shadow-lg transition-all h-12">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Daily Check-in
                  </Button>
                </Link>
                <Link href="/wallet/tasks">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-md hover:shadow-lg transition-all h-12">
                    <Gift className="w-5 h-5 mr-2" />
                    Complete Tasks
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <span>Recent Activity</span>
                  </span>
                  {transactions.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('transactions')}
                      className="text-[#26732d] hover:text-[#1e5d26] hover:bg-green-50"
                    >
                      View All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No transactions yet</p>
                    <p className="text-gray-400 text-sm mt-1">Start earning by playing games or checking in!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div
                        key={transaction._id}
                        className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {getTransactionIcon(transaction.type, transaction.source)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">{getTransactionLabel(transaction.source)}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{formatDate(transaction.createdAt)}</p>
                          </div>
                        </div>
                        <p className={`font-bold text-base flex-shrink-0 ml-2 ${transaction.type === 'EARN' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'EARN' ? '+' : '-'}{format(transaction.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'transactions' && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <span>All Transactions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium text-lg mb-1">No transactions yet</p>
                  <p className="text-gray-400 text-sm">Start earning by playing games or checking in!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getTransactionIcon(transaction.type, transaction.source)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{getTransactionLabel(transaction.source)}</p>
                          {transaction.description && (
                            <p className="text-sm text-gray-600 mt-0.5">{transaction.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1.5">{formatDate(transaction.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className={`font-bold text-lg ${transaction.type === 'EARN' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'EARN' ? '+' : '-'}{format(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Balance: {format(transaction.balanceAfter)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'earn' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Games */}
            <Card className="border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-white text-xl">Play Games</CardTitle>
                </div>
                <p className="text-purple-100 text-sm">Earn rewards by playing fun mini-games!</p>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-2.5 mb-6 text-sm">
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-600 font-bold">✓</span> 
                    <span>Feed Pet: $0.50 - $2.00</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-600 font-bold">✓</span> 
                    <span>Match Three: Up to $10.00</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-600 font-bold">✓</span> 
                    <span>Lucky Wheel: $1 - $50</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-600 font-bold">✓</span> 
                    <span>Pet Quiz: Up to $5.00</span>
                  </li>
                </ul>
                <Link href="/wallet/games">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md hover:shadow-lg transition-all">
                    Play Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Daily Check-in */}
            <Card className="border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-white text-xl">Daily Check-in</CardTitle>
                </div>
                <p className="text-blue-100 text-sm">Check in every day for rewards!</p>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-2.5 mb-6 text-sm">
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-600 font-bold">✓</span> 
                    <span>Daily: $1.00</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-600 font-bold">✓</span> 
                    <span>7 Days Streak: +$5.00 Bonus</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-600 font-bold">✓</span> 
                    <span>30 Days Streak: +$30.00 Bonus</span>
                  </li>
                  {membership && (
                    <li className="flex items-center gap-2 text-gray-700">
                      <span className="text-yellow-600 font-bold">★</span> 
                      <span className="font-semibold">Member Bonus Active</span>
                    </li>
                  )}
                </ul>
                <Link href="/wallet/check-in">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-md hover:shadow-lg transition-all">
                    Check In <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card className="border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Gift className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-white text-xl">Complete Tasks</CardTitle>
                </div>
                <p className="text-green-100 text-sm">Earn rewards by completing tasks!</p>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-2.5 mb-6 text-sm">
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-600 font-bold">✓</span> 
                    <span>Review Order: $3.00</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-600 font-bold">✓</span> 
                    <span>Photo Review: $5.00</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-600 font-bold">✓</span> 
                    <span>Share Product: $0.50</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-600 font-bold">✓</span> 
                    <span>Refer Friend: $20.00</span>
                  </li>
                </ul>
                <Link href="/wallet/tasks">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all">
                    View Tasks <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

