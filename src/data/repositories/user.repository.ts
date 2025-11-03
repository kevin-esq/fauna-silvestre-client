import { AxiosInstance } from 'axios';
import { BaseRepository } from './base.repository';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import User from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/UserMapper';
import { UserModel } from '../models/UserModel';
import { ILogger } from '../../services/logging/ILogger';
import { UsersResponse, UserCountsResponse } from '@/domain/models/user.models';

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

  async getAllUsers(
    page: number,
    size: number,
    active: boolean = true
  ): Promise<UsersResponse> {
    try {
      const response = await this.api.get<UsersResponse>(
        `/Admin/all-users/${active}?page=${page}&size=${size}`
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      const processedError = this.handleHttpError(error, 'getAllUsers');

      this.logger.debug(
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

  async getCounts(): Promise<UserCountsResponse> {
    try {
      this.logger.debug('[UserRepository] Obteniendo conteos de usuarios');

      const response = await this.api.get<UserCountsResponse>('/Users/counts');
      this.ensureSuccessStatus(response);

      this.logger.info(
        '[UserRepository] Conteos obtenidos exitosamente',
        response.data
      );
      return response.data;
    } catch (error) {
      const processedError = this.handleHttpError(error, 'getCounts');
      this.logger.error(
        '[UserRepository] Error obteniendo conteos',
        processedError
      );
      throw processedError;
    }
  }
}
