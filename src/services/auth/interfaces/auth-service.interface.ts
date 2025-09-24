import { Credentials, UserData } from '@/domain/models/auth.models';
import User from '@/domain/entities/user.entity';

export interface IAuthService {
  signIn(credentials: Credentials, rememberMe?: boolean): Promise<User>;
  signOut(): Promise<void>;
  register(userData: UserData): Promise<void>;
  sendResetCode(email: string): Promise<boolean>;
  verifyResetCode(email: string, code: string): Promise<string>;
  changePassword(email: string, password: string, token: string): Promise<void>;
  checkAuthStatus(): Promise<User | null>;
  hydrate(): Promise<User | null>;
  refreshToken(refreshToken: string): Promise<string>;
  setOnUnauthorizedCallback(callback: () => void): void;
  setOnClearUserDataCallback(callback: () => void): void;
  triggerLogout(): void;
}
