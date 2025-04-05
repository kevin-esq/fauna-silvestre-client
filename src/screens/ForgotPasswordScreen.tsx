import React, { useState, useEffect } from 'react';
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
import useAuth from '../hooks/useAuth';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import { MaterialIcons } from '@expo/vector-icons';

const ForgotPasswordScreen = ({ navigation }) => {
  const [backPressedOnce, setBackPressedOnce] = useState(false);

  const { forgot } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
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

  const handleForgotPassword = async () => {
    try {
      await forgot(email);
      setMessage('✅ Se ha enviado un correo de recuperación');
      setError('');
    } catch (err) {
      setError('❌ Error al enviar el correo');
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Recuperar Contraseña 🔐</Text>
        <Text style={styles.subtitle}>Ingresa tu correo para enviarte instrucciones</Text>

        {error !== '' && (
          <View style={styles.feedbackContainerError}>
            <MaterialIcons name="error-outline" size={20} color="#b91c1c" />
            <Text style={styles.feedbackText}>{error}</Text>
          </View>
        )}

        {message !== '' && (
          <View style={styles.feedbackContainerSuccess}>
            <MaterialIcons name="check-circle-outline" size={20} color="#059669" />
            <Text style={styles.feedbackText}>{message}</Text>
          </View>
        )}

        <CustomTextInput
          type="email"
          placeholder="Correo electrónico"
          onChange={setEmail}
          value={email}
        />

        <CustomButton
          title="Enviar instrucciones"
          onPress={handleForgotPassword}
          style={styles.button}
        />

        <Text style={styles.orText}>¿Recordaste tu contraseña?</Text>
        <CustomButton
          title="Volver a Iniciar Sesión"
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
  feedbackContainerError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdecea',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  feedbackContainerSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  feedbackText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
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

export default ForgotPasswordScreen;
