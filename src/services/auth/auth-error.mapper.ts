import { AxiosError } from 'axios';
import { AuthError } from '../../shared/types/custom-errors';

export class AuthErrorMapper {
  /**
   * Transforma errores de login HTTP en mensajes amigables.
   */
  static map(error: unknown): AuthError {
    if (AuthErrorMapper.isAxiosError(error)) {
      const status = error.response?.status;
      const serverMessage = error.response?.data?.error;

      if (status === 401) {
        if (typeof serverMessage === 'string') {
          if (serverMessage.includes('Username')) {
            return new AuthError('El usuario ingresado no existe.');
          }

          if (serverMessage.includes('password')) {
            return new AuthError('La contraseña es incorrecta.');
          }
        }

        return new AuthError('Credenciales inválidas. Verifica tus datos.');
      }
    }

    return new AuthError('Ocurrió un error al iniciar sesión.');
  }

  private static isAxiosError(
    error: unknown
  ): error is AxiosError<{ error: string }> {
    return (error as AxiosError)?.isAxiosError === true;
  }
}
