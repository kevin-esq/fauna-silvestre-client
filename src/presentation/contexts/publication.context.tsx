import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useEffect
} from 'react';
import { useAuth } from '@/presentation/contexts/auth.context';
import {
  PublicationResponse,
  PublicationModelResponse,
  CountsResponse
} from '@/domain/models/publication.models';
import {
  publicationService,
  PublicationStatus
} from '@/services/publication/publication.service';
import { AuthService } from '@/services/auth/auth.service';
import User from '@/domain/entities/user.entity';

const CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  INITIAL_PAGE: 1,
  REQUEST_TIMEOUT: 30000,
  MAX_MEMORY_PAGES: 3,
  PREFETCH_THRESHOLD: 0.7,
  CIRCUIT_BREAKER_THRESHOLD: 5,
  CIRCUIT_BREAKER_TIMEOUT: 10000,
  DEBOUNCE_DELAY: 300,
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000
} as const;

interface PublicationState {
  readonly publications: PublicationModelResponse[];
  readonly filteredPublications: PublicationModelResponse[];
  readonly isLoading: boolean;
  readonly isLoadingMore: boolean;
  readonly isRefreshing: boolean;
  readonly isEmpty: boolean;
  readonly pagination: {
    readonly page: number;
    readonly size: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNext: boolean;
    readonly hasPrev: boolean;
  };
  readonly currentSearchQuery: string;
  readonly lastUpdated: number | null;
  readonly error?: string;
}

interface CircuitBreakerState {
  readonly failureCount: number;
  readonly lastFailureTime: number | null;
  readonly isOpen: boolean;
}

interface CountsState {
  readonly data: CountsResponse | null;
  readonly isLoading: boolean;
  readonly lastUpdated: number | null;
  readonly error?: string;
}

interface State {
  readonly [PublicationStatus.PENDING]: PublicationState;
  readonly [PublicationStatus.ACCEPTED]: PublicationState;
  readonly [PublicationStatus.REJECTED]: PublicationState;
  readonly circuitBreaker: CircuitBreakerState;
  readonly counts: CountsState;
}

type Action =
  | { type: 'FETCH_STATUS_START'; status: PublicationStatus }
  | {
      type: 'FETCH_STATUS_SUCCESS';
      status: PublicationStatus;
      payload: PublicationResponse;
      searchQuery: string;
      resetPage: boolean;
    }
  | { type: 'FETCH_MORE_START'; status: PublicationStatus }
  | {
      type: 'FETCH_MORE_SUCCESS';
      status: PublicationStatus;
      payload: PublicationResponse;
    }
  | { type: 'REFRESH_START'; status: PublicationStatus }
  | {
      type: 'REFRESH_SUCCESS';
      status: PublicationStatus;
      payload: PublicationResponse;
    }
  | {
      type: 'FILTER_PUBLICATIONS';
      status: PublicationStatus;
      searchQuery: string;
    }
  | {
      type: 'OPERATION_FAILURE';
      payload: string;
      status?: PublicationStatus;
    }
  | { type: 'RESET_STATUS'; status: PublicationStatus }
  | { type: 'RESET_ALL' }
  | { type: 'CIRCUIT_BREAKER_OPEN' }
  | { type: 'CIRCUIT_BREAKER_RESET' }
  | {
      type: 'UPDATE_PUBLICATION_STATUS';
      publicationId: string;
      currentStatus: PublicationStatus;
      newStatus: PublicationStatus;
    }
  | { type: 'FETCH_COUNTS_START' }
  | { type: 'FETCH_COUNTS_SUCCESS'; payload: CountsResponse }
  | { type: 'FETCH_COUNTS_FAILURE'; payload: string }
  | { type: 'INVALIDATE_CACHE_AND_COUNTS' };

interface LoadOptions {
  searchQuery?: string;
  forceRefresh?: boolean;
}

interface PublicationContextType {
  readonly state: State;

