export abstract class BaseError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ApiError extends BaseError {
  constructor(message = 'An unexpected API error occurred.', statusCode = 500) {
    super(message, statusCode);
  }
}

export class AuthError extends BaseError {
  constructor(message = 'Authentication failed.', statusCode = 401) {
    super(message, statusCode);
  }
}

export class StorageError extends BaseError {
  constructor(
    message = 'A secure storage operation failed.',
    statusCode = 500
  ) {
    super(message, statusCode);
  }
}

export class NetworkError extends BaseError {
  constructor(
    message = 'A network error occurred. Please check your connection.',
    statusCode = 503
  ) {
    super(message, statusCode);
  }
}
