import { useState, useCallback } from 'react';
import { useAuth } from '@/presentation/contexts/auth.context';
import { useLoading } from '@/presentation/contexts/loading.context';
import { useNavigationActions } from '@/presentation/navigation/navigation-provider';

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
  const [successModal, setSuccessModal] = useState(false);

  const handleEmailChange = useCallback(
    (value: string) => {
      setEmail(value);
      if (error) setError(null);
      if (auth.error) auth.clearError();
    },
    [error, auth]
  );

  const handleCodeChange = useCallback(
    (value: string) => {
      setVerificationCode(value);
      if (error) setError(null);
      if (auth.error) auth.clearError();
    },
    [error, auth]
  );

  const handlePasswordChange = useCallback(
    (value: string) => {
      setNewPassword(value);
      if (error) setError(null);
      if (auth.error) auth.clearError();
    },
    [error, auth]
  );

  const handleConfirmPasswordChange = useCallback(
    (value: string) => {
      setConfirmPassword(value);
      if (error) setError(null);
      if (auth.error) auth.clearError();
    },
    [error, auth]
  );

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
      setError(null);
      if (auth.error) auth.clearError();
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
      setError(null);
      if (auth.error) auth.clearError();
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
      setSuccessModal(true);
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
    hideLoading
  ]);

  const handleSuccessModalClose = () => {
    setSuccessModal(false);
    navigate('Login');
  };

  return {
    currentStep,
    email,
    setEmail: handleEmailChange,
    verificationCode,
    setVerificationCode: handleCodeChange,
    newPassword,
    setNewPassword: handlePasswordChange,
    confirmPassword,
    setConfirmPassword: handleConfirmPasswordChange,
    message,
    error: error || auth.error,
    successModal,
    handleSuccessModalClose,
    sendResetPasswordEmail,
    verifyResetCode,
    handlePasswordReset
  };
};
