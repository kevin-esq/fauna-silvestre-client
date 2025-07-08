import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { useForgotPassword, ResetStep } from '../../hooks/use-forgot-password.hook';

// Reusable Components
import AuthContainer from '../../components/auth/auth-container.component';
import AuthTextInput from '../../components/auth/auth-text-input.component';
import CodeInput from '../../components/auth/code-input.component';
import ErrorMessage from '../../components/auth/error-message.component';
import CustomButton from '../../components/ui/custom-button.component';
import { createStyles } from './forgot-password-screen.styles';
import { useTheme } from '../../contexts/theme-context';
import { themeVariables } from '../../contexts/theme-context';

// Step Components
const EmailStep = ({ email, setEmail, onContinue, theme, styles }: { email: string; setEmail: (email: string) => void; onContinue: () => void, theme: any, styles: any }) => (
  <>
    <AuthTextInput
      iconName="email"
      placeholder="Correo electrónico"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      autoCapitalize="none"
      theme={theme}    />
    <CustomButton title="Enviar Código" onPress={onContinue} style={styles.button} />
  </>
);

const CodeStep = ({ code, setCode, onContinue, onResend, styles }: { code: string; setCode: (code: string) => void; onContinue: () => void; onResend: () => void, theme: any, styles: any }) => (
  <>
    <CodeInput code={code} setCode={setCode} />
    <CustomButton title="Verificar Código" onPress={onContinue} style={styles.button} />
    <TouchableOpacity onPress={onResend}>
      <Text style={styles.resendText}>Reenviar código</Text>
    </TouchableOpacity>
  </>
);

const PasswordStep = ({ newPassword, setNewPassword, confirmPassword, setConfirmPassword, onContinue, theme, styles }: { newPassword: string; setNewPassword: (newPassword: string) => void; confirmPassword: string; setConfirmPassword: (confirmPassword: string) => void; onContinue: () => void, theme: any, styles: any }) => (
  <>
    <AuthTextInput
      iconName="lock-outline"
      placeholder="Nueva contraseña"
      value={newPassword}
      onChangeText={setNewPassword}
      secureTextEntry
      theme={theme}
    />
    <AuthTextInput
      iconName="lock-reset"
      placeholder="Confirmar contraseña"
      value={confirmPassword}
      onChangeText={setConfirmPassword}
      secureTextEntry
      theme={theme}
    />
    <CustomButton title="Cambiar Contraseña" onPress={onContinue} style={styles.button} />
  </>
);

const ForgotPasswordScreen = () => {
  const { navigate } = useNavigationActions();
  const {
    currentStep, email, setEmail, verificationCode, setVerificationCode,
    newPassword, setNewPassword, confirmPassword, setConfirmPassword,
    message, error, sendResetPasswordEmail, verifyResetCode, handlePasswordReset,
  } = useForgotPassword();

  const { theme } = useTheme();
  const variables = themeVariables(theme);
  const styles = createStyles(variables);


  const subtitles = {
    [ResetStep.EMAIL]: 'Ingresa tu correo para enviarte un código',
    [ResetStep.CODE]: 'Ingresa el código de 5 dígitos que recibiste', 
    [ResetStep.PASSWORD]: 'Crea tu nueva contraseña',
  };

  return (
    <AuthContainer title="Recuperar Contraseña 🔐" subtitle={subtitles[currentStep]}>
      <ErrorMessage message={error || message} isSuccess={!!message && !error} />

      {currentStep === ResetStep.EMAIL && (
        <EmailStep email={email} setEmail={setEmail} onContinue={sendResetPasswordEmail} theme={theme} styles={styles} />
      )}
      {currentStep === ResetStep.CODE && (
        <CodeStep 
          code={verificationCode} 
          setCode={setVerificationCode} 
          onContinue={verifyResetCode} 
          onResend={sendResetPasswordEmail} 
          theme={theme} 
          styles={styles}
        />
      )}
      {currentStep === ResetStep.PASSWORD && (
        <PasswordStep 
          newPassword={newPassword} 
          setNewPassword={setNewPassword} 
          confirmPassword={confirmPassword} 
          setConfirmPassword={setConfirmPassword} 
          onContinue={handlePasswordReset} 
          theme={theme} 
          styles={styles}
        />
      )}

      <Text style={styles.orText}>¿Recordaste tu contraseña?</Text>
      <CustomButton
        title="Volver a Iniciar Sesión"
        onPress={() => navigate('Login')}
        variant="secondary"
        style={styles.button}
      />
    </AuthContainer>
  );
};

export default ForgotPasswordScreen;