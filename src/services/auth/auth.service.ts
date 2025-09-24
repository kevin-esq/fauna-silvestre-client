// src/services/auth/auth.service.ts
import { AxiosInstance, AxiosResponse } from 'axios';
import { IAuthService } from './interfaces/auth-service.interface';
import { ITokenService } from './interfaces/token-service.interface';
import { ILogger } from '../../shared/types/ILogger';
import { AuthError } from '../../shared/types/custom-errors';
import User from '../../domain/entities/user.entity';
import {
  Credentials,
  UserData,
  AuthResponse
} from '../../domain/models/auth.models';
import { AuthErrorMapper } from './auth-error.mapper';
import { authEventEmitter, AuthEvents } from './auth.events';
import { USER_KEY } from '../storage/storage-keys';
import { getSecureStorageService } from '../storage/secure-storage.service';

export class AuthService implements IAuthService {
  private static instance: AuthService;
  private onUnauthorizedCallback: (() => void) | null = null;
  private onClearUserDataCallback: (() => void) | null = null;
  private readonly handleUserSignedOut = this._handleUserSignedOut.bind(this);

  private constructor(
    private readonly api: AxiosInstance,
    private readonly tokenService: ITokenService,
    private readonly logger: ILogger
  ) {
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    this.setOnUnauthorizedCallback(this.handleUnauthorized.bind(this));
    authEventEmitter.on(
      AuthEvents.USER_SIGNED_IN,
      this.handleUserSignedIn.bind(this)
    );
    authEventEmitter.on(AuthEvents.USER_SIGNED_OUT, this.handleUserSignedOut);
  }

  public static getInstance(
    api?: AxiosInstance,
    tokenService?: ITokenService,
    logger?: ILogger
  ): AuthService {
    if (!AuthService.instance) {
      if (!api || !tokenService || !logger) {
        throw new Error(
          'AuthService dependencies are required for first initialization'
        );
      }
      AuthService.instance = new AuthService(api, tokenService, logger);
    }
    return AuthService.instance;
  }

  public static isInitialized(): boolean {
    return AuthService.instance !== undefined;
  }

  setOnUnauthorizedCallback(callback: () => void): void {
    this.onUnauthorizedCallback = callback;
  }

  setOnClearUserDataCallback(callback: () => void): void {
    this.onClearUserDataCallback = callback;
  }

  triggerLogout(): void {
    authEventEmitter.emit(AuthEvents.USER_SIGNED_OUT);
  }

  private async _handleUserSignedOut(): Promise<void> {
    try {
      await this.tokenService.clearTokens();

      // Limpiar completamente todos los datos de SQLite al cerrar sesión
      try {
        this.logger.info('[AuthService] All user data cleared from SQLite');
      } catch (dbError) {
        this.logger.error(
          '[AuthService] Error clearing SQLite data on logout',
          dbError as Error
        );
        // No lanzamos el error para no bloquear el logout
      }

      if (this.onClearUserDataCallback) {
        this.onClearUserDataCallback();
      }

      this.logger.info('[AuthService] User signed out successfully');

      if (this.onUnauthorizedCallback) {
        this.onUnauthorizedCallback();
      }
    } catch (error) {
      this.logger.error(
        '[AuthService] Error handling user sign out',
        error as Error
      );
    }
  }

  private handleUserSignedIn(): void {
    this.logger.info('[AuthService] User signed in');
    // Remove listener after first execution to prevent memory leaks
    authEventEmitter.off(
      AuthEvents.USER_SIGNED_IN,
      this.handleUserSignedIn.bind(this)
    );
  }

  async hydrate(): Promise<User | null> {
    try {
      const accessToken = await this.tokenService.getAccessToken();
      const refreshToken = await this.tokenService.getRefreshToken();

      if (!accessToken || !refreshToken) {
        this.logger.info('[AuthService] No credentials found on hydration');
        return null;
      }

      return await this.validateAndRefreshToken(accessToken, refreshToken);
    } catch (error) {
      this.logger.error('[AuthService] Hydration failed', error as Error);
      return null;
    }
  }

  private async validateAndRefreshToken(
    accessToken: string,
    refreshToken: string
  ): Promise<User | null> {
    try {
      if (this.tokenService.isTokenExpired(accessToken)) {
        this.logger.info('[AuthService] Access token expired, refreshing');
        const newToken = await this.refreshToken(refreshToken);
        return await this.tokenService.getUserFromToken(newToken);
      }

      return await this.tokenService.getUserFromToken(accessToken);
    } catch (error) {
      this.logger.warn(
        '[AuthService] Token validation failed, signing out',
        error as Error
      );
      await this.signOut();
      return null;
    }
  }

  async signIn(credentials: Credentials, rememberMe = false): Promise<User> {
    try {
      this.validateCredentials(credentials);

      const response = await this.performSignIn(credentials);
      const { accessToken, refreshToken } =
        this.extractTokensFromResponse(response);

      await this.tokenService.saveTokens(accessToken, refreshToken);

      this.logger.info('[AuthService] User signed in successfully');
      authEventEmitter.emit(AuthEvents.USER_SIGNED_IN);

      if (rememberMe) {
        return await this.loadAndReturnStoredUser();
      }

      return await this.tokenService.getUserFromToken(accessToken);
    } catch (error) {
      this.logger.error('[AuthService] Sign in failed', error as Error);
      throw AuthErrorMapper.map(error);
    }
  }

  private validateCredentials(credentials: Credentials): void {
    if (!credentials.UserName || !credentials.Password) {
      throw new AuthError('Username and password are required');
    }
  }

