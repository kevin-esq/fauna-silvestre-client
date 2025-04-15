import User from "../entities/User";

export default class IUserRepository {
    async getUser(): Promise<User> { throw new Error("Method not implemented."); }
  }