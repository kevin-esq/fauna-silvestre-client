import User from '@/domain/entities/user.entity';
import { UserRepository } from '../../data/repositories/user.repository';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { UsersResponse } from '../../domain/models/user.models';
import { ApiService } from '../http/api.service';
import { ConsoleLogger } from '../logging/console-logger';

export interface UserPaginationOptions {
  page: number;
  size: number;
}

export class UserService {
  private readonly repository: IUserRepository;
  private readonly logger: ConsoleLogger;

  constructor(apiService: ApiService) {
    this.repository = new UserRepository(
      apiService.client,
      new ConsoleLogger()
    );
    this.logger = new ConsoleLogger();
  }

  async getLocalUser(): Promise<User> {
    try {
      this.logger.debug('Obteniendo usuario local');
      const response = await this.repository.getLocalUser();
      this.logger.info('Usuario local obtenido exitosamente');
      return response;
    } catch (error) {
      this.logger.error('Error al obtener usuario local', error as Error);
      throw new Error('No se pudo obtener el usuario local');
    }
  }

  async getAllUsers(options: UserPaginationOptions): Promise<UsersResponse> {
    try {
      this.logger.debug('Obteniendo usuarios', options);
      const response = await this.repository.getAllUsers(
        options.page,
        options.size
      );
      this.logger.info('Usuarios obtenidos exitosamente', {
        total: response.pagination.total,
        page: response.pagination.page
      });
      return response;
    } catch (error) {
      this.logger.error('Error al obtener usuarios', error as Error);
      throw new Error('No se pudieron obtener los usuarios');
    }
  }
}

export class UserServiceFactory {
  private static instance: UserService | null = null;

  static getInstance(): UserService {
    if (!this.instance) {
      const apiService = ApiService.getInstance();
      this.instance = new UserService(apiService);
    }
    return this.instance;
  }

  static createInstance(apiService?: ApiService): UserService {
    if (apiService) {
      return new UserService(apiService);
    }
    return this.getInstance();
  }
}

export const userService = UserServiceFactory.getInstance();
