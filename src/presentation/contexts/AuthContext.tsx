// src/presentation/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import  { AuthService }  from '../../services/auth/AuthService';
import  User  from '../../domain/entities/User';
import {Credentials, UserData} from '../../domain/models/AuthModels';
import {NavigateReset} from "../../shared/utils/navigation";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  registerUser: (userData: UserData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
  authService: AuthService;
}

export const AuthProvider = ({ children, authService }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const initializeAuth = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      setState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } catch (error) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, [authService]);

  useEffect(() => {
    initializeAuth().then(r => console.log(r));
  }, [initializeAuth]);

  const signIn = useCallback(async (credentials: Credentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await authService.httpClient.instance.post<{}>('/Authentication/LogIn', credentials);

      const accessToken = response.data.toString();

      await authService.setTokens(
          accessToken,
          accessToken
      );

      // Obtener información completa del usuario
      const user = await authService.getCurrentUser();

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

    } catch (error) {
      await authService.clearTokens();
      setState({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  }, [authService]);

  const signOut = useCallback(async () => {
    try {
      await authService.httpClient.instance.post('/auth/logout');
    } finally {
      await authService.clearTokens();
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, [authService]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await authService.httpClient.instance.post<{}>('/Authentication/LogIn', { email });
    } catch (error) {
      throw error;
    }
  }, [authService]);

  const registerUser = useCallback(async (userData: UserData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await authService.httpClient.instance.post<{}>('/Users/Register', userData);
      setState({ user: null, isAuthenticated: false, isLoading: false });
      NavigateReset("Login");
    } catch (error) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  }, [authService]);

  const refreshAuth = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      setState(prev => ({ ...prev, user }));
    } catch (error) {
      await signOut();
    }
  }, [authService, signOut]);

  return (
      <AuthContext.Provider value={{ ...state, signIn, signOut, refreshAuth, forgotPassword, registerUser }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};