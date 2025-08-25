import { IAuthRepository } from '../interfaces/auth.repository.interface';
import { UserData } from '../models/auth.models';

export default async function registerUser(
  authRepository: IAuthRepository,
  userData: UserData
) {
  return await authRepository.register(userData);
}
