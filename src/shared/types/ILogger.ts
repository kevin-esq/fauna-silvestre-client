/**
 * Contrato para el servicio de logging.
 * @interface
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ILogger {
  debug(message: string, ...optionalParams: any[]): void;
  info(message: string, ...optionalParams: any[]): void;
  warn(message: string, ...optionalParams: any[]): void;
  error(message: string, error?: Error, ...optionalParams: any[]): void;
}