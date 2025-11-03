import {
  AnimalModelResponse,
  CatalogModelResponse,
  LocationResponse,
  PaginationModelResponse
} from '@/domain/models/animal.models';

export interface State {
  isLoading: boolean;
  error: string | null;
  catalog: AnimalModelResponse[];
  pagination: PaginationModelResponse;
  catalogLocations: LocationResponse | null;
  lastFetchTime: number | null;
  failureCount: number;
}

export type Action =
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

export interface CatalogContextType extends State {
  fetchCatalog: () => Promise<void>;
  fetchCatalogLocations: (catalogId: string) => Promise<void>;
  catalogLocations: LocationResponse | null;
  reset: () => void;
  fetchCatalogById: (catalogId: string) => Promise<void>;
}
