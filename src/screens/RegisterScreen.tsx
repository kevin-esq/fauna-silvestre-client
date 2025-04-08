import React, { useReducer, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  ToastAndroid,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import useAuth from '../hooks/useAuth';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';

import { genderOptions, locationOptions } from '../constants/registerOptions';
import { validateRegisterFields } from '../utils/validation';
import { sanitizeRegisterFields } from '../utils/sanitize';
import { RegisterState } from '../types/RegisterState';
import { RegisterAction } from '../types/RegisterAction';

const initialState: RegisterState = {
  username: '',
  name: '',
  lastName: '',
  location: '',
  alternativeLocation: '',
  gender: '',
  otherGender: '',
  age: '',
  email: '',
  password: '',
  confirmPassword: '',
  error: '',
  backPressedOnce: false,
};

function reducer(
  state: RegisterState,
  action: RegisterAction
): RegisterState {
  return { ...state, ...action };
}

const RegisterScreen = ({ navigation }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { register } = useAuth();

  const showToast = useCallback((message: string) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }, []);

  const handleBackPress = useCallback(() => {
    if (!state.backPressedOnce) {
      showToast('Presiona atrás de nuevo para regresar');
      dispatch({ backPressedOnce: true });
      setTimeout(() => dispatch({ backPressedOnce: false }), 2000);
      return true;
    }
    navigation.replace('Login');
    return true;
  }, [state.backPressedOnce, navigation, showToast]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  const onChange = useCallback((key: string) => (value: string) => {
    dispatch({ [key]: value });
  }, []);

  const handleRegister = useCallback(async () => {
    dispatch({ error: '' });

    const sanitizedState = sanitizeRegisterFields(state);
    dispatch(sanitizedState);

    const validationError = validateRegisterFields(sanitizedState);
    if (validationError) {
      dispatch({ error: validationError });
      return;
    }

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
    } = sanitizedState;

    const newUser = {
      Username: username,
      Name: name,
      LastName: lastName,
      Location: location,
      AlternativeLocation: alternativeLocation,
      Gender: gender,
      Age: parseInt(age, 10),
      Email: email,
      Password: password,
      UserType: 'User',
    };

    try {
      await register(newUser);
      navigation.navigate('Home');
    } catch {
      dispatch({ error: 'Error al registrarse' });
    }
  }, [state, register, navigation]);

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Crear una cuenta 📝</Text>
        <Text style={styles.subtitle}>Rellena los campos para registrarte</Text>

        {error !== '' && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <CustomTextInput
          type="username"
          placeholder="Nombre de usuario"
          value={username}
          onChange={onChange('username')}
        />
        <CustomTextInput
          type="name"
          placeholder="Nombre"
          value={name}
          onChange={onChange('name')}
        />
        <CustomTextInput
          type="lastName"
          placeholder="Apellidos"
          value={lastName}
          onChange={onChange('lastName')}
        />
        <CustomTextInput
          type="select"
          placeholder="Localidad"
          value={location}
          onChange={onChange('location')}
          options={locationOptions}
        />
        {location === 'other' && (
          <CustomTextInput
            type="text"
            placeholder="Ubicación alternativa"
            value={alternativeLocation}
            onChange={onChange('alternativeLocation')}
          />
        )}
        <CustomTextInput
          type="select"
          placeholder="Género"
          value={gender}
          onChange={onChange('gender')}
          options={genderOptions}
        />
        <CustomTextInput
          type="number"
          placeholder="Edad (18-65)"
          value={age}
          onChange={onChange('age')}
        />
        <CustomTextInput
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={onChange('email')}
        />
        <CustomTextInput
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={onChange('password')}
        />
        <CustomTextInput
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={onChange('confirmPassword')}
        />

        <CustomButton
          title="Registrarse"
          onPress={handleRegister}
          style={styles.button}
        />

        <Text style={styles.orText}>¿Ya tienes una cuenta?</Text>
        <CustomButton
          title="Inicia Sesión"
          onPress={() => navigation.replace('Login')}
          style={styles.secondaryButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdecea',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    marginLeft: 8,
    fontSize: 14,
  },
  button: {
    marginBottom: 12,
  },
  orText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#777',
    marginTop: 16,
    marginBottom: 8,
  },
  secondaryButton: {
    backgroundColor: '#e0e0e0',
  },
});

export default RegisterScreen;