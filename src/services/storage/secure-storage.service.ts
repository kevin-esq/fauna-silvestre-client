import { ILogger } from '../../shared/types/ILogger';
import { ConsoleLogger } from '../logging/console-logger';
import { StorageError } from '../../shared/types/custom-errors';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Defines the contract for a secure key-value storage service.
 * This interface allows for dependency inversion and easier testing.
 */
export interface ISecureStorage {
  save(key: string, value: string): Promise<void>;
  getValueFor(key: string): Promise<string | null>;
  deleteValueFor(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * A singleton service that provides a secure way to store key-value pairs using Expo's SecureStore.
 * It includes logging and custom error handling for storage operations.
 */
class SecureStorageService implements ISecureStorage {
  private static instance: SecureStorageService;
  private readonly logger: ILogger;

  private constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Gets the single instance of the SecureStorageService.
   * @returns The singleton instance.
   */
  public static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      // In a real app, you might inject a different logger based on the environment.
      SecureStorageService.instance = new SecureStorageService(new ConsoleLogger('info'));
    }
    return SecureStorageService.instance;
  }

  /**
   * Securely saves a key-value pair.
   * @param key The key to associate with the value.
   * @param value The value to store.
   * @throws {StorageError} If the save operation fails.
   */
  async save(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
      this.logger.debug(`[SecureStorage] Saved value for key: ${key}`);
    } catch (error) {
      this.logger.error(`[SecureStorage] Failed to save value for key: ${key}`, error as Error);
      throw new StorageError(`Could not save data for key: ${key}`);
    }
  }

  /**
   * Retrieves a value by its key.
   * @param key The key of the value to retrieve.
   * @returns The stored value, or null if not found.
   * @throws {StorageError} If the retrieval operation fails.
   */
  async getValueFor(key: string): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      this.logger.debug(`[AsyncStorage] ${value ? 'Retrieved' : 'Did not find'} value for key: ${key}`);
      return value;
    } catch (error) {
      this.logger.error(`[AsyncStorage] Failed to get value for key: ${key}`, error as Error);
      throw new StorageError(`Could not retrieve data for key: ${key}`);
    }
  }

  /**
   * Deletes a key-value pair.
   * @param key The key of the value to delete.
   * @throws {StorageError} If the delete operation fails.
   */
  async deleteValueFor(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      this.logger.debug(`[AsyncStorage] Deleted value for key: ${key}`);
    } catch (error) {
      this.logger.error(`[AsyncStorage] Failed to delete value for key: ${key}`, error as Error);
      throw new StorageError(`Could not delete data for key: ${key}`);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      this.logger.debug('[AsyncStorage] Cleared all data');
    } catch (error) {
      this.logger.error('[AsyncStorage] Failed to clear data', error as Error);
      throw new StorageError('Could not clear data');
    }
  }
}

/**
 * The singleton instance of the SecureStorageService.
 */
export const secureStorageService = SecureStorageService.getInstance();
