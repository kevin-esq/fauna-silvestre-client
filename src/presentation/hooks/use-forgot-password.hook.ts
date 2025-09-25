import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/auth.context';
import { useLoading } from '../contexts/loading.context';
import { useNavigationActions } from '../navigation/navigation-provider';

export enum ResetStep {
  EMAIL = 'EMAIL',
  CODE = 'CODE',
  PASSWORD = 'PASSWORD'
}

export const useForgotPassword = () => {
  const auth = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { navigate } = useNavigationActions();

  const [currentStep, setCurrentStep] = useState<ResetStep>(ResetStep.EMAIL);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sendResetPasswordEmail = useCallback(async () => {
    showLoading();
    try {
      const success = await auth.sendResetPasswordEmail(email.toLowerCase());
      if (!success && auth.error) {
        setError(auth.error);
        hideLoading();
        return;
      }
      setMessage('Código enviado al correo electrónico');
      setCurrentStep(ResetStep.CODE);
    } catch {
      if (auth.error) setError(auth.error);
    } finally {
      hideLoading();
    }
  }, [email, auth, showLoading, hideLoading]);

  const verifyResetCode = useCallback(async () => {
    if (verificationCode.length !== 5) {
      setError('El código debe tener 5 dígitos');
      return;
    }
    showLoading();
    try {
      const tokenValid = await auth.verifyResetCode(
        email.toLowerCase(),
        verificationCode
      );
      if (auth.error) {
        setError(auth.error || 'Código inválido o expirado');
        return;
      }
      setToken(tokenValid);
      setMessage('Código verificado correctamente');
      setCurrentStep(ResetStep.PASSWORD);
    } catch {
      if (auth.error) setError(auth.error);
      setToken('');
    } finally {
      hideLoading();
    }
  }, [verificationCode, email, auth, showLoading, hideLoading]);

  const handlePasswordReset = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    showLoading();
    try {
      await auth.resetPassword(token, email.toLowerCase(), newPassword);
      Alert.alert(
        'Contraseña Actualizada',
        'Tu contraseña ha sido cambiada exitosamente.',
        [{ text: 'OK', onPress: () => navigate('Login') }]
      );
    } catch {
      if (auth.error) setError(auth.error);
    } finally {
      hideLoading();
    }
  }, [
    newPassword,
    confirmPassword,
    token,
    email,
    auth,
    showLoading,
    hideLoading,
    navigate
  ]);

  return {
    currentStep,
    email,
    setEmail,
    verificationCode,
    setVerificationCode,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    message,
    error: error || auth.error,
    sendResetPasswordEmail,
    verifyResetCode,
    handlePasswordReset
  };
};
