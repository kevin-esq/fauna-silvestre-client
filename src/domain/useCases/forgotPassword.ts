import IAuthRepository from "../interfaces/IAuthRepository";

export default async function forgotPassword(authRepository: IAuthRepository, email: string) {
    try {
      const response = await authRepository.forgotPassword(email);
      return response;
    } catch (error) {
      throw error;
    }
  }