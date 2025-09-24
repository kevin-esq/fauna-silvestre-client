import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePublications } from '../contexts/publication.context';
import { useCatalog } from '../contexts/catalog.context';
import {
  AnimalModelResponse,
  CommonNounResponse
} from '@/domain/models/animal.models';

interface HomeDataState {
  totalUsers: number;
  totalPublications: number;
  selectedCategory: CommonNounResponse | null;
  showAllAnimals: boolean;
  isDropdownOpen: boolean;
}

interface HomeDataActions {
  setSelectedCategory: (category: CommonNounResponse | null) => void;
  setShowAllAnimals: (show: boolean) => void;
  setIsDropdownOpen: (open: boolean) => void;
  handleToggleShowAll: () => void;
  refreshData: () => void;
}

interface HomeDataReturn {
  state: HomeDataState;
  actions: HomeDataActions;
  categories: CommonNounResponse[];
  filteredAnimals: AnimalModelResponse[];
  animalsToShow: AnimalModelResponse[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personalizado para manejar el estado y lógica de datos del HomeScreen
 * Principio SRP: Solo maneja datos y estado relacionado con el home
 */
export const useHomeData = (): HomeDataReturn => {
  const { state: publicationState, loadCounts } = usePublications();
  const {
    catalog,
    isLoading: isCatalogLoading,
    fetchCatalog,
    error
  } = useCatalog();

  const hasLoaded = useRef(false);

  const [state, setState] = useState<HomeDataState>({
    totalUsers: 0,
    totalPublications: 0,
    selectedCategory: null,
    showAllAnimals: false,
    isDropdownOpen: false
  });

  const categories = useMemo(() => {
    if (!catalog || !Array.isArray(catalog) || catalog.length === 0) {
      return [{ catalogId: 0, commonNoun: 'Todas las categorías' }];
    }

    const uniqueCategories = [
      ...new Set(catalog.map(animal => animal.category))
    ].filter(Boolean);

    return [
      { catalogId: 0, commonNoun: 'Todas las categorías' },
      ...uniqueCategories.map((category, index) => ({
        catalogId: index + 1,
        commonNoun: category
      }))
    ];
  }, [catalog]);

  const filteredAnimals = useMemo(() => {
    if (!catalog || !Array.isArray(catalog)) {
      return [];
    }

    if (
      !state.selectedCategory ||
      state.selectedCategory.commonNoun === 'Todas las categorías'
    ) {
      return catalog;
    }

    return catalog.filter(
      animal => animal.category === state.selectedCategory!.commonNoun
    );
  }, [catalog, state.selectedCategory]);

  const animalsToShow = useMemo(() => {
    return state.showAllAnimals ? filteredAnimals : filteredAnimals.slice(0, 5);
  }, [filteredAnimals, state.showAllAnimals]);
  useEffect(() => {
    if (!hasLoaded.current) {
      loadCounts();
      fetchCatalog();
      hasLoaded.current = true;
    }
  }, [loadCounts, fetchCatalog]);

  useEffect(() => {
    const totalPubs = publicationState.counts.data?.records || 0;
    const totalUsers = publicationState.counts.data?.users || 0;

    setState(prev => ({
      ...prev,
      totalPublications: totalPubs,
      totalUsers
    }));
  }, [publicationState.counts.data]);

  const actions: HomeDataActions = {
    setSelectedCategory: useCallback((category: CommonNounResponse | null) => {
      setState(prev => ({ ...prev, selectedCategory: category }));
    }, []),

    setShowAllAnimals: useCallback((show: boolean) => {
      setState(prev => ({ ...prev, showAllAnimals: show }));
    }, []),

    setIsDropdownOpen: useCallback((open: boolean) => {
      setState(prev => ({ ...prev, isDropdownOpen: open }));
    }, []),

    handleToggleShowAll: useCallback(() => {
      setState(prev => ({ ...prev, showAllAnimals: !prev.showAllAnimals }));
    }, []),

    refreshData: useCallback(() => {
      loadCounts();
      fetchCatalog();
    }, [loadCounts, fetchCatalog])
  };

  return {
    state,
    actions,
    categories,
    filteredAnimals,
    animalsToShow,
    isLoading: isCatalogLoading || publicationState.counts.isLoading,
    error
  };
};
