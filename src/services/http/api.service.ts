import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { authService } from '../auth/auth.service';
import { ISecureStorage, secureStorageService } from '../storage/secure-storage.service';
import { ILogger } from '../../shared/types/ILogger';
import { ConsoleLogger } from '../logging/console-logger';
import { ApiError, NetworkError } from '../../shared/types/custom-errors';
import appJson from '../../../app.json';

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const { extra } = appJson as { extra: Record<string, string> };

class ApiService {
  private static instance: ApiService;
  public readonly client: AxiosInstance;
  private onUnauthorizedCallback: (() => void) | null = null;
  private isRefreshing = false;

  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  private readonly PUBLIC_API_URL: string;
  private readonly PUBLIC_API_TIMEOUT: number;

  private constructor(
    private readonly storageService: ISecureStorage,
    private readonly logger: ILogger
  ) {
    const apiUrl = extra?.PUBLIC_API_URL;
    if (typeof apiUrl !== 'string' || !apiUrl) {
      throw new Error('PUBLIC_API_URL no está configurado o no es una cadena de texto en app.json.');
    }
    this.PUBLIC_API_URL = apiUrl;

    const apiTimeout = extra?.PUBLIC_API_TIMEOUT;
    this.PUBLIC_API_TIMEOUT = typeof apiTimeout === 'string' ? Number(apiTimeout) : 15000;

    this.logger.info(`[ApiService] API URL: ${this.PUBLIC_API_URL}`);
    this.logger.info(`[ApiService] API Timeout: ${this.PUBLIC_API_TIMEOUT}`);

    this.client = axios.create({
      baseURL: this.PUBLIC_API_URL,
      timeout: this.PUBLIC_API_TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      const logger = new ConsoleLogger('info');
      ApiService.instance = new ApiService(secureStorageService, logger);
    }
    return ApiService.instance;
  }

  public setOnUnauthorizedCallback(callback: () => void): void {
    this.onUnauthorizedCallback = callback;
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      this.requestInterceptor.bind(this),
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      this.responseErrorInterceptor.bind(this)
    );
  }

  private async requestInterceptor(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
    if (!config.headers?.Authorization) {
      const token = await this.storageService.getValueFor('auth_access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        this.logger.debug('[ApiService] Token injected.');
      }
    }
    return config;
  }

  private async responseErrorInterceptor(error: unknown): Promise<unknown> {
    if (!axios.isAxiosError(error)) {
      this.logger.error('[ApiService] Non-Axios error', error instanceof Error ? error : new Error(String(error)));
      return Promise.reject(new ApiError('Ocurrió un error inesperado.'));
    }

    const { response, request, config } = error;
    const method = config?.method?.toUpperCase() ?? 'UNKNOWN';
    const url = config?.url ?? 'UNKNOWN_URL';

    if (response) {
      this.logger.error(`[ApiService] API Error: ${method} ${url}`, error, {
        status: response.status,
        data: response.data,
      });

      if (response.status === 401) {
        const originalRequest = error.config as CustomInternalAxiosRequestConfig;

        if (!originalRequest || originalRequest._retry) {
          return Promise.reject(error);
        }

        if (this.isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.client(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        this.isRefreshing = true;

        try {
          const newToken = await authService.refreshToken();
          this.processFailedQueue(null, newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          return this.client(originalRequest);
        } catch (refreshError) {
          const refreshErr = refreshError instanceof Error
            ? refreshError
            : new Error('Unknown refresh error');

          this.processFailedQueue(refreshErr, null);
          this.onUnauthorizedCallback?.();

          return Promise.reject(refreshErr);
        } finally {
          this.isRefreshing = false;
        }
      }

      if ([400, 403, 404].includes(response.status)) {
        this.logger.warn(`[ApiService] Client Error: ${response.status}`);
      }

      return Promise.reject(
        new ApiError(response.data?.message ?? 'Ocurrió un error de API.', response.status)
      );
    }

    if (request) {
      this.logger.error(`[ApiService] Network Error: No response for ${method} ${url}`, error);
      return Promise.reject(
        new NetworkError('No se recibió respuesta del servidor. Verifique su conexión a internet.')
      );
    }

    this.logger.error(`[ApiService] Request Setup Error: ${method} ${url}`, error);
    return Promise.reject(new ApiError('Ocurrió un error inesperado.'));
  }

  private processFailedQueue(error: Error | null, token: string | null = null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else if (token) {
        resolve(token);
      } else {
        reject(new Error('No se pudo renovar el token y no se proporcionó uno nuevo.'));
      }
    });

    this.failedQueue = [];
  }
}

export const apiService = ApiService.getInstance();
