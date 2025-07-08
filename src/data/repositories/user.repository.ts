// src/data/repositories/UserRepository.ts
import { AxiosInstance } from 'axios';
import { BaseRepository } from './base.repository';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import  User  from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/UserMapper';
import { UserModel } from '../models/UserModel';
import {ILogger} from "../../shared/types/ILogger";

/**
 * Implementación concreta del repositorio de usuario.
 * @class
 * @extends BaseRepository
 * @implements IUserRepository
 */
export class UserRepository extends BaseRepository implements IUserRepository {
  constructor(
      api: AxiosInstance,
      logger: ILogger
  ) {
    super(api, logger);
  }

  /**
   * Obtiene los datos del usuario autenticado.
   * @async
   * @returns {Promise<User>} Entidad de usuario del dominio
   * @throws {HttpError | NetworkError} Errores específicos del dominio
   */
  async getUser(): Promise<User> {
    try {
      this.logger.debug('[UserRepository] Obteniendo datos de usuario');

      const response = await this.api.get<UserModel>('/Users/user-information');
      this.ensureSuccessStatus(response);

      this.logger.info('[UserRepository] Datos de usuario obtenidos exitosamente');
      return UserMapper.toDomain(response.data);

    } catch (error) {
      const processedError = this.handleHttpError(error, 'getUser');
      this.logger.error('[UserRepository] Error obteniendo usuario', processedError);
      throw processedError;
    }
  }

  /**
   * Actualiza la información del usuario.
   * @async
   * @param {Partial<User>} userData - Datos actualizados del usuario
   * @returns {Promise<User>} Usuario actualizado
   * @throws {HttpError | NetworkError} Errores específicos del dominio
   */
  async updateUser(userData: Partial<User>): Promise<User> {
    try {
      this.logger.debug('[UserRepository] Actualizando datos de usuario', { userData });

      const modelData = UserMapper.toModel(userData as User);
      const response = await this.api.patch<UserModel>('/Users/update', modelData);
      this.ensureSuccessStatus(response);

      this.logger.info('[UserRepository] Usuario actualizado exitosamente');
      return UserMapper.toDomain(response.data);

    } catch (error) {
      const processedError = this.handleHttpError(error, 'updateUser');
      this.logger.error('[UserRepository] Error actualizando usuario', processedError);
      throw processedError;
    }
  }
}