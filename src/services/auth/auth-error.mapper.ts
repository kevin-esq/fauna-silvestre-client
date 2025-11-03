import { AxiosError } from 'axios';
import { AuthError } from '@/shared/errors/custom-errors';
import { BaseResponse } from '@/domain/models/auth.models';
import {
  ERROR_TRANSLATIONS,
  ERROR_KEYWORDS,
  GENERIC_ERROR_MESSAGES
} from '@/shared/constants/error-messages';

export class AuthErrorMapper {
  static map(error: unknown): AuthError {
    if (AuthErrorMapper.isBackendErrorResponse(error)) {
      const translatedMessage = AuthErrorMapper.translateMessage(error.message);
      return new AuthError(translatedMessage);
    }

    if (AuthErrorMapper.isAxiosError(error)) {
      return AuthErrorMapper.handleAxiosError(error);
    }

    if (error instanceof Error) {
      const translatedMessage = AuthErrorMapper.translateMessage(error.message);
      return new AuthError(translatedMessage);
    }

    return new AuthError(GENERIC_ERROR_MESSAGES.unknown);
  }

  private static handleAxiosError(error: AxiosError<BaseResponse>): AuthError {
    const status = error.response?.status;
    const responseData = error.response?.data;

    if (!error.response) {
      return new AuthError(GENERIC_ERROR_MESSAGES.network);
    }

    if (responseData && typeof responseData === 'object') {
      const { message, error: hasError } = responseData as BaseResponse;

      if (hasError && message) {
        const translatedMessage = AuthErrorMapper.translateMessage(message);
        return new AuthError(translatedMessage);
      }

      if (message) {
        const translatedMessage = AuthErrorMapper.translateMessage(message);
        return new AuthError(translatedMessage);
      }
    }

    return AuthErrorMapper.handleHttpStatus(status, responseData);
  }

  private static handleHttpStatus(
    status: number | undefined,
    responseData: unknown
  ): AuthError {
    const serverMessage = AuthErrorMapper.extractServerMessage(responseData);

    switch (status) {
      case 401:
        if (serverMessage) {
          const translatedMessage =
            AuthErrorMapper.translateMessage(serverMessage);
          return new AuthError(translatedMessage);
        }
        return new AuthError(GENERIC_ERROR_MESSAGES.authentication);

      case 400:
        if (serverMessage) {
          const translatedMessage =
            AuthErrorMapper.translateMessage(serverMessage);
          return new AuthError(translatedMessage);
        }
        return new AuthError(GENERIC_ERROR_MESSAGES.validation);

      case 403:
        return new AuthError('Acceso denegado.');

      case 404:
        if (serverMessage) {
          const translatedMessage =
            AuthErrorMapper.translateMessage(serverMessage);
          return new AuthError(translatedMessage);
        }
        return new AuthError(
          'Servicio no disponible. Contacta al administrador.'
        );

      case 409:
        if (serverMessage) {
          const translatedMessage =
            AuthErrorMapper.translateMessage(serverMessage);
          return new AuthError(translatedMessage);
        }
        return new AuthError('El recurso ya existe.');

      case 422:
        return new AuthError(GENERIC_ERROR_MESSAGES.validation);

      case 429:
        return new AuthError('Demasiadas solicitudes. Intenta más tarde.');

      case 500:
      case 502:
      case 503:
      case 504:
        return new AuthError(GENERIC_ERROR_MESSAGES.server);

      default:
        if (serverMessage) {
          const translatedMessage =
            AuthErrorMapper.translateMessage(serverMessage);
          return new AuthError(translatedMessage);
        }
        return new AuthError(GENERIC_ERROR_MESSAGES.unknown);
    }
  }

  private static extractServerMessage(responseData: unknown): string | null {
    if (!responseData) return null;

    if (typeof responseData === 'string') {
      return responseData;
    }

    if (typeof responseData !== 'object') return null;

    const data = responseData as Record<string, unknown>;

    if (typeof data.message === 'string') {
      return data.message;
    }

    if (typeof data.error === 'string') {
      return data.error;
    }

    if (typeof data.msg === 'string') {
      return data.msg;
    }

    if (typeof data.detail === 'string') {
      return data.detail;
    }

    return null;
  }

