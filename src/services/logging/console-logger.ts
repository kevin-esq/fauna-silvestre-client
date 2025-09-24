import { ILogger, LogLevel } from '../../shared/types/ILogger';

/**
 * A simple and clean logger implementation that writes to the console.
 * It supports different log levels and structured metadata.
 */
export class ConsoleLogger implements ILogger {
  private readonly minLevelIndex: number;
  private static readonly LOG_LEVELS: LogLevel[] = [
    'debug',
    'info',
    'warn',
    'error'
  ];

  /**
   * Creates a new ConsoleLogger instance.
   * @param minLevel The minimum level of messages to log. Defaults to 'info'.
   */
  constructor(minLevel: LogLevel = 'info') {
    this.minLevelIndex = ConsoleLogger.LOG_LEVELS.indexOf(minLevel);
  }

  /**
   * Logs a debug message.
   * @param message The primary message to log.
   * @param metadata Additional data to include in the log.
   */
  public debug(message: string, ...metadata: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...metadata);
    }
  }

  /**
   * Logs an informational message.
   * @param message The primary message to log.
   * @param metadata Additional data to include in the log.
   */
  public info(message: string, ...metadata: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...metadata);
    }
  }

  /**
   * Logs a warning message.
   * @param message The primary message to log.
   * @param metadata Additional data to include in the log.
   */
  public warn(message: string, ...metadata: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...metadata);
    }
  }

  /**
   * Logs an error message.
   * @param message The primary message to log.
   * @param error The associated Error object.
   * @param metadata Additional data to include in the log.
   */
  public error(message: string, error?: Error, ...metadata: unknown[]): void {
    if (this.shouldLog('error')) {
      const logObject = {
        message,
        error: error
          ? { name: error.name, message: error.message, stack: error.stack }
          : undefined,
        metadata
      };
      console.error(`[ERROR] ${message}`, logObject);
    }
  }

  /**
   * Determines if a message should be logged based on the configured minimum log level.
   * @param level The level of the message to check.
   * @returns True if the message should be logged, false otherwise.
   */
  private shouldLog(level: LogLevel): boolean {
    return ConsoleLogger.LOG_LEVELS.indexOf(level) >= this.minLevelIndex;
  }
}
