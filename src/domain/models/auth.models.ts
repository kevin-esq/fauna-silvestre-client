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

export interface BaseResponse {
  message: string;
  error: boolean;
}

export interface AuthResponse extends BaseResponse {
  accessToken?: string;
  refreshToken?: string;
}

// eslint-disable-next-line
export interface RegisterResponse extends BaseResponse {}
// eslint-disable-next-line
export interface ResetCodeResponse extends BaseResponse {}
// eslint-disable-next-line
export interface ChangePasswordResponse extends BaseResponse {}

export interface VerifyCodeResponse extends BaseResponse {
  token: string;
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
    | 'validation_error'
    | 'backend_error';
  message: string;
}
