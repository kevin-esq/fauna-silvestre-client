// src/shared/utils/jwt.ts
import { jwtDecode } from 'jwt-decode';

// This represents the raw structure of the token from the backend.
// The keys are the long claim URIs from the .NET identity system.
export interface RawJwtPayload {
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;
    exp: number;
    iat: number;
}

export const decodeJwt = (token: string): RawJwtPayload => {
    try {
        return jwtDecode<RawJwtPayload>(token);
    } catch (error) {
        console.error('Invalid token for decoding:', error);
        throw new Error('Token inválido');
    }
};