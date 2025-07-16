import { IAuthRepository } from "../interfaces/auth.repository.interface";
import { Credentials } from "../models/auth.models";

export default async function loginUser(authRepository: IAuthRepository, credentials: Credentials) {
    const token = await authRepository.login(credentials);
    return token;
}