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
  debug(message: string, ...optionalParams: any[]): void;
  info(message: string, ...optionalParams: any[]): void;
  warn(message: string, ...optionalParams: any[]): void;
  error(message: string, error?: Error, ...optionalParams: any[]): void;
}
