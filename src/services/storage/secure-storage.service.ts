import { ConsoleLogger } from '../logging/console-logger';
import { StorageError } from '../../shared/types/custom-errors';
import EncryptedStorage from 'react-native-encrypted-storage';
import { ILogger } from '../logging/ILogger';
import { IKeyManager, CryptoService, KeychainKeyManager } from './crypto‑storage.service';

export interface ISecureStorage {
  save(key: string, value: string): Promise<void>;
  getValueFor(key: string): Promise<string | null>;
  deleteValueFor(key: string): Promise<void>;
  clear(): Promise<void>;
  rotateEncryptionKeys(): Promise<void>;
}

export class SecureStorageService implements ISecureStorage {
  private static instance: SecureStorageService;
  private encryptionKey!: string;
  private readonly indexKey = '__secure_storage_index__';

  private constructor(
    private logger: ILogger,
    private keyManager: IKeyManager,
    private cryptoService: CryptoService
  ) {}

  public static async getInstance(): Promise<SecureStorageService> {
    if (!SecureStorageService.instance) {
      const logger = new ConsoleLogger('info');
      const keyManager = new KeychainKeyManager(logger);
      const cryptoService = new CryptoService(logger);
      const svc = new SecureStorageService(logger, keyManager, cryptoService);
      svc.encryptionKey = await keyManager.getKey();
      SecureStorageService.instance = svc;
    }
    return SecureStorageService.instance;
  }

  private async getStoredKeys(): Promise<Set<string>> {
    const raw = await EncryptedStorage.getItem(this.indexKey);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  }

  private async saveStoredKeys(keys: Set<string>): Promise<void> {
    await EncryptedStorage.setItem(this.indexKey, JSON.stringify([...keys]));
  }

  public async save(key: string, value: string): Promise<void> {
    if (!value) throw new StorageError('No se puede guardar valor vacío');
    try {
      const encrypted = await this.cryptoService.encrypt(value, this.encryptionKey);
      await EncryptedStorage.setItem(key, encrypted);
      const keys = await this.getStoredKeys();
      keys.add(key);
      await this.saveStoredKeys(keys);
      this.logger.debug(`Guardado y registrado key: ${key}`);
    } catch (e) {
      this.logger.error(`Error guardando key ${key}`, e as Error);
      throw new StorageError(`No se pudo guardar datos para ${key}`);
    }
  }

  public async getValueFor(key: string): Promise<string | null> {
    try {
      const raw = await EncryptedStorage.getItem(key);
      if (!raw) return null;
      const decrypted = await this.cryptoService.decrypt(raw, this.encryptionKey);
      this.logger.debug(`Obtenido y desencriptado key: ${key}`);
      return decrypted;
    } catch (e) {
      this.logger.error(`Error leyendo key ${key}`, e as Error);
      this.logger.warn('Falló desencriptado, rotando keys');
      await this.rotateEncryptionKeys();
      throw new StorageError(`No se pudo leer datos para ${key}`);
    }
  }

  public async deleteValueFor(key: string): Promise<void> {
    try {
      await EncryptedStorage.removeItem(key);
      const keys = await this.getStoredKeys();
      keys.delete(key);
      await this.saveStoredKeys(keys);
      this.logger.debug(`Eliminada key: ${key}`);
    } catch (e) {
      this.logger.error(`Error eliminando key ${key}`, e as Error);
      throw new StorageError(`No se pudo eliminar datos para ${key}`);
    }
  }

  public async clear(): Promise<void> {
    try {
      await EncryptedStorage.clear();
      await EncryptedStorage.removeItem(this.indexKey);
      this.logger.debug('Se borró todo el storage seguro');
    } catch (e) {
      this.logger.error('Error limpiando storage', e as Error);
      throw new StorageError('No se pudo limpiar el storage');
    }
  }

  public async rotateEncryptionKeys(): Promise<void> {
    try {
      const keys = await this.getStoredKeys();
      const backup: Record<string, string> = {};
      for (const k of keys) {
        backup[k] = (await EncryptedStorage.getItem(k)) || '';
      }

      this.encryptionKey = await this.keyManager.rotateKey();

      for (const [k, raw] of Object.entries(backup)) {
        try {
          const plain = await this.cryptoService.decrypt(raw, this.encryptionKey);
          const reenc = await this.cryptoService.encrypt(plain, this.encryptionKey);
          await EncryptedStorage.setItem(k, reenc);
        } catch {
          this.logger.warn(`No se pudo re‑encriptar ${k}, eliminando`);
          await EncryptedStorage.removeItem(k);
          keys.delete(k);
        }
      }
      await this.saveStoredKeys(keys);
      this.logger.info('Rotación de keys completada');
    } catch (e) {
      this.logger.error('Error rotando keys', e as Error);
      throw new StorageError('Falló rotación de claves');
    }
  }
}

let instance: SecureStorageService | null = null;

export const getSecureStorageService = async (): Promise<SecureStorageService> => {
  if (!instance) {
    instance = await SecureStorageService.getInstance();
  }
  return instance;
};
