import { AxiosInstance } from 'axios';
import { apiService } from '../http/api.service';
import { ISecureStorage, secureStorageService } from '../storage/secure-storage.service';
import { ILogger } from '../../shared/types/ILogger';
import { ConsoleLogger } from '../logging/console-logger';
import { AuthError, BaseError } from '../../shared/types/custom-errors';
import User from '../../domain/entities/user.entity';
import { Credentials, UserData } from '../../domain/models/auth.models';
import { decodeJwt } from '../../shared/utils/jwt';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

/**
 * A singleton service for handling all authentication-related logic,
 * including sign-in, sign-out, registration, and password reset flows.
 */
class AuthService {
  private static instance: AuthService;

  /**
   * Private constructor to enforce the singleton pattern.
   * @param api The Axios instance for making API calls.
   * @param storage The secure storage service for tokens.
   * @param logger The logging service.
   */
  private constructor(
    private readonly api: AxiosInstance,
    private readonly storage: ISecureStorage,
    private readonly logger: ILogger
  ) {
    apiService.setOnUnauthorizedCallback(this.signOut.bind(this));
  }

  /**
   * Retrieves the single instance of the AuthService.
   * @returns The singleton AuthService instance.
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      const logger = new ConsoleLogger('info');
      AuthService.instance = new AuthService(apiService.client, secureStorageService, logger);
    }
    return AuthService.instance;
  }

  /**
   * Signs in a user with the given credentials.
   * @param credentials The user's email and password.
   * @returns The authenticated user's data.
   * @throws {AuthError} If authentication fails.
   */
  async signIn(credentials: Credentials): Promise<User> {
    try {
      const { data } = await this.api.post('/Authentication/LogIn', credentials);
      const { accessToken, refreshToken } = data;

      await this.storage.save(ACCESS_TOKEN_KEY, accessToken);
      await this.storage.save(REFRESH_TOKEN_KEY, refreshToken);

      const user = this.getUserFromToken(accessToken);
      if (!user) {
        throw new AuthError('Failed to decode user from token.');
      }

      this.logger.info(`[AuthService] User ${user.id} signed in successfully.`);
      return user;
    } catch (error) {
      this.logger.error('[AuthService] signIn failed', error as Error, { username: credentials.UserName });
      throw this.handleAuthError(error, 'Sign-in failed. Please check your credentials.');
    }
  }

  /**
   * Signs out the current user by deleting their tokens.
   */
  async signOut(): Promise<void> {
    try {
      this.logger.info('[AuthService] Signing out user.');
      await this.storage.deleteValueFor(ACCESS_TOKEN_KEY);
      await this.storage.deleteValueFor(REFRESH_TOKEN_KEY);
    } catch (error) {
      this.logger.error('[AuthService] signOut failed', error instanceof Error ? error : new Error(String(error)));
      // Do not throw here to ensure sign-out flow always completes on the client.
    }
  }

  /**
   * Registers a new user.
   * @param userData The data for the new user.
   * @throws {AuthError} If registration fails.
   */
  async register(userData: UserData): Promise<void> {
    try {
      this.logger.info(`[AuthService] Registering new user: ${userData.email}`);
      await this.api.post('/Users/Register', userData);
      this.logger.info(`[AuthService] User ${userData.email} registered successfully.`);
    } catch (error) {
      this.logger.error('[AuthService] register failed', error as Error, { username: userData.userName });
      throw this.handleAuthError(error, 'Registration failed. The email might already be in use.');
    }
  }

  /**
   * Checks if a user is currently authenticated by verifying the stored token.
   * @returns The user's data if authenticated, otherwise null.
   */
  async checkAuthStatus(): Promise<User | null> {
    try {
      const token = await this.storage.getValueFor(ACCESS_TOKEN_KEY);
      if (!token) {
        this.logger.info('[AuthService] No auth token found.');
        return null;
      }

      const user = this.getUserFromToken(token);
      if (user) {
        this.logger.info(`[AuthService] User ${user.id} is authenticated.`);
        return user;
      }

      this.logger.warn('[AuthService] Invalid auth token found.');
      await this.signOut(); // Clean up invalid token
      return null;
    } catch (error) {
      this.logger.error('[AuthService] checkAuthStatus failed', error as Error);
      return null; // Fail gracefully
    }
  }

  /**
   * Sends a password reset code to the user's email.
   * @param email The user's email address.
   * @throws {AuthError} If sending the code fails.
   */
  async sendResetCode(email: string): Promise<boolean> {
    try {
      this.logger.info(`[AuthService] Sending password reset code to: ${email}`);
      const {data} = await this.api.get(`/Authentication/Code?email=${email.toLowerCase()}`);
      this.logger.info(`[AuthService] Reset code sent successfully to: ${email}`);
      return data.error !== true;
    } catch (error) {
      this.logger.error('[AuthService] sendResetCode failed', error as Error, { email });
      throw this.handleAuthError(error, 'Failed to send reset code.');
    }
  }

  /**
   * Verifies a password reset code.
   * @param email The user's email.
   * @param code The 6-digit code.
   * @returns A temporary token for changing the password.
   * @throws {AuthError} If verification fails.
   */
  async verifyResetCode(email: string, code: string): Promise<string> {
    try {
      this.logger.info(`[AuthService] Verifying reset code for: ${email}`);
      const { data } = await this.api.get(`/Authentication/verify-code?email=${email.toLowerCase()}&code=${code}`);
      this.logger.info(`[AuthService] Reset code verified for: ${email}`);
      return data.error !== true && data.message !== 'Expired code' ? data.message : 'INVALID';
    } catch (error) {
      this.logger.error('[AuthService] verifyResetCode failed', error as Error, { email });
      throw this.handleAuthError(error, 'Invalid or expired reset code.');
    }
  }

  /**
   * Changes the user's password using a temporary token.
   * @param email The user's email.
   * @param password The new password.
   * @param token The temporary token from verification.
   * @throws {AuthError} If the password change fails.
   */
  async changePassword(email: string, password: string, token: string): Promise<void> {
    try {
      this.logger.info(`[AuthService] Changing password for: ${email}`);
      await this.api.post(
        `/Authentication/change-password`,
        { Email: email, Password: password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      this.logger.info(`[AuthService] Password changed successfully for: ${email}`);
    } catch (error) {
      this.logger.error('[AuthService] changePassword failed', error as Error, { email });
      throw this.handleAuthError(error, 'Failed to change password. The token may be invalid.');
    }
  }

  /**
   * Decodes a JWT to extract user information.
   * @param token The JWT string.
   * @returns A User object or null if decoding fails.
   */
  private getUserFromToken(token: string): User | null {
    try {
      const rawPayload = decodeJwt(token);
      return new User(
        rawPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        rawPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'], // userName
        rawPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'], // name
        '', // lastName
        '', // locality
        '', // gender
        0,  // age
        rawPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        token,
        rawPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      );
    } catch (error) {
      this.logger.error('Failed to decode token:', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * A helper to standardize error handling for auth methods.
   * @param error The original error.
   * @param defaultMessage A fallback error message.
   * @returns A BaseError instance.
   */
  private handleAuthError(error: unknown, defaultMessage: string): BaseError {
    if (error instanceof BaseError) {
      return error;
    }
    return new AuthError(defaultMessage);
  }
}

export const authService = AuthService.getInstance();
