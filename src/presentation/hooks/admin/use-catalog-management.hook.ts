import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { catalogService } from '../../../services/catalog/catalog.service';
import {
  AnimalModelResponse,
  CreateAnimalRequest,
  UpdateAnimalRequest,
  UpdateAnimalImageRequest,
  AnimalCrudResponse,
  DeleteAnimalResponse
} from '@/domain/models/animal.models';

interface CatalogManagementState {
  animals: AnimalModelResponse[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  inputValue: string;
  searchQuery: string;
  selectedCategory: string;
  selectedSort: string;
  selectedHabitat: string;
  currentPage: number;
  hasNextPage: boolean;
  totalItems: number;
  isConnected: boolean;
}

interface CatalogManagementActions {
  loadMoreAnimals: () => Promise<void>;
  refreshAnimals: () => Promise<void>;
  searchAnimals: (query: string) => void;
  filterByCategory: (category: string) => void;
  sortAnimals: (sort: string) => void;
  filterByHabitat: (habitat: string) => void;
  createAnimal: (
    animalData: CreateAnimalRequest
  ) => Promise<AnimalCrudResponse>;
  updateAnimal: (
    animalData: UpdateAnimalRequest
  ) => Promise<AnimalCrudResponse>;
  updateAnimalImage: (
    imageData: UpdateAnimalImageRequest
  ) => Promise<AnimalCrudResponse>;
  updateAnimalImageInList: (catalogId: string, image: string) => void;
  deleteAnimal: (catalogId: string) => Promise<DeleteAnimalResponse>;
  getAnimalById: (catalogId: string) => Promise<AnimalModelResponse>;
  clearError: () => void;
}

interface CatalogManagementReturn {
  state: CatalogManagementState;
  actions: CatalogManagementActions;
  filteredAnimals: AnimalModelResponse[];
  categories: string[];
  sorts: string[];
  habitats: string[];
  isLoading: boolean;
}

const DEFAULT_PAGE_SIZE = 10;

export const useCatalogManagement = (): CatalogManagementReturn => {
  const abortControllerRef = useRef<AbortController | null>(null);
  const stateRef = useRef<CatalogManagementState>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  const [state, setState] = useState<CatalogManagementState>({
    animals: [],
    isLoading: true,
    isRefreshing: false,
    isLoadingMore: false,
    error: null,
    inputValue: '',
    searchQuery: '',
    selectedCategory: 'Todas',
    selectedSort: 'name',
    selectedHabitat: 'all',
    currentPage: 1,
    hasNextPage: true,
    totalItems: 0,
    isConnected: true
  });

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  }, []);

  const filteredAnimals = useMemo(() => {
    let filtered = [...state.animals];

    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(animal => {
        const commonNoun = animal.commonNoun?.toLowerCase() || '';
        const specie = animal.specie?.toLowerCase() || '';
        const category = animal.category?.toLowerCase() || '';

        return (
          commonNoun.includes(query) ||
          specie.includes(query) ||
          category.includes(query)
        );
      });
    }

    if (state.selectedCategory !== 'Todas') {
      filtered = filtered.filter(
        animal => animal.category === state.selectedCategory
      );
    }

    if (state.selectedHabitat !== 'all' && state.selectedHabitat !== 'Todos') {
      filtered = filtered.filter(
        animal => animal.habitat === state.selectedHabitat
      );
    }

    const sortedFiltered = [...filtered];

    switch (state.selectedSort) {
      case 'name':
      case 'Nombre':
        sortedFiltered.sort((a, b) =>
          (a.commonNoun || '').localeCompare(b.commonNoun || '')
        );
        break;
      case 'specie':
      case 'Especie':
        sortedFiltered.sort((a, b) =>
          (a.specie || '').localeCompare(b.specie || '')
        );
        break;
      case 'class':
      case 'Clase':
        sortedFiltered.sort((a, b) =>
          (a.category || '').localeCompare(b.category || '')
        );
        break;
      default:
        break;
    }

    return sortedFiltered;
  }, [
    state.animals,
    state.searchQuery,
    state.selectedCategory,
    state.selectedHabitat,
    state.selectedSort
  ]);

  const searchAnimals = useCallback((query: string) => {
    setState(prev => ({ ...prev, inputValue: query }));

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, searchQuery: query }));
    }, 300);
  }, []);

  const filterByCategory = useCallback((category: string) => {
    setState(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  const sortAnimals = useCallback((sort: string) => {
    setState(prev => ({ ...prev, selectedSort: sort }));
  }, []);

  const filterByHabitat = useCallback((habitat: string) => {
    setState(prev => ({ ...prev, selectedHabitat: habitat }));
  }, []);

  const loadMoreAnimals = useCallback(async () => {
    if (!stateRef.current?.hasNextPage || stateRef.current?.isLoadingMore) {
      return;
    }

    setState(prev => ({ ...prev, isLoadingMore: true, error: null }));

    try {
      const response = await catalogService.getAllCatalogs(
        stateRef.current.currentPage + 1,
        DEFAULT_PAGE_SIZE
      );

      setState(prev => ({
        ...prev,
        animals: [...prev.animals, ...response.catalog],
        currentPage: prev.currentPage + 1,
        hasNextPage: response.pagination.hasNext,
        totalItems: response.pagination.total,
        isLoadingMore: false,
        error: null
      }));
    } catch (catchError) {
      setState(prev => ({
        ...prev,
        isLoadingMore: false,
        error:
          catchError instanceof Error
            ? catchError.message
            : 'Error loading more animals'
      }));
    }
  }, []);

  const refreshAnimals = useCallback(async () => {
    setState(prev => ({ ...prev, isRefreshing: true, error: null }));

    try {
      const response = await catalogService.getAllCatalogs(
        1,
        DEFAULT_PAGE_SIZE
      );

      const refreshedAnimals = response.catalog.map(animal => ({
        ...animal,
        image: animal.image
          ? `${animal.image}?refresh=${Date.now()}`
          : animal.image
      }));

      setState(prev => ({
        ...prev,
        animals: refreshedAnimals,
        currentPage: 1,
        hasNextPage: response.pagination.hasNext,
        totalItems: response.pagination.total,
        isRefreshing: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        error:
          error instanceof Error ? error.message : 'Error refreshing animals'
      }));
    }
  }, []);

  const createAnimal = useCallback(
    async (animalData: CreateAnimalRequest): Promise<AnimalCrudResponse> => {
      if (!stateRef.current?.isConnected) {
        setState(prev => ({ ...prev, error: 'No internet connection' }));
        return { error: true, message: 'No internet connection' };
      }

      try {
        const response = await catalogService.createCatalog(animalData);
        if (!response?.error) {
          await refreshAnimals();
        }
        return response;
      } catch (catchError: unknown) {
        if (catchError instanceof Error) {
          throw catchError;
        }
        throw new Error('Error desconocido al crear el animal');
      }
    },
    [refreshAnimals]
  );

  const updateAnimal = useCallback(
    async (animalData: UpdateAnimalRequest): Promise<AnimalCrudResponse> => {
      if (!stateRef.current?.isConnected) {
        setState(prev => ({ ...prev, error: 'No internet connection' }));
        return { error: true, message: 'No internet connection' };
      }

      try {
        const response = await catalogService.updateCatalog(animalData);
        if (!response?.error) {
          setState(prev => ({
            ...prev,
            animals: prev.animals.map(animal =>
              animal.catalogId === animalData.catalogId
                ? { ...animal, ...animalData }
                : animal
            )
          }));
        }
        return response;
      } catch (catchError: unknown) {
        if (catchError instanceof Error) {
          throw catchError;
        }
        throw new Error('Error desconocido al actualizar el animal');
      }
    },
    []
  );

  const updateAnimalImage = useCallback(
    async (
      imageData: UpdateAnimalImageRequest
    ): Promise<AnimalCrudResponse> => {
      if (!stateRef.current?.isConnected) {
        setState(prev => ({ ...prev, error: 'No internet connection' }));
        return { error: true, message: 'No internet connection' };
      }

      try {
        const response = await catalogService.updateCatalogImage(imageData);
        if (!response?.error) {
          setState(prev => ({
            ...prev,
            animals: prev.animals.map(animal =>
              animal.catalogId === imageData.catalogId
                ? {
                    ...animal,
                    image: `${imageData.image}?${Date.now()}`
                  }
                : animal
            )
          }));
          await refreshAnimals();
        }
        return response;
      } catch (catchError: unknown) {
        if (catchError instanceof Error) {
          throw catchError;
        }
        throw new Error('Error desconocido al actualizar la imagen');
      }
    },
    [refreshAnimals]
  );

  const updateAnimalImageInList = useCallback(
    (catalogId: string, image: string) => {
      setState(prev => ({
        ...prev,
        animals: prev.animals.map(animal =>
          animal.catalogId.toString() === catalogId
            ? {
                ...animal,
                image: `${image}?${Date.now()}`
              }
            : animal
        )
      }));
    },
    []
  );

  const deleteAnimal = useCallback(
    async (catalogId: string): Promise<DeleteAnimalResponse> => {
      if (!stateRef.current?.isConnected) {
        setState(prev => ({ ...prev, error: 'No internet connection' }));
        return { error: true, message: 'No internet connection' };
      }

      try {
        const response = await catalogService.deleteCatalog(catalogId);
        if (!response?.error) {
          setState(prev => ({
            ...prev,
            animals: prev.animals.filter(
              animal => animal.catalogId.toString() !== catalogId
            ),
            totalItems: prev.totalItems - 1
          }));
        }
        return response;
      } catch (catchError: unknown) {
        if (catchError instanceof Error) {
          throw catchError;
        }
        throw new Error('Error desconocido al eliminar el animal');
      }
    },
    []
  );

  const getAnimalById = useCallback(
    async (catalogId: string): Promise<AnimalModelResponse> => {
      try {
        const animal = await catalogService.getCatalogById(catalogId);
        return animal;
      } catch (error) {
        console.error('Error al obtener animal:', error);
        throw error;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(state.animals.map(animal => animal.category).filter(Boolean))
    ];
    return ['Todas', ...uniqueCategories.sort()];
  }, [state.animals]);

  const sorts = useMemo(() => {
    return ['name', 'specie', 'class', 'date'];
  }, []);

  const habitats = useMemo(() => {
    const uniqueHabitats = [
      ...new Set(state.animals.map(animal => animal.habitat).filter(Boolean))
    ];
    return ['all', ...uniqueHabitats.sort()];
  }, [state.animals]);

  useEffect(() => {
    const loadInitialData = async () => {
      setState(prev => ({ ...prev, isLoading: true }));

      try {
        const response = await catalogService.getAllCatalogs(
          1,
          DEFAULT_PAGE_SIZE
        );

        const initialAnimals = response.catalog.map(animal => ({
          ...animal,
          image: animal.image ? `${animal.image}?t=${Date.now()}` : animal.image
        }));

        setState(prev => ({
          ...prev,
          animals: initialAnimals,
          currentPage: 1,
          hasNextPage: response.pagination.hasNext,
          totalItems: response.pagination.total,
          isLoading: false,
          error: null
        }));
      } catch (error: unknown) {
        if (error instanceof Error) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: error.message
          }));
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Error loading animals'
          }));
        }
      }
    };

    loadInitialData();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actions: CatalogManagementActions = useMemo(
    () => ({
      loadMoreAnimals,
      refreshAnimals,
      searchAnimals,
      filterByCategory,
      sortAnimals,
      filterByHabitat,
      createAnimal,
      updateAnimal,
      updateAnimalImage,
      updateAnimalImageInList,
      deleteAnimal,
      getAnimalById,
      clearError
    }),
    [
      loadMoreAnimals,
      refreshAnimals,
      searchAnimals,
      filterByCategory,
      sortAnimals,
      filterByHabitat,
      createAnimal,
      updateAnimal,
      updateAnimalImage,
      updateAnimalImageInList,
      deleteAnimal,
      getAnimalById,
      clearError
    ]
  );

  return {
    state,
    actions,
    filteredAnimals,
    categories,
    sorts,
    habitats,
    isLoading: state.isLoading || state.isRefreshing
  };
};
