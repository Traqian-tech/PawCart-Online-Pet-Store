import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/contexts/wallet-context';
import { useCurrency } from '@/contexts/currency-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Trophy, Timer } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

type PetIcon = '🐕' | '🐈' | '🐇' | '🐹' | '🦜' | '🐠';

interface Cell {
  id: string;
  icon: PetIcon;
  matched: boolean;
  selected: boolean;
}

const PET_ICONS: PetIcon[] = ['🐕', '🐈', '🐇', '🐹', '🦜', '🐠'];
const GRID_SIZE = 8;
const INITIAL_TIME = 60; // 60 seconds per game

export default function MatchThreeGame() {
  const { user } = useAuth();
  const { refreshWallet, membership } = useWallet();
  const { format } = useCurrency();
  const { toast } = useToast();

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [score, setScore] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize grid
  useEffect(() => {
    initializeGrid();
  }, []);

  // Timer
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameOver]);

  // Check for matches on grid change
  useEffect(() => {
    if (grid.length > 0 && isPlaying && !isProcessing) {
      checkAndProcessMatches();
    }
  }, [grid, isPlaying]);

  const initializeGrid = () => {
    const newGrid: Cell[][] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      const rowCells: Cell[] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        rowCells.push({
          id: `${row}-${col}`,
          icon: getRandomPetIcon(),
          matched: false,
          selected: false,
        });
      }
      newGrid.push(rowCells);
    }
    setGrid(newGrid);
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setGameOver(false);
    setSelectedCell(null);
  };

  const getRandomPetIcon = (): PetIcon => {
    return PET_ICONS[Math.floor(Math.random() * PET_ICONS.length)];
  };

  const startGame = () => {
    setIsPlaying(true);
    initializeGrid();
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isPlaying || gameOver || isProcessing) return;

    const cell = grid[row][col];
    if (cell.matched) return;

    if (!selectedCell) {
      // Select first cell
      setSelectedCell({ row, col });
      setGrid(prev => {
        const newGrid = [...prev];
        newGrid[row][col] = { ...newGrid[row][col], selected: true };
        return newGrid;
      });
    } else {
      // Check if cells are adjacent
      const isAdjacent = 
        (Math.abs(selectedCell.row - row) === 1 && selectedCell.col === col) ||
        (Math.abs(selectedCell.col - col) === 1 && selectedCell.row === row);

      if (isAdjacent) {
        // Swap cells
        swapCells(selectedCell.row, selectedCell.col, row, col);
      }

      // Deselect
      setGrid(prev => {
        const newGrid = [...prev];
        newGrid[selectedCell.row][selectedCell.col] = { 
          ...newGrid[selectedCell.row][selectedCell.col], 
          selected: false 
        };
        return newGrid;
      });
      setSelectedCell(null);
    }
  };

  const swapCells = (row1: number, col1: number, row2: number, col2: number) => {
    setGrid(prev => {
      const newGrid = [...prev.map(row => [...row])];
      const temp = newGrid[row1][col1].icon;
      newGrid[row1][col1] = { ...newGrid[row1][col1], icon: newGrid[row2][col2].icon, selected: false };
      newGrid[row2][col2] = { ...newGrid[row2][col2], icon: temp };
      return newGrid;
    });
  };

  const checkAndProcessMatches = async () => {
    setIsProcessing(true);
    
    let foundMatches = false;
    const newGrid = [...grid.map(row => [...row])];

    // Check horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        const icon = newGrid[row][col].icon;
        if (
          !newGrid[row][col].matched &&
          newGrid[row][col + 1].icon === icon &&
          newGrid[row][col + 2].icon === icon
        ) {
          let matchLength = 3;
          for (let i = col + 3; i < GRID_SIZE && newGrid[row][i].icon === icon; i++) {
            matchLength++;
          }
          
          for (let i = 0; i < matchLength; i++) {
            newGrid[row][col + i].matched = true;
          }
          
          setScore(prev => prev + matchLength * 10);
          foundMatches = true;
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        const icon = newGrid[row][col].icon;
        if (
          !newGrid[row][col].matched &&
          newGrid[row + 1][col].icon === icon &&
          newGrid[row + 2][col].icon === icon
        ) {
          let matchLength = 3;
          for (let i = row + 3; i < GRID_SIZE && newGrid[i][col].icon === icon; i++) {
            matchLength++;
          }
          
          for (let i = 0; i < matchLength; i++) {
            newGrid[row + i][col].matched = true;
          }
          
          setScore(prev => prev + matchLength * 10);
          foundMatches = true;
        }
      }
    }

    if (foundMatches) {
      setGrid(newGrid);
      
      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Drop cells and fill empty spaces
      dropAndFillCells(newGrid);
    }

    setIsProcessing(false);
  };

  const dropAndFillCells = (currentGrid: Cell[][]) => {
    const newGrid = [...currentGrid.map(row => [...row])];

    // Drop existing cells
    for (let col = 0; col < GRID_SIZE; col++) {
      let emptySpaces = 0;
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (newGrid[row][col].matched) {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          newGrid[row + emptySpaces][col] = { ...newGrid[row][col] };
          newGrid[row][col] = {
            id: `${row}-${col}`,
            icon: getRandomPetIcon(),
            matched: false,
            selected: false,
          };
        }
      }
      
      // Fill top with new cells
      for (let row = 0; row < emptySpaces; row++) {
        newGrid[row][col] = {
          id: `${row}-${col}`,
          icon: getRandomPetIcon(),
          matched: false,
          selected: false,
        };
      }
    }

    setGrid(newGrid);
  };

  const calculateReward = (finalScore: number): number => {
    if (finalScore >= 5000) return 10;
    if (finalScore >= 3000) return 5;
    if (finalScore >= 2000) return 3;
    if (finalScore >= 1000) return 1;
    return 0;
  };

  const endGame = async () => {
    if (gameOver) return;
    
    setGameOver(true);
    setIsPlaying(false);

    if (!(user as any)?._id) {
      toast({
        title: 'Game Over!',
        description: `Final Score: ${score}`,
      });
      return;
    }

    try {
      const response = await fetch('/api/games/match-three', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: (user as any)._id,
          score
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Game Over',
          description: data.message || `Final Score: ${score}`,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: '🎉 Game Complete!',
        description: `Score: ${score} | Earned: ${format(data.reward)} | New Balance: ${format(data.newBalance)}`,
      });

      await refreshWallet();

    } catch (error) {
      console.error('End game error:', error);
      toast({
        title: 'Game Over',
        description: `Final Score: ${score}`,
      });
    }
  };

  const getMembershipMultiplier = () => {
    const multipliers = {
      'Silver Paw': 1.2,
      'Golden Paw': 1.5,
      'Diamond Paw': 2.0,
    };
    return membership ? multipliers[membership as keyof typeof multipliers] || 1.0 : 1.0;
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/wallet/games">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Match Three
          </h1>
          <p className="text-gray-600">Match 3 or more pet icons to earn points!</p>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Score</p>
              <p className="text-2xl font-bold text-purple-600">{score}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Timer className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Time Left</p>
              <p className="text-2xl font-bold text-blue-600">{timeLeft}s</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Sparkles className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Reward</p>
              <p className="text-lg font-bold text-green-600">
                {format(calculateReward(score))}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        <Card className="mb-6">
          <CardContent className="p-4 md:p-6">
            {!isPlaying && !gameOver && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎮</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Play?</h2>
                <p className="text-gray-600 mb-6">
                  Match 3 or more pet icons in a row to score points!
                  <br />
                  You have {INITIAL_TIME} seconds to get the highest score possible.
                </p>
                {membership && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 inline-block">
                    <p className="text-yellow-800 font-medium">
                      🌟 {membership} Bonus: {getMembershipMultiplier()}x rewards!
                    </p>
                  </div>
                )}
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-6 text-lg"
                >
                  Start Game
                </Button>
              </div>
            )}

            {gameOver && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Game Over!</h2>
                <p className="text-3xl font-bold text-purple-600 mb-4">
                  Score: {score}
                </p>
                <p className="text-xl text-green-600 mb-6">
                  You earned: {format(calculateReward(score))}
                </p>
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-6 text-lg"
                >
                  Play Again
                </Button>
              </div>
            )}

            {isPlaying && !gameOver && (
              <div className="grid grid-cols-8 gap-1 md:gap-2 max-w-2xl mx-auto">
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <button
                      key={cell.id}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`aspect-square text-2xl md:text-3xl flex items-center justify-center rounded-lg transition-all duration-200 ${
                        cell.matched
                          ? 'opacity-30 scale-75'
                          : cell.selected
                          ? 'bg-yellow-200 scale-110 shadow-lg'
                          : 'bg-white hover:bg-gray-50 hover:scale-105 shadow'
                      }`}
                      disabled={cell.matched || isProcessing}
                    >
                      {cell.icon}
                    </button>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-900">
            <p>1. Click on a pet icon to select it</p>
            <p>2. Click on an adjacent icon to swap positions</p>
            <p>3. Match 3 or more identical icons in a row (horizontal or vertical)</p>
            <p>4. Each match earns you points: 3 icons = 30 points, 4 icons = 40 points, etc.</p>
            <p>5. Complete the game within {INITIAL_TIME} seconds</p>
            <p>6. Reward tiers: 1000pts = {format(1)}, 2000pts = {format(3)}, 3000pts = {format(5)}, 5000pts = {format(10)}</p>
            <p>7. Membership users get reward multipliers!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

