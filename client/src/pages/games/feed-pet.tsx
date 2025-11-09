import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/contexts/wallet-context';
import { useCurrency } from '@/contexts/currency-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function FeedPetGame() {
  const { user } = useAuth();
  const { refreshWallet } = useWallet();
  const { format } = useCurrency();
  const { toast } = useToast();
  const [playing, setPlaying] = useState(false);
  const [petHappiness, setPetHappiness] = useState(50);
  const [feedCount, setFeedCount] = useState(0);
  const [canPlay, setCanPlay] = useState(true);

  const pets = ['🐕', '🐈', '🐇', '🐹', '🦜'];
  const [currentPet] = useState(pets[Math.floor(Math.random() * pets.length)]);

  const handleFeed = async () => {
    if (!(user as any)?._id || playing) return;

    setPlaying(true);

    // Animate feeding
    setPetHappiness(prev => Math.min(prev + 20, 100));
    setFeedCount(prev => prev + 1);

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const response = await fetch('/api/games/feed-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: (user as any)._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Game Error',
          description: data.message || 'Something went wrong',
          variant: 'destructive',
        });
        
        if (data.waitTime) {
          setCanPlay(false);
          setTimeout(() => setCanPlay(true), data.waitTime * 1000);
        }
        return;
      }

      toast({
        title: 'Pet Fed Successfully! 🎉',
        description: `You earned ${format(data.reward)}! New balance: ${format(data.newBalance)}`,
      });

      await refreshWallet();

      // Wait before allowing next feed
      setCanPlay(false);
      setTimeout(() => {
        setCanPlay(true);
        setPetHappiness(50);
      }, 60000); // 60 seconds

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete game. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPlaying(false);
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
            <p className="text-gray-600 mb-4">Please sign in to play</p>
            <Link href="/sign-in">
              <Button className="bg-[#26732d] hover:bg-[#1e5d26]">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/wallet/games">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Feed the Pet
          </h1>
          <p className="text-gray-600">Feed your pet and earn rewards!</p>
        </div>

        {/* Game Area */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Your Pet</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Pet Display */}
            <div className="text-center mb-6">
              <div 
                className={`text-9xl mb-4 transition-transform duration-300 ${
                  playing ? 'scale-110' : 'scale-100'
                }`}
              >
                {currentPet}
              </div>
              
              {/* Happiness Bar */}
              <div className="max-w-xs mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Happiness</span>
                  <span className="text-sm font-bold text-pink-600">{petHappiness}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-pink-400 to-red-500 h-full rounded-full transition-all duration-500 flex items-center justify-center"
                    style={{ width: `${petHappiness}%` }}
                  >
                    {petHappiness >= 100 && (
                      <Sparkles className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mt-6">
                {petHappiness >= 80 && (
                  <p className="text-2xl animate-bounce">😊 Very Happy!</p>
                )}
                {petHappiness >= 50 && petHappiness < 80 && (
                  <p className="text-2xl">🙂 Content</p>
                )}
                {petHappiness < 50 && (
                  <p className="text-2xl">😕 Hungry</p>
                )}
              </div>
            </div>

            {/* Feed Button */}
            <Button
              onClick={handleFeed}
              disabled={playing || !canPlay}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-6 text-lg"
            >
              {playing ? (
                'Feeding... 🍖'
              ) : !canPlay ? (
                'Wait 60s before next feed ⏳'
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" />
                  Feed Pet
                </>
              )}
            </Button>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Times Fed</p>
                <p className="text-2xl font-bold text-yellow-600">{feedCount}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Reward Range</p>
                <p className="text-lg font-bold text-green-600">{format(0.5)} - {format(2.0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-900">
            <p>1. Click the "Feed Pet" button to feed your pet</p>
            <p>2. Your pet's happiness will increase</p>
            <p>3. Earn between {format(0.5)} and {format(2.0)} per feed</p>
            <p>4. Wait 60 seconds before feeding again</p>
            <p>5. Membership users earn bonus rewards!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

