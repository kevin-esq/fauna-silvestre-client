import { useState } from 'react';
import AuthRepository from '../data/repositories/AuthRepository';
import loginUser from '../domain/useCases/loginUser';
import registerUser from '../domain/useCases/registerUser';
import forgotPassword from '../domain/useCases/forgotPassword';
import { Credentials, UserData } from '../data/models/AuthModels';
//import { saveToken, clearToken } from '../utils/tokenStorage';
import { useAuthContext } from '../contexts/AuthContext';

const authRepository = new AuthRepository();

const useAuth = () => {
  const [user, setUser] = useState<string | null>(null);

  const { setAuthToken } = useAuthContext();

  const login = async (credentials: Credentials, rememberMe: boolean): Promise<string> => {
    const token = await loginUser(authRepository, credentials);
    setUser(token);

    if (rememberMe) {
      setAuthToken(token);
    }
    return token;
  };

  const register = async (userData: UserData): Promise<number> => {
    return await registerUser(authRepository, userData);
  };

  const forgot = async (email: string): Promise<number> => {
    return await forgotPassword(authRepository, email);
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    setAuthToken("");
  };

  return {
    user,
    login,
    register,
    forgot,
    logout,
  };
};

export default useAuth;