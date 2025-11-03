import User from '@/domain/entities/user.entity';
import { UserModel } from '@/data/models/UserModel';

export class UserMapper {
  static toDomain(data: UserModel): User {
    return new User(
      '',
      data.userName,
      data.name,
      data.lastName,
      data.locality,
      data.gender,
      data.age,
      data.email,
      '',
      ''
    );
  }

  static toModel(entity: User): UserModel {
    return {
      userName: entity.UserName,
      name: entity.name,
      lastName: entity.lastName,
      locality: entity.locality,
      gender: entity.gender,
      age: entity.age,
      email: entity.email
    };
  }
}
