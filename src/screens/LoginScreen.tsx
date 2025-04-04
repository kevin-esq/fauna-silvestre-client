import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import useAuth from '../hooks/useAuth';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await login({ email, password }, rememberMe);
      navigation.navigate('Home'); // Redirige a la pantalla principal
    } catch (err) {
      setError('Error de autenticación');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <View style={styles.checkboxContainer}>
        <Text>Recordar Sesión</Text>
        <Button
          title={rememberMe ? 'Sí' : 'No'}
          onPress={() => setRememberMe(!rememberMe)}
        />
      </View>
      <Button title="Ingresar" onPress={handleLogin} />
      <Button
        title="¿Olvidaste tu contraseña?"
        onPress={() => navigation.navigate('ForgotPassword')}
      />
      <Button
        title="Registrarse"
        onPress={() => navigation.navigate('Register')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  error: {
    color: 'red',
    marginBottom: 10
  }
});

export default LoginScreen;
