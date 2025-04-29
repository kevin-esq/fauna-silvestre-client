import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import axios, { AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";
import { CommonActions } from "@react-navigation/native";
import { navigationRef } from "../services/navigationRef";
import { View, Text } from "react-native";

/**
 * Shape (interfaz) del contexto de autenticación.
 */
interface AuthContextData {
  token: string | null;
  /**
   * Inicia sesión:
   * @param newToken Token recibido del servidor
   * @param remember Flag para guardar en SecureStore
   */
  isLoading: boolean;
  signIn: (newToken: string, remember: boolean) => Promise<void>;
  /**
   * Cierra sesión y limpia token de estado y SecureStore.
   */
  signOut: () => Promise<void>;
  /**
   * Instancia de Axios preconfigurada con interceptors.
   */
  api: AxiosInstance;
}

/**
 * Valor por defecto (stub) para que TS no se queje.
 * No se usa realmente, porque siempre envuelves tu app en AuthProvider.
 */
const defaultAuthContext: AuthContextData = {
  token: null,
  isLoading: false,
  signIn: async () => {},
  signOut: async () => {},
  api: axios.create(),
};

/**
 * Contexto de autenticación.
 * Provee token, metodos signIn/signOut y la instancia `api`.
 */
export const AuthContext = createContext<AuthContextData>(defaultAuthContext);

/**
 * Props de AuthProvider: típicamente tu `<App />`.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Componente proveedor de autenticación.
 * Centraliza:
 *  - Estado global del token
 *  - Lógica de “Remember me” con SecureStore
 *  - Configuración de Axios con interceptors para auth y logout automático.
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1) Al montar, intento recuperar el token si quedó guardado
  useEffect(() => {
    console.log("[AuthProvider] Inicio de recuperación de token...");
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync("userToken");
        console.log("[AuthProvider] Token SecureStore →", saved);
        if (saved) {
          setToken(saved);
          setRememberMe(true);
        }
      } catch (err) {
        console.error("[AuthProvider] Error al leer SecureStore", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 2) En cada cambio de token/rememberMe, sincronizo con SecureStore
  useEffect(() => {
    console.log("[AuthProvider] Sync SecureStore ->", { token, rememberMe });
    (async () => {
      try {
        if (token && rememberMe) {
          console.log("[AuthProvider] Guardando token en SecureStore");
          await SecureStore.setItemAsync("userToken", token);
        } else {
          console.log("[AuthProvider] Borrando token de SecureStore");
          await SecureStore.deleteItemAsync("userToken");
        }
      } catch (err) {
        console.error("[AuthProvider] Error sincronizando SecureStore:", err);
      }
    })();
  }, [token, rememberMe]);

  /**
   * signIn: actualiza el token en estado y define si se guarda.
   */
  const signIn = useCallback(async (newToken: string, remember: boolean) => {
    console.log("[AuthProvider] signIn llamado con:", { newToken, remember });
    setRememberMe(remember);
    setToken(newToken);
  }, []);

  /**
   * signOut: limpia token y SecureStore, y navega a Login.
   */
  const signOut = useCallback(async () => {
    console.log("[AuthProvider] signOut llamado");
    setRememberMe(false);
    setToken(null);
  }, []);

  /**
   * Instancia de Axios con interceptors.
   * - Request: añade header Authorization si hay token.
   * - Response 401/403: llama a signOut().
   */
  const api = useMemo<AxiosInstance>(() => {
    console.log(
      "[AuthProvider] Configurando instancia Axios con token:",
      token
    );
    const instance = axios.create({
      baseURL: "https://43fa-187-150-194-135.ngrok-free.app/api",
      timeout: 10000,
    });

    instance.interceptors.request.use((config) => {
      console.log("[AuthProvider][Interceptor Request] token:", token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    instance.interceptors.response.use(
      (res) => {
        return res;
      },
      (error) => {
        console.error(
          "[AuthProvider][Interceptor Response Error] status:",
          error.response?.status
        );
        if ((error.response?.status === 401 || error.response?.status === 403) && token != null) {
          console.log("[AuthProvider] 401/403 recibido, forzando signOut");
          signOut();
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [token, signOut]);

  console.log("[AuthProvider] Renderizando provider con token:", token);
  console.log("[AuthProvider] isLoading:", isLoading, "token:", token);

  if (isLoading) {
    // Mientras se recupera el token, muestro algo en pantalla
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando aplicación…</Text>
      </View>
    );
  }
  return (
    <AuthContext.Provider value={{ token, isLoading, signIn, signOut, api }}>
      {children}
    </AuthContext.Provider>
  );
};
