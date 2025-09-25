import User from '@/domain/entities/user.entity';

export interface ITokenService {
  getAccessToken(): Promise<string>;
  getRefreshToken(): Promise<string>;
  saveTokens(accessToken: string, refreshToken: string): Promise<void>;
  clearTokens(): Promise<void>;
  isTokenExpired(token: string): boolean;
  getUserFromToken(token: string): Promise<User>;
}
