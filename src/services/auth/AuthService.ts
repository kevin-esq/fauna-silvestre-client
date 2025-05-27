// src/services/auth/AuthService.ts
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '../http/ApiProvider';
import { ConsoleLogger } from '../logging/ConsoleLogger';
import  User  from '../../domain/entities/User';
import { decodeJwt, JwtPayload } from '../../shared/utils/jwt';
import {UserResponse} from "../../domain/models/AuthModels";

/**
 * Servicio de autenticación con manejo seguro de tokens
 * @class
 */
export class AuthService {
    private readonly ACCESS_TOKEN_KEY = 'auth_access_token';
    private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
    private readonly USER_ID_KEY = 'user_id';

    constructor(
        readonly httpClient: HttpClient,
        private readonly logger: ConsoleLogger
    ) {}

    /**
     * Almacena tokens de forma segura
     * @async
     * @param {string} accessToken - Token de acceso
     * @param {string} refreshToken - Token de actualización
     */
    async setTokens(accessToken: string, refreshToken: string): Promise<void> {
        // Decodificar el token para obtener el ID de usuario
        const payload = decodeJwt(accessToken);
        this.logger.info("payload", {"payload": payload});

        // Guardar tokens
        await SecureStore.setItemAsync('auth_access_token', accessToken);
        this.logger.info("auth_access_token", {"auth_access_token": accessToken});

        await SecureStore.setItemAsync('auth_refresh_token', refreshToken);
        this.logger.info("auth_refresh_token", {"auth_refresh_token": refreshToken});

        // Guardar el ID de usuario obtenido del JWT
        await SecureStore.setItemAsync('user_id', payload['sub'] || "5");
        this.logger.info("user_id", {"user_id": payload['sub'] || 5});

        this.logger.info("Tokens guardados exitosamente");
    }

    /**
     * Obtiene el token de acceso válido
     * @async
     * @returns {Promise<string|null>} Token de acceso o null
     */
    async getValidAccessToken(): Promise<string | null> {
        try {
            const accessToken = await SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY);
            if (!accessToken) return null;

            const { exp } = jwtDecode(accessToken);
            if (Date.now() >= exp! * 1000) {
                return this.refreshToken();
            }
            return accessToken;
        } catch (error: any) {
            this.logger.error('Error getting access token', error);
            return null;
        }
    }

    /**
     * Renueva el token de acceso usando el refresh token
     * @async
     * @returns {Promise<string>} Nuevo token de acceso
     */
    private async refreshToken(): Promise<string> {
        try {
            const refreshToken = await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
            if (!refreshToken) throw new Error('No refresh token available');

            const response = await this.httpClient.instance.post<{
                accessToken: string;
                refreshToken: string;
            }>('/auth/refresh', { refreshToken });

            await this.setTokens(response.data.accessToken, response.data.refreshToken);
            return response.data.accessToken;
        } catch (error: any) {
            this.logger.error('Token refresh failed', error);
            await this.clearTokens();
            throw error;
        }
    }

    /**
     * Elimina todos los tokens almacenados
     * @async
     */
    async clearTokens(): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(this.ACCESS_TOKEN_KEY);
            await SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY);
            await SecureStore.deleteItemAsync(this.USER_ID_KEY);
            this.httpClient.setAuthToken(null);
        } catch (error: any) {
            this.logger.error('Error clearing tokens', error);
        }
    }

    /**
     * Obtiene información del usuario desde el token
     * @async
     * @returns {Promise<User|null>} Usuario decodificado o null
     */
    async getCurrentUser(): Promise<User | null> {
        try {
            const accessToken = await this.getValidAccessToken();
            if (!accessToken) return null;

            // Obtener ID del usuario desde SecureStore
            const userId = await SecureStore.getItemAsync(this.USER_ID_KEY);
            if (!userId) throw new Error('ID de usuario no encontrado');

            this.httpClient.setAuthToken(accessToken);
            // Obtener detalles del usuario desde endpoint específico
            const response = await this.httpClient.instance.get<UserResponse>(`/Users/user-information`);

            this.logger.info("[AuthService] Datos de usuario obtenidos exitosamente", {"response": response.data});

            return new User(
                userId,
                response.data.userName,
                response.data.name,
                response.data.lastName,
                response.data.locality,
                response.data.gender,
                response.data.age,
                response.data.email,
                accessToken
            );
        } catch (error) {
            await this.clearTokens();
            return null;
        }
    }
}