import { ITokenService } from '@/services/auth/interfaces/token-service.interface';
import { getSecureStorageService } from '@/services/storage/secure-storage.service';
import { AuthError } from '@/shared/errors/custom-errors';
import { decodeJwt } from '@/shared/utils/jwt';
import User from '@/domain/entities/user.entity';
import { UserModel } from '@/data/models/UserModel';
import {
  REFRESH_TOKEN_KEY,
  ACCESS_TOKEN_KEY
} from '@/services/storage/storage-keys';
import { AxiosInstance } from 'axios';
import { ILogger } from '@/services/logging/ILogger';

export class TokenService implements ITokenService {
  constructor(
    private readonly api: AxiosInstance,
    private readonly logger: ILogger
  ) {}

  async getAccessToken(): Promise<string> {
    const storage = await getSecureStorageService();
    const token = await storage.getValueFor(ACCESS_TOKEN_KEY);

    if (!token) {
      throw new AuthError('No access token found');
    }

    return token;
  }

  async getRefreshToken(): Promise<string> {
    const storage = await getSecureStorageService();
    const token = await storage.getValueFor(REFRESH_TOKEN_KEY);

    if (!token) {
      throw new AuthError('No refresh token found');
    }

    return token;
  }

  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    if (!accessToken || !refreshToken) {
      throw new AuthError('Invalid tokens provided');
    }

    const storage = await getSecureStorageService();
    await Promise.all([
      storage.save(ACCESS_TOKEN_KEY, accessToken),
      storage.save(REFRESH_TOKEN_KEY, refreshToken)
    ]);
  }

  async clearTokens(): Promise<void> {
    const storage = await getSecureStorageService();
    await Promise.all([
      storage.deleteValueFor(ACCESS_TOKEN_KEY),
      storage.deleteValueFor(REFRESH_TOKEN_KEY)
    ]);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = decodeJwt(token);
      const currentTime = Math.floor(Date.now() / 1000);
      // 300 seconds (5 minutes) buffer before actual expiration
      return payload.exp < currentTime + 300;
    } catch (error) {
      this.logger.error(
        '[TokenService] Error checking token expiration',
        error as Error
      );
      return true;
    }
  }

  async getUserFromToken(token: string): Promise<User> {
    if (!token) {
      throw new AuthError('Token is required');
    }

    try {
      const payload = decodeJwt(token);
      const userApi = await this.getUserResponseFromApi(token);

      return new User(
        payload[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ],
        userApi.userName,
        userApi.name,
        userApi.lastName,
        userApi.locality,
        userApi.gender,
        userApi.age,
        userApi.email,
        token,
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      );
    } catch (error) {
      this.logger.error(
        '[TokenService] Error getting user from token',
        error as Error
      );
      throw new AuthError('Invalid token');
    }
  }

  private async getUserResponseFromApi(token: string): Promise<UserModel> {
    try {
      const { data } = await this.api.get<UserModel>(
        '/Users/user-information',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return data;
    } catch (error) {
      this.logger.error(
        '[TokenService] Error fetching user from API',
        error as Error
      );
      throw new AuthError('Failed to fetch user information');
    }
  }
}
