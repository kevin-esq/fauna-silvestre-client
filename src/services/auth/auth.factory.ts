import { AxiosInstance } from 'axios';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { ApiService } from '@/services/http/api.service';
import { ConsoleLogger } from '@/services/logging/console-logger';
import { ILogger } from '@/services/logging/ILogger';

export class AuthServiceFactory {
  static create(api?: AxiosInstance, logger?: ILogger): AuthService {
    const apiInstance = api || ApiService.getInstance().client;
    const loggerInstance = logger || new ConsoleLogger('info');
    const tokenService = new TokenService(apiInstance, loggerInstance);

    return AuthService.getInstance({
      api: apiInstance,
      tokenService: tokenService,
      logger: loggerInstance
    });
  }
}

export const authService = AuthServiceFactory.create();
