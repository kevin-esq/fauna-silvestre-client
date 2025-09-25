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

const ERROR_MESSAGES = {
  SIGN_IN: 'Error during sign in',
  SIGN_OUT: 'Error during sign out',
  REGISTRATION: 'Error during registration',
  RESET_EMAIL: 'Error sending reset code',
  RESET_CODE: 'Invalid or expired code',
  RESET_PASSWORD: 'Error changing password',
  LOAD_USER: 'Error loading user data',
  INITIALIZATION: 'Error during initialization'
} as const;

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

  const handleError = useCallback(
    (error: unknown, defaultMessage: string): string => {
      console.error('Auth error:', error);

      if (error instanceof Error) {
        switch (error.message.toLowerCase()) {
          case 'the username is incorrect':
            return 'El usuario no existe';
          case 'the password is incorrect':
            return 'La contraseña es incorrecta';
          case 'invalid credentials':
            return 'Credenciales inválidas';
          case 'user not found':
            return 'Usuario no encontrado';
          case 'account is disabled':
            return 'La cuenta está deshabilitada';
          case 'too many login attempts':
            return 'Demasiados intentos de inicio de sesión';
          case 'network error':
            return 'Error de conexión';
          case 'request timeout':
            return 'Tiempo de espera agotado';
          case 'the email is not registered':
            return 'El correo no existe';
          case 'failed: this email is already registered':
            return 'El correo ya esta registrado';
          case 'failed: this username is already registered':
            return 'El nombre de usuario ya esta registrado';
          default:
            return error.message || 'Error desconocido';
        }
      }

      return defaultMessage || 'Ocurrió un error inesperado';
    },
    []
  );

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
        console.error(ERROR_MESSAGES.INITIALIZATION, error);
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
        const errorMessage = handleError(error, ERROR_MESSAGES.SIGN_IN);
        setError(errorMessage);
        setStatus('UNAUTHENTICATED');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [setStatus, setAuthenticatedUser, handleError]
  );

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      await authService.signOut();
      resetAuthState();
    } catch (error) {
      const errorMessage = handleError(error, ERROR_MESSAGES.SIGN_OUT);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [resetAuthState, handleError]);

  const registerUser = useCallback(
    async (userData: UserData): Promise<void> => {
      setLoadingState(true, null);

      try {
        await authService.register(userData);
      } catch (error) {
        const errorMessage = handleError(error, ERROR_MESSAGES.REGISTRATION);
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, setLoadingState]
  );

  const sendResetPasswordEmail = useCallback(
    async (email: string): Promise<boolean> => {
      setLoadingState(true, null);

      try {
        return await authService.sendResetCode(email);
      } catch (error) {
        const errorMessage = handleError(error, ERROR_MESSAGES.RESET_EMAIL);
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, setLoadingState]
  );

  const verifyResetCode = useCallback(
    async (email: string, code: string): Promise<string> => {
      setLoadingState(true, null);

      try {
        return await authService.verifyResetCode(email, code);
      } catch (error) {
        const errorMessage = handleError(error, ERROR_MESSAGES.RESET_CODE);
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, setLoadingState]
  );

  const resetPassword = useCallback(
    async (token: string, email: string, password: string): Promise<void> => {
      setLoadingState(true, null);

      try {
        await authService.changePassword(email, password, token);
      } catch (error) {
        const errorMessage = handleError(error, ERROR_MESSAGES.RESET_PASSWORD);
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, setLoadingState]
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
      const errorMessage = handleError(error, ERROR_MESSAGES.LOAD_USER);
      setError(errorMessage);
      resetAuthState();
    } finally {
      setIsLoading(false);
    }
  }, [handleError, setAuthenticatedUser, resetAuthState]);

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
