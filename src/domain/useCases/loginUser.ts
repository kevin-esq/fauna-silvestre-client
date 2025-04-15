import IAuthRepository from "../interfaces/IAuthRepository";
import { Credentials } from "../../data/models/AuthModels";

export default async function loginUser(authRepository: IAuthRepository, credentials: Credentials) {
    try {
      const token = await authRepository.login(credentials);
      return token;
    } catch (error) {
      throw error;
    }
  }