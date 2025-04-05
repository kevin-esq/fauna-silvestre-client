import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  ToastAndroid,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import useAuth from '../hooks/useAuth';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import { MaterialIcons } from '@expo/vector-icons';

const RegisterScreen = ({ navigation }) => {
  const [backPressedOnce, setBackPressedOnce] = useState(false);

  const { register } = useAuth();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const backAction = () => {
      if (!backPressedOnce) {
        ToastAndroid.show("Presiona atrás de nuevo para regresar", ToastAndroid.SHORT);
        setBackPressedOnce(true);
        setTimeout(() => setBackPressedOnce(false), 2000);
        return true;
      }
      navigation.replace("Login");
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [backPressedOnce]);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await register({ name: `${name} ${lastName}`, email, password });
      navigation.navigate('Home');
    } catch (err) {
      setError('Error al registrarse');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Crear una cuenta 📝</Text>
        <Text style={styles.subtitle}>Rellena los campos para registrarte</Text>

        {error !== '' && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <CustomTextInput
          type="text"
          placeholder="Nombre"
          onChange={setName}
          value={name}
        />
        <CustomTextInput
          type="text"
          placeholder="Apellidos"
          onChange={setLastName}
          value={lastName}
        />
        <CustomTextInput
          type="email"
          placeholder="Correo electrónico"
          onChange={setEmail}
          value={email}
        />
        <CustomTextInput
          type="password"
          placeholder="Contraseña"
          onChange={setPassword}
          value={password}
        />
        <CustomTextInput
          type="password"
          placeholder="Confirmar contraseña"
          onChange={setConfirmPassword}
          value={confirmPassword}
        />

        <CustomButton title="Registrarse" onPress={handleRegister} style={styles.button} />

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
