// src/lib/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, getCurrentUser, logout as apiLogout } from './api';

interface User {
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        // Token invalid or expired
        await SecureStore.deleteItemAsync('token');
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await apiLogin(username, password);
    setUser({ username, isAdmin: result.isAdmin });
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.isAdmin ?? false,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
