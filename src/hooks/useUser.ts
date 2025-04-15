import User from "../domain/entities/User";
import { useState, useEffect } from "react";
import getUser from "../domain/useCases/getUser";
import IUserRepository from "../domain/interfaces/IUserRepository";
import UserRepository from "../data/repositories/UserRepository";

const useUser = () => {
    const [user, setUser] = useState<User | null>(null);

    const userRepository = new UserRepository();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await getUser(userRepository);
                setUser(user);
            } catch (error) {
                console.error("Error al obtener el usuario:", error);
            }
        };

        fetchUser();
    }, []);

    return user;
};

export default useUser;