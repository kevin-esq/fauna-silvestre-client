import { jwtDecode } from 'jwt-decode';

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
