import AsyncStorage from '@react-native-async-storage/async-storage';
import { PUBLICATION_VIEW_PREFERENCES_KEY } from './storage-keys';

export type ViewLayout = 'list' | 'grid' | 'card' | 'timeline';
export type ViewDensity = 'compact' | 'comfortable' | 'spacious';
export type ViewGroupBy = 'none' | 'animal' | 'date' | 'status';
export type ViewSortBy =
  | 'date-desc'
  | 'date-asc'
  | 'name-asc'
  | 'name-desc'
  | 'status'
  | 'accepted-desc'
  | 'accepted-asc'
  | 'location-asc'
  | 'location-desc'
  | 'species-asc'
  | 'species-desc';
export type FilterByAnimalState = 'all' | 'ALIVE' | 'DEAD';

export interface PublicationViewPreferences {
  layout: ViewLayout;
  density: ViewDensity;
  groupBy: ViewGroupBy;
  sortBy: ViewSortBy;
  filterByAnimalState: FilterByAnimalState;
  showImages: boolean;
  highlightStatus: boolean;
  showCreatedDate: boolean;
  showAcceptedDate: boolean;
  showAnimalState: boolean;
  showLocation: boolean;
  showRejectReason: boolean;
  reducedMotion: boolean;
}

export const DEFAULT_PUBLICATION_VIEW_PREFERENCES: PublicationViewPreferences =
  {
    layout: 'card',
    density: 'comfortable',
    groupBy: 'none',
    sortBy: 'date-desc',
    filterByAnimalState: 'all',
    showImages: true,
    highlightStatus: true,
    showCreatedDate: true,
    showAcceptedDate: true,
    showAnimalState: true,
    showLocation: true,
    showRejectReason: true,
    reducedMotion: false
  };

export class PublicationViewPreferencesService {
  private static instance: PublicationViewPreferencesService;
  private preferences: PublicationViewPreferences =
    DEFAULT_PUBLICATION_VIEW_PREFERENCES;

  private constructor() {}

  static getInstance(): PublicationViewPreferencesService {
    if (!PublicationViewPreferencesService.instance) {
      PublicationViewPreferencesService.instance =
        new PublicationViewPreferencesService();
    }
    return PublicationViewPreferencesService.instance;
  }

  async load(): Promise<PublicationViewPreferences> {
    try {
      const stored = await AsyncStorage.getItem(
        PUBLICATION_VIEW_PREFERENCES_KEY
      );
      if (stored) {
        this.preferences = {
          ...DEFAULT_PUBLICATION_VIEW_PREFERENCES,
          ...JSON.parse(stored)
        };
      }
      return this.preferences;
    } catch (error) {
      console.error('Error loading publication view preferences:', error);
      return DEFAULT_PUBLICATION_VIEW_PREFERENCES;
    }
  }

  async save(preferences: Partial<PublicationViewPreferences>): Promise<void> {
    try {
      this.preferences = { ...this.preferences, ...preferences };
      await AsyncStorage.setItem(
        PUBLICATION_VIEW_PREFERENCES_KEY,
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      console.error('Error saving publication view preferences:', error);
      throw error;
    }
  }

  async reset(): Promise<void> {
    try {
      this.preferences = DEFAULT_PUBLICATION_VIEW_PREFERENCES;
      await AsyncStorage.removeItem(PUBLICATION_VIEW_PREFERENCES_KEY);
    } catch (error) {
      console.error('Error resetting publication view preferences:', error);
      throw error;
    }
  }

  getCurrent(): PublicationViewPreferences {
    return this.preferences;
  }
}

export const publicationViewPreferencesService =
  PublicationViewPreferencesService.getInstance();
