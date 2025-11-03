import { ErrorHandlingService } from './error-handling.service';

export class ErrorHandlingServiceFactory {
  private static instance: ErrorHandlingService;

  static getInstance(): ErrorHandlingService {
    if (!this.instance) {
      this.instance = new ErrorHandlingService();
    }
    return this.instance;
  }

  static resetInstance(): void {
    // @ts-expect-error - Allow reset for testing purposes
    this.instance = undefined;
  }
}

export const errorHandlingService = ErrorHandlingServiceFactory.getInstance();
