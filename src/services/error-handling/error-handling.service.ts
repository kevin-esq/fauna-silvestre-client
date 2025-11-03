import { ILogger } from '@/services/logging/ILogger';
import { ErrorCategory, RETRYABLE_CATEGORIES } from './error-categories';
import { ErrorContext } from './error-context.interface';
import { RetryOptions, DEFAULT_RETRY_OPTIONS } from './retry-options.interface';

export class ErrorHandlingService {
  /**
   * Handle error with logging and throw
   */
  handle(error: unknown, context: ErrorContext, logger?: ILogger): never {
    const category = this.categorize(error);
    const message = this.formatErrorMessage(error, context);

    if (logger) {
      logger.error(message, error as Error, {
        ...context,
        category,
        timestamp: Date.now()
      });
    }

    throw error;
  }

  /**
   * Handle error and return default value instead of throwing
   */
  handleWithDefault<T>(
    error: unknown,
    defaultValue: T,
    context: ErrorContext,
    logger?: ILogger
  ): T {
    const category = this.categorize(error);
    const message = this.formatErrorMessage(error, context);

    if (logger) {
      logger.error(message, error as Error, {
        ...context,
        category,
        timestamp: Date.now(),
        returnedDefault: true
      });
    } else {
      console.error(message, error);
    }

    return defaultValue;
  }

  /**
   * Execute operation with retry logic
   */
  async handleWithRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    options?: Partial<RetryOptions>,
    logger?: ILogger
  ): Promise<T> {
    const retryOptions: RetryOptions = {
      ...DEFAULT_RETRY_OPTIONS,
      ...options
    };

    let lastError: unknown;

    for (let attempt = 1; attempt <= retryOptions.maxAttempts; attempt++) {
      try {
        if (logger && attempt > 1) {
          logger.debug(`Retry attempt ${attempt}/${retryOptions.maxAttempts}`, {
            ...context,
            attempt
          });
        }

        return await operation();
      } catch (error) {
        lastError = error;
        const category = this.categorize(error);

        // Check if error is retryable
        const isRetryable = retryOptions.retryableCategories.includes(category);
        const isLastAttempt = attempt === retryOptions.maxAttempts;

        if (!isRetryable || isLastAttempt) {
          // Don't retry, throw immediately
          if (logger) {
            const message = this.formatErrorMessage(error, context);
            logger.error(message, error as Error, {
              ...context,
              category,
              attempt,
              retryable: isRetryable,
              timestamp: Date.now()
            });
          }
          throw error;
        }

        // Calculate delay for next retry
        const delay = this.calculateRetryDelay(
          attempt,
          retryOptions.baseDelay,
          retryOptions.maxDelay,
          retryOptions.exponentialBackoff
        );

        if (logger) {
          logger.debug(`Operation failed, retrying in ${delay}ms`, {
            ...context,
            category,
            attempt,
            delay
          });
        }

        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError;
  }

  /**
   * Categorize error based on its properties
   */
  categorize(error: unknown): ErrorCategory {
    if (!error) {
      return ErrorCategory.UNKNOWN;
    }

    if (error instanceof Error) {
      // Check error name
      if (error.name === 'AbortError') {
        return ErrorCategory.ABORT;
      }

      if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        return ErrorCategory.TIMEOUT;
      }

      // Check error message
      const message = error.message.toLowerCase();

      if (message.includes('network') || message.includes('fetch failed')) {
        return ErrorCategory.NETWORK;
      }

      if (
        message.includes('unauthorized') ||
        message.includes('authentication')
      ) {
        return ErrorCategory.AUTHENTICATION;
      }

      if (message.includes('forbidden') || message.includes('authorization')) {
        return ErrorCategory.AUTHORIZATION;
      }

      if (message.includes('not found') || message.includes('404')) {
        return ErrorCategory.NOT_FOUND;
      }

      if (message.includes('conflict') || message.includes('409')) {
        return ErrorCategory.CONFLICT;
      }

      if (message.includes('validation') || message.includes('invalid')) {
        return ErrorCategory.VALIDATION;
      }

      if (message.includes('server error') || message.includes('500')) {
        return ErrorCategory.SERVER;
      }
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: unknown, options?: Partial<RetryOptions>): boolean {
    const category = this.categorize(error);
    const retryableCategories =
      options?.retryableCategories || RETRYABLE_CATEGORIES;
    return retryableCategories.includes(category);
  }

  /**
   * Format error message with context
   */
  formatErrorMessage(error: unknown, context: ErrorContext): string {
    const operation = context.operation;
    const params = context.params ? JSON.stringify(context.params) : '';

    if (error instanceof Error) {
      return `[${operation}] ${error.message}${params ? ` | Params: ${params}` : ''}`;
    }

    if (typeof error === 'string') {
      return `[${operation}] ${error}${params ? ` | Params: ${params}` : ''}`;
    }

    return `[${operation}] Unknown error${params ? ` | Params: ${params}` : ''}`;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(
    attempt: number,
    baseDelay: number,
    maxDelay: number,
    exponentialBackoff: boolean
  ): number {
    if (!exponentialBackoff) {
      return baseDelay;
    }

    // Exponential backoff: baseDelay * 2^(attempt-1)
    const delay = baseDelay * Math.pow(2, attempt - 1);
    return Math.min(delay, maxDelay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
