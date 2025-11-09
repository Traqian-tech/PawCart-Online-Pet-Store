import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/contexts/wallet-context';
import { useCurrency } from '@/contexts/currency-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Gift, 
  ArrowLeft, 
  CheckCircle2, 
  Star, 
  Camera, 
  Share2, 
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  name: string;
  description: string;
  reward: number;
  icon: React.ReactNode;
  color: string;
  completed: boolean;
  available: boolean;
}

export default function WalletTasksPage() {
  const { user } = useAuth();
  const { wallet, membership, refreshWallet } = useWallet();
  const { format } = useCurrency();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [completingTask, setCompletingTask] = useState<string | null>(null);

  // Task ID to API task type mapping
  const taskTypeMap: Record<string, string> = {
    'review-order': 'REVIEW_ORDER',
    'photo-review': 'PHOTO_REVIEW',
    'share-product': 'SHARE_PRODUCT',
    'refer-friend': 'REFER_FRIEND',
  };

  useEffect(() => {
    if ((user as any)?._id) {
      loadTasks();
    }
  }, [(user as any)?._id]);

  const loadTasks = async () => {
    if (!(user as any)?._id) return;

    setLoading(true);
    try {
      // Fetch task status from API
      const statusResponse = await fetch(`/api/tasks/status?userId=${(user as any)._id}`);
      const statusData = await statusResponse.json();
      const completedTasks = statusData.completedTasks || {};

      // Define default tasks
      const defaultTasks: Task[] = [
        {
          id: 'review-order',
          name: 'Review Order',
          description: 'Leave a review for your recent order',
          reward: 3.0,
          icon: <Star className="w-6 h-6" />,
          color: 'from-yellow-400 to-orange-500',
          completed: completedTasks['REVIEW_ORDER'] || false,
          available: true,
        },
        {
          id: 'photo-review',
          name: 'Photo Review',
          description: 'Upload a photo with your review',
          reward: 5.0,
          icon: <Camera className="w-6 h-6" />,
          color: 'from-blue-400 to-cyan-500',
          completed: completedTasks['PHOTO_REVIEW'] || false,
          available: true,
        },
        {
          id: 'share-product',
          name: 'Share Product',
          description: 'Share a product on social media',
          reward: 0.5,
          icon: <Share2 className="w-6 h-6" />,
          color: 'from-purple-400 to-pink-500',
          completed: completedTasks['SHARE_PRODUCT'] || false,
          available: true,
        },
        {
          id: 'refer-friend',
          name: 'Refer Friend',
          description: 'Invite a friend to join',
          reward: 20.0,
          icon: <Users className="w-6 h-6" />,
          color: 'from-green-400 to-emerald-500',
          completed: completedTasks['REFER_FRIEND'] || false,
          available: true,
        },
      ];

      setTasks(defaultTasks);
    } catch (error) {
      console.error('Load tasks error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!(user as any)?._id) return;

    const taskType = taskTypeMap[taskId];
    if (!taskType) {
      toast({
        title: 'Error',
        description: 'Invalid task type',
        variant: 'destructive',
      });
      return;
    }

    setCompletingTask(taskId);
    try {
      const response = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: (user as any)._id,
          taskType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete task');
      }

      // Update task status
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, completed: true }
            : task
        )
      );

      // Refresh wallet balance
      await refreshWallet();

      toast({
        title: 'Task Completed! 🎉',
        description: `You earned ${format(data.task.reward)}! Your new balance is ${format(data.newBalance)}.`,
      });
    } catch (error: any) {
      console.error('Complete task error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCompletingTask(null);
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
            <p className="text-gray-600 mb-4">Please sign in to view tasks</p>
            <Link href="/sign-in">
              <Button className="bg-[#26732d] hover:bg-[#1e5d26]">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getMembershipMultiplier = () => {
    const multipliers = {
      'Silver Paw': 1.2,
      'Golden Paw': 1.5,
      'Diamond Paw': 2.0,
    };
    return membership ? multipliers[membership as keyof typeof multipliers] || 1 : 1;
  };

  const calculateReward = (baseReward: number) => {
    const multiplier = getMembershipMultiplier();
    return baseReward * multiplier;
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalRewards = tasks
    .filter(t => !t.completed)
    .reduce((sum, task) => sum + calculateReward(task.reward), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
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
                Complete Tasks
              </h1>
              <p className="text-gray-600">Earn rewards by completing tasks!</p>
            </div>
            {membership && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
                {membership} - Bonus Rewards Active
              </div>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <Card className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-green-100 text-sm mb-1">Tasks Completed</p>
                <p className="text-3xl font-bold">{completedTasks} / {tasks.length}</p>
              </div>
              <div>
                <p className="text-green-100 text-sm mb-1">Total Rewards Available</p>
                <p className="text-3xl font-bold">{format(totalRewards)}</p>
              </div>
              <div>
                <p className="text-green-100 text-sm mb-1">Current Balance</p>
                <p className="text-3xl font-bold">{format(wallet?.balance || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26732d] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {tasks.map((task) => (
              <Card 
                key={task.id}
                className={`hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
                  task.completed ? 'opacity-75' : ''
                }`}
              >
                <div className={`h-2 bg-gradient-to-r ${task.color}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${task.color} text-white`}>
                        {task.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl flex items-center gap-2">
                          {task.name}
                          {task.completed && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-gray-700">Base Reward:</span>
                      <span className="font-bold text-green-600">{format(task.reward)}</span>
                    </div>
                    {membership && (
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="font-medium text-gray-700">{membership} Bonus:</span>
                        <span className="font-bold text-yellow-600">
                          +{format(calculateReward(task.reward) - task.reward)} ({getMembershipMultiplier()}x)
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-gray-700">Total Reward:</span>
                      <span className="font-bold text-blue-600 text-lg">
                        {format(calculateReward(task.reward))}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={task.completed || !task.available || completingTask === task.id}
                    className={`w-full bg-gradient-to-r ${task.color} text-white font-bold hover:opacity-90 transition-opacity`}
                  >
                    {completingTask === task.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Completing...
                      </>
                    ) : task.completed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        Complete Task
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* How It Works */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-blue-900">
              <p>• Complete tasks to earn wallet rewards</p>
              <p>• Each task can only be completed once</p>
              <p>• Rewards are added directly to your wallet</p>
              <p>• Membership users receive bonus rewards</p>
              <p>• Check back regularly for new tasks</p>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">💡 Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-yellow-900">
              <p>• Complete all tasks to maximize your rewards</p>
              <p>• Upgrade your membership for bonus rewards</p>
              <p>• Share products to help others discover great deals</p>
              <p>• Refer friends for the highest rewards</p>
              <p>• Photo reviews earn more than text reviews</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

