/**
 * Error base para operaciones HTTP.
 * @class
 * @extends Error
 */
export class HttpError extends Error {
    constructor(
        message: string,
        public readonly statusCode?: number,
        public readonly data?: unknown
    ) {
        super(message);
        this.name = 'HttpError';
    }
}

/**
 * Error específico para fallos de red.
 * @class
 * @extends Error
 */
export class NetworkError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NetworkError';
    }
}

/**
 * Error para operaciones canceladas por el usuario.
 * @class
 * @extends Error
 */
export class UserCancelledError extends Error {
    constructor() {
        super('Operación cancelada por el usuario');
        this.name = 'UserCancelledError';
    }
}