import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { safeGetItem, safeSetItem, safeRemoveItem } from '@/lib/storage';

interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Add name property
  role?: string;
  profilePicture?: string;
}

// Helper: normalize membership so expired memberships are treated as none on the client
function normalizeUserMembership(rawUser: any): any {
  if (!rawUser || !rawUser.membership) return rawUser;

  const membership = rawUser.membership;
  if (!membership.expiryDate) return rawUser;

  const expiry = new Date(membership.expiryDate);
  const isLifetime =
    membership.lifetime === true ||
    (expiry instanceof Date && !isNaN(expiry.getTime()) && expiry.getFullYear() >= 9999);

  // If not lifetime and already expired (or invalid date), drop membership on client
  if (!isLifetime && (!expiry || isNaN(expiry.getTime()) || expiry <= new Date())) {
    const { membership: _ignored, ...rest } = rawUser;
    return rest;
  }

  return rawUser;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signOut: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
  loading: boolean;
  authMethod: 'supabase' | 'fallback' | null;
  connectionStats: { total: number; supabase: number; fallback: number };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'meow_meow_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMethod, setAuthMethod] = useState<'supabase' | 'fallback' | null>(null);
  const [connectionStats, setConnectionStats] = useState({ total: 0, supabase: 0, fallback: 0 });

  useEffect(() => {
    // Check for existing session on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check localStorage for persisted user
      const storedUser = safeGetItem(AUTH_STORAGE_KEY);
      const storedStats = safeGetItem('connection_stats');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const normalizedUser = normalizeUserMembership(parsedUser);
          setUser(normalizedUser);
          // Only set authMethod to 'supabase' if explicitly set
          // MongoDB users will have authMethod as null, undefined, or not 'supabase'
          const userAuthMethod = parsedUser.authMethod === 'supabase' ? 'supabase' : 
                                 parsedUser.authMethod === 'fallback' ? 'fallback' : null;
          setAuthMethod(userAuthMethod);
          console.log('Restored user from localStorage - Auth method:', userAuthMethod);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          safeRemoveItem(AUTH_STORAGE_KEY);
        }
      }
      
      if (storedStats) {
        try {
          setConnectionStats(JSON.parse(storedStats));
        } catch (error) {
          console.error('Failed to parse connection stats:', error);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check if we should use fallback due to connection limit
      const supabaseConnections = parseInt(safeGetItem('supabase_connections') || '0');
      const useFallback = supabaseConnections >= 190;
      
      if (useFallback) {
        console.log('Using fallback authentication due to connection limit');
      }

      // Call MongoDB login API
      // Note: /api/auth/login is the MongoDB authentication endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies to establish session
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // MongoDB user logged in successfully
        // Set authMethod to null for MongoDB users (not 'supabase' or 'fallback')
        // This ensures MongoDB users use MongoDB API for password changes
        const mongoDBAuthMethod: null = null;
        
        const normalizedUser = normalizeUserMembership(data.user);
        setUser(normalizedUser);
        setAuthMethod(mongoDBAuthMethod);
        
        // Update connection stats (track MongoDB logins separately)
        const stats = {
          total: connectionStats.total + 1,
          supabase: connectionStats.supabase,
          fallback: connectionStats.fallback
        };
        setConnectionStats(stats);
        safeSetItem('connection_stats', JSON.stringify(stats));
        
        // Persist user to localStorage with null authMethod (MongoDB user)
        safeSetItem(AUTH_STORAGE_KEY, JSON.stringify({ ...normalizedUser, authMethod: mongoDBAuthMethod }));
        console.log('MongoDB user signed in:', normalizedUser);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const signOut = () => {
    setUser(null);
    safeRemoveItem(AUTH_STORAGE_KEY);
    // Also remove any potential old auth keys for compatibility
    safeRemoveItem('auth_user');
    console.log('User signed out and storage cleared');
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!user) {
      return { success: false, message: 'No user logged in' };
    }

    try {
      const response = await fetch(`/api/auth/profile/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session authentication
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        // Update localStorage with new user data
        safeSetItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
        console.log('Profile updated successfully:', updatedUser);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      // Fetch fresh user data from server
      // Use email as primary identifier (most reliable), then fallback to other IDs
      const userIdentifier = user.email || (user as any)?._id || (user as any)?.id || user.id || user.username;
      
      console.log('Refreshing user with identifier:', userIdentifier);
      const response = await fetch(`/api/auth/profile/${encodeURIComponent(userIdentifier)}`, {
        credentials: 'include', // Include cookies for session authentication
      });
      
      if (response.ok) {
        const data = await response.json();
        // The API returns the user object directly, not wrapped in { user: ... }
        const mergedUser = { ...user, ...data };
        const updatedUser = normalizeUserMembership(mergedUser);
        setUser(updatedUser);
        safeSetItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
        console.log('✅ User data refreshed from server successfully!');
        console.log('Membership info:', (updatedUser as any).membership || 'None');
        return updatedUser;
      } else {
        console.error('Failed to refresh user data from server, status:', response.status);
        // Fallback to localStorage if server request fails
        const storedUser = safeGetItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            console.log('User data refreshed from localStorage (fallback)');
          } catch (e) {
            console.error('Failed to parse stored user:', e);
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // Fallback to localStorage on error
      const storedUser = safeGetItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, updateProfile, refreshUser, loading, authMethod, connectionStats }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}