import User from "../domain/entities/User";
import { useState, useEffect, useContext, useMemo } from "react";
import getUser from "../domain/useCases/getUser";
import { UserRepository } from "../data/repositories/UserRepository";
import { AuthContext } from "../contexts/AuthContext";

const useUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const { api } = useContext(AuthContext);
    const userRepository = useMemo (() => new UserRepository(api), [api]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                console.log("userRepository es:", userRepository);
                const user = await getUser(userRepository);
                console.log("user es:", user);
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