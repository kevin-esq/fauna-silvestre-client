// src/shared/utils/jwt.ts
import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
    sub: string; // ID del usuario
}

export const decodeJwt = (token: string): JwtPayload => {
    try {
        return jwtDecode<JwtPayload>(token);
    } catch (error) {
        throw new Error('Token inválido');
    }
};