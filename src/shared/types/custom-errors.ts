/**
 * @file Defines custom error classes for the application, providing a structured way to handle different error scenarios.
 * @author KevinEsquivel
 */

/**
 * Base class for all custom application errors.
 * Ensures that all custom errors have a name, message, and statusCode for consistent handling.
 */
export abstract class BaseError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    // Restore the prototype chain, crucial for `instanceof` checks.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Represents an error originating from an API call (e.g., server-side validation error, resource not found).
 */
export class ApiError extends BaseError {
  constructor(message = 'An unexpected API error occurred.', statusCode = 500) {
    super(message, statusCode);
  }
}

/**
 * Represents an authentication-specific error (e.g., invalid credentials, bad token).
 */
export class AuthError extends BaseError {
  constructor(message = 'Authentication failed.', statusCode = 401) {
    super(message, statusCode);
  }
}

/**
 * Represents an error related to secure storage operations (e.g., failed to save or retrieve data).
 */
export class StorageError extends BaseError {
  constructor(
    message = 'A secure storage operation failed.',
    statusCode = 500
  ) {
    super(message, statusCode);
  }
}

/**
 * Represents a client-side network error (e.g., request timeout, no internet connection).
 */
export class NetworkError extends BaseError {
  constructor(
    message = 'A network error occurred. Please check your connection.',
    statusCode = 503
  ) {
    super(message, statusCode);
  }
}
