import IAuthRepository from "../interfaces/IAuthRepository";
import { UserData } from "../../data/models/AuthModels";

export default async function registerUser(authRepository: IAuthRepository, userData: UserData) {
    try {
      const response = await authRepository.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  } 