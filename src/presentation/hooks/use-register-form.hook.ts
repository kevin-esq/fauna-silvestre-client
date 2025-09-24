import { useReducer, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/auth.context';
import { useLoading } from '../contexts/loading.context';
import { useNavigationActions } from '../navigation/navigation-provider';
import { RegisterState } from '../../domain/types/register-state';
import { UserData } from '../../domain/models/auth.models';
import { validateRegisterFields } from '../../shared/utils/validation';
import { sanitizeRegisterFields } from '../../shared/utils/sanitize';
import { genderOptions } from '../../shared/constants/registerOptions';

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
  const auth = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { navigate } = useNavigationActions();
  const isSubmitting = useRef(false);

  const onChange = useCallback(
    (key: keyof RegisterState) => (value: string | number) => {
      dispatch({ [key]: String(value) });
    },
    []
  );

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
      navigate('Login');
    } catch (error: unknown) {
      if (error instanceof Error) {
        dispatch({ error: error.message });
      } else {
        dispatch({ error: 'Error al registrarse. Inténtalo de nuevo.' });
      }
    } finally {
      isSubmitting.current = false;
      hideLoading();
    }
  }, [state, auth, showLoading, hideLoading, navigate]);

  return {
    state,
    onChange,
    handleRegister
  };
};
