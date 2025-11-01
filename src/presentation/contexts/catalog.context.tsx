import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useMemo,
  useRef
} from 'react';
import { catalogService } from '../../services/catalog/catalog.service';
import {
  AnimalModelResponse,
  CatalogModelResponse,
  LocationResponse,
  PaginationModelResponse
} from '../../domain/models/animal.models';

interface State {
  isLoading: boolean;
  error: string | null;
  catalog: AnimalModelResponse[];
  pagination: PaginationModelResponse;
  catalogLocations: LocationResponse | null;
  lastFetchTime: number | null;
  failureCount: number;
}

type Action =
  | { type: 'FETCH_ALL_START' }
  | { type: 'FETCH_ALL_SUCCESS'; payload: CatalogModelResponse }
  | { type: 'FETCH_ALL_FAILURE'; payload: string }
  | { type: 'FETCH_ALL_END' }
  | { type: 'RESET' }
  | { type: 'FETCH_LOCATIONS_SUCCESS'; payload: LocationResponse }
  | { type: 'UPDATE_FAILURE_COUNT'; payload: number }
  | { type: 'UPDATE_LAST_FETCH_TIME'; payload: number }
  | { type: 'FETCH_CATALOG_BY_ID_START' }
  | { type: 'FETCH_CATALOG_BY_ID_SUCCESS'; payload: AnimalModelResponse }
  | { type: 'FETCH_CATALOG_BY_ID_FAILURE'; payload: string };

interface CatalogContextType extends State {
  fetchCatalog: () => Promise<void>;
  fetchCatalogLocations: (catalogId: string) => Promise<void>;
  catalogLocations: LocationResponse | null;
  reset: () => void;
  fetchCatalogById: (catalogId: string) => Promise<void>;
}

const initialState: State = {
  isLoading: false,
  error: null,
  catalog: [],
  pagination: {
    page: 0,
    size: 0,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  },
  catalogLocations: null,
  lastFetchTime: null,
  failureCount: 0
};

const catalogReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'FETCH_ALL_START':
      return {
        ...state,
        isLoading: true,
        error: null,
        lastFetchTime: Date.now()
      };
    case 'FETCH_ALL_SUCCESS':
      return {
        ...state,
        isLoading: false,
        catalog: action.payload.catalog,
        pagination: action.payload.pagination,
        failureCount: 0
      };
    case 'FETCH_ALL_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        failureCount: state.failureCount + 1
      };
    case 'FETCH_ALL_END':
      return { ...state, isLoading: false };
    case 'RESET':
      return initialState;
    case 'FETCH_LOCATIONS_SUCCESS':
      return { ...state, catalogLocations: action.payload };
    case 'UPDATE_FAILURE_COUNT':
      return { ...state, failureCount: action.payload };
    case 'UPDATE_LAST_FETCH_TIME':
      return { ...state, lastFetchTime: action.payload };
    case 'FETCH_CATALOG_BY_ID_START':
      return { ...state, isLoading: true };
    case 'FETCH_CATALOG_BY_ID_SUCCESS':
      return { ...state, isLoading: false, catalog: [action.payload] };
    case 'FETCH_CATALOG_BY_ID_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [state, dispatch] = useReducer(catalogReducer, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const stateRef = useRef(state);

  stateRef.current = state;

  const fetchCatalog = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentState = stateRef.current;
    const now = Date.now();
    const timeSinceLastFetch = currentState.lastFetchTime
      ? now - currentState.lastFetchTime
      : Infinity;

    if (currentState.failureCount >= 3 && timeSinceLastFetch < 60000) {
      console.log('[CatalogContext] Circuit breaker active, skipping fetch');
      return;
    }
    if (currentState.isLoading) {
      console.log(
        '[CatalogContext] Already loading, skipping duplicate request'
      );
      return;
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    dispatch({ type: 'FETCH_ALL_START' });
    try {
      const data = await catalogService.getAllCatalogs(1, 50, signal);

      const refreshedCatalog = data.catalog.map(animal => ({
        ...animal,
        image: animal.image
          ? `${animal.image}?catalog_refresh=${Date.now()}`
          : animal.image
      }));

      if (!signal.aborted) {
        dispatch({
          type: 'FETCH_ALL_SUCCESS',
          payload: {
            ...data,
            catalog: refreshedCatalog
          }
        });
      }
    } catch (error) {
      if (
        !signal.aborted &&
        !(error instanceof Error && error.name === 'AbortError')
      ) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Error de conexión al cargar el catálogo';
        console.error('[CatalogContext] Error fetching catalog:', errorMessage);
        dispatch({ type: 'FETCH_ALL_FAILURE', payload: errorMessage });
      }
    } finally {
      dispatch({ type: 'FETCH_ALL_END' });
      abortControllerRef.current = null;
    }
  }, []);

  const fetchCatalogLocations = useCallback(async (catalogId: string) => {
    try {
      const data = await catalogService.getLocations(catalogId);
      console.log('✅ Datos de ubicaciones recibidos:', data);
      dispatch({ type: 'FETCH_LOCATIONS_SUCCESS', payload: data });
    } catch (error) {
      console.error('Error fetching catalog locations:', error);
    }
  }, []);

  const fetchCatalogById = useCallback(async (catalogId: string) => {
    dispatch({ type: 'FETCH_CATALOG_BY_ID_START' });
    try {
      const data = await catalogService.getCatalogById(catalogId);
      dispatch({ type: 'FETCH_CATALOG_BY_ID_SUCCESS', payload: data });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error de conexión al cargar el animal';
      console.error(
        '[CatalogContext] Error fetching catalog by id:',
        errorMessage
      );
      dispatch({ type: 'FETCH_CATALOG_BY_ID_FAILURE', payload: errorMessage });
    }
  }, []);

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const contextValue = useMemo<CatalogContextType>(
    () => ({
      ...state,
      fetchCatalog,
      fetchCatalogLocations,
      fetchCatalogById,
      reset
    }),
    [state, fetchCatalog, fetchCatalogLocations, fetchCatalogById, reset]
  );

  return (
    <CatalogContext.Provider value={contextValue}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
