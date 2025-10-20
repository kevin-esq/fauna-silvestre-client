import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { catalogService } from '../../services/catalog/catalog.service';
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
  const searchTimeoutRef = useRef<number | null>(null);
  const stateRef = useRef<CatalogManagementState>(null);

  const [state, setState] = useState<CatalogManagementState>({
    animals: [],
    isLoading: false,
    isRefreshing: false,
    isLoadingMore: false,
    error: null,
    searchQuery: '',
    selectedCategory: 'Todas',
    selectedSort: 'Nombre',
    selectedHabitat: 'Todos',
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
    } catch (catchError) {
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        error:
          catchError instanceof Error
            ? catchError.message
            : 'Error refreshing animals'
      }));
    }
  }, []);

  const searchAnimals = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await catalogService.getAllCatalogs(
          1,
          DEFAULT_PAGE_SIZE
        );

        const searchedAnimals = response.catalog.map(animal => ({
          ...animal,
          image: animal.image
            ? `${animal.image}?search=${Date.now()}`
            : animal.image
        }));

        setState(prev => ({
          ...prev,
          animals: searchedAnimals,
          currentPage: 1,
          hasNextPage: response.pagination.hasNext,
          totalItems: response.pagination.total,
          error: null
        }));
      } catch (catchError) {
        setState(prev => ({
          ...prev,
          error:
            catchError instanceof Error
              ? catchError.message
              : 'Error searching animals'
        }));
      }
    }, 500);
  }, []);

  const filterByCategory = useCallback(async (category: string) => {
    setState(prev => ({
      ...prev,
      selectedCategory: category,
      currentPage: 1,
      hasNextPage: true
    }));

    try {
      const response = await catalogService.getAllCatalogs(
        1,
        DEFAULT_PAGE_SIZE
      );

      const filteredAnimals = response.catalog.map(animal => ({
        ...animal,
        image: animal.image
          ? `${animal.image}?filter=${Date.now()}`
          : animal.image
      }));

      setState(prev => ({
        ...prev,
        animals: filteredAnimals,
        currentPage: 1,
        hasNextPage: response.pagination.hasNext,
        totalItems: response.pagination.total,
        error: null
      }));
    } catch (error: unknown) {
      if (error instanceof Error) {
        setState(prev => ({
          ...prev,
          error: error.message
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: 'Error filtering animals'
        }));
      }
    }
  }, []);

  const sortAnimals = useCallback(async (sort: string) => {
    setState(prev => ({ ...prev, selectedSort: sort }));

    try {
      const response = await catalogService.getAllCatalogs(
        1,
        DEFAULT_PAGE_SIZE
      );

      const sortedAnimals = response.catalog.map(animal => ({
        ...animal,
        image: animal.image
          ? `${animal.image}?sort=${Date.now()}`
          : animal.image
      }));

      setState(prev => ({
        ...prev,
        animals: sortedAnimals,
        currentPage: 1,
        hasNextPage: response.pagination.hasNext,
        totalItems: response.pagination.total,
        error: null
      }));
    } catch (error: unknown) {
      if (error instanceof Error) {
        setState(prev => ({
          ...prev,
          error: error.message
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: 'Error sorting animals'
        }));
      }
    }
  }, []);

  const filterByHabitat = useCallback(async (habitat: string) => {
    setState(prev => ({
      ...prev,
      selectedHabitat: habitat,
      currentPage: 1,
      hasNextPage: true
    }));

    try {
      const response = await catalogService.getAllCatalogs(
        1,
        DEFAULT_PAGE_SIZE
      );

      const filteredAnimals = response.catalog.map(animal => ({
        ...animal,
        image: animal.image
          ? `${animal.image}?filter=${Date.now()}`
          : animal.image
      }));

      setState(prev => ({
        ...prev,
        animals: filteredAnimals,
        currentPage: 1,
        hasNextPage: response.pagination.hasNext,
        totalItems: response.pagination.total,
        error: null
      }));
    } catch (catchError) {
      setState(prev => ({
        ...prev,
        error:
          catchError instanceof Error
            ? catchError.message
            : 'Error filtering animals'
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
        if (!response.error) {
          await refreshAnimals();
          Alert.alert('Éxito', 'Animal creado exitosamente');
        }
        return response;
      } catch (catchError: unknown) {
        if (catchError instanceof Error) {
          const errorMessage = catchError.message || 'Error al crear el animal';
          Alert.alert('Error', errorMessage);
          throw catchError;
        }
        const errorMessage = 'Error desconocido al crear el animal';
        Alert.alert('Error', errorMessage);
        throw new Error(errorMessage);
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
        if (!response.error) {
          setState(prev => ({
            ...prev,
            animals: prev.animals.map(animal =>
              animal.catalogId === animalData.catalogId
                ? { ...animal, ...animalData }
                : animal
            )
          }));
          Alert.alert('Éxito', 'Animal actualizado exitosamente');
        }
        return response;
      } catch (catchError: unknown) {
        if (catchError instanceof Error) {
          const errorMessage =
            catchError.message || 'Error al actualizar el animal';
          Alert.alert('Error', errorMessage);
          throw catchError;
        }
        const errorMessage = 'Error desconocido al actualizar el animal';
        Alert.alert('Error', errorMessage);
        throw new Error(errorMessage);
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
        if (!response.error) {
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
          Alert.alert('Éxito', 'Imagen actualizada exitosamente');
        }
        return response;
      } catch (catchError: unknown) {
        if (catchError instanceof Error) {
          const errorMessage =
            catchError.message || 'Error al actualizar la imagen';
          Alert.alert('Error', errorMessage);
          throw catchError;
        }
        const errorMessage = 'Error desconocido al actualizar la imagen';
        Alert.alert('Error', errorMessage);
        throw new Error(errorMessage);
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
        if (!response.error) {
          setState(prev => ({
            ...prev,
            animals: prev.animals.filter(
              animal => animal.catalogId.toString() !== catalogId
            ),
            totalItems: prev.totalItems - 1
          }));
          Alert.alert('Éxito', 'Animal eliminado exitosamente');
        }
        return response;
      } catch (catchError: unknown) {
        if (catchError instanceof Error) {
          const errorMessage =
            catchError.message || 'Error al eliminar el animal';
          Alert.alert('Error', errorMessage);
          throw catchError;
        }
        const errorMessage = 'Error desconocido al eliminar el animal';
        Alert.alert('Error', errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const filteredAnimals = useMemo(() => {
    let filtered = state.animals;

    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        animal =>
          animal.commonNoun.toLowerCase().includes(query) ||
          animal.specie.toLowerCase().includes(query) ||
          animal.category.toLowerCase().includes(query)
      );
    }

    if (state.selectedCategory !== 'Todas') {
      filtered = filtered.filter(
        animal => animal.category === state.selectedCategory
      );
    }

    if (state.selectedHabitat !== 'Todos') {
      filtered = filtered.filter(
        animal => animal.habitat === state.selectedHabitat
      );
    }

    if (state.selectedSort === 'Nombre') {
      filtered = filtered.sort((a, b) =>
        a.commonNoun.localeCompare(b.commonNoun)
      );
    } else if (state.selectedSort === 'Especie') {
      filtered = filtered.sort((a, b) => a.specie.localeCompare(b.specie));
    }

    return filtered;
  }, [
    state.animals,
    state.searchQuery,
    state.selectedCategory,
    state.selectedHabitat,
    state.selectedSort
  ]);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(state.animals.map(animal => animal.category))
    ];
    return ['Todas', ...uniqueCategories.sort()];
  }, [state.animals]);

  const sorts = useMemo(() => {
    return ['Nombre', 'Especie'];
  }, []);

  const habitats = useMemo(() => {
    const uniqueHabitats = [
      ...new Set(state.animals.map(animal => animal.habitat))
    ];
    return ['Todos', ...uniqueHabitats.sort()];
  }, [state.animals]);

  useEffect(() => {
    const loadInitialData = async () => {
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
    return cleanup;
  }, [cleanup]);

  const actions: CatalogManagementActions = {
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
    clearError
  };

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
