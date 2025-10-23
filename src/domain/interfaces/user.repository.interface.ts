import User from '../entities/user.entity';
import { UsersResponse } from '@/domain/models/user.models';

export interface IUserRepository {
  getLocalUser(): Promise<User>;
  getAllUsers(page: number, size: number): Promise<UsersResponse>;
}
