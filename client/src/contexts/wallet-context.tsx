import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface WalletData {
  id: string;
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  frozenBalance: number;
}

interface WalletLimits {
  dailyEarningRemaining: number;
  maxDailyEarning: number;
  maxWalletUsagePercent: number;
}

interface WalletTransaction {
  _id: string;
  walletId: string;
  userId: string;
  type: 'EARN' | 'SPEND' | 'REFUND' | 'FREEZE' | 'UNFREEZE';
  source: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  metadata?: any;
  createdAt: string;
}

interface WalletContextType {
  wallet: WalletData | null;
  limits: WalletLimits | null;
  membership: string | null;
  transactions: WalletTransaction[];
  loading: boolean;
  error: string | null;
  refreshWallet: () => Promise<void>;
  loadTransactions: (limit?: number, offset?: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [limits, setLimits] = useState<WalletLimits | null>(null);
  const [membership, setMembership] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshWallet = async () => {
    if (!(user as any)?._id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/wallet?userId=${(user as any)._id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch wallet data');
      }

      const data = await response.json();
      setWallet(data.wallet);
      setLimits(data.limits);
      setMembership(data.membership);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Wallet fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (limit = 50, offset = 0) => {
    if (!(user as any)?._id) return;

    try {
      const response = await fetch(
        `/api/wallet/transactions?userId=${(user as any)._id}&limit=${limit}&offset=${offset}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      
      if (offset === 0) {
        setTransactions(data.transactions);
      } else {
        setTransactions(prev => [...prev, ...data.transactions]);
      }
    } catch (err) {
      console.error('Transactions fetch error:', err);
    }
  };

  useEffect(() => {
    if ((user as any)?._id) {
      refreshWallet();
      loadTransactions();
    }
  }, [(user as any)?._id]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        limits,
        membership,
        transactions,
        loading,
        error,
        refreshWallet,
        loadTransactions,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

