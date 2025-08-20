import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/auth.context';
import { useLoading } from '../contexts/loading.context';
import { Credentials } from '../../domain/models/auth.models';

export const useLoginForm = () => {
  const auth = useAuth();
  const { showLoading, hideLoading } = useLoading();

  const [username, setUsername] = useState('MizunoCM');
  const [password, setPassword] = useState('Mizuno1508');
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleAuthError = (err: unknown) => {
    if (err instanceof Error) {
      switch (err.message) {
        case 'The Username is incorrect':
          return 'Nombre de usuario es incorrecto';
        case 'The password is incorrect':
          return 'La contraseña es incorrecta';
        default:
          return err.message || 'Error desconocido';
      }
    }
    return 'Ocurrió un error inesperado';
  };

  const handleLogin = useCallback(async () => {
    if (!username || !password) {
        setError("El nombre de usuario y la contraseña son obligatorios.");
        return;
    }
    
    showLoading();
    setError(null);

    const credentials: Credentials = {
      UserName: username.trim(),
      Password: password,
    };

    try {
      await auth.signIn(credentials, rememberMe);
    } catch (err) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
    } finally {
      hideLoading();
    }
  }, [username, password, auth, showLoading, hideLoading, rememberMe]);

  return {
    username,
    setUsername,
    password,
    setPassword,
    error,
    handleLogin,
    rememberMe,
    setRememberMe,
  };
};
