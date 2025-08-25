// src/presentation/contexts/auth-context.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import { authService } from '../../services/auth/auth.factory';
import { authEventEmitter, AuthEvents } from '../../services/auth/auth.events';
import User from '../../domain/entities/user.entity';
import { Credentials, UserData } from '../../domain/models/auth.models';
import { useApiStatus } from '@/presentation/contexts/api-status.context';
import { getSecureStorageService } from '@/services/storage/secure-storage.service';
import {
  USER_KEY,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY
} from '@/services/storage/storage-keys';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initializing: boolean;
  error: string | null;
  signIn: (credentials: Credentials, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  registerUser: (userData: UserData) => Promise<void>;
  sendResetPasswordEmail: (email: string) => Promise<boolean>;
  verifyResetCode: (email: string, code: string) => Promise<string>;
  resetPassword: (
    token: string,
    email: string,
    password: string
  ) => Promise<void>;
  loadUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setStatus } = useApiStatus();

  useEffect(() => {
    const init = async () => {
      try {
        const storage = await getSecureStorageService();
        const storedUser = await storage.getValueFor(USER_KEY);
        const storedAccessToken = await storage.getValueFor(ACCESS_TOKEN_KEY);
        const storedRefreshToken = await storage.getValueFor(REFRESH_TOKEN_KEY);
        setStatus('BOOTING');

        const user = JSON.parse(storedUser || '{}');
        if (user && user.role && storedAccessToken && storedRefreshToken) {
          authService.hydrate();
          setUser(user);
          setIsAuthenticated(true);
          setStatus('AUTHENTICATED');
          setInitializing(false);
          return;
        } else {
          setStatus('UNAUTHENTICATED');
          setInitializing(false);
          setUser(null);
          setIsAuthenticated(false);
          return;
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        setStatus('UNAUTHENTICATED');
        setInitializing(false);
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    init();
  }, [setStatus]);

  useEffect(() => {
    const handleSignOut = () => {
      setUser(null);
      setIsAuthenticated(false);
      setStatus('UNAUTHENTICATED');
    };
    authEventEmitter.on(AuthEvents.USER_SIGNED_OUT, handleSignOut);
    return () => {
      authEventEmitter.off(AuthEvents.USER_SIGNED_OUT, handleSignOut);
    };
  }, [setStatus]);

  const signIn = useCallback(
    async (credentials: Credentials, rememberMe?: boolean) => {
      setIsLoading(true);
      setError(null);
      try {
        setStatus('AUTHENTICATING');
        const userEntity = await authService.signIn(credentials, rememberMe);
        setUser(userEntity);
        setIsAuthenticated(true);
        setStatus('AUTHENTICATED');
      } catch {
        setError('Error during sign in');
        setIsAuthenticated(false);
        setStatus('UNAUTHENTICATED');
      } finally {
        setIsLoading(false);
      }
    },
    [setStatus]
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setStatus('UNAUTHENTICATED');
    } catch {
      setError('Error during sign out');
    } finally {
      setIsLoading(false);
    }
  }, [setStatus]);

  const registerUser = useCallback(async (userData: UserData) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(userData);
    } catch {
      setError('Error during registration');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      const storage = await getSecureStorageService();
      await authService.loadUserData();
      const user = await storage.getValueFor(USER_KEY);
      if (user) {
        setUser(JSON.parse(user));
        setIsAuthenticated(true);
      }
    } catch {
      setError('Error during sign in');
      setIsAuthenticated(false);
      setStatus('UNAUTHENTICATED');
    } finally {
      setIsLoading(false);
    }
  }, [setStatus]);

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      initializing,
      error,
      signIn,
      signOut,
      registerUser,
      sendResetPasswordEmail: (email: string) =>
        authService.sendResetCode(email),
      verifyResetCode: (email: string, code: string) =>
        authService.verifyResetCode(email, code),
      resetPassword: (token: string, email: string, password: string) =>
        authService.changePassword(email, password, token),
      loadUserData
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      initializing,
      error,
      signIn,
      signOut,
      registerUser,
      loadUserData
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
