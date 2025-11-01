import User from '../entities/user.entity';
import { UsersResponse, UserCountsResponse } from '@/domain/models/user.models';

export interface IUserRepository {
  getLocalUser(): Promise<User>;
  getAllUsers(
    page: number,
    size: number,
    active?: boolean
  ): Promise<UsersResponse>;
  deactivateUser(userId: number): Promise<void>;
  getCounts(): Promise<UserCountsResponse>;
}
