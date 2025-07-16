/**
 * Contrato para el servicio de logging.
 * @interface
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ILogger {
  debug(message: string, ...optionalParams: unknown[]): void;
  info(message: string, ...optionalParams: unknown[]): void;
  warn(message: string, ...optionalParams: unknown[]): void;
  error(message: string, error?: Error, ...optionalParams: unknown[]): void;
}