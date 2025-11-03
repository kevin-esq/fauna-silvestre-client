import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios';
import axiosRetry from 'axios-retry';
import { ILogger } from '@/services/logging/ILogger';
import { ConsoleLogger } from '@/services/logging/console-logger';
import { ApiError, NetworkError } from '@/shared/errors/custom-errors';
import { extra } from '../../../app.json';
import { getSecureStorageService } from '@/services/storage/secure-storage.service';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/services/storage/storage-keys';
import { authService } from '@/services/auth/auth.factory';

const { PUBLIC_API_URL, PUBLIC_API_TIMEOUT } = extra;
interface CustomConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _pendingKey?: string;
}

export class ApiService {
  private static instance: ApiService;
  public readonly client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];
  private pending = new Map<string, AbortController>();
  private logger: ILogger;

  private constructor(logger: ILogger) {
    this.logger = logger;
    this.client = axios.create({
      baseURL: PUBLIC_API_URL,
      timeout: Number(PUBLIC_API_TIMEOUT) || 60000,
      headers: { 'Content-Type': 'application/json' }
    });

    axiosRetry(this.client, {
      retries: 3,
      retryDelay: retryCount => retryCount * 2000,
      retryCondition: err => {
        if (err.code === 'ERR_CANCELED' || err.message?.includes('canceled')) {
          return false;
        }
        return (
          axiosRetry.isNetworkError(err) ||
          axiosRetry.isRetryableError(err) ||
          (err.code === 'ECONNABORTED' && err.message.includes('timeout'))
        );
      },
      onRetry: (err, attempt) => {
        const errorMessage = this.getErrorMessage(err);
        this.logger.warn(`[ApiService] Retry #${errorMessage}: ${attempt}`);
      }
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService(new ConsoleLogger('info'));
    }
    return ApiService.instance;
  }

  public setOnUnauthorizedCallback(callback: () => void): void {
    authService.setOnUnauthorizedCallback(callback);
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(this.onRequest.bind(this));
    this.client.interceptors.response.use(
      r => this.onResponse(r),
      e => this.onError(e)
    );
  }

  private async onRequest(config: CustomConfig): Promise<CustomConfig> {
    const token = await (
      await getSecureStorageService()
    ).getValueFor(ACCESS_TOKEN_KEY);
    if (token && config.headers)
      config.headers.Authorization = `Bearer ${token}`;

    const key = this.makeKey(config);
    if (this.pending.has(key)) this.pending.get(key)!.abort();

    const ctrl = new AbortController();
    this.pending.set(key, ctrl);
    config.signal = ctrl.signal;
    config._pendingKey = key;

    return config;
  }

  private onResponse<T>(response: AxiosResponse<T>): AxiosResponse<T> {
    const key = (response.config as CustomConfig)._pendingKey;
    if (key) this.pending.delete(key);
    return response;
  }

  private async onError(error: unknown): Promise<unknown> {
    if (!axios.isAxiosError(error)) {
      if (error instanceof Error && !error.message?.includes('canceled')) {
        this.logger.error('Non Axios error', error);
      }
      return Promise.reject(new ApiError('Unexpected non-Axios error'));
    }

    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    if (!error.response) {
      if (!error.message?.includes('canceled')) {
        this.logger.error('No response', error as Error);
      }
      return Promise.reject(new NetworkError('No response from server'));
    }

    return this.handleAuthErrors(error);
  }

  private async handleAuthErrors<T>(
    error: AxiosError<T>
  ): Promise<AxiosResponse<T> | never> {
    const response = error.response;
    const original = error.config as CustomConfig;

    const isAuthRoute =
      original.url?.includes('/Authentication/') ||
      original.url?.includes('/Users/');

    if (response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;

      if (this.isRefreshing) {
        return new Promise<string>((resolve, reject) =>
          this.failedQueue.push({ resolve, reject })
        ).then(token => {
          original.headers!.Authorization = `Bearer ${token}`;
          return this.client(original);
        });
      }

      this.isRefreshing = true;
      try {
        const refreshToken = await (
          await getSecureStorageService()
        ).getValueFor(REFRESH_TOKEN_KEY);
        const newToken = await authService.refreshToken(refreshToken || '');
        this.processFailedQueue(null, newToken);
        original.headers!.Authorization = `Bearer ${newToken}`;
        return this.client(original);
      } catch (err) {
        const ex = err instanceof Error ? err : new Error('Refresh failed');
        this.processFailedQueue(ex, null);
        authService.triggerLogout();
        return Promise.reject(ex);
      } finally {
        this.isRefreshing = false;
      }
    }

    if (response && [400, 403, 404].includes(response.status)) {
      this.logger.warn(`[ApiService] HTTP ${response.status}`);
    }

    if (
      response?.data &&
      typeof response.data === 'object' &&
      'message' in response.data
    ) {
      return Promise.reject(
        new ApiError(
          (response.data as { message: string }).message,
          response.status
        )
      );
    }

    if ((error as AxiosError).request) {
      return Promise.reject(new NetworkError('No response from server'));
    }

    return Promise.reject(new ApiError('Unexpected error'));
  }

  private processFailedQueue(error: Error | null, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) =>
      error
        ? reject(error)
        : token
          ? resolve(token)
          : reject(new Error('No token'))
    );
    this.failedQueue = [];
  }

  private makeKey(config: InternalAxiosRequestConfig): string {
    return `${config.method}|${config.baseURL}|${config.url}|${JSON.stringify(
      config.params
    )}|${JSON.stringify(config.data)}`;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
