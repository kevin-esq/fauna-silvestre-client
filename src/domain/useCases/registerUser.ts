import {IAuthRepository} from "../interfaces/IAuthRepository";
import {UserData} from "../models/AuthModels";

export default async function registerUser(authRepository: IAuthRepository, userData: UserData) {
    try {
        return await authRepository.register(userData);
    } catch (error) {
      throw error;
    }
  }