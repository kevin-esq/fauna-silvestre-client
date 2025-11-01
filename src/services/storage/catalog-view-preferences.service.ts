import AsyncStorage from '@react-native-async-storage/async-storage';

const CATALOG_PREFERENCES_KEY = '@catalog_view_preferences';

export type ViewLayout = 'list' | 'grid' | 'card' | 'timeline';
export type ViewDensity = 'compact' | 'comfortable' | 'spacious';
export type CatalogSortBy =
  | 'name-asc'
  | 'name-desc'
  | 'species-asc'
  | 'species-desc'
  | 'category-asc'
  | 'category-desc'
  | 'habitat-asc'
  | 'habitat-desc';
export type FilterByCategory = 'all' | string;

export interface CatalogViewPreferences {
  layout: ViewLayout;
  density: ViewDensity;
  sortBy: CatalogSortBy;
  filterByCategory: FilterByCategory;
  showImages: boolean;
  highlightStatus: boolean;
  showCategory: boolean;
  showSpecies: boolean;
  showHabitat: boolean;
  showDescription: boolean;
  reducedMotion: boolean;
}

export const DEFAULT_CATALOG_PREFERENCES: CatalogViewPreferences = {
  layout: 'card',
  density: 'comfortable',
  sortBy: 'name-asc',
  filterByCategory: 'all',
  showImages: true,
  highlightStatus: false,
  showCategory: true,
  showSpecies: true,
  showHabitat: true,
  showDescription: true,
  reducedMotion: false
};

class CatalogViewPreferencesService {
  private preferences: CatalogViewPreferences = DEFAULT_CATALOG_PREFERENCES;

  async load(): Promise<CatalogViewPreferences> {
    try {
      const stored = await AsyncStorage.getItem(CATALOG_PREFERENCES_KEY);
      if (stored) {
        this.preferences = {
          ...DEFAULT_CATALOG_PREFERENCES,
          ...JSON.parse(stored)
        };
      } else {
        this.preferences = DEFAULT_CATALOG_PREFERENCES;
      }
      return this.preferences;
    } catch (error) {
      console.error('Error loading catalog preferences:', error);
      return DEFAULT_CATALOG_PREFERENCES;
    }
  }

  async save(preferences: Partial<CatalogViewPreferences>): Promise<void> {
    try {
      this.preferences = { ...this.preferences, ...preferences };
      await AsyncStorage.setItem(
        CATALOG_PREFERENCES_KEY,
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      console.error('Error saving catalog preferences:', error);
      throw error;
    }
  }

  async reset(): Promise<void> {
    try {
      this.preferences = DEFAULT_CATALOG_PREFERENCES;
      await AsyncStorage.removeItem(CATALOG_PREFERENCES_KEY);
    } catch (error) {
      console.error('Error resetting catalog preferences:', error);
      throw error;
    }
  }

  get(): CatalogViewPreferences {
    return this.preferences;
  }
}

export const catalogViewPreferencesService =
  new CatalogViewPreferencesService();
