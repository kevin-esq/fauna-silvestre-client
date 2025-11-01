import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from 'react';
import {
  UserViewPreferences,
  UserViewPreferencesService,
  ViewLayout,
  UserSortBy
} from '@/services/storage/user-view-preferences.service';

interface UserViewPreferencesContextType extends UserViewPreferences {
  setLayout: (layout: ViewLayout) => Promise<void>;
  setSortBy: (sortBy: UserSortBy) => Promise<void>;
  toggleEmail: () => Promise<void>;
  toggleLocation: () => Promise<void>;
  toggleUserName: () => Promise<void>;
  toggleInitials: () => Promise<void>;
  toggleHighlightStatus: () => Promise<void>;
  toggleReducedMotion: () => Promise<void>;
  resetPreferences: () => Promise<void>;
  clearFilters: () => Promise<void>;
  isLoading: boolean;
  isToggleDisabled: (
    toggle: 'showEmail' | 'showLocation' | 'showUserName' | 'showInitials'
  ) => boolean;
}

const UserViewPreferencesContext = createContext<
  UserViewPreferencesContextType | undefined
>(undefined);

export const UserViewPreferencesProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [preferences, setPreferences] = useState<UserViewPreferences>({
    layout: 'card',
    sortBy: 'name-asc',
    showEmail: true,
    showLocation: true,
    showUserName: true,
    showInitials: true,
    highlightStatus: false,
    reducedMotion: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const loaded = await UserViewPreferencesService.getPreferences();
      setPreferences(loaded);
    } catch (error) {
      console.error('Error loading user view preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = useCallback(
    async (updates: Partial<UserViewPreferences>) => {
      try {
        await UserViewPreferencesService.savePreferences(updates);
        setPreferences(prev => ({ ...prev, ...updates }));
      } catch (error) {
        console.error('Error updating user view preference:', error);
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

  const setSortBy = useCallback(
    async (sortBy: UserSortBy) => {
      await updatePreference({ sortBy });
    },
    [updatePreference]
  );

  const toggleEmail = useCallback(async () => {
    await updatePreference({ showEmail: !preferences.showEmail });
  }, [preferences.showEmail, updatePreference]);

  const toggleLocation = useCallback(async () => {
    await updatePreference({ showLocation: !preferences.showLocation });
  }, [preferences.showLocation, updatePreference]);

  const toggleUserName = useCallback(async () => {
    await updatePreference({ showUserName: !preferences.showUserName });
  }, [preferences.showUserName, updatePreference]);

  const toggleInitials = useCallback(async () => {
    await updatePreference({ showInitials: !preferences.showInitials });
  }, [preferences.showInitials, updatePreference]);

  const toggleHighlightStatus = useCallback(async () => {
    await updatePreference({ highlightStatus: !preferences.highlightStatus });
  }, [preferences.highlightStatus, updatePreference]);

  const toggleReducedMotion = useCallback(async () => {
    await updatePreference({ reducedMotion: !preferences.reducedMotion });
  }, [preferences.reducedMotion, updatePreference]);

  const resetPreferences = useCallback(async () => {
    try {
      await UserViewPreferencesService.resetPreferences();
      const defaults = await UserViewPreferencesService.getPreferences();
      setPreferences(defaults);
    } catch (error) {
      console.error('Error resetting user view preferences:', error);
    }
  }, []);

  const clearFilters = useCallback(async () => {
    try {
      await updatePreference({
        sortBy: 'name-asc'
      });
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  }, [updatePreference]);

  const isToggleDisabled = useCallback(
    (
      toggle: 'showEmail' | 'showLocation' | 'showUserName' | 'showInitials'
    ): boolean => {
      const { layout } = preferences;

      if (layout === 'card') return false;

      if (layout === 'list') {
        return toggle === 'showUserName' || toggle === 'showLocation';
      }

      if (layout === 'grid') {
        return toggle === 'showUserName' || toggle === 'showLocation';
      }

      return false;
    },
    [preferences]
  );

  const value: UserViewPreferencesContextType = {
    ...preferences,
    setLayout,
    setSortBy,
    toggleEmail,
    toggleLocation,
    toggleUserName,
    toggleInitials,
    toggleHighlightStatus,
    toggleReducedMotion,
    resetPreferences,
    clearFilters,
    isLoading,
    isToggleDisabled
  };

  return (
    <UserViewPreferencesContext.Provider value={value}>
      {children}
    </UserViewPreferencesContext.Provider>
  );
};

export const useUserViewPreferences = (): UserViewPreferencesContextType => {
  const context = useContext(UserViewPreferencesContext);
  if (!context) {
    throw new Error(
      'useUserViewPreferences must be used within UserViewPreferencesProvider'
    );
  }
  return context;
};
