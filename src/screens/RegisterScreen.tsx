import React, { useReducer, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  ToastAndroid,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import useAuth from "../hooks/useAuth";
import CustomTextInput from "../components/CustomTextInput";
import CustomButton from "../components/CustomButton";

import { genderOptions, locationOptions } from "../constants/registerOptions";
import { validateRegisterFields } from "../utils/validation";
import { sanitizeRegisterFields } from "../utils/sanitize";
import { RegisterState } from "../types/RegisterState";
import { RegisterAction } from "../types/RegisterAction";
import { UserData } from "../data/models/AuthModels";
import { NavigateReset } from "../utils/navigation";

const initialState: RegisterState = {
  username: "",
  name: "",
  lastName: "",
  location: "",
  alternativeLocation: "",
  gender: "",
  otherGender: "",
  age: "",
  email: "",
  password: "",
  confirmPassword: "",
  error: "",
  backPressedOnce: false,
};

function reducer(state: RegisterState, action: RegisterAction): RegisterState {
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
      showToast("Presiona atrás de nuevo para regresar");
      dispatch({ backPressedOnce: true });
      setTimeout(() => dispatch({ backPressedOnce: false }), 2000);
      return true;
    }
    NavigateReset("Login");
    return true;
  }, [state.backPressedOnce, navigation, showToast]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  const onChange = useCallback(
    (key: string) => (value: string) => {
      dispatch({ [key]: value });
    },
    []
  );

  const handleRegister = useCallback(async () => {
    dispatch({ error: "" });

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
      password,
    } = sanitizedState;

    const newUser = {
      userName: username,
      name: name,
      lastName: lastName,
      locality: location,
      gender: 1,
      age: Number(age),
      email : email,
      password: password,
    } as UserData;

    try {
      console.log(newUser);
      await register(newUser);
      NavigateReset("Login");
    } catch (error) {
      dispatch({ error: "Error al registrarse" });
      console.log("Error al registrarse:", error);
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
    error,
  } = state;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Crear una cuenta 📝</Text>
        <Text style={styles.subtitle}>Rellena los campos para registrarte</Text>

        {error !== "" && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <CustomTextInput
          type="username"
          placeholder="Nombre de usuario"
          value={username}
          onChange={onChange("username")}
          icon={<MaterialIcons name="person-outline" size={20} color="#888" />}
        />

        <CustomTextInput
          type="name"
          placeholder="Nombre"
          value={name}
          onChange={onChange("name")}
          icon={<MaterialIcons name="badge" size={20} color="#888" />}
        />

        <CustomTextInput
          type="lastName"
          placeholder="Apellidos"
          value={lastName}
          onChange={onChange("lastName")}
          icon={<MaterialIcons name="person" size={20} color="#888" />}
        />

        <CustomTextInput
          type="select"
          placeholder="Localidad"
          value={location}
          onChange={onChange("location")}
          options={locationOptions}
          icon={<MaterialIcons name="location-on" size={20} color="#888" />}
        />

        {location === "other" && (
          <CustomTextInput
            type="text"
            placeholder="Ubicación alternativa"
            value={alternativeLocation}
            onChange={onChange("alternativeLocation")}
            icon={<MaterialIcons name="edit-location" size={20} color="#888" />}
          />
        )}

        <CustomTextInput
          type="select"
          placeholder="Género"
          value={gender}
          onChange={onChange("gender")}
          options={genderOptions}
          icon={<MaterialIcons name="wc" size={20} color="#888" />}
        />

        <CustomTextInput
          type="number"
          placeholder="Edad (18-65)"
          value={age}
          onChange={onChange("age")}
          icon={<MaterialIcons name="calendar-today" size={20} color="#888" />}
        />

        <CustomTextInput
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={onChange("email")}
          icon={<MaterialIcons name="email" size={20} color="#888" />}
        />

        <CustomTextInput
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={onChange("password")}
          icon={<MaterialIcons name="lock-outline" size={20} color="#888" />}
        />

        <CustomTextInput
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={onChange("confirmPassword")}
          icon={<MaterialIcons name="lock-reset" size={20} color="#888" />}
        />

        <CustomButton
          title="Registrarse"
          onPress={handleRegister}
          style={styles.button}
        />

        <Text style={styles.orText}>¿Ya tienes una cuenta?</Text>
        <CustomButton
          title="Inicia Sesión"
          onPress={() => NavigateReset("Login")}
          style={styles.secondaryButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    top: 15,
    padding: 24,
    backgroundColor: "#fff",
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fdecea",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#b91c1c",
    marginLeft: 8,
    fontSize: 14,
  },
  button: {
    marginBottom: 12,
  },
  orText: {
    textAlign: "center",
    fontSize: 15,
    color: "#777",
    marginTop: 16,
    marginBottom: 8,
  },
  secondaryButton: {
    backgroundColor: "#e0e0e0",
  },
});

export default RegisterScreen;
