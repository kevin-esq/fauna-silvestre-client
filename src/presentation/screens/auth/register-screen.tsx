import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { useRegisterForm } from '../../hooks/use-register-form.hook';
import {
  genderOptions,
  locationOptions
} from '../../../shared/constants/registerOptions';
import { useTheme } from '../../contexts/theme.context';
import { themeVariables } from '../../contexts/theme.context';

import AuthContainer from '../../components/auth/auth-container.component';
import AuthTextInput from '../../components/auth/auth-text-input.component';
import ErrorMessage from '../../components/auth/error-message.component';
import CustomButton from '../../components/ui/custom-button.component';
import CustomPicker from '../../components/ui/custom-picker.component';
import StepIndicator from '../../components/auth/step-indicator.component';
import CustomModal from '../../components/ui/custom-modal.component';
import { SupportFooter } from '../../components/auth/support-footer.component';
import { createStyles } from './register-screen.styles';
import { useAuth } from '@/presentation/contexts/auth.context';

const TOTAL_STEPS = 3;

const RegisterScreen = () => {
  const { navigate } = useNavigationActions();
  const { theme } = useTheme();
  const variables = themeVariables(theme);
  const {
    state,
    onChange,
    handleRegister,
    successModal,
    handleSuccessModalClose
  } = useRegisterForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});
  const { clearError } = useAuth();

  const {
    username,
    name,
    lastName,
    location,
    alternativeLocation,
    gender,
    age,
    email,
    password,
    confirmPassword,
    error
  } = state;

  const styles = createStyles(variables);

  const validateStep = (step: number): string => {
    switch (step) {
      case 1:
        if (!name.trim()) return 'El nombre es requerido';
        if (!lastName.trim()) return 'Los apellidos son requeridos';
        if (!username.trim()) return 'El nombre de usuario es requerido';
        if (username.length < 3)
          return 'El nombre de usuario debe tener al menos 3 caracteres';
        break;

      case 2:
        if (!location) return 'La localidad es requerida';
        if (location === 'other' && !alternativeLocation.trim())
          return 'Especifica tu localidad';
        if (!gender) return 'El género es requerido';
        if (!age.trim()) return 'La edad es requerida';
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 65)
          return 'La edad debe estar entre 18 y 65 años';
        break;

      case 3:
        if (!email.trim()) return 'El correo electrónico es requerido';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email))
          return 'Ingresa un correo electrónico válido';
        if (!password.trim()) return 'La contraseña es requerida';
        if (password.length < 6)
          return 'La contraseña debe tener al menos 6 caracteres';
        if (!confirmPassword.trim()) return 'Confirma tu contraseña';
        if (password !== confirmPassword) return 'Las contraseñas no coinciden';
        break;
    }
    return '';
  };

  const handleNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      setStepErrors({ ...stepErrors, [currentStep]: error });
      return;
    }

    setStepErrors({ ...stepErrors, [currentStep]: '' });
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    const error = validateStep(currentStep);
    if (error) {
      setStepErrors({ ...stepErrors, [currentStep]: error });
      return;
    }
    handleRegister();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>Información Personal</Text>
            <Text style={styles.stepDescription}>
              Cuéntanos un poco sobre ti
            </Text>

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
            <AuthTextInput
              iconName="person-outline"
              placeholder="Nombre de usuario"
              value={username}
              onChangeText={onChange('username')}
              autoCapitalize="none"
              variables={variables}
            />
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>Información Demográfica</Text>
            <Text style={styles.stepDescription}>
              Ayúdanos a conocerte mejor
            </Text>

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
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>Credenciales de Acceso</Text>
            <Text style={styles.stepDescription}>Crea tu cuenta segura</Text>

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
              placeholder="Contraseña (mínimo 6 caracteres)"
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
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <AuthContainer
      title="Crear Cuenta"
      titleIcon={
        <Ionicons name="person-add" size={24} color={variables['--primary']} />
      }
      subtitle={`Paso ${currentStep} de ${TOTAL_STEPS}`}
      variables={variables}
    >
      <StepIndicator
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        variables={variables}
      />

      <ErrorMessage
        message={stepErrors[currentStep] || error}
        variables={variables}
      />

      {renderStepContent()}

      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <CustomButton
            title="Atrás"
            onPress={handleBack}
            variant="outline"
            style={styles.backButton}
            variables={variables}
          />
        )}

        {currentStep < TOTAL_STEPS ? (
          <CustomButton
            title="Siguiente"
            onPress={handleNext}
            style={styles.nextButton}
            variables={variables}
          />
        ) : (
          <CustomButton
            title="Registrarse"
            onPress={handleSubmit}
            style={styles.submitButton}
            variables={variables}
          />
        )}
      </View>

      <Text style={styles.orText}>¿Ya tienes una cuenta?</Text>
      <CustomButton
        title="Inicia Sesión"
        onPress={() => {
          clearError();
          navigate('Login');
        }}
        variant="outline"
        style={styles.loginButton}
        variables={variables}
      />

      <SupportFooter
        showContextualHelp={!!error}
        contextMessage="¿Problemas con el registro?"
      />

      <CustomModal
        isVisible={successModal}
        onClose={handleSuccessModalClose}
        title="Registro exitoso"
        description="Has sido registrado correctamente."
        type="alert"
        size="small"
        centered
        showFooter
        buttons={[
          {
            label: 'OK',
            onPress: handleSuccessModalClose,
            variant: 'primary'
          }
        ]}
      />
    </AuthContainer>
  );
};

export default RegisterScreen;
