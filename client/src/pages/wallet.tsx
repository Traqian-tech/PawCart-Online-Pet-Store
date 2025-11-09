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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Wallet</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshWallet}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          {membership && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Membership:</span>
              {getMembershipBadge()}
            </div>
          )}
        </div>

        {/* Balance Card */}
        <Card className="mb-8 bg-gradient-to-br from-[#26732d] to-[#1e5d26] text-white border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-green-100 text-sm mb-2">Available Balance</p>
                <h2 className="text-4xl md:text-5xl font-bold mb-2">
                  {format(wallet?.balance || 0)}
                </h2>
                {wallet && wallet.frozenBalance > 0 && (
                  <p className="text-green-200 text-sm">
                    Frozen: {format(wallet.frozenBalance)}
                  </p>
                )}
              </div>
              <div className="bg-white/20 p-4 rounded-full">
                <WalletIcon className="w-8 h-8" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-100 text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Total Earned
                </div>
                <p className="text-xl font-semibold">{format(wallet?.totalEarned || 0)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-100 text-sm mb-1">
                  <TrendingDown className="w-4 h-4" />
                  Total Spent
                </div>
                <p className="text-xl font-semibold">{format(wallet?.totalSpent || 0)}</p>
              </div>
            </div>

            {limits && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-100">Daily Earning Remaining:</span>
                  <span className="font-semibold">{format(limits.dailyEarningRemaining)} / {format(limits.maxDailyEarning)}</span>
                </div>
                <div className="mt-2 bg-white/20 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-yellow-400 h-full rounded-full transition-all"
                    style={{ width: `${(limits.dailyEarningRemaining / limits.maxDailyEarning) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-[#26732d] border-b-2 border-[#26732d]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'transactions'
                ? 'text-[#26732d] border-b-2 border-[#26732d]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('earn')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'earn'
                ? 'text-[#26732d] border-b-2 border-[#26732d]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-2">
              Earn More <Sparkles className="w-4 h-4" />
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/wallet/games">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Play Games
                  </Button>
                </Link>
                <Link href="/wallet/check-in">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Daily Check-in
                  </Button>
                </Link>
                <Link href="/wallet/tasks">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                    <Gift className="w-4 h-4 mr-2" />
                    Complete Tasks
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </span>
                  {transactions.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('transactions')}
                    >
                      View All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No transactions yet</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div
                        key={transaction._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type, transaction.source)}
                          <div>
                            <p className="font-medium text-sm">{getTransactionLabel(transaction.source)}</p>
                            <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                          </div>
                        </div>
                        <p className={`font-bold ${transaction.type === 'EARN' ? 'text-green-600' : 'text-red-600'}`}>
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
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-12">No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {getTransactionIcon(transaction.type, transaction.source)}
                        <div>
                          <p className="font-medium">{getTransactionLabel(transaction.source)}</p>
                          {transaction.description && (
                            <p className="text-sm text-gray-600">{transaction.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">{formatDate(transaction.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${transaction.type === 'EARN' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'EARN' ? '+' : '-'}{format(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Games */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Gamepad2 className="w-6 h-6 text-purple-600" />
                  <CardTitle>Play Games</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Earn rewards by playing fun mini-games!</p>
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Feed Pet: $0.50 - $2.00
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Match Three: Up to $10.00
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Lucky Wheel: $1 - $50
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Pet Quiz: Up to $5.00
                  </li>
                </ul>
                <Link href="/wallet/games">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Play Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Daily Check-in */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  <CardTitle>Daily Check-in</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Check in every day for rewards!</p>
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Daily: $1.00
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> 7 Days Streak: +$5.00 Bonus
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> 30 Days Streak: +$30.00 Bonus
                  </li>
                  {membership && (
                    <li className="flex items-center gap-2">
                      <span className="text-yellow-600">★</span> Member Bonus Active
                    </li>
                  )}
                </ul>
                <Link href="/wallet/check-in">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Check In <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-6 h-6 text-green-600" />
                  <CardTitle>Complete Tasks</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Earn rewards by completing tasks!</p>
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Review Order: $3.00
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Photo Review: $5.00
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Share Product: $0.50
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Refer Friend: $20.00
                  </li>
                </ul>
                <Link href="/wallet/tasks">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
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

