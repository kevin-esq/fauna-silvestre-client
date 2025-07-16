import React from 'react';
import { Text, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { useForgotPassword, ResetStep } from '../../hooks/use-forgot-password.hook';

// Reusable Components
import AuthContainer from '../../components/auth/auth-container.component';
import AuthTextInput from '../../components/auth/auth-text-input.component';
import CodeInput from '../../components/auth/code-input.component';
import ErrorMessage from '../../components/auth/error-message.component';
import CustomButton from '../../components/ui/custom-button.component';
import { createStyles } from './forgot-password-screen.styles';
import { useTheme, Theme, themeVariables } from '../../contexts/theme-context';

type StepProps = {
  theme: Theme;
  styles: { button: StyleProp<ViewStyle>; resendText?: StyleProp<TextStyle> };
};

// Step Components
const EmailStep = ({ email, setEmail, onContinue, theme, styles }: StepProps & { email: string; setEmail: (email: string) => void; onContinue: () => void }) => (
  <>
    <AuthTextInput
      iconName="email"
      placeholder="Correo electrónico"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      autoCapitalize="none"
      variables={themeVariables(theme)}    />
    <CustomButton title="Enviar Código" onPress={onContinue} style={styles.button} variables={themeVariables(theme)} />
  </>
);

const CodeStep = ({ code, setCode, onContinue, onResend, styles, theme }: StepProps & { code: string; setCode: (code: string) => void; onContinue: () => void; onResend: () => void }) => (
  <>
    <CodeInput code={code} setCode={setCode} variables={themeVariables(theme)} />
    <CustomButton title="Verificar Código" onPress={onContinue} style={styles.button} variables={themeVariables(theme)} />
    <TouchableOpacity onPress={onResend}>
      <Text style={styles.resendText}>Reenviar código</Text>
    </TouchableOpacity>
  </>
);

const PasswordStep = ({ newPassword, setNewPassword, confirmPassword, setConfirmPassword, onContinue, theme, styles }: StepProps & { newPassword: string; setNewPassword: (newPassword: string) => void; confirmPassword: string; setConfirmPassword: (confirmPassword: string) => void; onContinue: () => void }) => (
  <>
    <AuthTextInput
      iconName="lock-outline"
      placeholder="Nueva contraseña"
      value={newPassword}
      onChangeText={setNewPassword}
      secureTextEntry
      variables={themeVariables(theme)}
    />
    <AuthTextInput
      iconName="lock-reset"
      placeholder="Confirmar contraseña"
      value={confirmPassword}
      onChangeText={setConfirmPassword}
      secureTextEntry
      variables={themeVariables(theme)}
    />
    <CustomButton title="Cambiar Contraseña" onPress={onContinue} style={styles.button} variables={themeVariables(theme)}/>
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
    <AuthContainer title="Recuperar Contraseña 🔐" subtitle={subtitles[currentStep]} variables={variables}>
      <ErrorMessage message={error || message} isSuccess={!!message && !error} variables={variables} />

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
        variables={variables}
      />
    </AuthContainer>
  );
};

export default ForgotPasswordScreen;