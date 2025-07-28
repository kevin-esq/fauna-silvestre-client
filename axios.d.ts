import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    _pendingKey?: string;
  }

  interface AxiosResponse {
    config: AxiosRequestConfig & { _pendingKey?: string };
  }
}
