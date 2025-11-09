import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/contexts/wallet-context';
import { useCurrency } from '@/contexts/currency-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock,
  Trophy,
  Sparkles,
  Brain
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "How many hours do cats typically sleep per day?",
    options: ["8-10 hours", "12-14 hours", "16-18 hours", "20-22 hours"],
    correctAnswer: 2,
    explanation: "Cats sleep 12-16 hours per day on average, and some can sleep up to 20 hours! They're crepuscular, meaning they're most active at dawn and dusk.",
    difficulty: 'easy'
  },
  {
    id: 2,
    question: "What is the average lifespan of a domestic indoor cat?",
    options: ["5-8 years", "10-12 years", "13-17 years", "20-25 years"],
    correctAnswer: 2,
    explanation: "Indoor cats typically live 13-17 years, with many living into their early 20s with proper care. Outdoor cats have shorter lifespans due to various risks.",
    difficulty: 'medium'
  },
  {
    id: 3,
    question: "How many teeth does an adult cat have?",
    options: ["24 teeth", "28 teeth", "30 teeth", "32 teeth"],
    correctAnswer: 2,
    explanation: "Adult cats have 30 teeth: 12 incisors, 4 canines, 10 premolars, and 4 molars. Kittens start with 26 baby teeth.",
    difficulty: 'hard'
  },
  {
    id: 4,
    question: "What is a group of cats called?",
    options: ["A pack", "A clowder", "A pride", "A colony"],
    correctAnswer: 1,
    explanation: "A group of cats is called a 'clowder'. A group of kittens is called a 'kindle'. The term 'colony' is also used for feral cat groups.",
    difficulty: 'medium'
  },
  {
    id: 5,
    question: "Which of these foods is toxic to cats?",
    options: ["Cooked chicken", "Onions and garlic", "Plain rice", "Cooked fish"],
    correctAnswer: 1,
    explanation: "Onions, garlic, and related plants (leeks, chives) are highly toxic to cats. They can damage red blood cells and cause anemia. Never feed these to cats!",
    difficulty: 'easy'
  },
  {
    id: 6,
    question: "What is the fastest speed a domestic cat can run?",
    options: ["20 mph", "30 mph", "40 mph", "50 mph"],
    correctAnswer: 1,
    explanation: "Domestic cats can run up to 30 mph (48 km/h) in short bursts. They're excellent sprinters but not built for long-distance running.",
    difficulty: 'medium'
  },
  {
    id: 7,
    question: "How many bones does a cat have in its body?",
    options: ["200 bones", "230 bones", "244 bones", "280 bones"],
    correctAnswer: 2,
    explanation: "Cats have approximately 244 bones, compared to humans who have 206. Their extra bones are mainly in their tail and spine, giving them incredible flexibility.",
    difficulty: 'hard'
  },
  {
    id: 8,
    question: "What is a cat's normal body temperature?",
    options: ["98.6°F (37°C)", "100.5-102.5°F (38-39°C)", "104-106°F (40-41°C)", "95-97°F (35-36°C)"],
    correctAnswer: 1,
    explanation: "A cat's normal body temperature ranges from 100.5-102.5°F (38-39°C), slightly higher than humans. Anything above 103°F may indicate fever.",
    difficulty: 'hard'
  },
  {
    id: 9,
    question: "Which sense is weakest in cats?",
    options: ["Smell", "Hearing", "Vision", "Taste"],
    correctAnswer: 3,
    explanation: "Cats have a relatively weak sense of taste compared to their other senses. They can't taste sweetness and have only about 470 taste buds (humans have 9,000).",
    difficulty: 'medium'
  },
  {
    id: 10,
    question: "What percentage of a cat's life is spent grooming?",
    options: ["5-10%", "15-30%", "30-50%", "50-70%"],
    correctAnswer: 2,
    explanation: "Cats spend approximately 30-50% of their waking hours grooming themselves. This helps regulate body temperature, stimulate blood flow, and maintain their coat.",
    difficulty: 'easy'
  }
];

const QUESTIONS_PER_GAME = 5;
const TIME_PER_QUESTION = 20; // seconds

