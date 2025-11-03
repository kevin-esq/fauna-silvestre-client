import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { HttpError, NetworkError } from '../../shared/types/errors';
import { ILogger } from '../../services/logging/ILogger';

export abstract class BaseRepository {
  protected readonly api: AxiosInstance;
  protected readonly logger: ILogger;

  constructor(api: AxiosInstance, logger: ILogger) {
    this.api = api;
    this.logger = logger;
  }

  protected ensureSuccessStatus(response: AxiosResponse): void {
    console.log(response.data);
    if (response.status < 200 || response.status >= 300) {
      throw new HttpError(
        `HTTP Error: Received status ${response.status}`,
        response.status,
        response.data
      );
    }
  }

  protected handleHttpError(error: unknown, context: string): HttpError {
    if (this.isAxiosError(error)) {
      if (
        error.code === 'ERR_CANCELED' ||
        error.message?.includes('canceled')
      ) {
        return new HttpError('Request canceled', 0);
      }

      const statusCode = error.response?.status;
      const responseData = error.response?.data as
        | { message?: string }
        | undefined;
      const message = responseData?.message || error.message;

      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        const networkError = new NetworkError(
          `Network error in ${context}: ${message}`
        );
        this.logger.error(`[${context}] Network Error`, networkError);
        return networkError;
      }

      const httpError = new HttpError(
        message,
        statusCode,
        error.response?.data
      );
      this.logger.error(`[${context}] API Error`, httpError);
      return httpError;
    }

    if (error instanceof Error && error.message?.includes('canceled')) {
      return new HttpError('Request canceled', 0);
    }

    const unknownError = new HttpError(
      `Unknown error in ${context}: ${String(error)}`
    );
    this.logger.error(`[${context}] Unexpected Error`, unknownError);
    return unknownError;
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError;
  }
}
