import { Credentials, UserData } from '../../data/models/AuthModels';

export default class IAuthRepository {
    async login(credentials: Credentials) : Promise<string> {
      throw new Error("Method not implemented.");
    }
    async register(userData: UserData) : Promise<number> {
      throw new Error("Method not implemented.");
    }
    async forgotPassword(email: string) : Promise<number> {
      throw new Error("Method not implemented.");
    }
  }