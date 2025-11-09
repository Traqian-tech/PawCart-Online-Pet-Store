import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/contexts/wallet-context';
import { useCurrency } from '@/contexts/currency-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Clock } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function LuckyWheelGame() {
  const { user } = useAuth();
  const { refreshWallet } = useWallet();
  const { format } = useCurrency();
  const { toast } = useToast();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [canSpin, setCanSpin] = useState(false);
  const [nextAvailable, setNextAvailable] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  const prizes = [1, 2, 3, 5, 10, 20, 50];
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];

  useEffect(() => {
    if ((user as any)?._id) {
      checkAvailability();
    }
  }, [(user as any)?._id]);

  useEffect(() => {
    if (nextAvailable) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = nextAvailable.getTime() - now.getTime();

        if (diff <= 0) {
          setCanSpin(true);
          setTimeRemaining('');
          clearInterval(interval);
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          setTimeRemaining(
            `${days}d ${hours}h ${minutes}m ${seconds}s`
          );
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [nextAvailable]);

  const checkAvailability = async () => {
    // For now, we'll implement a simple check
    // In production, this would call an API endpoint
    setCanSpin(true);
  };

  const handleSpin = async () => {
    if (!(user as any)?._id || spinning || !canSpin) return;

    setSpinning(true);

    try {
      const response = await fetch('/api/games/lucky-wheel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: (user as any)._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Spin Failed',
          description: data.message || 'Something went wrong',
          variant: 'destructive',
        });

        if (data.nextAvailable) {
          setNextAvailable(new Date(data.nextAvailable));
          setCanSpin(false);
        }
        setSpinning(false);
        return;
      }

      // Calculate rotation based on prize position
      const prizeIndex = data.wheelPosition;
      const segmentAngle = 360 / prizes.length;
      const targetRotation = 360 * 5 + (prizeIndex * segmentAngle) + (segmentAngle / 2);
      
      setRotation(targetRotation);

      // Wait for spin animation
      await new Promise(resolve => setTimeout(resolve, 4000));

      toast({
        title: 'Congratulations! 🎉',
        description: `You won ${format(data.reward)}! New balance: ${format(data.newBalance)}`,
      });

      await refreshWallet();

      // Set next available time (7 days from now)
      const next = new Date();
      next.setDate(next.getDate() + 7);
      setNextAvailable(next);
      setCanSpin(false);

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to spin wheel. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSpinning(false);
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 py-8">
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
            Lucky Wheel
          </h1>
          <p className="text-gray-600">Spin the wheel and win amazing prizes!</p>
        </div>

        {/* Wheel Card */}
        <Card className="mb-6">
          <CardContent className="py-8">
            {/* Wheel Container */}
            <div className="relative max-w-md mx-auto mb-8">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-20">
                <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-lg" />
              </div>

              {/* Wheel */}
              <div className="relative aspect-square">
                <div 
                  className="absolute inset-0 rounded-full overflow-hidden shadow-2xl"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                  }}
                >
                  {prizes.map((prize, index) => {
                    const segmentAngle = 360 / prizes.length;
                    const startAngle = index * segmentAngle;
                    
                    return (
                      <div
                        key={index}
                        className="absolute w-full h-full"
                        style={{
                          transform: `rotate(${startAngle}deg)`,
                          transformOrigin: 'center',
                        }}
                      >
                        <div
                          className="absolute w-1/2 h-full left-1/2 origin-left flex items-center justify-center"
                          style={{
                            backgroundColor: colors[index],
                            clipPath: `polygon(0 0, 100% ${50 - Math.tan((segmentAngle / 2) * Math.PI / 180) * 50}%, 100% ${50 + Math.tan((segmentAngle / 2) * Math.PI / 180) * 50}%)`,
                          }}
                        >
                          <span className="text-white font-bold text-2xl ml-8">
                            {format(prize)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center z-10 border-4 border-yellow-400">
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Spin Button */}
            <div className="max-w-md mx-auto">
              {!canSpin && timeRemaining ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                  <p className="font-medium text-yellow-900 mb-2">Next spin available in:</p>
                  <p className="text-2xl font-bold text-yellow-700">{timeRemaining}</p>
                  <p className="text-sm text-yellow-600 mt-2">Lucky Wheel is available once per week</p>
                </div>
              ) : (
                <Button
                  onClick={handleSpin}
                  disabled={spinning || !canSpin}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 text-xl"
                >
                  {spinning ? (
                    'Spinning... 🎰'
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 mr-2" />
                      SPIN THE WHEEL!
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prizes List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Possible Prizes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {prizes.map((prize, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg text-center font-bold text-white"
                  style={{ backgroundColor: colors[index] }}
                >
                  {format(prize)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">ℹ️ How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-900">
            <p>• Free spin available once per week</p>
            <p>• Win between {format(1)} and {format(50)}</p>
            <p>• Membership users get bonus multipliers</p>
            <p>• Rewards are added directly to your wallet</p>
            <p>• Good luck! 🍀</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

