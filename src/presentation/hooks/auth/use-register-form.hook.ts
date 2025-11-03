import { useReducer, useCallback, useRef, useState } from 'react';
import { useAuth } from '@/presentation/contexts/auth.context';
import { useLoading } from '@/presentation/contexts/loading.context';
import { useNavigationActions } from '@/presentation/navigation/navigation-provider';
import { RegisterState } from '@/domain/types/register-state';
import { UserData } from '@/domain/models/auth.models';
import { validateRegisterFields } from '@/shared/utils/validation';
import { sanitizeRegisterFields } from '@/shared/utils/sanitize';
import { genderOptions } from '@/shared/constants/registerOptions';

const initialState: RegisterState = {
  username: '',
  name: '',
  lastName: '',
  location: 'Raudales',
  alternativeLocation: '',
  gender: 'male',
  otherGender: '',
  age: '',
  email: '',
  password: '',
  confirmPassword: '',
  error: '',
  backPressedOnce: false
};

function reducer(
  state: RegisterState,
  action: Partial<RegisterState>
): RegisterState {
  return { ...state, ...action };
}

export const useRegisterForm = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});
  const [successModal, setSuccessModal] = useState(false);

  const auth = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { navigate } = useNavigationActions();
  const isSubmitting = useRef(false);

  const onChange = useCallback(
    (key: keyof RegisterState) => (value: string | number) => {
      dispatch({ [key]: String(value) });
      if (stepErrors[currentStep]) {
        setStepErrors({ ...stepErrors, [currentStep]: '' });
      }
      if (auth.error) {
        auth.clearError();
      }
    },
    [currentStep, stepErrors, auth]
  );

  const validateStep = useCallback(
    (step: number, formState = state): string => {
      switch (step) {
        case 1:
          if (!formState.name.trim()) return 'El nombre es requerido';
          if (!formState.lastName.trim()) return 'Los apellidos son requeridos';
          if (!formState.username.trim())
            return 'El nombre de usuario es requerido';
          if (formState.username.length < 3)
            return 'El nombre de usuario debe tener al menos 3 caracteres';
          if (!/^[a-zA-Z0-9_]+$/.test(formState.username))
            return 'El nombre de usuario solo puede contener letras, números y guión bajo';
          break;

        case 2:
          if (!formState.location) return 'La localidad es requerida';
          if (
            formState.location === 'other' &&
            !formState.alternativeLocation.trim()
          )
            return 'Especifica tu localidad';
          if (!formState.gender) return 'El género es requerido';
          if (!formState.age.trim()) return 'La edad es requerida';
          const ageNum = parseInt(formState.age);
          if (isNaN(ageNum) || ageNum < 18 || ageNum > 65)
            return 'La edad debe estar entre 18 y 65 años';
          break;

        case 3:
          if (!formState.email.trim())
            return 'El correo electrónico es requerido';
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formState.email))
            return 'Ingresa un correo electrónico válido';
          if (!formState.password.trim()) return 'La contraseña es requerida';
          if (formState.password.length < 6)
            return 'La contraseña debe tener al menos 6 caracteres';
          if (!formState.confirmPassword.trim())
            return 'Confirma tu contraseña';
          if (formState.password !== formState.confirmPassword)
            return 'Las contraseñas no coinciden';
          break;
      }
      return '';
    },
    [state]
  );

  const goToNextStep = useCallback(() => {
    const error = validateStep(currentStep);
    if (error) {
      setStepErrors({ ...stepErrors, [currentStep]: error });
      return false;
    }

    setStepErrors({ ...stepErrors, [currentStep]: '' });
    setCurrentStep(prev => Math.min(prev + 1, 3));

    if (auth.error) {
      auth.clearError();
    }

    return true;
  }, [currentStep, validateStep, stepErrors, auth]);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));

    if (auth.error) {
      auth.clearError();
    }
  }, [auth]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= 3) {
        setCurrentStep(step);

        if (auth.error) {
          auth.clearError();
        }
      }
    },
    [auth]
  );

  const validateAllSteps = useCallback((): boolean => {
    const errors: Record<number, string> = {};
    let hasErrors = false;

    for (let step = 1; step <= 3; step++) {
      const error = validateStep(step);
      if (error) {
        errors[step] = error;
        hasErrors = true;
      }
    }

    setStepErrors(errors);
    return !hasErrors;
  }, [validateStep]);

  const createUserData = (sanitized: RegisterState): UserData | null => {
    const {
      username,
      name,
      lastName,
      location,
      alternativeLocation,
      gender,
      age,
      email,
      password
    } = sanitized;

    const ageNumber = parseInt(age, 10);
    if (isNaN(ageNumber)) {
      dispatch({ error: 'La edad debe ser un número válido' });
      return null;
    }

    const genderIndex = genderOptions.findIndex(
      option => option.value === gender
    );

    return {
      userName: username,
      name,
      lastName,
      locality: location === 'other' ? alternativeLocation : location,
      gender: genderIndex + 1,
      age: ageNumber,
      email,
      password
    };
  };

  const handleRegister = useCallback(async () => {
    if (isSubmitting.current) return;

    if (!validateAllSteps()) {
      const firstErrorStep = Object.keys(stepErrors).find(
        step => stepErrors[parseInt(step)]
      );
      if (firstErrorStep) {
        setCurrentStep(parseInt(firstErrorStep));
      }
      return;
    }

    showLoading();
    dispatch({ error: '' });
    isSubmitting.current = true;

    const sanitized = sanitizeRegisterFields(state);
    dispatch(sanitized);

    const errorMsg = validateRegisterFields(sanitized);
    if (errorMsg) {
      dispatch({ error: errorMsg });
      isSubmitting.current = false;
      hideLoading();
      return;
    }

    const userData = createUserData(sanitized);
    if (!userData) {
      isSubmitting.current = false;
      hideLoading();
      return;
    }

    try {
      await auth.registerUser(userData);
      setSuccessModal(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        dispatch({ error: auth.error || error.message });
      } else {
        dispatch({ error: 'Error al registrarse. Inténtalo de nuevo.' });
      }
    } finally {
      isSubmitting.current = false;
      hideLoading();
    }
  }, [state, auth, showLoading, hideLoading, validateAllSteps, stepErrors]);

  const getProgress = useCallback((): number => {
    const completedSteps = [1, 2, 3].filter(step => !validateStep(step)).length;
    return (completedSteps / 3) * 100;
  }, [validateStep]);

  const isStepComplete = useCallback(
    (step: number): boolean => {
      return !validateStep(step);
    },
    [validateStep]
  );

  const handleSuccessModalClose = () => {
    setSuccessModal(false);
    navigate('Login');
  };

  return {
    state,
    onChange,
    handleRegister,

    currentStep,
    stepErrors,
    goToNextStep,
    goToPreviousStep,
    goToStep,

    validateStep,
    validateAllSteps,
    getProgress,
    isStepComplete,
    successModal,
    handleSuccessModalClose,

    isSubmitting: isSubmitting.current
  };
};
