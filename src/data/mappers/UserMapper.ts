// data/mappers/UserMapper.ts
import User  from '../../domain/entities/user.entity';
import { UserModel } from '../models/UserModel';

/**
 * Mapeador para convertir modelos de usuario a entidades del dominio.
 * @class
 */
export class UserMapper {
  /**
   * Convierte un modelo de usuario a entidad.
   * @static
   * @param {UserModel} data - Modelo de datos de la API
   * @returns {User} Entidad de dominio
   */
  static toDomain(data: UserModel): User {
    return new User(data.id, data.userName, data.name, data.lastName, data.locality, data.gender, data.age, data.email, data.token);
  }

  /**
   * Convierte una entidad de usuario a modelo.
   * @static
   * @param {User} entity - Entidad de dominio
   * @returns {UserModel} Modelo para la API
   */
  static toModel(entity: User): UserModel {
    return {
      id: entity.id,
      userName: entity.UserName,
      name: entity.name,
      lastName: entity.lastName,
      locality: entity.locality,
      gender: entity.gender,
      age: entity.age,
      email: entity.email,
      token: entity.token
    };
  }
}