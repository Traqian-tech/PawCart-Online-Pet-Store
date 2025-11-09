import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function DebugClearQuiz() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clearing, setClearing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleClear = async () => {
    if (!(user as any)?._id) {
      toast({
        title: 'Error',
        description: 'Please login first',
        variant: 'destructive',
      });
      return;
    }

    setClearing(true);
    try {
      const res = await fetch(`/api/games/quiz/clear?userId=${(user as any)._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setResult(data);
      toast({
        title: 'Success! ✅',
        description: `Cleared ${data.deletedCount} quiz records`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to clear records',
        variant: 'destructive',
      });
    } finally {
      setClearing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Please Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Link href="/games">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Button>
        </Link>

        <Card className="bg-white/80 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">🧹 Clear Quiz Records</CardTitle>
            <p className="text-gray-600 mt-2">Debug tool to reset your quiz game status</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Debug Tool:</strong> This will delete all your quiz game records,
                allowing you to play again today.
              </p>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-700">
                Current User ID: <code className="bg-gray-100 px-2 py-1 rounded">{(user as any)?._id}</code>
              </p>

              <Button
                onClick={handleClear}
                disabled={clearing}
                className="w-full bg-red-500 hover:bg-red-600"
                size="lg"
              >
                {clearing ? 'Clearing...' : '🗑️ Clear Quiz Records'}
              </Button>

              {result && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    ✅ Success! Deleted <strong>{result.deletedCount}</strong> records
                  </p>
                  <Link href="/games/pet-quiz">
                    <Button className="w-full mt-4" variant="outline">
                      Go to Quiz Game →
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

