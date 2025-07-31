import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { authService } from '../auth/auth.service';
import { ILogger } from '../../shared/types/ILogger';
import { ConsoleLogger } from '../logging/console-logger';
import { ApiError, NetworkError } from '../../shared/types/custom-errors';
import { extra } from '../../../app.json';

interface CustomConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _pendingKey?: string;
}

class ApiService {
  private static instance: ApiService;
  public readonly client: AxiosInstance;
  private onUnauthorizedCallback: (() => void) | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];
  private readonly pending = new Map<string, AbortController>();

  private constructor(
    private readonly logger: ILogger,
  ) {
    const apiUrl = extra?.PUBLIC_API_URL;
    if (typeof apiUrl !== 'string' || !apiUrl) {
      throw new Error('PUBLIC_API_URL no está configurado en app.json');
    }
    const timeout =
      typeof extra?.PUBLIC_API_TIMEOUT === 'string'
        ? Number(extra.PUBLIC_API_TIMEOUT)
        : 15000;

    this.client = axios.create({
      baseURL: apiUrl,
      timeout,
      headers: { 'Content-Type': 'application/json' },
    });

    this.logger.info(`[ApiService] URL: ${apiUrl}, Timeout: ${timeout}`);
    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService(
        new ConsoleLogger('info'),
      );
    }
    return ApiService.instance;
  }

  public setOnUnauthorizedCallback(callback: () => void): void {
    this.onUnauthorizedCallback = callback;
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(this.onRequest.bind(this), err =>
      Promise.reject(err),
    );
    this.client.interceptors.response.use(
      this.onResponse.bind(this),
      this.onError.bind(this),
    );
  }

  private onRequest(config: CustomConfig): CustomConfig {
    const key = this.makeKey(config);
    if (this.pending.has(key)) {
      this.pending.get(key)!.abort();
    }
    const controller = new AbortController();
    this.pending.set(key, controller);
    config.signal = controller.signal;
    config._pendingKey = key;
    return config;
  }

  private onResponse<T = unknown>(
    response: AxiosResponse<T>,
  ): AxiosResponse<T> {
    const key = response.config._pendingKey as string | undefined;
    if (key) {
      this.pending.delete(key);
    }
    return response;
  }

  private async onError(error: unknown): Promise<unknown> {
    if (axios.isAxiosError(error) && error.config) {
      const cfg = error.config as CustomConfig;
      const key = cfg._pendingKey;
      if (key) this.pending.delete(key);

      if (error.name === 'CanceledError' || axios.isCancel(error)) {
        return Promise.reject(error);
      }

      return this.handleAuthErrors(error);
    }

    return Promise.reject(new ApiError('Ocurrió un error inesperado.'));
  }

  private async handleAuthErrors<T>(
    error: AxiosError<T>,
  ): Promise<AxiosResponse<T> | never> {
    const { response, config } = error;
    const method = config?.method?.toUpperCase() ?? 'UNKNOWN';
    const url = config?.url ?? 'UNKNOWN_URL';

    if (response) {
      this.logger.error(`[ApiService] Error ${method} ${url}`, error, {
        status: response.status,
        data: response.data,
      });

      if (response.status === 401) {
        const original = config as CustomConfig;
        if (original._retry) {
          return Promise.reject(error);
        }

        if (this.isRefreshing) {
          return new Promise<string>((resolve, reject) =>
            this.failedQueue.push({ resolve, reject }),
          ).then(token => {
            if (original.headers)
              original.headers.Authorization = `Bearer ${token}`;
            return this.client(original);
          });
        }

        original._retry = true;
        this.isRefreshing = true;

        try {
          const newToken = await authService.refreshToken();
          this.processFailedQueue(null, newToken);
          console.log('Token renovado:', newToken);
          if (original.headers) {
            original.headers.Authorization = `Bearer ${newToken}`;
          }
          return this.client(original);
        } catch (refreshError) {
          const err =
            refreshError instanceof Error
              ? refreshError
              : new Error('Error al renovar token');
          this.processFailedQueue(err, null);
          this.onUnauthorizedCallback?.();
          return Promise.reject(err);
        } finally {
          this.isRefreshing = false;
        }
      }

      if ([400, 403, 404].includes(response.status)) {
        this.logger.warn(`[ApiService] Client Error: ${response.status}`);
      }

      const errorMessage =
        response.data &&
        typeof response.data === 'object' &&
        'message' in response.data &&
        typeof (response.data as Record<string, unknown>).message === 'string'
          ? (response.data as Record<string, { message: string }>).message
          : 'Error de API';

      return Promise.reject(new ApiError(errorMessage as string, response.status));
    }

    if (error.request) {
      this.logger.error(`[ApiService] Network Error: no response`, error);
      return Promise.reject(new NetworkError('Sin respuesta del servidor.'));
    }

    this.logger.error(`[ApiService] Setup Error`, error);
    return Promise.reject(new ApiError('Error inesperado.'));
  }

  private processFailedQueue(
    error: Error | null,
    token: string | null = null,
  ): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else if (token) {
        resolve(token);
      } else {
        reject(new Error('Sin token nuevo'));
      }
    });
    this.failedQueue = [];
  }

  private makeKey(config: InternalAxiosRequestConfig): string {
    const { method, baseURL, url, params, data } = config;
    return `${method}:${baseURL || ''}${url}?${JSON.stringify(
      params,
    )}|${JSON.stringify(data)}`;
  }
}

export const apiService = ApiService.getInstance();
