// src/services/http/ApiProvider.tsx
import * as SecureStore from 'expo-secure-store';
import axios, {AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig} from 'axios';
import React, { createContext, useContext, useMemo } from 'react';
import { ConsoleLogger } from '../logging/ConsoleLogger';
import { HttpError, NetworkError } from '../../shared/types/errors';
import Config from "react-native-config";

export interface HttpClient {
    instance: AxiosInstance;
    setAuthToken: (token: string | null) => void;
}

const ApiContext = createContext<HttpClient | null>(null);

interface ApiProviderProps {
    children: React.ReactNode;
    logger: ConsoleLogger;
}

export const ApiProvider = ({ children, logger }: ApiProviderProps) => {
    const httpClient = useMemo<HttpClient>(() => {
        const instance = axios.create({
            baseURL: process.env.EXPO_PUBLIC_API_URL,
            timeout: Number( process.env.EXPO_PUBLIC_API_TIMEOUT),
        });

        instance.defaults.headers.common['Content-Type'] = 'application/json';

        instance.interceptors.request.use(async (config: AxiosRequestConfig) => {
            const internalConfig = config as InternalAxiosRequestConfig<any>;
            console.log("internalConfig", internalConfig);
            const token = await SecureStore.getItemAsync('auth_access_token');
            console.log("auth_access_token", token);
            if (token && internalConfig.headers) {
                internalConfig.headers.Authorization = `Bearer ${token}`;
            }
            return internalConfig;
        });

        instance.interceptors.response.use(
            response => response,
            (error: AxiosError) => {
                const status = error.response?.status;
                const message = error.message;

                if (status === 401 || status === 403) {
                    logger.warn('Acceso no autorizado, limpiando token');
                    SecureStore.deleteItemAsync('auth_access_token');
                }

                const enhancedError = error.response
                    ? new HttpError(message, status, error.response.data)
                    : new NetworkError(message);

                logger.error('Error en la respuesta HTTP', enhancedError);
                return Promise.reject(enhancedError);
            }
        );

        logger.info('Configuración de la instancia de axios', instance.defaults);

        return {
            instance,
            setAuthToken: (token: string | null) => {
                instance.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : null;
            },
        };
    }, [logger]);

    return <ApiContext.Provider value={httpClient}>{children}</ApiContext.Provider>;
};

export const useApi = () => {
    const context = useContext(ApiContext);
    if (!context) throw new Error('useApi debe usarse dentro de un ApiProvider');
    return context;
};