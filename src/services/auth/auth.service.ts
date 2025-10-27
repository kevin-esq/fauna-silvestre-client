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
      const sanitizedCredentials = this.sanitizeCredentials(credentials);
      this.validateCredentials(sanitizedCredentials);

      await this.tokenService.clearTokens();
      const response = await this.performSignIn(sanitizedCredentials);
      const tokens = this.extractTokensFromResponse(response);

      await this.tokenService.saveTokens(
        tokens.accessToken,
        tokens.refreshToken
      );

      authEventEmitter.emit(AuthEvents.USER_SIGNED_IN);

      if (rememberMe) {
        return await this.loadAndReturnStoredUser();
      } else {
        return await this.tokenService.getUserFromToken(tokens.accessToken);
      }
    } catch (error) {
      this.logger.error('[AuthService] Sign in failed');

      try {
        await this.tokenService.clearTokens();
      } catch {
        // Silently fail token cleanup
      }

      throw AuthErrorMapper.map(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.tokenService.clearTokens();
      await this.clearUserData();
      this.triggerLogout();
    } catch (error) {
      this.logger.error('[AuthService] Sign out failed');
      throw error;
    }
  }

  async register(userData: UserData): Promise<void> {
    try {
      const sanitizedUserData = this.sanitizeUserData(userData);
      this.validateUserData(sanitizedUserData);

      const response = await this.api.post<RegisterResponse>(
        '/Users/Register',
        sanitizedUserData
      );
      this.validateApiResponse(response.data, 'Error en el registro');
    } catch (error) {
      this.logger.error('[AuthService] Registration failed');
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
      return true;
    } catch (error) {
      this.logger.error('[AuthService] Send reset code failed');
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
      this.logger.error('[AuthService] Verify reset code failed');
      throw AuthErrorMapper.map(error);
    }
  }

  async changePassword(
    email: string,
    password: string,
    token: string
  ): Promise<void> {
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPassword = password.trim();
    const sanitizedToken = token.trim();

    this.validateChangePasswordParams(
      sanitizedEmail,
      sanitizedPassword,
      sanitizedToken
    );

    try {
      this.api.defaults.headers.common['Authorization'] =
        `Bearer ${sanitizedToken}`;
      const response = await this.api.post<ChangePasswordResponse>(
        '/Authentication/change-password',
        {
          email: sanitizedEmail,
          password: sanitizedPassword
        }
      );

      delete this.api.defaults.headers.common['Authorization'];

      this.validateApiResponse(response.data, 'Error al cambiar contraseña');
    } catch (error) {
      delete this.api.defaults.headers.common['Authorization'];

      this.logger.error('[AuthService] Change password failed');
      throw AuthErrorMapper.map(error);
    }
  }

  async refreshToken(refreshToken: string): Promise<string> {
    if (!refreshToken || !refreshToken.trim()) {
      throw new AuthError('Token de actualización requerido');
    }

    if (!refreshToken.includes('.')) {
      throw new AuthError('Token de actualización inválido');
    }

    try {
      const response = await this.api.post('/Authentication/refresh-token', {
        refreshToken: refreshToken.trim()
      });

      const tokens = this.extractTokensFromResponse(response);
      await this.tokenService.saveTokens(
        tokens.accessToken,
        tokens.refreshToken
      );

      return tokens.accessToken;
    } catch {
      this.logger.error('[AuthService] Token refresh failed');
      throw new AuthError('La sesión ha expirado. Inicia sesión nuevamente.');
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
        return null;
      }

      return await this.validateAndRefreshToken(accessToken, refreshToken);
    } catch {
      this.logger.error('[AuthService] Hydration failed');
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
    } catch {
      this.logger.error('[AuthService] Load user data failed');
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

  private sanitizeCredentials(credentials: Credentials): Credentials {
    return {
      UserName: credentials.UserName.trim(),
      Password: credentials.Password
    };
  }

  private sanitizeUserData(userData: UserData): UserData {
    return {
      ...userData,
      userName: userData.userName.trim(),
      name: userData.name.trim(),
      lastName: userData.lastName.trim(),
      locality: userData.locality.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password
    };
  }

  private validateCredentials(credentials: Credentials): void {
    if (!credentials.UserName || !credentials.Password) {
      throw new AuthError('Usuario y contraseña son requeridos');
    }

    if (credentials.UserName.length < 3) {
      throw new AuthError(
        'El nombre de usuario debe tener al menos 3 caracteres'
      );
    }

    if (credentials.UserName.length > 50) {
      throw new AuthError('El nombre de usuario es demasiado largo');
    }
  }

  private validateUserData(userData: UserData): void {
    if (!userData.userName || !userData.password) {
      throw new AuthError(
        'Usuario y contraseña son requeridos para el registro'
      );
    }

    if (!userData.email) {
      throw new AuthError('El correo electrónico es requerido');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new AuthError('El formato del correo electrónico no es válido');
    }

    if (userData.userName.length < 3) {
      throw new AuthError(
        'El nombre de usuario debe tener al menos 3 caracteres'
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(userData.userName)) {
      throw new AuthError(
        'El nombre de usuario solo puede contener letras, números y guión bajo'
      );
    }

    this.validatePasswordStrength(userData.password);
  }

  private validatePasswordStrength(password: string): void {
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      throw new AuthError(
        `La contraseña debe tener al menos ${this.MIN_PASSWORD_LENGTH} caracteres`
      );
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new AuthError(
        'La contraseña debe incluir al menos una letra y un número'
      );
    }

    if (password.length > 100) {
      throw new AuthError('La contraseña es demasiado larga');
    }
  }

  private validateEmail(email: string): void {
    if (!email?.trim()) {
      throw new AuthError('El correo electrónico es requerido');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new AuthError('El formato del correo electrónico no es válido');
    }
  }

  private validateEmailAndCode(email: string, code: string): void {
    if (!email?.trim() || !code?.trim()) {
      throw new AuthError('Correo electrónico y código son requeridos');
    }

    this.validateEmail(email);

    if (code.trim().length < 4) {
      throw new AuthError('El código debe tener al menos 4 caracteres');
    }
  }

  private validateChangePasswordParams(
    email: string,
    password: string,
    token: string
  ): void {
    if (!email?.trim() || !password?.trim() || !token?.trim()) {
      throw new AuthError(
        'Correo electrónico, contraseña y token son requeridos'
      );
    }

    this.validateEmail(email);
    this.validatePasswordStrength(password);

    if (!token.includes('.')) {
      throw new AuthError('Token inválido');
    }
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
    const response = await this.api.post<AuthResponse>(
      '/Authentication/LogIn',
      credentials
    );

    this.validateApiResponse(response.data, 'Error de autenticación');

    if (response.status !== 200) {
      throw AuthErrorMapper.map(response.data);
    }

    return response;
  }

  private extractTokensFromResponse(
    response: AxiosResponse<AuthResponse>
  ): TokenPair {
    const { accessToken, refreshToken } = response.data;

    if (!accessToken || !refreshToken) {
      throw new AuthError('Respuesta inválida: tokens faltantes');
    }

    if (!accessToken.includes('.') || !refreshToken.includes('.')) {
      throw new AuthError('Tokens inválidos recibidos del servidor');
    }

    if (accessToken.length < 20 || refreshToken.length < 20) {
      throw new AuthError('Tokens inválidos recibidos del servidor');
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
    } catch {
      this.logger.error('[AuthService] Error parsing stored user data');
      throw new AuthError('Invalid stored user data format');
    }
  }

  private async validateAndRefreshToken(
    accessToken: string,
    refreshToken: string
  ): Promise<User | null> {
    try {
      if (this.tokenService.isTokenExpired(accessToken)) {
        const newToken = await this.refreshToken(refreshToken);
        return await this.tokenService.getUserFromToken(newToken);
      }

      return await this.tokenService.getUserFromToken(accessToken);
    } catch {
      this.logger.warn('[AuthService] Token validation failed');
      return null;
    }
  }

  private async clearUserData(): Promise<void> {
    try {
      if (this.onClearUserDataCallback) {
        this.onClearUserDataCallback();
      }
    } catch {
      this.logger.error('[AuthService] Error clearing data');
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
    } catch {
      this.logger.error('[AuthService] Error handling user sign out');
    }
  }

  private handleUserSignedIn(): void {
    authEventEmitter.off(
      AuthEvents.USER_SIGNED_IN,
      this.handleUserSignedIn.bind(this)
    );
  }

  private async handleUnauthorized(): Promise<void> {
    try {
      authEventEmitter.emit(AuthEvents.USER_SIGNED_OUT);
    } catch {
      this.logger.error('[AuthService] Error handling unauthorized');
    }
  }
}
