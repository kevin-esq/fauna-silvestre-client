import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ISecureStorage, secureStorageService } from '../storage/secure-storage.service';
import { ILogger } from '../../shared/types/ILogger';
import { ConsoleLogger } from '../logging/console-logger';
import { ApiError, NetworkError } from '../../shared/types/custom-errors';
import Constants from 'expo-constants';
import { ExpoConfig } from 'expo/config';

/**
 * A singleton service for managing API calls using Axios.
 * It handles Axios instance configuration, token injection, and global error handling.
 */
class ApiService {
  private static instance: ApiService;
  public readonly client: AxiosInstance;
  private onUnauthorizedCallback: (() => void) | null = null;

  private readonly expoConfig: (ExpoConfig & { hostUri?: string | undefined; }) | null;
  private readonly extraConfig: { [k: string]: any } | undefined;
  private readonly EXPO_PUBLIC_API_URL: string;
  private readonly EXPO_PUBLIC_API_TIMEOUT: number;

  /**
   * Private constructor to enforce the singleton pattern.
   * @param storageService The secure storage service for handling auth tokens.
   * @param logger The logging service.
   */
  private constructor(private readonly storageService: ISecureStorage, private readonly logger: ILogger) {
    this.expoConfig = Constants.expoConfig;
    this.extraConfig = this.expoConfig?.extra;
    this.EXPO_PUBLIC_API_URL = this.extraConfig?.EXPO_PUBLIC_API_URL || '';
    this.EXPO_PUBLIC_API_TIMEOUT = Number(this.extraConfig?.EXPO_PUBLIC_API_TIMEOUT || 15000);

    this.client = axios.create({
      baseURL: this.EXPO_PUBLIC_API_URL,
      timeout: this.EXPO_PUBLIC_API_TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
  }

  /**
   * Retrieves the single instance of the ApiService.
   * @returns The singleton ApiService instance.
   */
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      const logger = new ConsoleLogger('info');
      ApiService.instance = new ApiService(secureStorageService, logger);
    }
    return ApiService.instance;
  }

  /**
   * Registers a callback function to be executed upon receiving a 401 Unauthorized response.
   * @param callback The function to execute.
   */
  public setOnUnauthorizedCallback(callback: () => void): void {
    this.onUnauthorizedCallback = callback;
  }

  /**
   * Sets up the request and response interceptors for the Axios client.
   */
  private setupInterceptors(): void {
    // Request interceptor: Injects the auth token into headers.
    this.client.interceptors.request.use(this.requestInterceptor.bind(this), (error) => Promise.reject(error));

    // Response interceptor: Handles API errors globally.
    this.client.interceptors.response.use((response) => response, this.responseErrorInterceptor.bind(this));
  }

  /**
   * Intercepts outgoing requests to inject the authentication token.
   * @param config The Axios request configuration.
   * @returns The modified config.
   */
  private async requestInterceptor(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
    if (!config.headers.Authorization) {
      const token = await this.storageService.getValueFor('auth_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        this.logger.debug('[ApiService] Auth token injected into request header.');
      }
    }
    return config;
  }

  /**
   * Intercepts incoming responses to handle errors centrally.
   * @param error The error object from Axios.
   * @returns A rejected promise with a custom error.
   */
  private responseErrorInterceptor(error: any): Promise<never> {
    if (axios.isAxiosError(error)) {
      const { response, request, message, config } = error;
      const method = config?.method?.toUpperCase();
      const url = config?.url;

      if (response) {
        // The request was made and the server responded with a status code
        this.logger.error(`[ApiService] API Error: ${method} ${url}`, error, { status: response.status, data: response.data });

        if (response.status === 401 || response.status === 403 || response.status === 404 || response.status === 400) {
          this.logger.warn('[ApiService] Unauthorized access detected. Triggering sign-out.');
          this.onUnauthorizedCallback?.();
        }

        // Create a specific ApiError
        return Promise.reject(new ApiError(response.data?.message || 'An API error occurred.', response.status));
      } else if (request) {
        // The request was made but no response was received (e.g., network error)
        this.logger.error(`[ApiService] Network Error: No response for ${method} ${url}`, error);
        return Promise.reject(new NetworkError('No response from server. Please check your network connection.'));
      } else {
        // Something happened in setting up the request that triggered an Error
        this.logger.error(`[ApiService] Request Setup Error: ${method} ${url}`, error);
        return Promise.reject(new ApiError(message));
      }
    }

    this.logger.error('[ApiService] Non-Axios error occurred', error);
    return Promise.reject(new ApiError('An unexpected error occurred.'));
  }
}

/**
 * The singleton instance of the ApiService.
 */
export const apiService = ApiService.getInstance();
