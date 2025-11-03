import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import { authService } from '@/services/auth/auth.factory';
import { authEventEmitter, AuthEvents } from '@/services/auth/auth.events';
import { AuthErrorMapper } from '@/services/auth/auth-error.mapper';
import User from '@/domain/entities/user.entity';
import { Credentials, UserData } from '@/domain/models/auth.models';
import { useApiStatus } from '@/presentation/contexts/api-status.context';
import { getSecureStorageService } from '@/services/storage/secure-storage.service';
import {
  USER_KEY,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY
} from '@/services/storage/storage-keys';
import { AUTH_CONTEXT_ERRORS } from '@/shared/constants/error-messages';

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
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setStatus } = useApiStatus();

  const getErrorMessage = useCallback((error: unknown): string => {
    const authError = AuthErrorMapper.map(error);
    return authError.message;
  }, []);

  const resetAuthState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setStatus('UNAUTHENTICATED');
  }, [setStatus]);

  const setAuthenticatedUser = useCallback(
    (userEntity: User) => {
      setUser(userEntity);
      setIsAuthenticated(true);
      setStatus('AUTHENTICATED');
    },
    [setStatus]
  );

  const setLoadingState = useCallback(
    (loading: boolean, errorMsg: string | null = null) => {
      setIsLoading(loading);
      if (errorMsg !== null) {
        setError(errorMsg);
      }
    },
    []
  );

  const isValidUserData = (
    user: User,
    accessToken: string | null,
    refreshToken: string | null
  ): boolean => {
    return !!(user && user.role && accessToken && refreshToken);
  };

  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        const storage = await getSecureStorageService();
        const [storedUser, storedAccessToken, storedRefreshToken] =
          await Promise.all([
            storage.getValueFor(USER_KEY),
            storage.getValueFor(ACCESS_TOKEN_KEY),
            storage.getValueFor(REFRESH_TOKEN_KEY)
          ]);

        setStatus('BOOTING');

        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        if (
          isValidUserData(parsedUser, storedAccessToken, storedRefreshToken)
        ) {
          authService.hydrate();
          setAuthenticatedUser(parsedUser);
        } else {
          setStatus('UNAUTHENTICATED');
        }
      } catch (error) {
        console.error(AUTH_CONTEXT_ERRORS.INITIALIZATION, error);
        setStatus('UNAUTHENTICATED');
      } finally {
        setInitializing(false);
      }
    };

    initializeAuth();
  }, [setStatus, resetAuthState, setAuthenticatedUser]);

  useEffect(() => {
    const handleSignOutEvent = async (): Promise<void> => {
      try {
        const storage = await getSecureStorageService();
        await Promise.all([
          storage.deleteValueFor(USER_KEY),
          storage.deleteValueFor(ACCESS_TOKEN_KEY),
          storage.deleteValueFor(REFRESH_TOKEN_KEY)
        ]);
      } catch (error) {
        console.error('Error clearing storage during sign out:', error);
      }
      resetAuthState();
    };

    authEventEmitter.on(AuthEvents.USER_SIGNED_OUT, handleSignOutEvent);
    return () => {
      authEventEmitter.off(AuthEvents.USER_SIGNED_OUT, handleSignOutEvent);
    };
  }, [resetAuthState]);

  const signIn = useCallback(
    async (credentials: Credentials, rememberMe?: boolean): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        setStatus('AUTHENTICATING');
        const userEntity = await authService.signIn(credentials, rememberMe);
        setAuthenticatedUser(userEntity);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
        setStatus('UNAUTHENTICATED');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [setStatus, setAuthenticatedUser, getErrorMessage]
  );

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      await authService.signOut();
      resetAuthState();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [resetAuthState, getErrorMessage]);

  const registerUser = useCallback(
    async (userData: UserData): Promise<void> => {
      setLoadingState(true, null);

      try {
        await authService.register(userData);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [getErrorMessage, setLoadingState]
  );

  const sendResetPasswordEmail = useCallback(
    async (email: string): Promise<boolean> => {
      setLoadingState(true, null);

      try {
        return await authService.sendResetCode(email);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [getErrorMessage, setLoadingState]
  );

  const verifyResetCode = useCallback(
    async (email: string, code: string): Promise<string> => {
      setLoadingState(true, null);

      try {
        return await authService.verifyResetCode(email, code);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [getErrorMessage, setLoadingState]
  );

  const resetPassword = useCallback(
    async (token: string, email: string, password: string): Promise<void> => {
      setLoadingState(true, null);

      try {
        await authService.changePassword(email, password, token);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [getErrorMessage, setLoadingState]
  );

  const loadUserData = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      const storage = await getSecureStorageService();
      await authService.loadUserData();
      const storedUser = await storage.getValueFor(USER_KEY);

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setAuthenticatedUser(parsedUser);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      resetAuthState();
    } finally {
      setIsLoading(false);
    }
  }, [getErrorMessage, setAuthenticatedUser, resetAuthState]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
      sendResetPasswordEmail,
      verifyResetCode,
      resetPassword,
      loadUserData,
      clearError
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
      sendResetPasswordEmail,
      verifyResetCode,
      resetPassword,
      loadUserData,
      clearError
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
