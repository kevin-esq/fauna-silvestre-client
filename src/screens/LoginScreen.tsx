import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CustomTextInput from "../components/CustomTextInput";
import CustomButton from "../components/CustomButton";
import SocialButton from "../components/SocialButton";
import { validateLoginFields } from "../utils/loginValidation";
import { Credentials } from "../data/models/AuthModels";
import { NavigateReset } from "../utils/navigation";
import { useAuthContext } from "../contexts/AuthContext";
import useDoubleBackExit from "../hooks/useDoubleBackExit";
import useAuth from "../hooks/useAuth";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const errorOpacity = useRef(new Animated.Value(0)).current;

  const { setAuthToken } = useAuthContext();
  const { login } = useAuth();
  useDoubleBackExit();

  useEffect(() => {
    if (error) {
      Animated.timing(errorOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(errorOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [error]);

  useEffect(() => {
    if (error) {
      setError("");
    }
  }, [username, password]);

  const handleLogin = useCallback(async () => {
    const trimmedUsername = username.trim();
    setUsername(trimmedUsername);

   // const validationError = validateLoginFields(trimmedUsername, password);
    /*if (validationError) {
      setError(validationError);
      return;
    }*/

    setError("");

    const credentials: Credentials = {
      UserName: trimmedUsername,
      Password: password,
    };

    try {
      // Supongamos que login devuelve un token
      const token = await login(credentials, rememberMe);
      setAuthToken(token);
     // NavigateReset("Home");
    } catch (localError) {
      setError("Nombre de usuario o contraseña incorrectos");
      console.log("error", localError);
    }
  }, [username, password, rememberMe, login, setAuthToken, navigation]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={require("../assets/favicon.png")} style={styles.logo} />

        <Text style={styles.title}>¡Hola! 👋</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        {error ? (
          <Animated.View style={[styles.errorContainer, { opacity: errorOpacity }]}>
            <MaterialIcons name="error-outline" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        ) : null}

        <CustomTextInput
          type="text"
          placeholder="Nombre de usuario"
          onChange={setUsername}
          value={username}
          autoFocus
          style={[styles.input, error ? { borderColor: "#ef4444" } : {}]}
          icon={<MaterialIcons name="person" size={20} color="#888" />}
        />

        <CustomTextInput
          type="password"
          placeholder="Contraseña"
          onChange={setPassword}
          value={password}
          style={styles.input}
          icon={<MaterialIcons name="key" size={20} color="#888" />}
        />

        <View style={styles.rememberContainer}>
          <Text style={styles.rememberText}>Recordar sesión</Text>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: "#ccc", true: "#81b0ff" }}
            thumbColor={rememberMe ? "#007AFF" : "#f4f3f4"}
          />
        </View>

        <CustomButton
          title="Ingresar"
          onPress={handleLogin}
          style={styles.button}
          disabled={!username || !password}
        />

        <TouchableOpacity
          onPress={() => NavigateReset("ForgotPassword")}
          style={styles.forgotPassword}
        >
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>¿No tienes cuenta?</Text>
        <CustomButton
          title="Registrarse"
          onPress={() => NavigateReset("Register")}
          style={styles.button}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    flexGrow: 1,
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 16,
    resizeMode: "contain",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fdecea",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: "#b91c1c",
    marginLeft: 8,
    fontSize: 14,
  },
  rememberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  rememberText: {
    fontSize: 16,
    color: "#444",
  },
  button: {
    marginBottom: 12,
  },
  forgotPassword: {
    alignSelf: "center",
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#007AFF",
  },
  orText: {
    textAlign: "center",
    fontSize: 15,
    color: "#777",
    marginVertical: 12,
  },
});

export default LoginScreen;