import { ILogger } from '../../shared/types/ILogger';

export class ContextLogger implements ILogger {
  constructor(private readonly context: string = 'App') {}

  debug(message: string, context?: unknown): void {
    console.debug(`[${this.context}] ${message}`, context);
  }

  info(message: string, context?: unknown): void {
    console.info(`[${this.context}] ${message}`, context);
  }

  error(message: string, error?: Error): void {
    console.error(`[${this.context}] ${message}`, error || '');
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    console.warn(`[${this.context}] ${message}`, metadata);
  }
}
