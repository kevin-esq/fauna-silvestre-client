import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  ToastAndroid,
  Switch,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

import useAuth from '../hooks/useAuth';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import SocialButton from '../components/SocialButton';
import { validateLoginFields } from '../utils/loginValidation';

const LoginScreen = ({ navigation }) => {
  const [backPressedOnce, setBackPressedOnce] = useState(false);
  const [email, setEmail] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  useEffect(() => {
    const loadSavedEmail = async () => {
      const storedEmail = await AsyncStorage.getItem('savedEmail');
      if (storedEmail) {
        setSavedEmail(storedEmail);
        setEmail(storedEmail);
      }
    };
    loadSavedEmail();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (!backPressedOnce) {
        ToastAndroid.show('Presiona atrás de nuevo para salir', ToastAndroid.SHORT);
        setBackPressedOnce(true);
        setTimeout(() => setBackPressedOnce(false), 2000);
        return true;
      }
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [backPressedOnce]);

  const handleLogin = useCallback(async () => {
    const trimmedEmail = email.trim();
    setEmail(trimmedEmail);

    const validationError = validateLoginFields(trimmedEmail, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

    try {
      await login({ email: trimmedEmail, password }, rememberMe);
      
      if (rememberMe) {
        await AsyncStorage.setItem('savedEmail', trimmedEmail);
      } else {
        await AsyncStorage.removeItem('savedEmail');
      }
      navigation.navigate('Home');
    } catch {
      setError('Correo o contraseña incorrectos');
    }
  }, [email, password, rememberMe, login, navigation]);

  const clearSavedEmail = useCallback(async () => {
    await AsyncStorage.removeItem('savedEmail');
    setSavedEmail('');
    setEmail('');
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image source={require('../assets/favicon.png')} style={styles.logo} />

        <Text style={styles.title}>
          {savedEmail ? '¡Bienvenido de nuevo! 👋' : '¡Hola! 👋'}
        </Text>
        <Text style={styles.subtitle}>
          {savedEmail
            ? `Hola de nuevo ${savedEmail}, ingresa tu contraseña`
            : 'Inicia sesión para continuar'}
        </Text>

        {error !== '' && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!savedEmail && (
          <CustomTextInput
            type="email"
            placeholder="Correo electrónico"
            onChange={setEmail}
            value={email}
            style={styles.input}
          />
        )}

        <CustomTextInput
          type="password"
          placeholder="Contraseña"
          onChange={setPassword}
          value={password}
          style={styles.input}
        />

        <View style={styles.rememberContainer}>
          <Text style={styles.rememberText}>Recordar sesión</Text>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: '#ccc', true: '#81b0ff' }}
            thumbColor={rememberMe ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <CustomButton title="Ingresar" onPress={handleLogin} style={styles.button} />

        {savedEmail && (
          <TouchableOpacity onPress={clearSavedEmail} style={styles.clearEmail}>
            <Text style={styles.clearEmailText}>¿No eres tú? Cambiar cuenta</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => navigation.replace('ForgotPassword')} style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>O inicia sesión con</Text>

        <View style={styles.socialContainer}>
          <SocialButton title="Google" onPress={() => {}} type="google" />
          <SocialButton title="Facebook" onPress={() => {}} type="facebook" />
        </View>

        <Text style={styles.orText}>¿No tienes cuenta?</Text>
        <CustomButton title="Registrarse" onPress={() => navigation.replace('Register')} style={styles.button} />
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
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdecea',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#b91c1c',
    marginLeft: 8,
    fontSize: 14,
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  rememberText: {
    fontSize: 16,
    color: '#444',
  },
  button: {
    marginBottom: 12,
  },
  clearEmail: {
    alignSelf: 'center',
    marginTop: 4,
  },
  clearEmailText: {
    color: '#007AFF',
    fontSize: 14,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
  },
  orText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#777',
    marginVertical: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
});

export default LoginScreen;