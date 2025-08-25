// domain/interfaces/IAuthRepository.ts
import { Credentials, UserData } from '../models/auth.models';
import { HttpError, NetworkError } from '../../shared/types/errors';

/**
 * Contrato para operaciones de autenticación.
 * @interface
 */
export interface IAuthRepository {
  login(credentials: Credentials): Promise<string>;
  register(userData: UserData): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  handleError(error: unknown): HttpError | NetworkError;
}
