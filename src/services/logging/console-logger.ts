import { ILogger, LogLevel } from '../../shared/types/ILogger';

export class ConsoleLogger implements ILogger {
  private readonly minLevelIndex: number;
  private static readonly LOG_LEVELS: LogLevel[] = [
    'debug',
    'info',
    'warn',
    'error'
  ];

  constructor(minLevel: LogLevel = 'info') {
    this.minLevelIndex = ConsoleLogger.LOG_LEVELS.indexOf(minLevel);
  }

  public debug(message: string, ...metadata: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...metadata);
    }
  }

  public info(message: string, ...metadata: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...metadata);
    }
  }

  public warn(message: string, ...metadata: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...metadata);
    }
  }

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

  private shouldLog(level: LogLevel): boolean {
    return ConsoleLogger.LOG_LEVELS.indexOf(level) >= this.minLevelIndex;
  }
}
