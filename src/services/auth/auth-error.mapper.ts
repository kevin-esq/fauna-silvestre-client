import { AxiosError } from 'axios';
import { AuthError } from '../../shared/types/custom-errors';
import { BaseResponse } from '../../domain/models/auth.models';

export class AuthErrorMapper {
  static map(error: unknown): AuthError {
    if (AuthErrorMapper.isBackendErrorResponse(error)) {
      return new AuthError(error.message || 'Error del servidor');
    }

    if (AuthErrorMapper.isAxiosError(error)) {
      const status = error.response?.status;
      const responseData = error.response?.data;

      if (responseData && typeof responseData === 'object') {
        const { message, error: hasError } = responseData as BaseResponse;

        if (hasError && message) {
          return new AuthError(message);
        }
      }

      if (status === 401) {
        const serverMessage = responseData?.error || responseData?.message;

        if (typeof serverMessage === 'string') {
          if (
            serverMessage.toLowerCase().includes('username') ||
            serverMessage.toLowerCase().includes('usuario')
          ) {
            return new AuthError('El usuario ingresado no existe.');
          }

          if (
            serverMessage.toLowerCase().includes('password') ||
            serverMessage.toLowerCase().includes('contraseña')
          ) {
            return new AuthError('La contraseña es incorrecta.');
          }

          return new AuthError(serverMessage);
        }

        return new AuthError('Credenciales inválidas. Verifica tus datos.');
      }

      if (status === 400) {
        const serverMessage =
          typeof responseData?.message === 'string'
            ? responseData.message
            : typeof responseData?.error === 'string'
              ? responseData.error
              : undefined;
        return new AuthError(
          serverMessage || 'Datos inválidos. Verifica la información.'
        );
      }

      if (status === 500) {
        return new AuthError('Error interno del servidor. Intenta más tarde.');
      }

      if (status === 404) {
        return new AuthError(
          'Servicio no disponible. Contacta al administrador.'
        );
      }
    }

    if (error instanceof Error) {
      return new AuthError(error.message);
    }

    return new AuthError('Ocurrió un error inesperado.');
  }

  private static isBackendErrorResponse(error: unknown): error is BaseResponse {
    return (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      'message' in error &&
      typeof (error as BaseResponse).error === 'boolean' &&
      typeof (error as BaseResponse).message === 'string'
    );
  }

  private static isAxiosError(
    error: unknown
  ): error is AxiosError<BaseResponse> {
    return (error as AxiosError)?.isAxiosError === true;
  }
}
