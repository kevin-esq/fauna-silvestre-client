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

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class UserCancelledError extends Error {
  constructor() {
    super('Operación cancelada por el usuario');
    this.name = 'UserCancelledError';
  }
}
