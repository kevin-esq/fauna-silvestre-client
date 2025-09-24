export interface Credentials {
  UserName: string;
  Password: string;
}

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

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  error?: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface AuthError {
  code:
    | 'invalid_credentials'
    | 'email_not_verified'
    | 'account_locked'
    | 'token_expired'
    | 'validation_error';
  message: string;
}

export interface AuthError {
  code:
    | 'invalid_credentials'
    | 'email_not_verified'
    | 'account_locked'
    | 'token_expired'
    | 'validation_error';
  message: string;
}
