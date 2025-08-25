// data/repositories/BaseRepository.ts
import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { HttpError, NetworkError } from '../../shared/types/errors';
import { ILogger } from '../../shared/types/ILogger';

/**
 * Clase base para repositorios HTTP.
 * @class
 */
export abstract class BaseRepository {
  protected readonly api: AxiosInstance;
  protected readonly logger: ILogger;

  constructor(api: AxiosInstance, logger: ILogger) {
    this.api = api;
    this.logger = logger;
  }

  /**
   * Verifica el estado de la respuesta HTTP.
   * @param response - Respuesta de Axios
   * @throws {HttpError} Si el estado no es exitoso
   */
  protected ensureSuccessStatus(response: AxiosResponse): void {
    if (response.status < 200 || response.status >= 300) {
      throw new HttpError(
        `HTTP Error: Received status ${response.status}`,
        response.status,
        response.data
      );
    }
  }

  /**
   * Maneja errores HTTP centralizados.
   * @param error - Error capturado
   * @param context - Contexto de la operación
   * @returns {HttpError | NetworkError} Error procesado
   */
  protected handleHttpError(
    error: unknown,
    context: string
  ): HttpError | NetworkError {
    if (error instanceof HttpError) {
      this.logger.error(`[${context}] HTTP Error: ${error.message}`, error);
      return error;
    }

    if (this.isAxiosError(error)) {
      const message = error.response?.data?.toString() || error.message;
      const statusCode = error.response?.status;

      if (error.code === 'ECONNABORTED') {
        const networkError = new NetworkError(message);
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