  private static translateMessage(message: string): string {
    if (!message || typeof message !== 'string') {
      return GENERIC_ERROR_MESSAGES.unknown;
    }

    const normalizedMessage = message.toLowerCase().trim();

    if (AuthErrorMapper.isSpanish(message)) {
      return message;
    }

    const translationKeys = Object.keys(ERROR_TRANSLATIONS) as Array<
      keyof typeof ERROR_TRANSLATIONS
    >;
    for (const key of translationKeys) {
      if (normalizedMessage.includes(key)) {
        return ERROR_TRANSLATIONS[key];
      }
    }

    const keywordMatch = AuthErrorMapper.findByKeywords(normalizedMessage);
    if (keywordMatch) {
      return keywordMatch;
    }

    const categoryMessage =
      AuthErrorMapper.detectErrorCategory(normalizedMessage);
    if (categoryMessage) {
      return categoryMessage;
    }

    return GENERIC_ERROR_MESSAGES.unknown;
  }

  private static findByKeywords(message: string): string | null {
    if (ERROR_KEYWORDS.username.some(keyword => message.includes(keyword))) {
      if (
        message.includes('incorrect') ||
        message.includes('wrong') ||
        message.includes('not found')
      ) {
        return 'El usuario ingresado no existe.';
      }
      if (
        message.includes('already') ||
        message.includes('exists') ||
        message.includes('taken')
      ) {
        return 'El nombre de usuario ya está registrado.';
      }
      if (message.includes('invalid') || message.includes('required')) {
        return 'El nombre de usuario no es válido.';
      }
    }

    if (ERROR_KEYWORDS.password.some(keyword => message.includes(keyword))) {
      if (message.includes('incorrect') || message.includes('wrong')) {
        return 'La contraseña es incorrecta.';
      }
      if (message.includes('weak') || message.includes('short')) {
        return 'La contraseña es demasiado débil.';
      }
      if (message.includes('match')) {
        return 'Las contraseñas no coinciden.';
      }
    }

    if (ERROR_KEYWORDS.email.some(keyword => message.includes(keyword))) {
      if (
        message.includes('already') ||
        message.includes('exists') ||
        message.includes('registered')
      ) {
        return 'El correo ya está registrado.';
      }
      if (message.includes('not found') || message.includes('not registered')) {
        return 'El correo no está registrado.';
      }
      if (message.includes('invalid') || message.includes('format')) {
        return 'El correo electrónico no es válido.';
      }
    }

    if (ERROR_KEYWORDS.token.some(keyword => message.includes(keyword))) {
      if (message.includes('expired')) {
        return 'La sesión ha expirado. Inicia sesión nuevamente.';
      }
      if (message.includes('invalid') || message.includes('malformed')) {
        return 'Sesión inválida. Inicia sesión nuevamente.';
      }
    }

    if (ERROR_KEYWORDS.blocked.some(keyword => message.includes(keyword))) {
      if (message.includes('user') || message.includes('account')) {
        return 'El usuario ha sido bloqueado. Por favor, contacta a soporte.';
      }
    }

    return null;
  }

  private static detectErrorCategory(message: string): string | null {
    if (ERROR_KEYWORDS.network.some(keyword => message.includes(keyword))) {
      return GENERIC_ERROR_MESSAGES.network;
    }

    if (ERROR_KEYWORDS.server.some(keyword => message.includes(keyword))) {
      return GENERIC_ERROR_MESSAGES.server;
    }

    if (ERROR_KEYWORDS.validation.some(keyword => message.includes(keyword))) {
      return GENERIC_ERROR_MESSAGES.validation;
    }

    return null;
  }

  private static isSpanish(message: string): boolean {
    if (/[áéíóúñü]/i.test(message)) {
      return true;
    }

    const translationValues = Object.values(ERROR_TRANSLATIONS) as string[];
    if (translationValues.includes(message)) {
      return true;
    }

    const genericValues = Object.values(GENERIC_ERROR_MESSAGES) as string[];
    if (genericValues.includes(message)) {
      return true;
    }

    const spanishWords = [
      'usuario',
      'contraseña',
      'correo',
      'cuenta',
      'sesión',
      'inicia',
      'ingresado',
      'registrado',
      'bloqueado',
      'deshabilitada',
      'requerido',
      'inválido',
      'verificar',
      'intenta',
      'servidor',
      'conexión'
    ];

    const lowerMessage = message.toLowerCase();
    return spanishWords.some(word => lowerMessage.includes(word));
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
