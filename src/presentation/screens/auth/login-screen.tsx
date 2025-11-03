import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';

import { useNavigationActions } from '@/presentation/navigation/navigation-provider';
import { useDoubleBackExit } from '@/presentation/hooks/common/use-double-back-exit.hook';
import { useLoginForm } from '@/presentation/hooks/auth/use-login-form.hook';
import {
  useTheme,
  themeVariables
} from '@/presentation/contexts/theme.context';

import AuthContainer from '@/presentation/components/auth/auth-container.component';
import AuthTextInput from '@/presentation/components/auth/auth-text-input.component';
import ErrorMessage from '@/presentation/components/auth/error-message.component';
import CustomButton from '@/presentation/components/ui/custom-button.component';
import SponsorsFooter from '@/presentation/components/auth/sponsors-footer.component';
import { SupportFooter } from '@/presentation/components/auth/support-footer.component';
import { createStyles } from '@/presentation/screens/auth/login-screen.styles';
import { useAuth } from '@/presentation/contexts/auth.context';

const LoginScreen = () => {
  useDoubleBackExit();

  const { navigate } = useNavigationActions();
  const {
    username,
    setUsername,
    password,
    setPassword,
    error,
    rememberMe,
    setRememberMe,
    handleLogin
  } = useLoginForm();

  const { theme } = useTheme();
  const variables = themeVariables(theme);
  const styles = createStyles(variables);

  const { clearError } = useAuth();

  const errorType = useMemo(() => {
    if (!error) return null;

    const lowerError = error.toLowerCase();

    if (
      lowerError.includes('usuario') &&
      (lowerError.includes('no existe') ||
        lowerError.includes('no encontrado') ||
        lowerError.includes('not found') ||
        lowerError.includes('inválido') ||
        lowerError.includes('no registrado') ||
        lowerError.includes('no válido'))
    ) {
      return 'username';
    }

    if (
      lowerError.includes('contraseña') &&
      (lowerError.includes('incorrecta') ||
        lowerError.includes('inválida') ||
        lowerError.includes('incorrecta') ||
        lowerError.includes('no coincide') ||
        lowerError.includes('no válida') ||
        lowerError.includes('errónea') ||
        lowerError.includes('equivocada'))
    ) {
      return 'password';
    }

    if (
      lowerError.includes('credenciales incorrectas') ||
      lowerError.includes('credenciales inválidas') ||
      lowerError.includes('invalid credentials')
    ) {
      return 'both';
    }

    return null;
  }, [error]);

  return (
    <AuthContainer
      title="Bienvenido"
      subtitle="Inicia sesión para continuar"
      variables={variables}
    >
      <ErrorMessage message={error} variables={variables} />

      <AuthTextInput
        iconName="person"
        label="Usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        error={errorType === 'username' || errorType === 'both' ? true : false}
        variables={variables}
        variant="outlined"
        size="large"
        containerStyle={styles.inputContainer}
      />

      <AuthTextInput
        iconName="lock"
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errorType === 'password' || errorType === 'both' ? true : false}
        variables={variables}
        variant="outlined"
        size="large"
        containerStyle={styles.inputContainer}
      />

      <View style={styles.rememberContainer}>
        <Text style={styles.rememberText}>Recordar sesión</Text>
        <Switch
          value={rememberMe}
          onValueChange={setRememberMe}
          trackColor={{
            false: variables['--border'],
            true: variables['--primary-light']
          }}
          thumbColor={
            rememberMe ? variables['--primary'] : variables['--text-secondary']
          }
        />
      </View>

      <CustomButton
        title="Ingresar"
        onPress={handleLogin}
        style={styles.button}
        disabled={!username || !password}
        variables={variables}
      />

      <TouchableOpacity
        onPress={() => {
          clearError();
          navigate('ForgotPassword');
        }}
        style={styles.forgotPassword}
      >
        <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>¿No tienes cuenta?</Text>

      <CustomButton
        title="Registrarse"
        onPress={() => {
          clearError();
          navigate('Register');
        }}
        style={styles.button}
        variant="secondary"
        variables={variables}
      />

      <SupportFooter
        showContextualHelp={!!error}
        contextMessage="¿Problemas para iniciar sesión?"
      />

      <SponsorsFooter variables={variables} />
    </AuthContainer>
  );
};

export default React.memo(LoginScreen);
