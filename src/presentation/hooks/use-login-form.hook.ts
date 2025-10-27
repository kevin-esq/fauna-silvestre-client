import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/auth.context';
import { useLoading } from '../contexts/loading.context';
import { Credentials } from '../../domain/models/auth.models';

export const useLoginForm = () => {
  const auth = useAuth();
  const { showLoading, hideLoading } = useLoading();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleUsernameChange = useCallback(
    (value: string) => {
      setUsername(value);
      if (auth.error) {
        auth.clearError();
      }
    },
    [auth]
  );

  const handlePasswordChange = useCallback(
    (value: string) => {
      setPassword(value);
      if (auth.error) {
        auth.clearError();
      }
    },
    [auth]
  );

  const handleLogin = useCallback(async () => {
    if (!username || !password) {
      return;
    }

    showLoading();

    const credentials: Credentials = {
      UserName: username.trim(),
      Password: password
    };

    try {
      await auth.signIn(credentials, rememberMe);
    } catch {
    } finally {
      hideLoading();
    }
  }, [username, password, auth, showLoading, hideLoading, rememberMe]);

  return {
    username,
    setUsername: handleUsernameChange,
    password,
    setPassword: handlePasswordChange,
    error: auth.error,
    handleLogin,
    rememberMe,
    setRememberMe
  };
};
