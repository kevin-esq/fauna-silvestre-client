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
import { ValidationService } from '@/services/validation';
import User from '@/domain/entities/user.entity';
import { Credentials, UserData } from '@/domain/models/auth.models';
import { useApiStatus } from '@/presentation/contexts/api-status.context';
import { AUTH_CONTEXT_ERRORS } from '@/shared/constants/error-messages';
import type { AuthContextType } from './auth/types';
import {
  loadAuthDataFromStorage,
  clearAuthDataFromStorage,
  loadUserFromStorage
} from './auth/storage-utils';

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


  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        setStatus('BOOTING');

        const { user, accessToken, refreshToken } = await loadAuthDataFromStorage();

        if (ValidationService.validateAuthData(user, accessToken, refreshToken)) {
          authService.hydrate();
          setAuthenticatedUser(user!);
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
  }, [setStatus, setAuthenticatedUser]);

  useEffect(() => {
    const handleSignOutEvent = async (): Promise<void> => {
      try {
        await clearAuthDataFromStorage();
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
      await authService.loadUserData();
      const user = await loadUserFromStorage();

      if (user) {
        setAuthenticatedUser(user);
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
