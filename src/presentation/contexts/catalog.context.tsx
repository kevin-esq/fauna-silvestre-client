import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useMemo
} from 'react';
import Animal from '../../domain/entities/animal.entity';
import { catalogService } from '../../services/catalog/catalog.service';
import { useAuth } from './auth.context';
import { LocationResponse } from '../../domain/models/animal.models';

interface State {
  isLoading: boolean;
  error: string | null;
  catalog: Animal[];
  catalogLocations: LocationResponse | null;
}

type Action =
  | { type: 'FETCH_ALL_START' }
  | { type: 'FETCH_ALL_SUCCESS'; payload: Animal[] }
  | { type: 'FETCH_ALL_FAILURE'; payload: string }
  | { type: 'RESET' }
  | { type: 'FETCH_LOCATIONS_SUCCESS'; payload: LocationResponse };

interface CatalogContextType extends State {
  fetchCatalog: () => Promise<void>;
  fetchCatalogLocations: (catalogId: string) => Promise<void>;
  catalogLocations: LocationResponse | null;
  reset: () => void;
}

const initialState: State = {
  isLoading: false,
  error: null,
  catalog: [],
  catalogLocations: null
};

const catalogReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'FETCH_ALL_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_ALL_SUCCESS':
      return { ...state, isLoading: false, catalog: action.payload };
    case 'FETCH_ALL_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'RESET':
      return initialState;
    case 'FETCH_LOCATIONS_SUCCESS':
      return { ...state, catalogLocations: action.payload };
    default:
      return state;
  }
};

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(catalogReducer, initialState);

  const fetchCatalog = useCallback(async () => {
    if (!user) {
      dispatch({ type: 'RESET' });
      return;
    }
    dispatch({ type: 'FETCH_ALL_START' });
    try {
      const data = await catalogService.getAllCatalogs(1, 10);
      dispatch({ type: 'FETCH_ALL_SUCCESS', payload: data });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'FETCH_ALL_FAILURE', payload: errorMessage });
    }
  }, [user]);

  const fetchCatalogLocations = useCallback(async (catalogId: string) => {
    try {
      const data = await catalogService.getLocations(catalogId);
      console.log('✅ Datos de ubicaciones recibidos:', data);
      dispatch({ type: 'FETCH_LOCATIONS_SUCCESS', payload: data });
    } catch (error) {
      console.error('Error fetching catalog locations:', error);
    }
  }, []);

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const contextValue = useMemo<CatalogContextType>(
    () => ({
      ...state,
      fetchCatalog,
      fetchCatalogLocations,
      reset
    }),
    [state, fetchCatalog, fetchCatalogLocations, reset]
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
