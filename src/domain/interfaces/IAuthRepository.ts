import User from "../entities/User";

interface Credentials {
    username: string;
    password: string;
  }

  interface UserData {
    name: string;
    email: string;
    password: string;
  }

export default class IAuthRepository {
    async login(credentials: Credentials) : Promise<User> {
      throw new Error("Method not implemented.");
    }
    async register(userData: UserData) : Promise<User> {
      throw new Error("Method not implemented.");
    }
    async forgotPassword(email: string) {
      throw new Error("Method not implemented.");
    }
  }
  