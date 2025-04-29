// src/data/repositories/AuthRepository.ts

import { IAuthRepository } from '../../domain/interfaces/IAuthRepository';
import { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { Credentials, UserData } from '../models/AuthModels';

// Definición de errores personalizados
export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly data?: any
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Interfaz para logging (SOLID: Dependency Inversion)
export interface ILogger {
  debug(message: string, context?: any): void;
  info(message: string, context?: any): void;
  error(message: string, error?: Error): void;
}

export class AuthRepository extends IAuthRepository {
  constructor(
    protected readonly api: AxiosInstance,
    protected readonly logger: ILogger
  ) {
    super(api, logger);
  }

  /** @inheritdoc */
  async login(credentials: Credentials): Promise<string> {
    try {
      this.logger.debug('[AuthRepository] Starting login', { credentials });
      
      const response = await this.api.post<string>('/Authentication/LogIn', credentials);
      this.ensureSuccessStatus(response);
      
      this.logger.info('[AuthRepository] Login successful');
      return response.data;
      
    } catch (error) {
      this.handleAuthError(error, 'login');
      throw error;
    }
  }

  /** @inheritdoc */
  async register(userData: UserData): Promise<number> {
    try {
      this.logger.debug('[AuthRepository] Starting registration', { userData });
      
      const response = await this.api.post('/Users/Register', userData);
      this.ensureSuccessStatus(response);
      
      this.logger.info('[AuthRepository] Registration successful');
      return response.status;
      
    } catch (error) {
      this.handleAuthError(error, 'register');
      throw error;
    }
  }

  /** @inheritdoc */
  async forgotPassword(email: string): Promise<number> {
    try {
      this.logger.debug('[AuthRepository] Starting password recovery', { email });
      
      const response = await this.api.post('/forgot-password', { email });
      this.ensureSuccessStatus(response);
      
      this.logger.info('[AuthRepository] Password recovery initiated');
      return response.status;
      
    } catch (error) {
      this.handleAuthError(error, 'forgotPassword');
      throw error;
    }
  }

  /** Valida códigos de estado HTTP 2xx */
  private ensureSuccessStatus(response: AxiosResponse): void {
    if (response.status < 200 || response.status >= 300) {
      throw new HttpError(
        `HTTP Error: Received status ${response.status}`,
        response.status,
        response.data
      );
    }
  }

  /** Manejo centralizado de errores */
  private handleAuthError(error: any, context: string): void {
    if (error instanceof HttpError) {
      this.logger.error(
        `[AuthRepository] Error in ${context} - HTTP ${error.statusCode}`,
        error
      );
      return;
    }

    if (this.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const message = String(error.response?.data) || error.message;

      if (error.code === 'ECONNABORTED') {
        this.logger.error(
          `[AuthRepository] Network timeout in ${context}`,
          new NetworkError(message)
        );
        throw new NetworkError(`Request timed out: ${message}`);
      }

      const httpError = new HttpError(
        `Request failed: ${message}`,
        statusCode,
        error.response?.data
      );

      this.logger.error(
        `[AuthRepository] Error in ${context} - Axios Error`,
        httpError
      );
      throw httpError;
    }

    // Errores no controlados
    const unexpectedError = new Error(
      `Unexpected error in ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    
    this.logger.error(
      `[AuthRepository] Unexpected error in ${context}`,
      unexpectedError
    );
    throw unexpectedError;
  }

  /** Type guard para AxiosError */
  private isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError === true;
  }
}