  readonly loadStatus: (
    status: PublicationStatus,
    options?: LoadOptions
  ) => Promise<void>;
  readonly loadMoreStatus: (status: PublicationStatus) => Promise<void>;
  readonly refreshStatus: (status: PublicationStatus) => Promise<void>;
  readonly filterPublications: (
    status: PublicationStatus,
    searchQuery: string
  ) => void;
  readonly resetStatus: (status: PublicationStatus) => void;
  readonly resetAll: () => void;
  readonly clearAllData: () => void;

  readonly acceptPublication: (
    publicationId: string,
    currentStatus: PublicationStatus
  ) => Promise<void>;
  readonly rejectPublication: (
    publicationId: string,
    currentStatus: PublicationStatus
  ) => Promise<void>;
  readonly processBulkPublications: (
    publicationIds: string[],
    action: 'accept' | 'reject',
    currentStatus: PublicationStatus
  ) => Promise<{ success: string[]; failed: string[] }>;

  readonly loadCounts: () => Promise<void>;
  readonly refreshCounts: () => Promise<void>;

  readonly canLoadMore: (status: PublicationStatus) => boolean;
  readonly getStatusData: (status: PublicationStatus) => PublicationState;
  readonly getTotalCount: (status: PublicationStatus) => number;
  readonly resetCircuitBreaker: () => void;
}

class PublicationFilters {
  static filterByQuery(
    publications: PublicationModelResponse[],
    searchQuery: string
  ): PublicationModelResponse[] {
    if (!searchQuery.trim()) return publications;

    const query = searchQuery.toLowerCase().trim();
    return publications.filter(
      pub =>
        pub.commonNoun?.toLowerCase().includes(query) ||
        pub.description?.toLowerCase().includes(query) ||
        pub.location?.toLowerCase().includes(query)
    );
  }
}

class CircuitBreakerUtils {
  static isOpen(circuitBreaker: CircuitBreakerState): boolean {
    if (!circuitBreaker.isOpen) return false;

    if (circuitBreaker.lastFailureTime) {
      const timeSinceLastFailure = Date.now() - circuitBreaker.lastFailureTime;
      return timeSinceLastFailure < CONFIG.CIRCUIT_BREAKER_TIMEOUT;
    }

    return false;
  }

  static shouldOpen(failureCount: number): boolean {
    return failureCount >= CONFIG.CIRCUIT_BREAKER_THRESHOLD;
  }
}

class ValidationUtils {
  static validatePaginationParams(page: number, size: number): void {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('El número de página debe ser un entero mayor a 0');
    }
    if (!Number.isInteger(size) || size < 1 || size > 100) {
      throw new Error('El límite debe ser un entero entre 1 y 100');
    }
  }

  static validateUser(user: User | null): void {
    if (!user?.role) {
      throw new Error('User not authenticated');
    }
  }
}

class StateCreators {
  static createInitialPublicationState(): PublicationState {
    return {
      publications: [],
      filteredPublications: [],
      isLoading: false,
      isLoadingMore: false,
      isRefreshing: false,
      isEmpty: true,
      pagination: {
        page: CONFIG.INITIAL_PAGE,
        size: CONFIG.DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      },
      currentSearchQuery: '',
      lastUpdated: null,
      error: undefined
    };
  }

  static createInitialCountsState(): CountsState {
    return {
      data: null,
      isLoading: false,
      lastUpdated: null,
      error: undefined
    };
  }

  static createInitialState(): State {
    return {
      [PublicationStatus.PENDING]:
        StateCreators.createInitialPublicationState(),
      [PublicationStatus.ACCEPTED]:
        StateCreators.createInitialPublicationState(),
      [PublicationStatus.REJECTED]:
        StateCreators.createInitialPublicationState(),
      circuitBreaker: {
        failureCount: 0,
        lastFailureTime: null,
        isOpen: false
      },
      counts: StateCreators.createInitialCountsState()
    };
  }
}

