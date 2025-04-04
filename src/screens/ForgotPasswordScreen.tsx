import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import useAuth from '../hooks/useAuth';

const ForgotPasswordScreen = ({ navigation }) => {
  const { forgot } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleForgotPassword = async () => {
    try {
      const result = await forgot(email);
      setMessage('Se ha enviado un correo de recuperación');
    } catch (err) {
      setError('Error al enviar el correo');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Contraseña</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
      />
      <Button title="Enviar" onPress={handleForgotPassword} />
      <Button
        title="Volver a Login"
        onPress={() => navigation.navigate('Login')}
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
  error: {
    color: 'red',
    marginBottom: 10
  },
  success: {
    color: 'green',
    marginBottom: 10
  }
});

export default ForgotPasswordScreen;
