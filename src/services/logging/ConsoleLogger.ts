import { ILogger } from '../../shared/types/ILogger';

/**
 * Implementación de logger para producción usando la consola.
 * @class
 * @implements ILogger
 */
export class ConsoleLogger implements ILogger {
    private readonly logLevels = ['debug', 'info', 'warn', 'error'];
    private readonly minLevel: number;

    constructor(minLevel: 'debug' | 'info' | 'warn' | 'error' = 'info') {
        this.minLevel = this.logLevels.indexOf(minLevel);
    }

    debug(message: string, metadata?: Record<string, unknown>): void {
        if (this.minLevel <= 0) {
            console.debug(`[DEBUG] ${message}`, this.sanitize(metadata));
        }
    }

    info(message: string, metadata?: Record<string, unknown>): void {
        if (this.minLevel <= 1) {
            console.info(`[INFO] ${message}`, this.sanitize(metadata));
        }
    }

    warn(message: string, metadata?: Record<string, unknown>): void {
        if (this.minLevel <= 2) {
            console.warn(`[WARN] ${message}`, this.sanitize(metadata));
        }
    }

    error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
        if (this.minLevel <= 3) {
            console.error(`[ERROR] ${message}`, {
                error: this.formatError(error),
                ...this.sanitize(metadata)
            });
        }
    }

    private formatError(error?: Error): Record<string, unknown> | undefined {
        if (!error) return undefined;
        return {
            name: error.name,
            message: error.message,
            stack: error.stack?.split('\n').map(line => line.trim())
        };
    }

    private sanitize(data?: Record<string, unknown>): Record<string, unknown> | undefined {
        if (!data) return undefined;
        return JSON.parse(JSON.stringify(data, (_, value) => {
            if (value instanceof Error) return this.formatError(value);
            if (typeof value === 'bigint') return value.toString();
            return value;
        }));
    }
}