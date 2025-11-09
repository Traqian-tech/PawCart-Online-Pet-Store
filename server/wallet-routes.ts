import type { Express } from "express";
import { Wallet, WalletTransaction, GameRecord, DailyCheckIn, UserTask, User } from "@shared/models";

// Wallet reward configuration
const REWARDS = {
  DAILY_CHECKIN: 1.0,
  DAILY_CHECKIN_BONUS: {
    7: 5,    // 7 consecutive days bonus
    30: 30,  // 30 consecutive days bonus
  },
  GAME: {
    FEED_PET: { min: 0.5, max: 2.0 },
    MATCH_THREE: {
      1000: 1,
      2000: 3,
      3000: 5,
      5000: 10,
    },
    LUCKY_WHEEL: [1, 2, 3, 5, 10, 20, 50], // Possible rewards
    QUIZ: {
      ALL_CORRECT: 5,
      PARTIAL: 2,
    }
  },
  TASK: {
    REVIEW_ORDER: 3,
    PHOTO_REVIEW: 5,
    SHARE_PRODUCT: 0.5,
    REFER_FRIEND: 20,
    REFEREE_BONUS: 10,
    FIRST_PURCHASE: 50,
    BIRTHDAY: 20,
    ANNIVERSARY: 30,
    SURVEY: 5,
    UPDATE_PROFILE: 2,
  },
  LIMITS: {
    MAX_DAILY_EARNING: 50,
    MAX_GAMES_PER_DAY: 10,
    MIN_GAME_INTERVAL: 60, // seconds
  }
};

// Membership multipliers
const MEMBERSHIP_MULTIPLIERS = {
  'Silver Paw': 1.2,
  'Golden Paw': 1.5,
  'Diamond Paw': 2.0,
};

const MEMBERSHIP_CHECKIN_BONUS = {
  'Silver Paw': 0.5,
  'Golden Paw': 1.0,
  'Diamond Paw': 2.0,
};

const MEMBERSHIP_WALLET_USAGE = {
  'Silver Paw': 0.4,   // 40%
  'Golden Paw': 0.5,   // 50%
  'Diamond Paw': 0.7,  // 70%
  'default': 0.3,      // 30% for non-members
};

// Helper: Get or create wallet
export async function getOrCreateWallet(userId: string) {
  let wallet = await Wallet.findOne({ userId });
  
  if (!wallet) {
    wallet = await Wallet.create({
      userId,
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      frozenBalance: 0,
    });
  }
  
  return wallet;
}

// Helper: Add wallet transaction
export async function addWalletTransaction(
  walletId: string,
  userId: string,
  type: 'EARN' | 'SPEND' | 'REFUND' | 'FREEZE' | 'UNFREEZE',
  source: string,
  amount: number,
  wallet: any,
  description?: string,
  metadata?: any
) {
  const balanceBefore = wallet.balance;
  let balanceAfter = balanceBefore;

  if (type === 'EARN' || type === 'REFUND') {
    balanceAfter = balanceBefore + amount;
    wallet.balance = balanceAfter;
    wallet.totalEarned += amount;
  } else if (type === 'SPEND') {
    balanceAfter = balanceBefore - amount;
    wallet.balance = balanceAfter;
    wallet.totalSpent += amount;
  } else if (type === 'FREEZE') {
    wallet.frozenBalance += amount;
    wallet.balance -= amount;
    balanceAfter = wallet.balance;
  } else if (type === 'UNFREEZE') {
    wallet.frozenBalance -= amount;
    wallet.balance += amount;
    balanceAfter = wallet.balance;
  }

  await wallet.save();

  const transaction = await WalletTransaction.create({
    walletId,
    userId,
    type,
    source,
    amount,
    balanceBefore,
    balanceAfter,
    description,
    metadata,
  });

  return transaction;
}

// Helper: Get user's membership tier
async function getUserMembership(userId: string) {
  const user = await User.findById(userId);
  return user?.membership?.tier || null;
}

