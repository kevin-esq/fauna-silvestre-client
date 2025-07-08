import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';

import { useNavigationActions } from '../../navigation/navigation-provider';
import useDoubleBackExit from '../../hooks/use-double-back-exit.hook';
import { useLoginForm } from '../../hooks/use-login-form.hook';
import { useTheme, themeVariables } from '../../contexts/theme-context';

import AuthContainer from '../../components/auth/auth-container.component';
import AuthTextInput from '../../components/auth/auth-text-input.component';
import ErrorMessage from '../../components/auth/error-message.component';
import CustomButton from '../../components/ui/custom-button.component';
import { createStyles } from './login-screen.styles';

/**
 * LoginScreen handles user authentication through username and password inputs.
 */
const LoginScreen = () => {
  useDoubleBackExit();

  const { navigate } = useNavigationActions();
  const {
    username,
    setUsername,
    password,
    setPassword,
    error,
    handleLogin,
  } = useLoginForm();

  const { theme } = useTheme();
  const variables = themeVariables(theme);
  const styles = createStyles(variables);

  const [rememberMe, setRememberMe] = useState(false);

  return (
    <AuthContainer title="¡Hola! 👋" subtitle="Inicia sesión para continuar">
      <ErrorMessage message={error} />

      <AuthTextInput
        iconName="person"
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        error={!!error}
        theme={theme}
        style={[
          styles.input,
          {
            color: variables['--text'],
            borderColor: variables['--border'],
          },
        ]}
      />

      <AuthTextInput
        iconName="key"
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={!!error}
        theme={theme}
        style={[
          styles.input,
          {
            color: variables['--text'],
            borderColor: variables['--border'],
          },
        ]}
      />

      <View style={styles.rememberContainer}>
        <Text style={styles.rememberText}>Recordar sesión</Text>
        <Switch
          value={rememberMe}
          onValueChange={setRememberMe}
          trackColor={{ false: variables['--border'], true: variables['--primary-light'] }}
          thumbColor={rememberMe ? variables['--primary'] : variables['--text-secondary']}
        />
      </View>

      <CustomButton
        title="Ingresar"
        onPress={handleLogin}
        style={styles.button}
        disabled={!username || !password}
      />

      <TouchableOpacity
        onPress={() => navigate('ForgotPassword')}
        style={styles.forgotPassword}
      >
        <Text style={styles.forgotPasswordText}>
          ¿Olvidaste tu contraseña?
        </Text>
      </TouchableOpacity>

      <Text style={styles.orText}>¿No tienes cuenta?</Text>

      <CustomButton
        title="Registrarse"
        onPress={() => navigate('Register')}
        style={styles.button}
        variant="secondary"
      />
    </AuthContainer>
  );
};

export default LoginScreen;