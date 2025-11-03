import { ErrorCategory } from './error-categories';

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  exponentialBackoff: boolean;
  retryableCategories: ErrorCategory[];
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponentialBackoff: true,
  retryableCategories: [
    ErrorCategory.NETWORK,
    ErrorCategory.SERVER,
    ErrorCategory.TIMEOUT
  ]
};
