// data/repositories/AuthRepository.ts
import { BaseRepository } from './BaseRepository';
import { IAuthRepository } from '../../domain/interfaces/IAuthRepository';
import {HttpError, NetworkError} from "../../shared/types/errors";
import {Credentials, UserData} from "../../domain/models/AuthModels";

/**
 * Implementación concreta del repositorio de autenticación.
 * @class
 * @extends BaseRepository
 * @implements IAuthRepository
 */
export class AuthRepository extends BaseRepository implements IAuthRepository {
  async login(credentials: Credentials): Promise<string> {
    try {
      this.logger.debug('[AuthRepository] Starting login', { credentials });
      const response = await this.api.post<string>('/Authentication/LogIn', credentials);
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(error, 'login');
    }
  }

  async register(userData: UserData): Promise<void> {
    try {
      this.logger.debug('[AuthRepository] Starting registration', { userData });
      const response = await this.api.post('/Users/Register', userData);
      this.ensureSuccessStatus(response);
    } catch (error) {
      throw this.handleHttpError(error, 'register');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      this.logger.debug('[AuthRepository] Starting password recovery', { email });
      const response = await this.api.post('/forgot-password', { email });
      this.ensureSuccessStatus(response);
    } catch (error) {
      throw this.handleHttpError(error, 'forgotPassword');
    }
  }

  handleError(error: unknown): HttpError | NetworkError {
    return this.handleHttpError(error, 'authOperation');
  }
}