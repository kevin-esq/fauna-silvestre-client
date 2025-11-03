import { Credentials, UserData } from '@/domain/models/auth.models';
import { HttpError, NetworkError } from '@/shared/types/errors';

export interface IAuthRepository {
  login(credentials: Credentials): Promise<string>;
  register(userData: UserData): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  handleError(error: unknown): HttpError | NetworkError;
}
