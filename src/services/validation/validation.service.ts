import User from '@/domain/entities/user.entity';

export class ValidationService {
  // Pagination validation constants
  private static readonly MIN_PAGE_NUMBER = 1;
  private static readonly MAX_PAGE_SIZE = 100;
  private static readonly MIN_PAGE_SIZE = 1;

  /**
   * Validate pagination parameters
   */
  static validatePaginationParams(page: number, size: number): void {
    if (!Number.isInteger(page) || page < this.MIN_PAGE_NUMBER) {
      throw new Error(
        `Page number must be an integer greater than or equal to ${this.MIN_PAGE_NUMBER}`
      );
    }

    if (
      !Number.isInteger(size) ||
      size < this.MIN_PAGE_SIZE ||
      size > this.MAX_PAGE_SIZE
    ) {
      throw new Error(
        `Page size must be an integer between ${this.MIN_PAGE_SIZE} and ${this.MAX_PAGE_SIZE}`
      );
    }
  }

  /**
   * Validate user is authenticated and has a role
   */
  static validateUser(user: User | null): asserts user is User {
    if (!user?.role) {
      throw new Error('User not authenticated');
    }
  }

  /**
   * Validate ID is non-empty
   */
  static validateId(id: string, context: string): void {
    if (!id?.trim()) {
      throw new Error(`ID is required for ${context}`);
    }
  }

  /**
   * Validate non-empty string
   */
  static validateNonEmptyString(
    value: string,
    fieldName: string,
    context: string
  ): void {
    if (!value?.trim()) {
      throw new Error(`${fieldName} is required for ${context}`);
    }
  }

  /**
   * Validate auth data (user, tokens)
   */
  static validateAuthData(
    user: User | null,
    accessToken: string | null,
    refreshToken: string | null
  ): boolean {
    return !!(user && user.role && accessToken && refreshToken);
  }
}
