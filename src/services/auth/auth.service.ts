import { AxiosInstance } from 'axios';
import { apiService } from '../http/api.service';
import { ISecureStorage, secureStorageService } from '../storage/secure-storage.service';
import { ILogger } from '../../shared/types/ILogger';
import { ConsoleLogger } from '../logging/console-logger';
import { AuthError } from '../../shared/types/custom-errors';
import User from '../../domain/entities/user.entity';
import { Credentials, UserData } from '../../domain/models/auth.models';
import { decodeJwt } from '../../shared/utils/jwt';
import { UserModel } from '../../data/models/UserModel';
import { AuthErrorMapper } from './auth-error.mapper';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

class AuthService {
  private static instance: AuthService;

  private constructor(
    private readonly api: AxiosInstance,
    private readonly storage: ISecureStorage,
    private readonly logger: ILogger
  ) {
    apiService.setOnUnauthorizedCallback(this.signOut.bind(this));
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      const logger = new ConsoleLogger('info');
      AuthService.instance = new AuthService(apiService.client, secureStorageService, logger);
    }
    return AuthService.instance;
  }

  async signIn(credentials: Credentials): Promise<User> {
    try {
      const response = await this.api.post('/Authentication/LogIn', credentials);
      if (response.status !== 200) {
        throw AuthErrorMapper.map(response.data.error);
      }
      const { accessToken, refreshToken } = response.data;
  
      if (!accessToken || !refreshToken) {
        throw new AuthError('Login response missing access or refresh token.');
      }
  
      await this.storage.save(ACCESS_TOKEN_KEY, accessToken);
      await this.storage.save(REFRESH_TOKEN_KEY, refreshToken);
  
      const user = await this.getUserFromToken(accessToken);
      if (!user) throw new AuthError('No se pudo decodificar el token.');
  
      this.logger.info(`[AuthService] User ${user.id} signed in successfully.`);
      return user;
    } catch (error) {
      this.logger.error('[AuthService] signIn failed', error as Error, { username: credentials.UserName });
      throw AuthErrorMapper.map(error);
    }
  }

  async refreshToken(): Promise<string> {
    this.logger.info('[AuthService] Attempting to refresh token.');
    const refreshToken = await this.storage.getValueFor(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      this.logger.warn('[AuthService] No refresh token available. Signing out.');
      await this.signOut();
      throw new AuthError('No refresh token available.');
    }

    try {
      const { data } = await this.api.post('/Authentication/refresh-token', { refreshToken });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;

      if (!newAccessToken || !newRefreshToken) {
        throw new Error('Invalid token response from server.');
      }

      await this.storage.save(ACCESS_TOKEN_KEY, newAccessToken);
      await this.storage.save(REFRESH_TOKEN_KEY, newRefreshToken);

      this.logger.info('[AuthService] Token refreshed successfully.');
      return newAccessToken;
    } catch (error) {
      this.logger.error('[AuthService] Failed to refresh token. Signing out.', error as Error);
      await this.signOut();
      throw new AuthError('Session expired. Please sign in again.');
    }
  }

  async signOut(): Promise<void> {
    try {
      this.logger.info('[AuthService] Signing out user.');
      await this.storage.deleteValueFor(ACCESS_TOKEN_KEY);
      await this.storage.deleteValueFor(REFRESH_TOKEN_KEY);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('[AuthService] signOut failed', err);
      // Never throws to ensure sign-out always completes
    }
  }

  async register(userData: UserData): Promise<void> {
    try {
      this.logger.info(`[AuthService] Registering new user: ${userData.email}`);
      await this.api.post('/Users/Register', userData);
      this.logger.info(`[AuthService] User ${userData.email} registered successfully.`);
    } catch (error) {
      this.logger.error('[AuthService] register failed', error as Error, { username: userData.userName });
      throw AuthErrorMapper.map(error);
    }
  }

  async checkAuthStatus(): Promise<User | null> {
    try {
      const token = await this.storage.getValueFor(ACCESS_TOKEN_KEY);
      if (!token) {
        this.logger.info('[AuthService] No auth token found.');
        return null;
      }

      const user = await this.getUserFromToken(token);
      if (user) {
        this.logger.info(`[AuthService] User ${user.id} is authenticated.`);
        return user;
      }

      this.logger.warn('[AuthService] Invalid auth token found.');
      await this.signOut();
      return null;
    } catch (error) {
      this.logger.error('[AuthService] checkAuthStatus failed', error as Error);
      return null;
    }
  }

  async sendResetCode(email: string): Promise<boolean> {
    try {
      this.logger.info(`[AuthService] Sending password reset code to: ${email}`);
      const { data } = await this.api.get(`/Authentication/Code?email=${email.toLowerCase()}`);
      const success = data.error !== true;
      this.logger.info(`[AuthService] Reset code ${success ? 'sent' : 'failed'} to: ${email}`);
      return success;
    } catch (error) {
      this.logger.error('[AuthService] sendResetCode failed', error as Error, { email });
      throw AuthErrorMapper.map(error);
    }
  }

  async verifyResetCode(email: string, code: string): Promise<string> {
    try {
      this.logger.info(`[AuthService] Verifying reset code for: ${email}`);
      const { data } = await this.api.get(`/Authentication/verify-code?email=${email.toLowerCase()}&code=${code}`);
      const isValid = data.error !== true && data.message !== 'Expired code';
      this.logger.info(`[AuthService] Reset code verified for: ${email}`);
      return isValid ? data.message : 'INVALID';
    } catch (error) {
      this.logger.error('[AuthService] verifyResetCode failed', error as Error, { email });
      throw AuthErrorMapper.map(error);
    }
  }

  async changePassword(email: string, password: string, token: string): Promise<void> {
    try {
      this.logger.info(`[AuthService] Changing password for: ${email}`);
      await this.api.post(
        '/Authentication/change-password',
        { Email: email, Password: password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      this.logger.info(`[AuthService] Password changed successfully for: ${email}`);
    } catch (error) {
      this.logger.error('[AuthService] changePassword failed', error as Error, { email });
      throw AuthErrorMapper.map(error);
    }
  }

  private async getUserFromToken(token: string): Promise<User | null> {
    try {
      const userApi = await this.getUserResponseFromApi();
      if (!userApi) {
        this.logger.warn('Could not get user from API response.');
        return null;
      }

      const rawPayload = decodeJwt(token);
      return new User(
        rawPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        userApi.userName,
        userApi.name,
        userApi.lastName,
        userApi.locality,
        userApi.gender,
        userApi.age,
        userApi.email,
        token,
        rawPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to decode token:', err);
      return null;
    }
  }

  private async getUserResponseFromApi(): Promise<UserModel | null> {
    const token = await this.storage.getValueFor(ACCESS_TOKEN_KEY);
    if (!token) return null;

    const { data } = await this.api.get('/Users/user-information', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      userName: data.userName,
      name: data.name,
      lastName: data.lastName,
      locality: data.locality,
      gender: data.gender,
      age: data.age,
      email: data.email,
    };
  }

}

export const authService = AuthService.getInstance();
