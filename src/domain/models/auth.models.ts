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
    accessToken: string;
    refreshToken: string;
    error?: string;
}

/**
 * Payload para renovación de token
 * @interface
 */
export interface RefreshTokenPayload {
    refreshToken: string;
}

/**
 * Respuesta de error de autenticación
 * @interface
 */
export interface AuthError {
    code:
        | 'invalid_credentials'
        | 'email_not_verified'
        | 'account_locked'
        | 'token_expired'
        | 'validation_error';
    message: string;
}