import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/contexts/wallet-context';
import { useCurrency } from '@/contexts/currency-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Calendar, Gift, TrendingUp, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function WalletCheckInPage() {
  const { user } = useAuth();
  const { wallet, membership, refreshWallet } = useWallet();
  const { format } = useCurrency();
  const { toast } = useToast();
  const [checkInStatus, setCheckInStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if ((user as any)?._id) {
      loadCheckInStatus();
    }
  }, [(user as any)?._id]);

  const loadCheckInStatus = async () => {
    if (!(user as any)?._id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/check-in/status?userId=${(user as any)._id}`);
      if (!response.ok) throw new Error('Failed to load check-in status');
      
      const data = await response.json();
      setCheckInStatus(data);
    } catch (error) {
      console.error('Load check-in status error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!(user as any)?._id || checking) return;

    setChecking(true);
    try {
      const response = await fetch('/api/tasks/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: (user as any)._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Check-in Failed',
          description: data.message || 'Something went wrong',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Check-in Successful! 🎉',
        description: `You earned ${format(data.reward)}! Consecutive days: ${data.consecutiveDays}`,
      });

      await loadCheckInStatus();
      await refreshWallet();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check in. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setChecking(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Please sign in to check in</p>
            <Link href="/sign-in">
              <Button className="bg-[#26732d] hover:bg-[#1e5d26]">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getMembershipBonus = () => {
    const bonuses = {
      'Silver Paw': 0.5,
      'Golden Paw': 1.0,
      'Diamond Paw': 2.0,
    };
    return membership ? bonuses[membership as keyof typeof bonuses] || 0 : 0;
  };

  const calculateReward = () => {
    let reward = 1.0;
    const memberBonus = getMembershipBonus();
    reward += memberBonus;
    
    if (checkInStatus?.consecutiveDays === 6) {
      reward += 5; // Bonus for 7 days
    } else if (checkInStatus?.consecutiveDays === 29) {
      reward += 30; // Bonus for 30 days
    }
    
    return reward;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/wallet">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wallet
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Daily Check-in
          </h1>
          <p className="text-gray-600">Check in every day to earn rewards!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Check-in Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="w-6 h-6" />
                Today's Check-in
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                </div>
              ) : checkInStatus?.checkedInToday ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-300" />
                  <h3 className="text-2xl font-bold mb-2">Already Checked In!</h3>
                  <p className="text-blue-100">Come back tomorrow for more rewards</p>
                  <div className="mt-6 bg-white/20 rounded-lg p-4">
                    <p className="text-sm text-blue-100 mb-1">Current Streak</p>
                    <p className="text-3xl font-bold">{checkInStatus.consecutiveDays} Days</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                  <h3 className="text-2xl font-bold mb-2">Ready to Check In!</h3>
                  <p className="text-blue-100 mb-4">Earn {format(calculateReward())} today</p>
                  
                  <Button
                    onClick={handleCheckIn}
                    disabled={checking}
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold py-6 text-lg"
                  >
                    {checking ? 'Checking in...' : 'Check In Now'}
                  </Button>

                  {checkInStatus && checkInStatus.consecutiveDays > 0 && (
                    <div className="mt-6 bg-white/20 rounded-lg p-4">
                      <p className="text-sm text-blue-100 mb-1">Current Streak</p>
                      <p className="text-3xl font-bold">{checkInStatus.consecutiveDays} Days</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rewards Info */}
          <div className="space-y-6">
            {/* Base Rewards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Reward Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Daily Check-in</span>
                  <span className="font-bold text-green-600">{format(1.0)}</span>
                </div>
                
                {membership && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">{membership} Bonus</span>
                    <span className="font-bold text-yellow-600">+{format(getMembershipBonus())}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">7 Days Streak Bonus</span>
                  <span className="font-bold text-blue-600">+{format(5.0)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">30 Days Streak Bonus</span>
                  <span className="font-bold text-purple-600">+{format(30.0)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Streak Calendar Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Keep Your Streak!</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {[...Array(7)].map((_, i) => {
                    const dayNum = i + 1;
                    const isChecked = checkInStatus ? dayNum <= (checkInStatus.consecutiveDays % 7 || (checkInStatus.checkedInToday ? 7 : 0)) : false;
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${
                          isChecked
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isChecked ? <CheckCircle2 className="w-4 h-4" /> : dayNum}
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  {checkInStatus?.consecutiveDays > 0
                    ? `You're on a ${checkInStatus.consecutiveDays} day streak!`
                    : 'Start your streak today!'}
                </p>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-800">💡 Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-yellow-900">
                <p>• Check in every day to maintain your streak</p>
                <p>• Membership users get bonus rewards</p>
                <p>• Reach 7 and 30 day milestones for extra bonuses</p>
                <p>• Missing a day will reset your streak</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Wallet Balance */}
        {wallet && (
          <Card className="mt-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Wallet Balance:</span>
                <span className="text-2xl font-bold text-[#26732d]">{format(wallet.balance)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

