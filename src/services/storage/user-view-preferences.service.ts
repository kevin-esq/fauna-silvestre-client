import AsyncStorage from '@react-native-async-storage/async-storage';
import { errorHandlingService } from '@/services/error-handling';

const STORAGE_KEY = '@user_view_preferences';

export type ViewLayout = 'card' | 'list' | 'grid';
export type UserSortBy =
  | 'name-asc'
  | 'name-desc'
  | 'email-asc'
  | 'email-desc'
  | 'location-asc'
  | 'location-desc'
  | 'date-asc'
  | 'date-desc';

export interface UserViewPreferences {
  layout: ViewLayout;
  sortBy: UserSortBy;
  showEmail: boolean;
  showLocation: boolean;
  showUserName: boolean;
  showInitials: boolean;
  highlightStatus: boolean;
  reducedMotion: boolean;
}

const DEFAULT_PREFERENCES: UserViewPreferences = {
  layout: 'card',
  sortBy: 'name-asc',
  showEmail: true,
  showLocation: true,
  showUserName: true,
  showInitials: true,
  highlightStatus: false,
  reducedMotion: false
};

export const UserViewPreferencesService = {
  async getPreferences(): Promise<UserViewPreferences> {
    return errorHandlingService.handleWithDefault(
      async () => {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...DEFAULT_PREFERENCES, ...parsed };
        }
        return DEFAULT_PREFERENCES;
      },
      DEFAULT_PREFERENCES,
      { operation: 'getUserViewPreferences' }
    );
  },

  async savePreferences(
    preferences: Partial<UserViewPreferences>
  ): Promise<void> {
    await errorHandlingService.handleWithRetry(
      async () => {
        const current = await this.getPreferences();
        const updated = { ...current, ...preferences };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      },
      { operation: 'saveUserViewPreferences' },
      { maxAttempts: 1 }
    ).catch(() => {});
  },

  async resetPreferences(): Promise<void> {
    await errorHandlingService.handleWithRetry(
      async () => {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(DEFAULT_PREFERENCES)
        );
      },
      { operation: 'resetUserViewPreferences' },
      { maxAttempts: 1 }
    ).catch(() => {});
  },

  async clearFilters(): Promise<void> {
    await errorHandlingService.handleWithRetry(
      async () => {
        const current = await this.getPreferences();
        const cleared: UserViewPreferences = {
          ...current,
          showEmail: true,
          showLocation: true,
          showUserName: true,
          showInitials: true,
          highlightStatus: false
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cleared));
      },
      { operation: 'clearUserViewFilters' },
      { maxAttempts: 1 }
    ).catch(() => {});
  }
};