class ReducerHandlers {
  static handleFetchStart(
    state: State,
    action: { type: string; status: PublicationStatus }
  ): State {
    const currentState = state[action.status];
    return {
      ...state,
      [action.status]: {
        ...currentState,
        isLoading: true,
        error: undefined
      }
    };
  }

  static handleFetchSuccess(
    state: State,
    action: {
      type: string;
      status: PublicationStatus;
      payload: PublicationResponse;
      searchQuery: string;
      resetPage: boolean;
    }
  ): State {
    const { status, payload, searchQuery, resetPage } = action;
    const currentState = state[status];

    const newPublications = resetPage
      ? payload.records
      : [...currentState.publications, ...payload.records];

    const filteredPubs = PublicationFilters.filterByQuery(
      newPublications,
      searchQuery
    );

    return {
      ...state,
      [status]: {
        ...currentState,
        publications: newPublications,
        filteredPublications: filteredPubs,
        isLoading: false,
        isEmpty: newPublications.length === 0,
        pagination: {
          page: payload.pagination.page,
          size: payload.pagination.size,
          total: payload.pagination.total,
          totalPages: payload.pagination.totalPages,
          hasNext: payload.pagination.hasNext,
          hasPrev: payload.pagination.hasPrev
        },
        currentSearchQuery: searchQuery,
        lastUpdated: Date.now(),
        error: undefined
      },
      circuitBreaker: {
        failureCount: 0,
        lastFailureTime: null,
        isOpen: false
      }
    };
  }

  static handleFetchMoreSuccess(
    state: State,
    action: {
      type: string;
      status: PublicationStatus;
      payload: PublicationResponse;
    }
  ): State {
    const { status, payload } = action;
    const currentState = state[status];

    const allPublications = [...currentState.publications, ...payload.records];
    const maxItems = CONFIG.MAX_MEMORY_PAGES * CONFIG.DEFAULT_PAGE_SIZE;
    const limitedPublications = allPublications.slice(-maxItems);

    const filteredPubs = PublicationFilters.filterByQuery(
      limitedPublications,
      currentState.currentSearchQuery
    );

    return {
      ...state,
      [status]: {
        ...currentState,
        publications: limitedPublications,
        filteredPublications: filteredPubs,
        isLoadingMore: false,
        isEmpty: limitedPublications.length === 0,
        pagination: {
          page: payload.pagination.page,
          size: payload.pagination.size,
          total: payload.pagination.total,
          totalPages: payload.pagination.totalPages,
          hasNext: payload.pagination.hasNext,
          hasPrev: payload.pagination.hasPrev
        },
        lastUpdated: Date.now(),
        error: undefined
      }
    };
  }

  static handleOperationFailure(
    state: State,
    action: { type: string; payload: string; status?: PublicationStatus }
  ): State {
    const { payload: errorMessage, status } = action;

    const newFailureCount = state.circuitBreaker.failureCount + 1;
    const newCircuitBreaker = {
      failureCount: newFailureCount,
      lastFailureTime: Date.now(),
      isOpen: CircuitBreakerUtils.shouldOpen(newFailureCount)
    };

    if (status) {
      const currentState = state[status];
      return {
        ...state,
        [status]: {
          ...currentState,
          isLoading: false,
          isLoadingMore: false,
          isRefreshing: false,
          error: errorMessage
        },
        circuitBreaker: newCircuitBreaker
      };
    }

    return {
      ...state,
      circuitBreaker: newCircuitBreaker
    };
  }

