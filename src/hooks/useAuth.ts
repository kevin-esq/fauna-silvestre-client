import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import AuthRepository from '../data/repositories/AuthRepository';
import loginUser from '../domain/useCases/loginUser';
import registerUser from '../domain/useCases/registerUser';
import forgotPassword from '../domain/useCases/forgotPassword';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const authRepository = new AuthRepository();

  const login = async (credentials, rememberMe) => {
    try {
      const loggedUser = await loginUser(authRepository, credentials);
      setUser(loggedUser);
      if (rememberMe) {
        await SecureStore.setItemAsync('userToken', loggedUser.token);
      }
      return loggedUser;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const registeredUser = await registerUser(authRepository, userData);
      setUser(registeredUser);
      await SecureStore.setItemAsync('userToken', registeredUser.token);
      return registeredUser;
    } catch (error) {
      throw error;
    }
  };

  const forgot = async (email) => {
    try {
      const result = await forgotPassword(authRepository, email);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('userToken');
  };

  return { user, login, register, forgot, logout };
};

export default useAuth;
