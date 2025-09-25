/**
 * @file Defines the interface for a logging service.
 * @author KevinEsquivel
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Defines the contract for a logging service, allowing for different implementations
 * (e.g., console, remote logging service).
 */
export interface ILogger {
  debug(message: string, ...optionalParams: unknown[]): void;
  info(message: string, ...optionalParams: unknown[]): void;
  warn(message: string, ...optionalParams: unknown[]): void;
  error(message: string, error?: Error, ...optionalParams: unknown[]): void;
}