  static handleUpdatePublicationStatus(
    state: State,
    action: {
      type: string;
      publicationId: string;
      currentStatus: PublicationStatus;
      newStatus: PublicationStatus;
    }
  ): State {
    const { publicationId, currentStatus, newStatus } = action;
    const fromState = state[currentStatus];
    const toState = state[newStatus];

    const publication = fromState.publications.find(
      p => p.recordId.toString() === publicationId
    );
    if (!publication) return state;

    const updatedFromPublications = fromState.publications.filter(
      p => p.recordId.toString() !== publicationId
    );
    const updatedToPublications = [...toState.publications, publication];

    return {
      ...state,
      [currentStatus]: {
        ...fromState,
        publications: updatedFromPublications,
        filteredPublications: PublicationFilters.filterByQuery(
          updatedFromPublications,
          fromState.currentSearchQuery
        ),
        isEmpty: updatedFromPublications.length === 0,
        pagination: {
          ...fromState.pagination,
          total: Math.max(0, fromState.pagination.total - 1)
        }
      },
      [newStatus]: {
        ...toState,
        publications: updatedToPublications,
        filteredPublications: PublicationFilters.filterByQuery(
          updatedToPublications,
          toState.currentSearchQuery
        ),
        isEmpty: false,
        pagination: {
          ...toState.pagination,
          total: toState.pagination.total + 1
        }
      }
    };
  }
}

const publicationReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'FETCH_STATUS_START':
      return ReducerHandlers.handleFetchStart(state, action);

    case 'FETCH_STATUS_SUCCESS':
      return ReducerHandlers.handleFetchSuccess(state, action);

    case 'FETCH_MORE_START': {
      const currentState = state[action.status];
      return {
        ...state,
        [action.status]: {
          ...currentState,
          isLoadingMore: true,
          error: undefined
        }
      };
    }

    case 'FETCH_MORE_SUCCESS':
      return ReducerHandlers.handleFetchMoreSuccess(state, action);

    case 'REFRESH_START': {
      const currentState = state[action.status];
      return {
        ...state,
        [action.status]: {
          ...currentState,
          isRefreshing: true,
          error: undefined
        }
      };
    }

    case 'REFRESH_SUCCESS': {
      const { status, payload } = action;
      const currentState = state[status];
      const filteredPubs = PublicationFilters.filterByQuery(
        payload.records,
        currentState.currentSearchQuery
      );

      return {
        ...state,
        [status]: {
          ...currentState,
          publications: payload.records,
          filteredPublications: filteredPubs,
          isRefreshing: false,
          isEmpty: payload.records.length === 0,
          pagination: {
            page: payload.pagination.page,
            size: payload.pagination.size,
            total: payload.pagination.total,
            totalPages: payload.pagination.totalPages,
            hasNext: payload.pagination.hasNext,
            hasPrev: payload.pagination.hasPrev
          },
          lastUpdated: Date.now(),
          error: undefined
        }
      };
    }

    case 'FILTER_PUBLICATIONS': {
      const { status, searchQuery } = action;
      const currentState = state[status];
      const filteredPubs = PublicationFilters.filterByQuery(
        currentState.publications,
        searchQuery
      );

      return {
        ...state,
        [status]: {
          ...currentState,
          filteredPublications: filteredPubs,
          currentSearchQuery: searchQuery
        }
      };
    }

    case 'OPERATION_FAILURE':
      return ReducerHandlers.handleOperationFailure(state, action);

    case 'RESET_STATUS': {
      return {
        ...state,
        [action.status]: StateCreators.createInitialPublicationState()
      };
    }

    case 'RESET_ALL': {
      return StateCreators.createInitialState();
    }

    case 'CIRCUIT_BREAKER_OPEN': {
      return {
        ...state,
        circuitBreaker: {
          ...state.circuitBreaker,
          isOpen: true,
          lastFailureTime: Date.now()
        }
      };
    }

    case 'CIRCUIT_BREAKER_RESET': {
      return {
        ...state,
        circuitBreaker: {
          failureCount: 0,
          lastFailureTime: null,
          isOpen: false
        }
      };
    }

    case 'UPDATE_PUBLICATION_STATUS':
      return ReducerHandlers.handleUpdatePublicationStatus(state, action);

    case 'FETCH_COUNTS_START': {
      return {
        ...state,
        counts: {
          ...state.counts,
          isLoading: true,
          error: undefined
        }
      };
    }

    case 'FETCH_COUNTS_SUCCESS': {
      return {
        ...state,
        counts: {
          data: action.payload,
          isLoading: false,
          lastUpdated: Date.now(),
          error: undefined
        }
      };
    }

    case 'FETCH_COUNTS_FAILURE': {
      return {
        ...state,
        counts: {
          ...state.counts,
          isLoading: false,
          error: action.payload
        }
      };
    }

    case 'INVALIDATE_CACHE_AND_COUNTS': {
      const initialPublicationState =
        StateCreators.createInitialPublicationState();
      return {
        ...state,
        [PublicationStatus.PENDING]: initialPublicationState,
        [PublicationStatus.ACCEPTED]: initialPublicationState,
        [PublicationStatus.REJECTED]: initialPublicationState,
        counts: StateCreators.createInitialCountsState()
      };
    }

    default:
      return state;
  }
};