// Helper: Apply membership multiplier
function applyMembershipMultiplier(amount: number, tier: string | null): number {
  if (!tier) return amount;
  const multiplier = MEMBERSHIP_MULTIPLIERS[tier as keyof typeof MEMBERSHIP_MULTIPLIERS] || 1;
  return amount * multiplier;
}

// Helper: Check daily earning limit
async function checkDailyEarningLimit(userId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const transactions = await WalletTransaction.find({
    userId,
    type: 'EARN',
    createdAt: { $gte: today }
  });
  
  const totalEarned = transactions.reduce((sum, t) => sum + t.amount, 0);
  return REWARDS.LIMITS.MAX_DAILY_EARNING - totalEarned;
}

export function registerWalletRoutes(app: Express) {
  
  // ========== WALLET ENDPOINTS ==========
  
  // Get wallet info
  app.get('/api/wallet', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const wallet = await getOrCreateWallet(userId);
      const membership = await getUserMembership(userId);
      const dailyEarningRemaining = await checkDailyEarningLimit(userId);
      
      res.json({
        wallet: {
          id: wallet._id,
          userId: wallet.userId,
          balance: wallet.balance,
          totalEarned: wallet.totalEarned,
          totalSpent: wallet.totalSpent,
          frozenBalance: wallet.frozenBalance,
        },
        membership,
        limits: {
          dailyEarningRemaining,
          maxDailyEarning: REWARDS.LIMITS.MAX_DAILY_EARNING,
          maxWalletUsagePercent: MEMBERSHIP_WALLET_USAGE[membership as keyof typeof MEMBERSHIP_WALLET_USAGE] || MEMBERSHIP_WALLET_USAGE.default,
        }
      });
    } catch (error) {
      console.error('Get wallet error:', error);
      res.status(500).json({ message: 'Failed to get wallet' });
    }
  });
  
  // Get wallet transactions
  app.get('/api/wallet/transactions', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const transactions = await WalletTransaction.find({ userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
      
      const total = await WalletTransaction.countDocuments({ userId });
      
      res.json({
        transactions,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        }
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ message: 'Failed to get transactions' });
    }
  });
  
  // ========== DAILY CHECK-IN ENDPOINTS ==========
  
  // Daily check-in
  app.post('/api/tasks/check-in', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Check if already checked in today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const existingCheckIn = await DailyCheckIn.findOne({
        userId,
        checkInDate: { $gte: today, $lt: tomorrow }
      });
      
      if (existingCheckIn) {
        return res.status(400).json({ message: 'Already checked in today' });
      }
      
      // Check yesterday's check-in for consecutive days
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayCheckIn = await DailyCheckIn.findOne({
        userId,
        checkInDate: { $gte: yesterday, $lt: today }
      }).sort({ checkInDate: -1 });
      
      let consecutiveDays = 1;
      if (yesterdayCheckIn) {
        consecutiveDays = yesterdayCheckIn.consecutiveDays + 1;
      }
      
      // Calculate reward
      let reward = REWARDS.DAILY_CHECKIN;
      const membership = await getUserMembership(userId);
      
      // Add membership bonus
      if (membership) {
        reward += MEMBERSHIP_CHECKIN_BONUS[membership as keyof typeof MEMBERSHIP_CHECKIN_BONUS] || 0;
      }
      
      // Add consecutive days bonus
      if (consecutiveDays === 7) {
        reward += REWARDS.DAILY_CHECKIN_BONUS[7];
      } else if (consecutiveDays === 30) {
        reward += REWARDS.DAILY_CHECKIN_BONUS[30];
      }
      
      // Check daily limit
      const remaining = await checkDailyEarningLimit(userId);
      if (remaining <= 0) {
        return res.status(400).json({ message: 'Daily earning limit reached' });
      }
      reward = Math.min(reward, remaining);
      
      // Create check-in record
      const checkIn = await DailyCheckIn.create({
        userId,
        checkInDate: new Date(),
        consecutiveDays,
        reward,
      });
      
      // Add to wallet
      const wallet = await getOrCreateWallet(userId);
      await addWalletTransaction(
        wallet._id.toString(),
        userId,
        'EARN',
        'DAILY_CHECKIN',
        reward,
        wallet,
        `Daily check-in reward (${consecutiveDays} consecutive days)`,
        { consecutiveDays }
      );
      
      res.json({
        message: 'Check-in successful',
        checkIn,
        reward,
        consecutiveDays,
        newBalance: wallet.balance,
      });
    } catch (error) {
      console.error('Check-in error:', error);
      res.status(500).json({ message: 'Failed to check in' });
    }
  });
  
  // Get daily check-in status
  app.get('/api/tasks/check-in/status', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayCheckIn = await DailyCheckIn.findOne({
        userId,
        checkInDate: { $gte: today, $lt: tomorrow }
      });
      
      const lastCheckIn = await DailyCheckIn.findOne({ userId })
        .sort({ checkInDate: -1 });
      
      res.json({
        checkedInToday: !!todayCheckIn,
        consecutiveDays: lastCheckIn?.consecutiveDays || 0,
        lastCheckInDate: lastCheckIn?.checkInDate,
      });
    } catch (error) {
      console.error('Get check-in status error:', error);
      res.status(500).json({ message: 'Failed to get check-in status' });
    }
  });
  
  // ========== TASK ENDPOINTS ==========
  
  // Get user task status
  app.get('/api/tasks/status', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Get all completed tasks for this user
      const completedTasks = await UserTask.find({
        userId,
        completed: true
      });
      
      const taskStatus: Record<string, boolean> = {};
      completedTasks.forEach(task => {
        taskStatus[task.taskType] = true;
      });
      
      res.json({
        completedTasks: taskStatus,
        taskList: completedTasks.map(t => ({
          taskType: t.taskType,
          completed: t.completed,
          reward: t.reward,
          completedAt: t.completedAt,
        }))
      });
    } catch (error) {
      console.error('Get task status error:', error);
      res.status(500).json({ message: 'Failed to get task status' });
    }
  });
  
  // Complete a task
  app.post('/api/tasks/complete', async (req, res) => {
    try {
      const { userId, taskType } = req.body;
      
      if (!userId || !taskType) {
        return res.status(400).json({ message: 'User ID and task type are required' });
      }
      
      // Validate task type
      const validTaskTypes = ['REVIEW_ORDER', 'PHOTO_REVIEW', 'SHARE_PRODUCT', 'REFER_FRIEND'];
      if (!validTaskTypes.includes(taskType)) {
        return res.status(400).json({ message: 'Invalid task type' });
      }
      
      // Check if task already completed
      const existingTask = await UserTask.findOne({
        userId,
        taskType,
        completed: true
      });
      
      if (existingTask) {
        return res.status(400).json({ message: 'Task already completed' });
      }
      
      // Get base reward
      const baseReward = REWARDS.TASK[taskType as keyof typeof REWARDS.TASK] || 0;
      
      if (baseReward === 0) {
        return res.status(400).json({ message: 'Invalid task type or reward not configured' });
      }
      
      // Get membership and calculate final reward
      const membership = await getUserMembership(userId);
      const finalReward = applyMembershipMultiplier(baseReward, membership);
      
      // Check daily earning limit
      const remaining = await checkDailyEarningLimit(userId);
      if (remaining <= 0) {
        return res.status(400).json({ message: 'Daily earning limit reached' });
      }
      
      const actualReward = Math.min(finalReward, remaining);
      
      // Create task record
      const userTask = await UserTask.create({
        userId,
        taskType,
        completed: true,
        reward: actualReward,
        completedAt: new Date(),
      });
      
      // Add to wallet
      const wallet = await getOrCreateWallet(userId);
      await addWalletTransaction(
        wallet._id.toString(),
        userId,
        'EARN',
        `TASK_${taskType}`,
        actualReward,
        wallet,
        `Task reward: ${taskType}`,
        { taskId: userTask._id, baseReward, membershipBonus: actualReward - baseReward }
      );
      
      res.json({
        message: 'Task completed successfully!',
        task: {
          taskType: userTask.taskType,
          reward: actualReward,
          baseReward,
          membershipBonus: actualReward - baseReward,
          completedAt: userTask.completedAt,
        },
        newBalance: wallet.balance,
      });
    } catch (error) {
      console.error('Complete task error:', error);
      res.status(500).json({ message: 'Failed to complete task' });
    }
  });
  
  // ========== GAME ENDPOINTS ==========
  
  // Get daily game status
  app.get('/api/games/daily-status', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayGames = await GameRecord.find({
        userId,
        playedAt: { $gte: today }
      });
      
      const gamesByType = {
        FEED_PET: todayGames.filter(g => g.gameType === 'FEED_PET').length,
        MATCH_THREE: todayGames.filter(g => g.gameType === 'MATCH_THREE').length,
        LUCKY_WHEEL: todayGames.filter(g => g.gameType === 'LUCKY_WHEEL').length,
        QUIZ: todayGames.filter(g => g.gameType === 'QUIZ').length,
      };
      
      const totalGamesToday = todayGames.length;
      const canPlayMore = totalGamesToday < REWARDS.LIMITS.MAX_GAMES_PER_DAY;
      
      res.json({
        gamesByType,
        totalGamesToday,
        maxGamesPerDay: REWARDS.LIMITS.MAX_GAMES_PER_DAY,
        canPlayMore,
      });
    } catch (error) {
      console.error('Get game status error:', error);
      res.status(500).json({ message: 'Failed to get game status' });
    }
  });
  
  // DEBUG: Clear quiz game records (temporary endpoint for testing)
  app.delete('/api/games/quiz/clear', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Delete all QUIZ game records for this user
      const result = await GameRecord.deleteMany({
        userId,
        gameType: 'QUIZ'
      });
      
      res.json({
        message: 'Quiz game records cleared',
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error('Clear quiz records error:', error);
      res.status(500).json({ message: 'Failed to clear quiz records' });
    }
  });
  
  // Play Feed Pet Game
  app.post('/api/games/feed-pet', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Check daily game limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayGames = await GameRecord.countDocuments({
        userId,
        playedAt: { $gte: today }
      });
      
      if (todayGames >= REWARDS.LIMITS.MAX_GAMES_PER_DAY) {
        return res.status(400).json({ message: 'Daily game limit reached' });
      }
      
      // Check interval between games
      const lastGame = await GameRecord.findOne({ userId })
        .sort({ playedAt: -1 });
      
      if (lastGame) {
        const timeSinceLastGame = (Date.now() - lastGame.playedAt.getTime()) / 1000;
        if (timeSinceLastGame < REWARDS.LIMITS.MIN_GAME_INTERVAL) {
          return res.status(400).json({ 
            message: 'Please wait before playing again',
            waitTime: Math.ceil(REWARDS.LIMITS.MIN_GAME_INTERVAL - timeSinceLastGame)
          });
        }
      }
      
      // Calculate random reward
      const baseReward = Math.random() * (REWARDS.GAME.FEED_PET.max - REWARDS.GAME.FEED_PET.min) + REWARDS.GAME.FEED_PET.min;
      const membership = await getUserMembership(userId);
      const reward = parseFloat(applyMembershipMultiplier(baseReward, membership).toFixed(2));
      
      // Check daily earning limit
      const remaining = await checkDailyEarningLimit(userId);
      if (remaining <= 0) {
        return res.status(400).json({ message: 'Daily earning limit reached' });
      }
      const finalReward = Math.min(reward, remaining);
      
      // Create game record
      const gameRecord = await GameRecord.create({
        userId,
        gameType: 'FEED_PET',
        score: 1,
        reward: finalReward,
        metadata: { membership },
      });
      
      // Add to wallet
      const wallet = await getOrCreateWallet(userId);
      await addWalletTransaction(
        wallet._id.toString(),
        userId,
        'EARN',
        'GAME_FEED_PET',
        finalReward,
        wallet,
        'Feed pet game reward',
        { gameId: gameRecord._id }
      );
      
      res.json({
        message: 'Game completed!',
        reward: finalReward,
        newBalance: wallet.balance,
        gameRecord,
      });
    } catch (error) {
      console.error('Feed pet game error:', error);
      res.status(500).json({ message: 'Failed to play game' });
    }
  });
  
  // Play Match Three Game
  app.post('/api/games/match-three', async (req, res) => {
    try {
      const { userId, score } = req.body;
      
      if (!userId || typeof score !== 'number') {
        return res.status(400).json({ message: 'User ID and score are required' });
      }
      
      // Check daily game limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayGames = await GameRecord.countDocuments({
        userId,
        playedAt: { $gte: today }
      });
      
      if (todayGames >= REWARDS.LIMITS.MAX_GAMES_PER_DAY) {
        return res.status(400).json({ message: 'Daily game limit reached' });
      }
      
      // Calculate reward based on score
      let baseReward = 0;
      if (score >= 5000) {
        baseReward = REWARDS.GAME.MATCH_THREE[5000];
      } else if (score >= 3000) {
        baseReward = REWARDS.GAME.MATCH_THREE[3000];
      } else if (score >= 2000) {
        baseReward = REWARDS.GAME.MATCH_THREE[2000];
      } else if (score >= 1000) {
        baseReward = REWARDS.GAME.MATCH_THREE[1000];
      }
      
      if (baseReward === 0) {
        return res.status(400).json({ message: 'Score too low for reward' });
      }
      
      const membership = await getUserMembership(userId);
      const reward = parseFloat(applyMembershipMultiplier(baseReward, membership).toFixed(2));
      
      // Check daily earning limit
      const remaining = await checkDailyEarningLimit(userId);
      if (remaining <= 0) {
        return res.status(400).json({ message: 'Daily earning limit reached' });
      }
      const finalReward = Math.min(reward, remaining);
      
      // Create game record
      const gameRecord = await GameRecord.create({
        userId,
        gameType: 'MATCH_THREE',
        score,
        reward: finalReward,
        metadata: { membership },
      });
      
      // Add to wallet
      const wallet = await getOrCreateWallet(userId);
      await addWalletTransaction(
        wallet._id.toString(),
        userId,
        'EARN',
        'GAME_MATCH_THREE',
        finalReward,
        wallet,
        `Match three game reward (score: ${score})`,
        { gameId: gameRecord._id, score }
      );
      
      res.json({
        message: 'Game completed!',
        score,
        reward: finalReward,
        newBalance: wallet.balance,
        gameRecord,
      });
    } catch (error) {
      console.error('Match three game error:', error);
      res.status(500).json({ message: 'Failed to submit score' });
    }
  });
  
  // Play Lucky Wheel Game
  app.post('/api/games/lucky-wheel', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Check if user can play (once per week)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentWheel = await GameRecord.findOne({
        userId,
        gameType: 'LUCKY_WHEEL',
        playedAt: { $gte: oneWeekAgo }
      });
      
      if (recentWheel) {
        const nextAvailable = new Date(recentWheel.playedAt);
        nextAvailable.setDate(nextAvailable.getDate() + 7);
        return res.status(400).json({ 
          message: 'Lucky wheel available once per week',
          nextAvailable
        });
      }
      
      // Random reward
      const rewards = REWARDS.GAME.LUCKY_WHEEL;
      const randomIndex = Math.floor(Math.random() * rewards.length);
      const baseReward = rewards[randomIndex];
      
      const membership = await getUserMembership(userId);
      const reward = parseFloat(applyMembershipMultiplier(baseReward, membership).toFixed(2));
      
      // Check daily earning limit
      const remaining = await checkDailyEarningLimit(userId);
      const finalReward = Math.min(reward, remaining);
      
      // Create game record
      const gameRecord = await GameRecord.create({
        userId,
        gameType: 'LUCKY_WHEEL',
        score: randomIndex,
        reward: finalReward,
        metadata: { membership, wheelPosition: randomIndex },
      });
      
      // Add to wallet
      const wallet = await getOrCreateWallet(userId);
      await addWalletTransaction(
        wallet._id.toString(),
        userId,
        'EARN',
        'GAME_LUCKY_WHEEL',
        finalReward,
        wallet,
        'Lucky wheel reward',
        { gameId: gameRecord._id }
      );
      
      res.json({
        message: 'Lucky spin!',
        reward: finalReward,
        wheelPosition: randomIndex,
        newBalance: wallet.balance,
        gameRecord,
      });
    } catch (error) {
      console.error('Lucky wheel game error:', error);
      res.status(500).json({ message: 'Failed to spin wheel' });
    }
  });
  
  // Play Quiz Game
  app.post('/api/games/quiz', async (req, res) => {
    try {
      const { userId, correctAnswers, totalQuestions } = req.body;
      
      if (!userId || typeof correctAnswers !== 'number' || typeof totalQuestions !== 'number') {
        return res.status(400).json({ message: 'Invalid request data' });
      }
      
      // Check daily game limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayQuiz = await GameRecord.findOne({
        userId,
        gameType: 'QUIZ',
        playedAt: { $gte: today }
      });
      
      if (todayQuiz) {
        return res.status(400).json({ message: 'Quiz available once per day' });
      }
      
      // Calculate reward: $1 per correct answer
      const baseReward = correctAnswers * 1.0;
      
      if (baseReward === 0) {
        return res.status(400).json({ message: 'No correct answers, no reward' });
      }
      
      const membership = await getUserMembership(userId);
      const reward = parseFloat(applyMembershipMultiplier(baseReward, membership).toFixed(2));
      
      // Check daily earning limit
      const remaining = await checkDailyEarningLimit(userId);
      const finalReward = Math.min(reward, remaining);
      
      // Create game record
      const gameRecord = await GameRecord.create({
        userId,
        gameType: 'QUIZ',
        score: correctAnswers,
        reward: finalReward,
        metadata: { membership, totalQuestions, correctAnswers },
      });
      
      // Add to wallet
      const wallet = await getOrCreateWallet(userId);
      await addWalletTransaction(
        wallet._id.toString(),
        userId,
        'EARN',
        'GAME_QUIZ',
        finalReward,
        wallet,
        `Quiz game reward (${correctAnswers}/${totalQuestions} correct)`,
        { gameId: gameRecord._id, correctAnswers, totalQuestions }
      );
      
      res.json({
        message: 'Quiz completed!',
        correctAnswers,
        totalQuestions,
        reward: finalReward,
        newBalance: wallet.balance,
        gameRecord,
      });
    } catch (error) {
      console.error('Quiz game error:', error);
      res.status(500).json({ message: 'Failed to submit quiz' });
    }
  });
  
  // Get game leaderboard
  app.get('/api/games/leaderboard', async (req, res) => {
    try {
      const gameType = req.query.gameType as string;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!gameType) {
        return res.status(400).json({ message: 'Game type is required' });
      }
      
      // Get top players for the game type
      const leaderboard = await GameRecord.aggregate([
        { $match: { gameType } },
        { 
          $group: {
            _id: '$userId',
            totalScore: { $sum: '$score' },
            totalReward: { $sum: '$reward' },
            gamesPlayed: { $sum: 1 },
            bestScore: { $max: '$score' },
          }
        },
        { $sort: { totalScore: -1 } },
        { $limit: limit }
      ]);
      
      // Populate user info
      for (const entry of leaderboard) {
        const user = await User.findById(entry._id);
        entry.username = user?.username || 'Anonymous';
        entry.membership = user?.membership?.tier || null;
      }
      
      res.json({ leaderboard });
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ message: 'Failed to get leaderboard' });
    }
  });
  
  console.log('✅ Wallet routes registered');
}

