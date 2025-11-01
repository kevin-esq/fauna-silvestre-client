import AsyncStorage from '@react-native-async-storage/async-storage';

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
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
      return DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Error loading user view preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  },

  async savePreferences(
    preferences: Partial<UserViewPreferences>
  ): Promise<void> {
    try {
      const current = await this.getPreferences();
      const updated = { ...current, ...preferences };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving user view preferences:', error);
    }
  },

  async resetPreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(DEFAULT_PREFERENCES)
      );
    } catch (error) {
      console.error('Error resetting user view preferences:', error);
    }
  },

  async clearFilters(): Promise<void> {
    try {
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
    } catch (error) {
      console.error('Error clearing user view filters:', error);
    }
  }
};
