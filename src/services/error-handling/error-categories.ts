export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  SERVER = 'server',
  UNKNOWN = 'unknown',
  ABORT = 'abort',
  TIMEOUT = 'timeout'
}

export const RETRYABLE_CATEGORIES = [
  ErrorCategory.NETWORK,
  ErrorCategory.SERVER,
  ErrorCategory.TIMEOUT
];
