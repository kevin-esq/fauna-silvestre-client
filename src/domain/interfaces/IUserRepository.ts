// domain/interfaces/IUserRepository.ts
import  User  from '../entities/User';

/**
 * Contrato para operaciones de usuario.
 * @interface
 */
export interface IUserRepository {
  getUser(): Promise<User>;
}