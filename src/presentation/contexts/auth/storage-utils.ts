import User from '@/domain/entities/user.entity';
import { getSecureStorageService } from '@/services/storage/secure-storage.service';
import {
  USER_KEY,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY
} from '@/services/storage/storage-keys';
import type { StoredAuthData } from './types';

/**
 * Load all auth data from secure storage
 */
export const loadAuthDataFromStorage = async (): Promise<StoredAuthData> => {
  const storage = await getSecureStorageService();

  const [storedUser, storedAccessToken, storedRefreshToken] = await Promise.all(
    [
      storage.getValueFor(USER_KEY),
      storage.getValueFor(ACCESS_TOKEN_KEY),
      storage.getValueFor(REFRESH_TOKEN_KEY)
    ]
  );

  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

  return {
    user,
    accessToken: storedAccessToken,
    refreshToken: storedRefreshToken
  };
};

/**
 * Clear all auth data from secure storage
 */
export const clearAuthDataFromStorage = async (): Promise<void> => {
  const storage = await getSecureStorageService();

  await Promise.all([
    storage.deleteValueFor(USER_KEY),
    storage.deleteValueFor(ACCESS_TOKEN_KEY),
    storage.deleteValueFor(REFRESH_TOKEN_KEY)
  ]);
};

/**
 * Load only user data from secure storage
 */
export const loadUserFromStorage = async (): Promise<User | null> => {
  const storage = await getSecureStorageService();
  const storedUser = await storage.getValueFor(USER_KEY);

  return storedUser ? JSON.parse(storedUser) : null;
};
