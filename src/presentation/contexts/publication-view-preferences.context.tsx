import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from 'react';
import {
  PublicationViewPreferences,
  publicationViewPreferencesService,
  ViewLayout,
  ViewDensity,
  ViewGroupBy,
  ViewSortBy,
  FilterByAnimalState
} from '../../services/storage/publication-view-preferences.service';

interface PublicationViewPreferencesContextType
  extends PublicationViewPreferences {
  setLayout: (layout: ViewLayout) => Promise<void>;
  setDensity: (density: ViewDensity) => Promise<void>;
  setGroupBy: (groupBy: ViewGroupBy) => Promise<void>;
  setSortBy: (sortBy: ViewSortBy) => Promise<void>;
  setFilterByAnimalState: (filter: FilterByAnimalState) => Promise<void>;
  toggleImages: () => Promise<void>;
  toggleHighlightStatus: () => Promise<void>;
  toggleCreatedDate: () => Promise<void>;
  toggleAcceptedDate: () => Promise<void>;
  toggleAnimalState: () => Promise<void>;
  toggleLocation: () => Promise<void>;
  toggleRejectReason: () => Promise<void>;
  toggleReducedMotion: () => Promise<void>;
  resetPreferences: () => Promise<void>;
  clearFilters: () => Promise<void>;
  isLoading: boolean;
}

const PublicationViewPreferencesContext = createContext<
  PublicationViewPreferencesContextType | undefined
>(undefined);

export const PublicationViewPreferencesProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [preferences, setPreferences] = useState<PublicationViewPreferences>({
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
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const loaded = await publicationViewPreferencesService.load();
      setPreferences(loaded);
    } catch (error) {
      console.error('Error loading publication view preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = useCallback(
    async (updates: Partial<PublicationViewPreferences>) => {
      try {
        await publicationViewPreferencesService.save(updates);
        setPreferences(prev => ({ ...prev, ...updates }));
      } catch (error) {
        console.error('Error updating publication view preference:', error);
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

  const setGroupBy = useCallback(
    async (groupBy: ViewGroupBy) => {
      await updatePreference({ groupBy });
    },
    [updatePreference]
  );

  const setSortBy = useCallback(
    async (sortBy: ViewSortBy) => {
      await updatePreference({ sortBy });
    },
    [updatePreference]
  );

  const setFilterByAnimalState = useCallback(
    async (filterByAnimalState: FilterByAnimalState) => {
      await updatePreference({ filterByAnimalState });
    },
    [updatePreference]
  );

  const toggleImages = useCallback(async () => {
    await updatePreference({ showImages: !preferences.showImages });
  }, [preferences.showImages, updatePreference]);

  const toggleHighlightStatus = useCallback(async () => {
    await updatePreference({
      highlightStatus: !preferences.highlightStatus
    });
  }, [preferences.highlightStatus, updatePreference]);

  const toggleCreatedDate = useCallback(async () => {
    await updatePreference({ showCreatedDate: !preferences.showCreatedDate });
  }, [preferences.showCreatedDate, updatePreference]);

  const toggleAcceptedDate = useCallback(async () => {
    await updatePreference({ showAcceptedDate: !preferences.showAcceptedDate });
  }, [preferences.showAcceptedDate, updatePreference]);

  const toggleAnimalState = useCallback(async () => {
    await updatePreference({ showAnimalState: !preferences.showAnimalState });
  }, [preferences.showAnimalState, updatePreference]);

  const toggleLocation = useCallback(async () => {
    await updatePreference({ showLocation: !preferences.showLocation });
  }, [preferences.showLocation, updatePreference]);

  const toggleRejectReason = useCallback(async () => {
    await updatePreference({ showRejectReason: !preferences.showRejectReason });
  }, [preferences.showRejectReason, updatePreference]);

  const toggleReducedMotion = useCallback(async () => {
    await updatePreference({ reducedMotion: !preferences.reducedMotion });
  }, [preferences.reducedMotion, updatePreference]);

  const resetPreferences = useCallback(async () => {
    try {
      await publicationViewPreferencesService.reset();
      const defaults = await publicationViewPreferencesService.load();
      setPreferences(defaults);
    } catch (error) {
      console.error('Error resetting publication view preferences:', error);
    }
  }, []);

  const clearFilters = useCallback(async () => {
    try {
      await updatePreference({
        sortBy: 'date-desc',
        filterByAnimalState: 'all',
        groupBy: 'none'
      });
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  }, [updatePreference]);

  const value: PublicationViewPreferencesContextType = {
    ...preferences,
    setLayout,
    setDensity,
    setGroupBy,
    setSortBy,
    setFilterByAnimalState,
    toggleImages,
    toggleHighlightStatus,
    toggleCreatedDate,
    toggleAcceptedDate,
    toggleAnimalState,
    toggleLocation,
    toggleRejectReason,
    toggleReducedMotion,
    resetPreferences,
    clearFilters,
    isLoading
  };

  return (
    <PublicationViewPreferencesContext.Provider value={value}>
      {children}
    </PublicationViewPreferencesContext.Provider>
  );
};

export const usePublicationViewPreferences =
  (): PublicationViewPreferencesContextType => {
    const context = useContext(PublicationViewPreferencesContext);
    if (!context) {
      throw new Error(
        'usePublicationViewPreferences must be used within PublicationViewPreferencesProvider'
      );
    }
    return context;
  };
