// src/domain/models/AuthModels.ts

/**
 * Credenciales de autenticación para el inicio de sesión
 * @interface
 */
export interface Credentials {
    /** Nombre de usuario o email (formato válido requerido) */
    UserName: string;
    /** Contraseña (mínimo 8 caracteres, 1 mayúscula, 1 número) */
    Password: string;
}

/**
 * Datos completos del usuario para registro
 * @interface
 */
export interface UserData {
    userName: string;
    name: string;
    lastName: string;
    locality: string;
    gender: number;
    age: number;
    email: string;
    password: string;
}

export interface UserResponse {
    userName: string;
    name: string;
    lastName: string;
    locality: string;
    gender: string;
    age: number;
    email: string;
}

/**
 * Respuesta de autenticación exitosa
 * @interface
 */
export interface AuthResponse {
    /** Token de acceso JWT (válido por 15 minutos) */
    accessToken: string;
    /** Token de refresco (válido por 7 días) */
    refreshToken: string;
    /** Datos del usuario autenticado */
    user: {
        /** ID único del usuario */
        id: string;
        /** Nombre de usuario */
        username: string;
        /** Email verificado */
        email: string;
        /** Roles del usuario */
        roles: ('user' | 'admin' | 'moderator')[];
    };
}

/**
 * Payload para renovación de token
 * @interface
 */
export interface RefreshTokenPayload {
    /** Token de refresco */
    refreshToken: string;
}

/**
 * Datos para recuperación de contraseña
 * @interface
 */
export interface PasswordRecovery {
    /** Email asociado a la cuenta */
    email: string;
    /** Token temporal de recuperación */
    token?: string;
    /** Nueva contraseña (solo para el paso de reset) */
    newPassword?: string;
}

/**
 * Respuesta de error de autenticación
 * @interface
 */
export interface AuthError {
    /** Código de error único */
    code:
        | 'invalid_credentials'
        | 'email_not_verified'
        | 'account_locked'
        | 'token_expired'
        | 'validation_error';
    /** Mensaje legible para humanos */
    message: string;
    /** Detalles adicionales del error */
    details?: {
        /** Campo específico con error */
        field?: string;
        /** Restricciones de validación */
        constraints?: Record<string, string>;
    };
}