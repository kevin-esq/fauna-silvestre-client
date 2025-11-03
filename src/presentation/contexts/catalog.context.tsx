import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useMemo,
  useRef
} from 'react';
import { catalogService } from '@/services/catalog/catalog.service';
import { ValidationService } from '@/services/validation';
import { ConsoleLogger } from '@/services/logging/console-logger';
import type { CatalogContextType } from './catalog/types';
import { catalogReducer, initialState } from './catalog/reducer';

const logger = new ConsoleLogger('info');

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
      logger.info('Circuit breaker active, skipping fetch');
      return;
    }
    if (currentState.isLoading) {
      logger.info('Already loading, skipping duplicate request');
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
            : 'Connection error loading catalog';
        logger.error('Error fetching catalog', error as Error);
        dispatch({ type: 'FETCH_ALL_FAILURE', payload: errorMessage });
      }
    } finally {
      dispatch({ type: 'FETCH_ALL_END' });
      abortControllerRef.current = null;
    }
  }, []);

  const fetchCatalogLocations = useCallback(async (catalogId: string) => {
    try {
      ValidationService.validateId(catalogId, 'fetchCatalogLocations');

      const data = await catalogService.getLocations(catalogId);
      logger.info('Location data received', { catalogId });
      dispatch({ type: 'FETCH_LOCATIONS_SUCCESS', payload: data });
    } catch (error) {
      logger.error('Error fetching catalog locations', error as Error);
    }
  }, []);

  const fetchCatalogById = useCallback(async (catalogId: string) => {
    dispatch({ type: 'FETCH_CATALOG_BY_ID_START' });
    try {
      ValidationService.validateId(catalogId, 'fetchCatalogById');

      const data = await catalogService.getCatalogById(catalogId);
      dispatch({ type: 'FETCH_CATALOG_BY_ID_SUCCESS', payload: data });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Connection error loading animal';
      logger.error('Error fetching catalog by id', error as Error);
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
