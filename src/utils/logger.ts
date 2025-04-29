// src/utils/logger.ts
import { ILogger } from '../data/repositories/AuthRepository';

export class ContextLogger implements ILogger {
  constructor(private readonly context: string = 'App') {}

  debug(message: string, context?: any): void {
    console.debug(`[${this.context}] ${message}`, context);
  }

  info(message: string, context?: any): void {
    console.info(`[${this.context}] ${message}`, context);
  }

  error(message: string, error?: Error): void {
    console.error(`[${this.context}] ${message}`, error || '');
  }
}