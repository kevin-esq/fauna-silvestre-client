import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from 'react';
import {
  CatalogViewPreferences,
  ViewLayout,
  ViewDensity,
  CatalogSortBy,
  FilterByCategory,
  catalogViewPreferencesService,
  DEFAULT_CATALOG_PREFERENCES
} from '@/services/storage/catalog-view-preferences.service';

interface CatalogViewPreferencesContextType extends CatalogViewPreferences {
  setLayout: (layout: ViewLayout) => Promise<void>;
  setDensity: (density: ViewDensity) => Promise<void>;
  setSortBy: (sortBy: CatalogSortBy) => Promise<void>;
  setFilterByCategory: (category: FilterByCategory) => Promise<void>;
  toggleImages: () => Promise<void>;
  toggleHighlightStatus: () => Promise<void>;
  toggleCategory: () => Promise<void>;
  toggleSpecies: () => Promise<void>;
  toggleHabitat: () => Promise<void>;
  toggleDescription: () => Promise<void>;
  toggleReducedMotion: () => Promise<void>;
  clearFilters: () => Promise<void>;
  resetPreferences: () => Promise<void>;
  isLoading: boolean;
  isToggleDisabled: (
    toggle: 'showCategory' | 'showSpecies' | 'showHabitat' | 'showDescription'
  ) => boolean;
}

const CatalogViewPreferencesContext = createContext<
  CatalogViewPreferencesContextType | undefined
>(undefined);

interface CatalogViewPreferencesProviderProps {
  children: ReactNode;
}

export const CatalogViewPreferencesProvider: React.FC<
  CatalogViewPreferencesProviderProps
> = ({ children }) => {
  const [preferences, setPreferences] = useState<CatalogViewPreferences>(
    DEFAULT_CATALOG_PREFERENCES
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const loaded = await catalogViewPreferencesService.load();
      setPreferences(loaded);
    } catch (error) {
      console.error('Error loading catalog view preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = useCallback(
    async (updates: Partial<CatalogViewPreferences>) => {
      try {
        await catalogViewPreferencesService.save(updates);
        setPreferences(prev => ({ ...prev, ...updates }));
      } catch (error) {
        console.error('Error updating catalog view preference:', error);
      }
    },
    []
  );

  const setLayout = useCallback(
    async (layout: ViewLayout) => {
      await updatePreference({ layout });
    },
    [updatePreference]
  );

  const setDensity = useCallback(
    async (density: ViewDensity) => {
      await updatePreference({ density });
    },
    [updatePreference]
  );

  const setSortBy = useCallback(
    async (sortBy: CatalogSortBy) => {
      await updatePreference({ sortBy });
    },
    [updatePreference]
  );

  const setFilterByCategory = useCallback(
    async (filterByCategory: FilterByCategory) => {
      await updatePreference({ filterByCategory });
    },
    [updatePreference]
  );

  const toggleImages = useCallback(async () => {
    await updatePreference({ showImages: !preferences.showImages });
  }, [preferences.showImages, updatePreference]);

  const toggleHighlightStatus = useCallback(async () => {
    await updatePreference({ highlightStatus: !preferences.highlightStatus });
  }, [preferences.highlightStatus, updatePreference]);

  const toggleCategory = useCallback(async () => {
    await updatePreference({ showCategory: !preferences.showCategory });
  }, [preferences.showCategory, updatePreference]);

  const toggleSpecies = useCallback(async () => {
    await updatePreference({ showSpecies: !preferences.showSpecies });
  }, [preferences.showSpecies, updatePreference]);

  const toggleHabitat = useCallback(async () => {
    await updatePreference({ showHabitat: !preferences.showHabitat });
  }, [preferences.showHabitat, updatePreference]);

  const toggleDescription = useCallback(async () => {
    await updatePreference({ showDescription: !preferences.showDescription });
  }, [preferences.showDescription, updatePreference]);

  const toggleReducedMotion = useCallback(async () => {
    await updatePreference({ reducedMotion: !preferences.reducedMotion });
  }, [preferences.reducedMotion, updatePreference]);

  const clearFilters = useCallback(async () => {
    try {
      await updatePreference({
        sortBy: 'name-asc',
        filterByCategory: 'all'
      });
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  }, [updatePreference]);

  const resetPreferences = useCallback(async () => {
    try {
      await catalogViewPreferencesService.reset();
      const defaults = await catalogViewPreferencesService.load();
      setPreferences(defaults);
    } catch (error) {
      console.error('Error resetting preferences:', error);
    }
  }, []);

  const isToggleDisabled = useCallback(
    (
      toggle: 'showCategory' | 'showSpecies' | 'showHabitat' | 'showDescription'
    ): boolean => {
      const { layout } = preferences;

      if (layout === 'card') return false;

      if (layout === 'list') {
        return (
          toggle === 'showCategory' ||
          toggle === 'showHabitat' ||
          toggle === 'showDescription'
        );
      }

      if (layout === 'grid') {
        return (
          toggle === 'showCategory' ||
          toggle === 'showHabitat' ||
          toggle === 'showDescription'
        );
      }

      if (layout === 'timeline') {
        return toggle === 'showCategory' || toggle === 'showHabitat';
      }

      return false;
    },
    [preferences]
  );

  const value: CatalogViewPreferencesContextType = {
    ...preferences,
    setLayout,
    setDensity,
    setSortBy,
    setFilterByCategory,
    toggleImages,
    toggleHighlightStatus,
    toggleCategory,
    toggleSpecies,
    toggleHabitat,
    toggleDescription,
    toggleReducedMotion,
    clearFilters,
    resetPreferences,
    isLoading,
    isToggleDisabled
  };

  return (
    <CatalogViewPreferencesContext.Provider value={value}>
      {children}
    </CatalogViewPreferencesContext.Provider>
  );
};

export const useCatalogViewPreferences =
  (): CatalogViewPreferencesContextType => {
    const context = useContext(CatalogViewPreferencesContext);
    if (!context) {
      throw new Error(
        'useCatalogViewPreferences must be used within CatalogViewPreferencesProvider'
      );
    }
    return context;
  };
