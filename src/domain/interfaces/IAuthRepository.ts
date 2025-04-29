import { AxiosInstance } from 'axios';
import { Credentials, UserData } from '../../data/models/AuthModels';
import { ILogger } from '../../data/repositories/AuthRepository';

/**
 * Clase abstracta que define el contrato para un repositorio de Auth.
 * - Recibe la instancia de Axios por constructor.
 * - Declara un miembro `api` que los hijos usarán.
 */
export abstract class IAuthRepository {
  protected readonly api: AxiosInstance;
  protected readonly logger: ILogger;

  constructor(api: AxiosInstance, logger: ILogger) {
    this.api = api;
    this.logger = logger;
  }

  /** Inicia sesión y devuelve el token */
  abstract login(credentials: Credentials): Promise<string>;

  /** Registra un usuario y devuelve el status HTTP */
  abstract register(userData: UserData): Promise<number>;

  /** Envía email para recuperación y devuelve el status HTTP */
  abstract forgotPassword(email: string): Promise<number>;
}
