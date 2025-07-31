// crypto‑storage.service.ts

import { ILogger } from '../../shared/types/ILogger';
import Keychain from 'react-native-keychain';
import Aes from 'react-native-aes-crypto';
import { Platform } from 'react-native';

export interface IKeyManager {
  getKey(): Promise<string>;
  rotateKey(): Promise<string>;
}

export class KeychainKeyManager implements IKeyManager {
  private readonly service = 'com.faunasilvestreapp.securekeys';
  private readonly alias = 'aes_encryption_key';

  constructor(private logger: ILogger) {}

  async getKey(): Promise<string> {
    const creds = await Keychain.getGenericPassword({ service: this.service });
    if (creds) {
      this.logger.debug('Encryption key loaded from Keychain');
      return creds.password;
    }
    return this.rotateKey();
  }

  async rotateKey(): Promise<string> {
    const newKey = await Aes.randomKey(32);
    await Keychain.setGenericPassword(
      this.alias,
      newKey,
      {
        service: this.service,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        ...(Platform.OS === 'ios'
          ? { accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE }
          : {})
      }
    );
    this.logger.debug('New encryption key generated and stored');
    return newKey;
  }
}

export class CryptoService {
  constructor(private logger: ILogger) {}

  async encrypt(value: string, hexKey: string): Promise<string> {
    const iv = await Aes.randomKey(16);
    const cipher = await Aes.encrypt(value, hexKey, iv, 'aes-256-cbc');
    return `${iv}:${cipher}`;
  }

  async decrypt(payload: string, hexKey: string): Promise<string> {
    const [iv, cipher] = payload.split(':');
    const text = await Aes.decrypt(cipher, hexKey, iv, 'aes-256-cbc');
    return text;
  }
}