const PublicationContext = createContext<PublicationContextType | undefined>(
  undefined
);

export const PublicationProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(
    publicationReducer,
    StateCreators.createInitialState()
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef<boolean>(false);

  const clearAllData = useCallback(() => {
    console.log('[PublicationContext] Clearing all user data');
    dispatch({ type: 'RESET_ALL' });
    dispatch({ type: 'INVALIDATE_CACHE_AND_COUNTS' });
  }, []);

  const createAbortController = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current;
  }, []);

  const checkCircuitBreaker = useCallback(() => {
    if (CircuitBreakerUtils.isOpen(state.circuitBreaker)) {
      throw new Error('Circuit breaker is open. Too many failures.');
    }
  }, [state.circuitBreaker]);

  const loadCounts = useCallback(async () => {
    try {
      checkCircuitBreaker();
      dispatch({ type: 'FETCH_COUNTS_START' });

      const counts = await publicationService.getCounts();
      dispatch({ type: 'FETCH_COUNTS_SUCCESS', payload: counts });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'FETCH_COUNTS_FAILURE', payload: errorMessage });
    }
  }, [checkCircuitBreaker]);

  const refreshCounts = useCallback(async () => {
    dispatch({ type: 'FETCH_COUNTS_START' });
    await loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    const handleCacheInvalidation = () => {
      console.log('[Cache] Invalidation callback triggered');
      dispatch({ type: 'INVALIDATE_CACHE_AND_COUNTS' });
    };

    publicationService.setOnCacheInvalidate(handleCacheInvalidation);

    try {
      if (AuthService.isInitialized()) {
        const authService = AuthService.getInstance();
        authService.setOnClearUserDataCallback(clearAllData);
        console.log('[PublicationContext] Auth cleanup callback registered');
      } else {
        console.log(
          '[PublicationContext] AuthService not yet initialized, skipping callback registration'
        );
      }
    } catch (error) {
      console.warn(
        '[PublicationContext] Could not register auth cleanup callback:',
        error
      );
    }

    return () => {
      publicationService.setOnCacheInvalidate(null);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [clearAllData]);

  const loadStatus = useCallback(
    async (status: PublicationStatus, options: LoadOptions = {}) => {
      const { searchQuery = '' } = options;

      try {
        checkCircuitBreaker();
        ValidationUtils.validateUser(user);

        const currentState = state[status];
        if (currentState.isLoading) {
          console.log(`[loadStatus] Already loading ${status}, skipping`);
          return;
        }

        ValidationUtils.validatePaginationParams(
          CONFIG.INITIAL_PAGE,
          CONFIG.DEFAULT_PAGE_SIZE
        );

        const isAdmin = user!.role === 'Admin';
        createAbortController();

        dispatch({ type: 'FETCH_STATUS_START', status });

        const response = await publicationService.getPublicationsByStatus({
          status,
          page: CONFIG.INITIAL_PAGE,
          size: CONFIG.DEFAULT_PAGE_SIZE,
          forAdmin: isAdmin
        });

        dispatch({
          type: 'FETCH_STATUS_SUCCESS',
          status,
          payload: response,
          searchQuery,
          resetPage: true
        });

        if (!state.counts.data && !state.counts.isLoading) {
          loadCounts();
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Error al cargar publicaciones';
        dispatch({ type: 'OPERATION_FAILURE', payload: errorMessage, status });
      }
    },
    [state, createAbortController, checkCircuitBreaker, user, loadCounts]
  );

  useEffect(() => {
    if (user && !initialLoadRef.current) {
      console.log('[PublicationContext] User changed, loading initial data');
      initialLoadRef.current = true;

      dispatch({ type: 'RESET_ALL' });

      const timeoutId = setTimeout(() => {
        loadStatus(PublicationStatus.PENDING);
        loadCounts();
      }, 100);

      return () => clearTimeout(timeoutId);
    } else if (!user) {
      initialLoadRef.current = false;
    }
  }, [user, loadCounts, loadStatus]);

  const loadMoreStatus = useCallback(
    async (status: PublicationStatus) => {
      try {
        checkCircuitBreaker();
        ValidationUtils.validateUser(user);

        const currentState = state[status];
        if (currentState.isLoadingMore || !currentState.pagination.hasNext) {
          return;
        }

        const nextPage = currentState.pagination.page + 1;
        ValidationUtils.validatePaginationParams(
          nextPage,
          CONFIG.DEFAULT_PAGE_SIZE
        );

        const isAdmin = user!.role === 'Admin';
        createAbortController();

        dispatch({ type: 'FETCH_MORE_START', status });

        const response = await publicationService.getPublicationsByStatus({
          status,
          page: nextPage,
          size: CONFIG.DEFAULT_PAGE_SIZE,
          forAdmin: isAdmin
        });

        dispatch({
          type: 'FETCH_MORE_SUCCESS',
          status,
          payload: response
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Error al cargar más publicaciones';
        dispatch({ type: 'OPERATION_FAILURE', payload: errorMessage, status });
      }
    },
    [user, state, checkCircuitBreaker, createAbortController]
  );

  const refreshStatus = useCallback(
    async (status: PublicationStatus) => {
      try {
        checkCircuitBreaker();
        ValidationUtils.validateUser(user);

        const currentState = state[status];
        if (currentState.isRefreshing) {
          console.log(`[refreshStatus] Already refreshing ${status}, skipping`);
          return;
        }

        const isAdmin = user!.role === 'Admin';
        createAbortController();

        dispatch({ type: 'REFRESH_START', status });

        const response = await publicationService.getPublicationsByStatus({
          status,
          page: CONFIG.INITIAL_PAGE,
          size: CONFIG.DEFAULT_PAGE_SIZE,
          forAdmin: isAdmin
        });

        dispatch({
          type: 'REFRESH_SUCCESS',
          status,
          payload: response
        });

        refreshCounts();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Error al refrescar publicaciones';
        dispatch({ type: 'OPERATION_FAILURE', payload: errorMessage, status });
      }
    },
    [user, checkCircuitBreaker, createAbortController, refreshCounts, state]
  );

  const acceptPublication = useCallback(
    async (publicationId: string, currentStatus: PublicationStatus) => {
      try {
        checkCircuitBreaker();

        dispatch({
          type: 'UPDATE_PUBLICATION_STATUS',
          publicationId,
          currentStatus,
          newStatus: PublicationStatus.ACCEPTED
        });

        await publicationService.acceptPublication(publicationId);
        await refreshStatus(currentStatus);
        refreshCounts();
      } catch (error) {
        dispatch({
          type: 'UPDATE_PUBLICATION_STATUS',
          publicationId,
          currentStatus: PublicationStatus.ACCEPTED,
          newStatus: currentStatus
        });

        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Error al aceptar publicación';
        dispatch({ type: 'OPERATION_FAILURE', payload: errorMessage });
        throw error;
      }
    },
    [checkCircuitBreaker, refreshCounts, refreshStatus]
  );

  const rejectPublication = useCallback(
    async (publicationId: string, currentStatus: PublicationStatus) => {
      try {
        checkCircuitBreaker();

        dispatch({
          type: 'UPDATE_PUBLICATION_STATUS',
          publicationId,
          currentStatus,
          newStatus: PublicationStatus.REJECTED
        });

        await publicationService.rejectPublication(publicationId);
        await refreshStatus(currentStatus);
        refreshCounts();
      } catch (error) {
        dispatch({
          type: 'UPDATE_PUBLICATION_STATUS',
          publicationId,
          currentStatus: PublicationStatus.REJECTED,
          newStatus: currentStatus
        });

        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Error al rechazar publicación';
        dispatch({ type: 'OPERATION_FAILURE', payload: errorMessage });
        throw error;
      }
    },
    [checkCircuitBreaker, refreshCounts, refreshStatus]
  );

  const processBulkPublications = useCallback(
    async (publicationIds: string[], action: 'accept' | 'reject') => {
      try {
        checkCircuitBreaker();

        const result = await publicationService.processBulkPublications(
          publicationIds,
          action
        );

        dispatch({ type: 'INVALIDATE_CACHE_AND_COUNTS' });
        refreshCounts();

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error en operación masiva';
        dispatch({ type: 'OPERATION_FAILURE', payload: errorMessage });
        throw error;
      }
    },
    [checkCircuitBreaker, refreshCounts]
  );

  const filterPublications = useCallback(
    (status: PublicationStatus, searchQuery: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        dispatch({
          type: 'FILTER_PUBLICATIONS',
          status,
          searchQuery
        });
      }, CONFIG.DEBOUNCE_DELAY);
    },
    []
  );

  const resetStatus = useCallback((status: PublicationStatus) => {
    dispatch({ type: 'RESET_STATUS', status });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, []);

  const resetCircuitBreaker = useCallback(() => {
    dispatch({ type: 'CIRCUIT_BREAKER_RESET' });
  }, []);

  const canLoadMore = useCallback(
    (status: PublicationStatus) => {
      const statusState = state[status];

      if (statusState.pagination.total === 0) {
        return false;
      }

      return (
        statusState.pagination.hasNext &&
        !statusState.isLoadingMore &&
        !CircuitBreakerUtils.isOpen(state.circuitBreaker)
      );
    },
    [state]
  );

  const getStatusData = useCallback(
    (status: PublicationStatus) => state[status],
    [state]
  );

  const getTotalCount = useCallback(
    (status: PublicationStatus) => {
      if (state.counts.data) {
        switch (status) {
          case PublicationStatus.PENDING:
            return state.counts.data.pendingCount || 0;
          case PublicationStatus.ACCEPTED:
            return state.counts.data.acceptedCount || 0;
          case PublicationStatus.REJECTED:
            return state.counts.data.rejectedCount || 0;
          default:
            return 0;
        }
      }
      return state[status].pagination.total;
    },
    [state]
  );

  const contextValue = useMemo<PublicationContextType>(
    () => ({
      state,
      loadStatus,
      loadMoreStatus,
      refreshStatus,
      filterPublications,
      resetStatus,
      resetAll,
      clearAllData,
      acceptPublication,
      rejectPublication,
      processBulkPublications,
      loadCounts,
      refreshCounts,
      canLoadMore,
      getStatusData,
      getTotalCount,
      resetCircuitBreaker
    }),
    [
      state,
      loadStatus,
      loadMoreStatus,
      refreshStatus,
      filterPublications,
      resetStatus,
      resetAll,
      clearAllData,
      acceptPublication,
      rejectPublication,
      processBulkPublications,
      loadCounts,
      refreshCounts,
      canLoadMore,
      getStatusData,
      getTotalCount,
      resetCircuitBreaker
    ]
  );

  return (
    <PublicationContext.Provider value={contextValue}>
      {children}
    </PublicationContext.Provider>
  );
};

export const usePublications = (): PublicationContextType => {
  const context = useContext(PublicationContext);
  if (context === undefined) {
    throw new Error(
      'usePublications must be used within a PublicationProvider'
    );
  }
  return context;
};
