export { ErrorHandlingService } from './error-handling.service';
export {
  ErrorHandlingServiceFactory,
  errorHandlingService
} from './error-handling.factory';
export { ErrorCategory, RETRYABLE_CATEGORIES } from './error-categories';
export type { ErrorContext } from './error-context.interface';
export type { RetryOptions } from './retry-options.interface';
export { DEFAULT_RETRY_OPTIONS } from './retry-options.interface';