export default function PetQuizGame() {
  const { user } = useAuth();
  const { wallet, membership, refreshWallet } = useWallet();
  const { format } = useCurrency();
  const [, navigate] = useLocation();

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [selectedQuestions, setSelectedQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [score, setScore] = useState(0);

  // Get game status
  const { data: gameStatus } = useQuery({
    queryKey: ['/api/games/daily-status', (user as any)?._id],
    queryFn: async () => {
      const userId = (user as any)?._id;
      if (!userId) return null;
      
      const res = await fetch(`/api/games/daily-status?userId=${userId}`, {
        credentials: 'include',
      });
      
      if (!res.ok) throw new Error('Failed to fetch game status');
      return res.json();
    },
    enabled: !!(user as any)?._id,
  });

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: async ({ correctAnswers, totalQuestions }: { correctAnswers: number; totalQuestions: number }) => {
      const res = await fetch('/api/games/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          userId: (user as any)?._id,
          correctAnswers,
          totalQuestions
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to submit quiz');
      }

      return res.json();
    },
    onSuccess: () => {
      refreshWallet();
    },
  });

  // Timer countdown
  useEffect(() => {
    if (gameState === 'playing' && !showResult && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, showResult, timeLeft]);

  const getMembershipMultiplier = () => {
    const multipliers = {
      'Silver Paw': 1.2,
      'Golden Paw': 1.5,
      'Diamond Paw': 2.0,
    };
    return membership ? multipliers[membership as keyof typeof multipliers] || 1 : 1;
  };

  const calculatePotentialReward = () => {
    // Max reward: $5.00 for perfect score
    const baseReward = 5.0;
    return baseReward * getMembershipMultiplier();
  };

  const calculateFinalReward = (correctCount: number) => {
    // Base reward calculation: $1 per correct answer
    const baseReward = correctCount * 1.0;
    return baseReward * getMembershipMultiplier();
  };

  const startGame = () => {
    // Randomly select 5 questions
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, QUESTIONS_PER_GAME);
    setSelectedQuestions(selected);
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setScore(0);
    setTimeLeft(TIME_PER_QUESTION);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleTimeout = () => {
    // Auto-submit as wrong answer when time runs out
    handleAnswerSubmit();
  };

  const handleAnswerSubmit = () => {
    if (showResult) return;

    const currentQuestion = selectedQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      const points = currentQuestion.difficulty === 'easy' ? 10 : 
                     currentQuestion.difficulty === 'medium' ? 20 : 30;
      setScore(prev => prev + points);
      setCorrectAnswers(prev => prev + 1);
    }

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(TIME_PER_QUESTION);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameState('finished');
    // Submit quiz results to backend
    await submitQuizMutation.mutateAsync({
      correctAnswers,
      totalQuestions: selectedQuestions.length
    });
  };

  const canPlayToday = () => {
    if (!gameStatus) return false;
    // Backend returns gamesByType object with counts
    return (gameStatus.gamesByType?.QUIZ || 0) === 0; // Only one quiz per day
  };

  const getNextAvailableTime = () => {
    if (!gameStatus?.gamesByType) return null;
    // If QUIZ count is 0, user can play now
    if ((gameStatus.gamesByType?.QUIZ || 0) === 0) return null;
    
    // Return tomorrow at midnight
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return tomorrow;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Please sign in to play Pet Quiz</p>
            <Link href="/sign-in">
              <Button className="bg-[#26732d] hover:bg-[#1e5d26]">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = selectedQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/wallet/games">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Games
            </Button>
          </Link>
          <div className="text-right">
            <p className="text-sm text-gray-600">Your Balance</p>
            <p className="text-xl font-bold text-[#26732d]">{format(wallet?.balance || 0)}</p>
          </div>
        </div>

        {/* Game Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Pet Quiz 📝
            </h1>
          </div>
          <p className="text-gray-600">Test your pet knowledge and earn rewards!</p>
        </div>

        {/* Ready State */}
        {gameState === 'ready' && (
          <div className="space-y-6">
            {/* Game Info */}
            <Card className="bg-white/80 backdrop-blur border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Game Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 mb-1">Questions</p>
                    <p className="text-2xl font-bold text-blue-900">{QUESTIONS_PER_GAME}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                    <p className="text-sm text-purple-700 mb-1">Time per Question</p>
                    <p className="text-2xl font-bold text-purple-900">{TIME_PER_QUESTION}s</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                    <p className="text-sm text-green-700 mb-1">Max Reward</p>
                    <p className="text-2xl font-bold text-green-900">{format(calculatePotentialReward())}</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg">
                    <p className="text-sm text-pink-700 mb-1">Your Multiplier</p>
                    <p className="text-2xl font-bold text-pink-900">{getMembershipMultiplier()}x</p>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Daily Limit</h3>
                  <p className="text-sm text-purple-700">
                    🎯 You can play Pet Quiz <strong>once per day</strong>
                  </p>
                  {!canPlayToday() && (
                    <p className="text-sm text-red-600 mt-2">
                      ⏰ Next available: {getNextAvailableTime()?.toLocaleString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-900">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-purple-900">
                <p>1. Answer 5 random pet knowledge questions</p>
                <p>2. You have 20 seconds to answer each question</p>
                <p>3. Easy questions = 10 points, Medium = 20 points, Hard = 30 points</p>
                <p>4. Each correct answer earns you {format(1.0)} (base reward)</p>
                <p>5. Maximum reward: {format(5.0)} for perfect score (5/5 correct)</p>
                <p>6. Membership users get reward multipliers!</p>
                <p>7. Review the correct answer and explanation after each question</p>
              </CardContent>
            </Card>

            {/* Play Button */}
            <Button
              size="lg"
              className="w-full h-16 text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={startGame}
              disabled={!canPlayToday() || submitQuizMutation.isPending}
            >
              {!canPlayToday() ? "Come Back Tomorrow!" : "Start Quiz 🧠"}
            </Button>
          </div>
        )}

        {/* Playing State */}
        {gameState === 'playing' && currentQuestion && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Question {currentQuestionIndex + 1} of {QUESTIONS_PER_GAME}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    Score: {score} points
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS_PER_GAME) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Timer */}
            <Card className={`${timeLeft <= 5 ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-200'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-2">
                  <Clock className={`w-5 h-5 ${timeLeft <= 5 ? 'text-red-600' : 'text-blue-600'}`} />
                  <span className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-600' : 'text-blue-600'}`}>
                    {timeLeft}s
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Question Card */}
            <Card className="bg-white/90 backdrop-blur border-purple-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-purple-900">{currentQuestion.question}</CardTitle>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {currentQuestion.difficulty.toUpperCase()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const shouldShowCorrect = showResult && isCorrect;
                  const shouldShowWrong = showResult && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => !showResult && setSelectedAnswer(index)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-lg text-left transition-all ${
                        shouldShowCorrect
                          ? 'bg-green-100 border-2 border-green-500 text-green-900'
                          : shouldShowWrong
                          ? 'bg-red-100 border-2 border-red-500 text-red-900'
                          : isSelected
                          ? 'bg-purple-100 border-2 border-purple-500 text-purple-900'
                          : 'bg-gray-50 border-2 border-gray-200 hover:bg-purple-50 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {shouldShowCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {shouldShowWrong && <XCircle className="w-5 h-5 text-red-600" />}
                      </div>
                    </button>
                  );
                })}

                {/* Explanation */}
                {showResult && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    selectedAnswer === currentQuestion.correctAnswer
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`font-semibold mb-2 ${
                      selectedAnswer === currentQuestion.correctAnswer ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {selectedAnswer === currentQuestion.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
                    </p>
                    <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {!showResult ? (
                <Button
                  size="lg"
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600"
                  onClick={handleAnswerSubmit}
                  disabled={selectedAnswer === null}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-blue-600"
                  onClick={handleNextQuestion}
                >
                  {currentQuestionIndex < QUESTIONS_PER_GAME - 1 ? 'Next Question →' : 'Finish Quiz 🎉'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Finished State */}
        {gameState === 'finished' && (
          <Card className="bg-white/90 backdrop-blur border-purple-200">
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              <div className="flex justify-center">
                <Trophy className="w-20 h-20 text-yellow-500" />
              </div>
              
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Quiz Complete! 🎉
              </h2>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 mb-1">Score</p>
                  <p className="text-3xl font-bold text-blue-900">{score}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <p className="text-sm text-purple-700 mb-1">Correct Answers</p>
                  <p className="text-3xl font-bold text-purple-900">{correctAnswers}/{QUESTIONS_PER_GAME}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                <p className="text-sm text-green-700 mb-2">🎁 You Earned</p>
                <p className="text-4xl font-bold text-green-600">
                  {format(calculateFinalReward(correctAnswers))}
                </p>
                {membership && (
                  <p className="text-sm text-green-700 mt-2">
                    With {membership} {getMembershipMultiplier()}x multiplier
                  </p>
                )}
              </div>

              {submitQuizMutation.isError && (
                <p className="text-red-600 text-sm">
                  {submitQuizMutation.error?.message || 'Failed to submit quiz'}
                </p>
              )}

              <div className="flex gap-4">
                <Link href="/wallet/games" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full">
                    Back to Games
                  </Button>
                </Link>
                <Link href="/wallet" className="flex-1">
                  <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    View Wallet
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

