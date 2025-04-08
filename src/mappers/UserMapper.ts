import User from '../domain/entities/User';
import { UserModel } from '../data/models/UserModel';

export const mapUserModelToEntity = (data: UserModel): User => {
  const { id, name, email, token } = data;
  return new User(id, name, email, token);
};