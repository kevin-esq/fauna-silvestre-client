import React from 'react';
import { Text } from 'react-native';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { useRegisterForm } from '../../hooks/use-register-form.hook';
import { genderOptions, locationOptions } from '../../../shared/constants/registerOptions';
import { useTheme } from '../../contexts/theme.context';
import { themeVariables } from '../../contexts/theme.context';

// Reusable Components
import AuthContainer from '../../components/auth/auth-container.component';
import AuthTextInput from '../../components/auth/auth-text-input.component';
import ErrorMessage from '../../components/auth/error-message.component';
import CustomButton from '../../components/ui/custom-button.component';
import CustomPicker from '../../components/ui/custom-picker.component';
import { createStyles } from './register-screen.styles';

const RegisterScreen = () => {
  const { navigate } = useNavigationActions();
  const { theme } = useTheme();
  const variables = themeVariables(theme);
  const { state, onChange, handleRegister } = useRegisterForm();
  const { 
    username, name, lastName, location, alternativeLocation, 
    gender, age, email, password, confirmPassword, error 
  } = state;
  
  const styles = createStyles(variables);

  return (
    <AuthContainer title="Crear Cuenta" subtitle="Completa tus datos para empezar" variables={variables}>
      <ErrorMessage message={error} variables={variables} />

      <AuthTextInput
        iconName="person-outline"
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={onChange('username')}
        autoCapitalize="none"
        variables={variables}
      />
      <AuthTextInput
        iconName="badge"
        placeholder="Nombre(s)"
        value={name}
        onChangeText={onChange('name')}
        variables={variables}
      />
      <AuthTextInput
        iconName="person"
        placeholder="Apellidos"
        value={lastName}
        onChangeText={onChange('lastName')}
        variables={variables}
      />
      <CustomPicker
        iconName="location-on"
        selectedValue={location}
        onValueChange={onChange('location')}
        options={locationOptions}
      />
      {location === 'other' && (
        <AuthTextInput
          iconName="edit-location"
          placeholder="Especifica tu localidad"
          value={alternativeLocation}
          onChangeText={onChange('alternativeLocation')}
          variables={variables}
          />
      )}
      <CustomPicker
        iconName="wc"
        selectedValue={gender}
        onValueChange={onChange('gender')}
        options={genderOptions}
        />
      <AuthTextInput
        iconName="calendar-today"
        placeholder="Edad (18-65)"
        value={age}
        onChangeText={onChange('age')}
        keyboardType="numeric"
        variables={variables}
              />
      <AuthTextInput
        iconName="email"
        placeholder="Correo electrónico"
        value={email}
        onChangeText={onChange('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        variables={variables}
              />
      <AuthTextInput
        iconName="lock-outline"
        placeholder="Contraseña"
        value={password}
        onChangeText={onChange('password')}
        secureTextEntry
        variables={variables}
        />
      <AuthTextInput
        iconName="lock-reset"
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={onChange('confirmPassword')}
        secureTextEntry
        variables={variables}
              />

      <CustomButton title="Registrarse" onPress={handleRegister} style={styles.button} variables={variables} />

      <Text style={styles.orText}>¿Ya tienes una cuenta?</Text>
      <CustomButton
        title="Inicia Sesión"
        onPress={() => navigate('Login')}
        variant="secondary"
        style={styles.loginButton}
        variables={variables}
      />
    </AuthContainer>
  );
};

export default RegisterScreen;
