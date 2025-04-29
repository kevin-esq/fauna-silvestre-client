import { IAuthRepository } from "../interfaces/IAuthRepository";
import { Credentials } from "../../data/models/AuthModels";

export default async function loginUser(authRepository: IAuthRepository, credentials: Credentials) {
    try {
      console.log("[loginUser] credentials", credentials);
      const token = await authRepository.login(credentials);
      console.log("[loginUser] token", token);
      return token;
    } catch (error) {
      throw error;
    }
  }