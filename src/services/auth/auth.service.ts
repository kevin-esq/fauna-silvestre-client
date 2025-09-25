import { AxiosInstance, AxiosResponse } from 'axios';
import { IAuthService } from './interfaces/auth-service.interface';
import { ITokenService } from './interfaces/token-service.interface';
import { ILogger } from '../../shared/types/ILogger';
import { AuthError } from '../../shared/types/custom-errors';
import User from '../../domain/entities/user.entity';
import {
  Credentials,
  UserData,
  AuthResponse,
  RegisterResponse,
  ResetCodeResponse,
  VerifyCodeResponse,
  ChangePasswordResponse
} from '../../domain/models/auth.models';
import { AuthErrorMapper } from './auth-error.mapper';
import { authEventEmitter, AuthEvents } from './auth.events';
import { USER_KEY } from '../storage/storage-keys';
import { getSecureStorageService } from '../storage/secure-storage.service';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthServiceDependencies {
  api: AxiosInstance;
  tokenService: ITokenService;
  logger: ILogger;
}

export class AuthService implements IAuthService {
  private static instance: AuthService;
  private readonly MIN_PASSWORD_LENGTH = 8;

  private onUnauthorizedCallback: (() => void) | null = null;
  private onClearUserDataCallback: (() => void) | null = null;
  private isRefreshing = false;

  private constructor(
    private readonly api: AxiosInstance,
    private readonly tokenService: ITokenService,
    private readonly logger: ILogger
  ) {
    this.initializeEventListeners();
  }

  public static getInstance(
    dependencies?: AuthServiceDependencies
  ): AuthService {
    if (!AuthService.instance) {
      if (!dependencies) {
        throw new Error(
          'AuthService dependencies are required for first initialization'
        );
      }

      const { api, tokenService, logger } = dependencies;
      AuthService.instance = new AuthService(api, tokenService, logger);
    }
    return AuthService.instance;
  }

  public static isInitialized(): boolean {
    return AuthService.instance !== undefined;
  }

  private initializeEventListeners(): void {
    authEventEmitter.on(
      AuthEvents.USER_SIGNED_IN,
      this.handleUserSignedIn.bind(this)
    );
    authEventEmitter.on(
      AuthEvents.USER_SIGNED_OUT,
      this.handleUserSignedOut.bind(this)
    );
  }

