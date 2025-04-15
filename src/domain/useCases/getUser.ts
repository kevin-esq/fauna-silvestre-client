import User from "../entities/User";
import IUserRepository from "../interfaces/IUserRepository";

export default async function getUser(userRepository: IUserRepository) : Promise<User> {
    try {
        const user = await userRepository.getUser();
        return user;
    } catch (error) {
        throw error;
    }
}