  private async performSignIn(
    credentials: Credentials
  ): Promise<AxiosResponse<AuthResponse>> {
    console.log(credentials);
    console.log(this.api);
    const response = await this.api.post<AuthResponse>(
      '/Authentication/LogIn',
      credentials
    );
    console.log(response);

    if (response.status !== 200) {
      throw AuthErrorMapper.map(response.data.error);
    }

    return response;
  }

  private extractTokensFromResponse(response: AxiosResponse<AuthResponse>): {
    accessToken: string;
    refreshToken: string;
  } {
    const { accessToken, refreshToken } = response.data;

    if (!accessToken || !refreshToken) {
      throw new AuthError('Invalid login response: missing tokens');
    }

    return { accessToken, refreshToken };
  }

  private async loadAndReturnStoredUser(): Promise<User> {
    await this.loadUserData();
    const storage = await getSecureStorageService();
    const userData = await storage.getValueFor(USER_KEY);

    if (!userData) {
      throw new AuthError('Failed to load user data');
    }

    try {
      return JSON.parse(userData) as User;
    } catch (error) {
      this.logger.error(
        '[AuthService] Error parsing stored user data',
        error as Error
      );
      throw new AuthError('Invalid stored user data');
    }
  }

  async refreshToken(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new AuthError('Refresh token is required');
    }

    try {
      const response = await this.api.post('/Authentication/refresh-token', {
        refreshToken
      });
      const { accessToken: newAccess, refreshToken: newRefresh } =
        response.data;

      if (!newAccess || !newRefresh) {
        throw new AuthError('Refresh response missing tokens');
      }

      await this.tokenService.saveTokens(newAccess, newRefresh);
      this.logger.info('[AuthService] Token refreshed successfully');

      return newAccess;
    } catch (error) {
      this.logger.error('[AuthService] Token refresh failed', error as Error);
      await this.signOut();
      throw new AuthError('Session expired');
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.tokenService.clearTokens();

      try {
        if (this.onClearUserDataCallback) {
          this.onClearUserDataCallback();
        }
        this.logger.info(
          '[AuthService] All user data cleared from SQLite on manual logout'
        );
      } catch (dbError) {
        this.logger.error(
          '[AuthService] Error clearing SQLite data on manual logout',
          dbError as Error
        );
        // No lanzamos el error para no bloquear el logout
      }

      this.logger.info('[AuthService] User signed out successfully');
    } catch (error) {
      this.logger.error('[AuthService] Sign out failed', error as Error);
    }
  }

  async register(userData: UserData): Promise<void> {
    try {
      this.validateUserData(userData);

      await this.api.post('/Users/Register', userData);
      this.logger.info('[AuthService] Registration successful');
    } catch (error) {
      this.logger.error('[AuthService] Registration failed', error as Error);
      throw AuthErrorMapper.map(error);
    }
  }

  private validateUserData(userData: UserData): void {
    if (!userData.userName || !userData.password) {
      throw new AuthError(
        'Username and password are required for registration'
      );
    }

    if (userData.password.length < 8) {
      throw new AuthError('Password must be at least 8 characters long');
    }
  }

  async sendResetCode(email: string): Promise<boolean> {
    if (!email) {
      throw new AuthError('Email is required');
    }

    try {
      await this.api.post('/Users/send-reset-code', { email });
      this.logger.info('[AuthService] Reset code sent successfully');
      return true;
    } catch (error) {
      this.logger.error('[AuthService] Send reset code failed', error as Error);
      throw AuthErrorMapper.map(error);
    }
  }

  async verifyResetCode(email: string, code: string): Promise<string> {
    if (!email || !code) {
      throw new AuthError('Email and code are required');
    }

    try {
      const { data } = await this.api.post('/Users/verify-reset-code', {
        email,
        code
      });

      if (!data.token) {
        throw new AuthError('Invalid verification response');
      }

      return data.token;
    } catch (error) {
      this.logger.error(
        '[AuthService] Verify reset code failed',
        error as Error
      );
      throw AuthErrorMapper.map(error);
    }
  }

  async changePassword(
    email: string,
    password: string,
    token: string
  ): Promise<void> {
    if (!email || !password || !token) {
      throw new AuthError('Email, password, and token are required');
    }

    if (password.length < 8) {
      throw new AuthError('Password must be at least 8 characters long');
    }

    try {
      await this.api.post('/Users/change-password', { email, password, token });
      this.logger.info('[AuthService] Password changed successfully');
    } catch (error) {
      this.logger.error('[AuthService] Change password failed', error as Error);
      throw AuthErrorMapper.map(error);
    }
  }

  async checkAuthStatus(): Promise<User | null> {
    return this.hydrate();
  }

  async loadUserData(): Promise<void> {
    try {
      const accessToken = await this.tokenService.getAccessToken();
      const user = await this.tokenService.getUserFromToken(accessToken);

      const storage = await getSecureStorageService();
      await storage.save(USER_KEY, JSON.stringify(user));

      this.logger.info('[AuthService] User data loaded successfully');
    } catch (error) {
      this.logger.error('[AuthService] Load user data failed', error as Error);
      throw new AuthError('Failed to load user data');
    }
  }

  private async handleUnauthorized(): Promise<void> {
    try {
      await this.signOut();
      authEventEmitter.emit(AuthEvents.USER_SIGNED_OUT);
    } catch (error) {
      this.logger.error(
        '[AuthService] Error handling unauthorized',
        error as Error
      );
    }
  }
}
