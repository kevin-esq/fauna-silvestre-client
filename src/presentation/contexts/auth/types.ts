import User from '@/domain/entities/user.entity';
import { Credentials, UserData } from '@/domain/models/auth.models';

export interface AuthContextType {
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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initializing: boolean;
  error: string | null;
}

export interface StoredAuthData {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}
