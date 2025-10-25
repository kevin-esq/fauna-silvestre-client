import { AxiosInstance } from 'axios';
import { BaseRepository } from './base.repository';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import User from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/UserMapper';
import { UserModel } from '../models/UserModel';
import { ILogger } from '../../shared/types/ILogger';
import { UsersResponse } from '@/domain/models/user.models';

export class UserRepository extends BaseRepository implements IUserRepository {
  constructor(api: AxiosInstance, logger: ILogger) {
    super(api, logger);
  }
  async getLocalUser(): Promise<User> {
    try {
      this.logger.debug('[UserRepository] Obteniendo datos de usuario');

      const response = await this.api.get<UserModel>('/Users/user-information');
      this.ensureSuccessStatus(response);

      this.logger.info(
        '[UserRepository] Datos de usuario obtenidos exitosamente'
      );
      return UserMapper.toDomain(response.data);
    } catch (error) {
      const processedError = this.handleHttpError(error, 'getUser');
      this.logger.error(
        '[UserRepository] Error obteniendo usuario',
        processedError
      );
      throw processedError;
    }
  }

  // TODO: Implementar en el futuro
  // async updateUser(userData: Partial<User>): Promise<User> {
  //   try {
  //     this.logger.debug('[UserRepository] Actualizando datos de usuario', {
  //       userData
  //     });
  //
  //     const modelData = UserMapper.toModel(userData as User);
  //     const response = await this.api.patch<UserModel>(
  //       '/Users/update',
  //       modelData
  //     );
  //     this.ensureSuccessStatus(response);
  //
  //     this.logger.info('[UserRepository] Usuario actualizado exitosamente');
  //     return UserMapper.toDomain(response.data);
  //   } catch (error) {
  //     const processedError = this.handleHttpError(error, 'updateUser');
  //     this.logger.error(
  //       '[UserRepository] Error actualizando usuario',
  //       processedError
  //     );
  //     throw processedError;
  //   }
  // }

  async getAllUsers(page: number, size: number): Promise<UsersResponse> {
    try {
      const response = await this.api.get<UsersResponse>(
        `/Admin/all-users?page=${page}&size=${size}`
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      const processedError = this.handleHttpError(error, 'getAllUsers');
      this.logger.error(
        '[UserRepository] Error obteniendo todos los usuarios',
        processedError
      );
      throw processedError;
    }
  }

  async deactivateUser(userId: number): Promise<void> {
    try {
      this.logger.debug('[UserRepository] Desactivando usuario', { userId });

      const response = await this.api.delete(`/Users/?userId=${userId}`);
      this.ensureSuccessStatus(response);

      this.logger.info('[UserRepository] Usuario desactivado exitosamente', {
        userId
      });
    } catch (error) {
      const processedError = this.handleHttpError(error, 'deactivateUser');
      this.logger.error(
        '[UserRepository] Error desactivando usuario',
        processedError
      );
      throw processedError;
    }
  }
}
