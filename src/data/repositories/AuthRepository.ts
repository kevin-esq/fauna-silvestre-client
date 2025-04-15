import IAuthRepository from '../../domain/interfaces/IAuthRepository';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { mapLoginModelToEntity } from '../../mappers/LoginMapper';
import { Credentials, UserData } from '../models/AuthModels';
import api from '../../services/ApiClient';

export default class AuthRepository extends IAuthRepository {
  private api: AxiosInstance = api;

  async login(credentials: Credentials): Promise<string> {
    const response = await this.api.post('/Authentication/LogIn', credentials);
    this.ensureSuccessStatus(response);
    console.log(response.data);
    return response.data;
  }

  async register(userData: UserData): Promise<number> {
    try {
      const response = await this.api.post('/Users/Register', userData);
      this.ensureSuccessStatus(response);
      return response.status;
    } catch (error) {
      throw this.handleError(error, 'Registro fallido');
    }
  }

  async forgotPassword(email: string): Promise<number> {
    try {
      const response = await this.api.post('/forgot-password', { email });
      this.ensureSuccessStatus(response);
      return response.status;
    } catch (error) {
      throw this.handleError(error, 'Recuperación fallida');
    }
  }

  private ensureSuccessStatus(response: AxiosResponse): void {
    if (response.status !== 200) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
  }

  private handleError(error: any, context: string): Error {
    if (error.response) {
      const message = error.response.data?.message || 'Error del servidor';
      return new Error(`❌ ${context}: ${message}`);
    } else if (error.request) {
      return new Error(`❌ ${context}: No se recibió respuesta del servidor`);
    } else {
      return new Error(`❌ ${context}: ${error.message}`);
    }
  }
}
