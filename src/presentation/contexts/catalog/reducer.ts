import type { State, Action } from './types';

export const initialState: State = {
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

export const catalogReducer = (state: State, action: Action): State => {
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