  async signIn(credentials: Credentials, rememberMe = false): Promise<User> {
    try {
      this.logger.info('[AuthService] Starting signIn process');
      this.validateCredentials(credentials);

      this.logger.info('[AuthService] Clearing existing tokens');
      await this.tokenService.clearTokens();

      this.logger.info('[AuthService] Performing sign in request');
      const response = await this.performSignIn(credentials);

      this.logger.info('[AuthService] Extracting tokens from response');
      const tokens = this.extractTokensFromResponse(response);

      this.logger.info('[AuthService] Saving tokens');
      await this.tokenService.saveTokens(
        tokens.accessToken,
        tokens.refreshToken
      );

      this.logger.info('[AuthService] User signed in successfully');
      authEventEmitter.emit(AuthEvents.USER_SIGNED_IN);

      if (rememberMe) {
        this.logger.info('[AuthService] Loading and returning stored user');
        return await this.loadAndReturnStoredUser();
      } else {
        this.logger.info('[AuthService] Getting user from token');
        return await this.tokenService.getUserFromToken(tokens.accessToken);
      }
    } catch (error) {
      this.logger.error('[AuthService] SignIn failed at step:', error as Error);

      try {
        await this.tokenService.clearTokens();
      } catch (clearError) {
        this.logger.warn(
          '[AuthService] Failed to clear tokens after login error',
          clearError
        );
      }

      this.logger.error(
        '[AuthService] Sign in failed',
        this.getErrorDetails(error)
      );
      throw AuthErrorMapper.map(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.tokenService.clearTokens();
      await this.clearUserData();
      this.triggerLogout();
      this.logger.info('[AuthService] User signed out successfully');
    } catch (error) {
      this.logger.error(
        '[AuthService] Sign out failed',
        this.getErrorDetails(error)
      );
      throw error;
    }
  }

  async register(userData: UserData): Promise<void> {
    try {
      this.validateUserData(userData);

      const response = await this.api.post<RegisterResponse>(
        '/Users/Register',
        userData
      );
      this.validateApiResponse(response.data, 'Error en el registro');

      this.logger.info('[AuthService] Registration successful');
    } catch (error) {
      this.logger.error(
        '[AuthService] Registration failed',
        this.getErrorDetails(error)
      );
      throw AuthErrorMapper.map(error);
    }
  }

  async sendResetCode(email: string): Promise<boolean> {
    this.validateEmail(email);

    try {
      const response = await this.api.get<ResetCodeResponse>(
        '/Authentication/Code',
        {
          params: { email }
        }
      );
      this.validateApiResponse(response.data, 'Error al enviar código');

      this.logger.info('[AuthService] Reset code sent successfully');
      return true;
    } catch (error) {
      this.logger.error(
        '[AuthService] Send reset code failed',
        this.getErrorDetails(error)
      );
      throw AuthErrorMapper.map(error);
    }
  }

  async verifyResetCode(email: string, code: string): Promise<string> {
    this.validateEmailAndCode(email, code);

    try {
      const response = await this.api.get<VerifyCodeResponse>(
        '/Authentication/verify-code',
        {
          params: {
            email,
            code
          }
        }
      );

      this.validateApiResponse(response.data, 'Código inválido o expirado');

      if (!response.data.message || response.data.message === '') {
        throw new AuthError('Invalid verification response: missing token');
      }

      return response.data.message;
    } catch (error) {
      this.logger.error(
        '[AuthService] Verify reset code failed',
        this.getErrorDetails(error)
      );
      throw AuthErrorMapper.map(error);
    }
  }

  async changePassword(
    email: string,
    password: string,
    token: string
  ): Promise<void> {
    this.validateChangePasswordParams(email, password, token);

    try {
      console.log('Changing password for', email);
      console.log('Using token:', token);
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await this.api.post<ChangePasswordResponse>(
        '/Authentication/change-password',
        {
          email,
          password
        }
      );

      this.validateApiResponse(response.data, 'Error al cambiar contraseña');
      this.logger.info('[AuthService] Password changed successfully');
    } catch (error) {
      this.logger.error(
        '[AuthService] Change password failed',
        this.getErrorDetails(error)
      );
      throw AuthErrorMapper.map(error);
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

      const tokens = this.extractTokensFromResponse(response);
      await this.tokenService.saveTokens(
        tokens.accessToken,
        tokens.refreshToken
      );

      this.logger.info('[AuthService] Token refreshed successfully');
      return tokens.accessToken;
    } catch (error) {
      this.logger.error(
        '[AuthService] Token refresh failed',
        this.getErrorDetails(error)
      );
      throw new AuthError('Session expired');
    }
  }

  async checkAuthStatus(): Promise<User | null> {
    return this.hydrate();
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
      this.logger.error(
        '[AuthService] Hydration failed',
        this.getErrorDetails(error)
      );
      return null;
    }
  }

  async loadUserData(): Promise<void> {
    try {
      const accessToken = await this.tokenService.getAccessToken();
      if (!accessToken) {
        throw new AuthError('No access token available');
      }

      const user = await this.tokenService.getUserFromToken(accessToken);
      const storage = await getSecureStorageService();
      await storage.save(USER_KEY, JSON.stringify(user));

      this.logger.info('[AuthService] User data loaded successfully');
    } catch (error) {
      this.logger.error(
        '[AuthService] Load user data failed',
        this.getErrorDetails(error)
      );
      throw new AuthError('Failed to load user data');
    }
  }

  setOnUnauthorizedCallback(callback: () => void): void {
    this.onUnauthorizedCallback = callback;
  }

  setOnClearUserDataCallback(callback: () => void): void {
    this.onClearUserDataCallback = callback;
  }

