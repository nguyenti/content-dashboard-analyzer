import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const DEBUG = import.meta.env.VITE_DEBUG === 'true';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: 'admin' | 'user' | 'viewer';
  created_at: string;
  last_login?: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEBUG) console.log('🔍 AuthProvider mounted, checking auth...');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (DEBUG) console.log('📡 Checking auth status...');
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      
      if (DEBUG) {
        console.log('📡 Auth check response:', {
          status: response.status,
          ok: response.ok,
          url: response.url
        });
      }
      
      if (response.ok) {
        const userData = await response.json();
        if (DEBUG) console.log('✅ User authenticated:', userData.email);
        setUser(userData);
      } else {
        if (DEBUG) console.log('❌ User not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Redirect to Google OAuth
    if (DEBUG) {
      console.log('🚀 Login button clicked, redirecting to Google OAuth...');
      console.log('🔗 Redirecting to:', '/auth/google');
    }
    window.location.href = '/auth/google';
  };

  const logout = async () => {
    try {
      if (DEBUG) console.log('📤 Logging out...');
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      if (DEBUG) console.log('✅ Logout successful, redirecting to login');
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout on client side even if server request fails
      setUser(null);
      window.location.href = '/login';
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};