// En tu hook useAuth modificado
import { useContext, useMemo, useState } from 'react';
import { AuthRepository } from '../data/repositories/AuthRepository';
import loginUser from '../domain/useCases/loginUser';
import registerUser from '../domain/useCases/registerUser';
import forgotPassword from '../domain/useCases/forgotPassword';
import { Credentials, UserData } from '../data/models/AuthModels';
import { AuthContext } from '../contexts/AuthContext';
import { ContextLogger } from '../utils/logger';

const useAuth = () => {
  const [user, setUser] = useState<string | null>(null);
  const { signOut, signIn, api } = useContext(AuthContext);
  // Crear instancia del logger
  const logger = useMemo(() => new ContextLogger('Auth'), []);
  // Inyectar el logger al repositorio
  const authRepository = useMemo(
    () => new AuthRepository(api, logger),
    [api, logger]
  );

  const login = async (credentials: Credentials, rememberMe: boolean): Promise<string> => {
    logger.debug('Iniciando proceso de login');
    try {
      const token = await loginUser(authRepository, credentials);
      logger.info('Login exitoso');
      if (token) signIn(token, rememberMe);
      return token;
    } catch (error) {
      logger.error('Error en login', error as Error);
      throw error;
    }
  };

  const register = async (userData: UserData): Promise<number> => {
    logger.debug('Registrando nuevo usuario');
    try {
      const result = await registerUser(authRepository, userData);
      logger.info('Registro exitoso');
      return result;
    } catch (error) {
      logger.error('Error en registro', error as Error);
      throw error;
    }
  };

  const forgot = async (email: string): Promise<number> => {
    logger.debug('Solicitando recuperación de contraseña');
    try {
      const result = await forgotPassword(authRepository, email);
      logger.info('Recuperación de contraseña iniciada');
      return result;
    } catch (error) {
      logger.error('Error en recuperación de contraseña', error as Error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    logger.debug('Ejecutando logout');
    setUser(null);
    signOut();
    logger.info('Logout completado');
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