  triggerLogout(): void {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      authEventEmitter.emit(AuthEvents.USER_SIGNED_OUT);
      setTimeout(() => (this.isRefreshing = false), 1000);
    }
  }

  private validateCredentials(credentials: Credentials): void {
    if (!credentials.UserName || !credentials.Password) {
      throw new AuthError('Username and password are required');
    }
  }

  private validateUserData(userData: UserData): void {
    if (!userData.userName || !userData.password) {
      throw new AuthError(
        'Username and password are required for registration'
      );
    }

    this.validatePasswordStrength(userData.password);
  }

  private validatePasswordStrength(password: string): void {
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      throw new AuthError(
        `Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`
      );
    }
  }

  private validateEmail(email: string): void {
    if (!email?.trim()) {
      throw new AuthError('Email is required');
    }
  }

  private validateEmailAndCode(email: string, code: string): void {
    if (!email?.trim() || !code?.trim()) {
      throw new AuthError('Email and code are required');
    }
  }

  private validateChangePasswordParams(
    email: string,
    password: string,
    token: string
  ): void {
    if (!email?.trim() || !password?.trim() || !token?.trim()) {
      throw new AuthError('Email, password, and token are required');
    }

    this.validatePasswordStrength(password);
  }

  private validateApiResponse(
    data: { error?: boolean; message?: string },
    defaultMessage: string
  ): void {
    if (data.error) {
      throw new AuthError(data.message || defaultMessage);
    } else if (
      (typeof data !== 'object' && (data as string)) ===
      'The Email is not registered'
    ) {
      throw new AuthError((data as string) || defaultMessage);
    }
  }

  private async performSignIn(
    credentials: Credentials
  ): Promise<AxiosResponse<AuthResponse>> {
    this.logger.debug('[AuthService] Attempting sign in', {
      username: credentials.UserName
    });

    this.logger.info('[AuthService] Making API call to /Authentication/LogIn');
    const response = await this.api.post<AuthResponse>(
      '/Authentication/LogIn',
      credentials
    );

    this.logger.info('[AuthService] API call completed, validating response');
    this.validateApiResponse(response.data, 'Error de autenticación');

    this.logger.info(
      '[AuthService] Response validation completed, checking status'
    );
    if (response.status !== 200) {
      this.logger.error(
        '[AuthService] Non-200 status:',
        Error(response.status.toString())
      );
      throw AuthErrorMapper.map(response.data);
    }

    this.logger.info('[AuthService] performSignIn completed successfully');
    return response;
  }

  private extractTokensFromResponse(
    response: AxiosResponse<AuthResponse>
  ): TokenPair {
    const { accessToken, refreshToken } = response.data;

    if (!accessToken || !refreshToken) {
      throw new AuthError('Invalid response: missing tokens');
    }

    return { accessToken, refreshToken };
  }

  private async loadAndReturnStoredUser(): Promise<User> {
    await this.loadUserData();
    const storage = await getSecureStorageService();
    const userData = await storage.getValueFor(USER_KEY);

    if (!userData) {
      throw new AuthError('Failed to load user data from storage');
    }

    try {
      return JSON.parse(userData) as User;
    } catch (parseError) {
      this.logger.error(
        '[AuthService] Error parsing stored user data',
        this.getErrorDetails(parseError)
      );
      throw new AuthError('Invalid stored user data format');
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
        this.getErrorDetails(error)
      );
      return null;
    }
  }

  private async clearUserData(): Promise<void> {
    try {
      if (this.onClearUserDataCallback) {
        this.onClearUserDataCallback();
      }
      this.logger.info('[AuthService] All user data cleared');
    } catch (dbError) {
      this.logger.error(
        '[AuthService] Error clearing data',
        this.getErrorDetails(dbError)
      );
    }
  }

  private getErrorDetails(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (error && typeof error === 'object' && 'message' in error) {
      return new Error(String(error.message));
    }

    return new Error('Unknown error occurred');
  }

  private async handleUserSignedOut(): Promise<void> {
    try {
      await this.tokenService.clearTokens();
      await this.clearUserData();

      this.logger.info('[AuthService] User signed out successfully');
    } catch (error) {
      this.logger.error(
        '[AuthService] Error handling user sign out',
        this.getErrorDetails(error)
      );
    }
  }

  private handleUserSignedIn(): void {
    this.logger.info('[AuthService] User signed in');
    authEventEmitter.off(
      AuthEvents.USER_SIGNED_IN,
      this.handleUserSignedIn.bind(this)
    );
  }

  private async handleUnauthorized(): Promise<void> {
    try {
      authEventEmitter.emit(AuthEvents.USER_SIGNED_OUT);
    } catch (error) {
      this.logger.error(
        '[AuthService] Error handling unauthorized',
        this.getErrorDetails(error)
      );
    }
  }
}
