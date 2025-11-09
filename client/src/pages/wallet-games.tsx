import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/contexts/wallet-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Gamepad2, Trophy, Clock } from 'lucide-react';
import { Link } from 'wouter';

export default function WalletGamesPage() {
  const { user } = useAuth();
  const { membership } = useWallet();
  const [gameStatus, setGameStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ((user as any)?._id) {
      loadGameStatus();
    }
  }, [(user as any)?._id]);

  const loadGameStatus = async () => {
    if (!(user as any)?._id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/games/daily-status?userId=${(user as any)._id}`);
      if (!response.ok) throw new Error('Failed to load game status');
      
      const data = await response.json();
      setGameStatus(data);
    } catch (error) {
      console.error('Load game status error:', error);
    } finally {
      setLoading(false);
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
            <p className="text-gray-600 mb-4">Please sign in to play games</p>
            <Link href="/sign-in">
              <Button className="bg-[#26732d] hover:bg-[#1e5d26]">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const games = [
    {
      id: 'feed-pet',
      name: 'Feed the Pet',
      icon: '🐕',
      description: 'Feed your virtual pet and earn rewards!',
      reward: '$0.50 - $2.00',
      color: 'from-yellow-400 to-orange-500',
      path: '/wallet/games/feed-pet',
    },
    {
      id: 'match-three',
      name: 'Match Three',
      icon: '🎮',
      description: 'Match 3 or more pet icons to earn points!',
      reward: 'Up to $10.00',
      color: 'from-purple-400 to-pink-500',
      path: '/wallet/games/match-three',
    },
    {
      id: 'lucky-wheel',
      name: 'Lucky Wheel',
      icon: '🎰',
      description: 'Spin the wheel for a chance to win big!',
      reward: '$1 - $50',
      color: 'from-green-400 to-cyan-500',
      path: '/wallet/games/lucky-wheel',
    },
    {
      id: 'quiz',
      name: 'Pet Quiz',
      icon: '📝',
      description: 'Test your pet knowledge!',
      reward: 'Up to $5.00',
      color: 'from-blue-400 to-indigo-500',
      path: '/wallet/games/quiz',
    },
  ];

  const getMembershipMultiplier = () => {
    const multipliers = {
      'Silver Paw': '1.2x',
      'Golden Paw': '1.5x',
      'Diamond Paw': '2.0x',
    };
    return membership ? multipliers[membership as keyof typeof multipliers] : '1.0x';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/wallet">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wallet
            </Button>
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Game Center
              </h1>
              <p className="text-gray-600">Play fun games and earn wallet rewards!</p>
            </div>
            {membership && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
                {membership} - {getMembershipMultiplier()} Rewards
              </div>
            )}
          </div>
        </div>

        {/* Game Status */}
        {gameStatus && (
          <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Clock className="w-6 h-6 text-indigo-600" />
                  <div>
                    <p className="font-medium text-indigo-900">Games Played Today</p>
                    <p className="text-sm text-indigo-600">
                      {gameStatus.totalGamesToday} / {gameStatus.maxGamesPerDay}
                    </p>
                  </div>
                </div>
                {!gameStatus.canPlayMore && (
                  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium">
                    Daily limit reached. Come back tomorrow!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {games.map((game) => (
            <Card 
              key={game.id}
              className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${game.color}`} />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{game.icon}</div>
                    <div>
                      <CardTitle className="text-xl">{game.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{game.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Reward:</span>
                    <span className="font-bold text-green-600">{game.reward}</span>
                  </div>
                  {membership && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Your Multiplier:</span>
                      <span className="font-bold text-yellow-600">{getMembershipMultiplier()}</span>
                    </div>
                  )}
                </div>

                <Link href={game.path}>
                  <Button 
                    className={`w-full bg-gradient-to-r ${game.color} text-white font-bold hover:opacity-90 transition-opacity`}
                    disabled={!gameStatus?.canPlayMore && game.id !== 'lucky-wheel'}
                  >
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Play Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leaderboard Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Top Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Leaderboard coming soon! Compete with other players for top spots.
            </p>
          </CardContent>
        </Card>

        {/* Game Rules */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">📋 Game Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-900">
            <p>• Maximum {gameStatus?.maxGamesPerDay || 10} games per day across all game types</p>
            <p>• Minimum 60 seconds between games</p>
            <p>• Daily earning limit: $50.00</p>
            <p>• Membership users receive reward multipliers</p>
            <p>• Lucky Wheel available once per week</p>
            <p>• Pet Quiz available once per day</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

