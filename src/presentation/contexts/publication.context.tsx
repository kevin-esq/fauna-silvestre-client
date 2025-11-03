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
  publicationService,
  PublicationStatus
} from '@/services/publication/publication.service';
import { AuthService } from '@/services/auth/auth.service';
import { ValidationService } from '@/services/validation';
import { PublicationFilters } from '@/utils/publication-filters';
import { StateCreators } from './publication/state-creators';
import { ReducerHandlers } from './publication/reducer-handlers';
import type {
  State,
  PublicationState,
  Action,
  LoadOptions,
  BulkAction,
  BulkOperationResult
} from './publication/types';

const CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  INITIAL_PAGE: 1,
  PREFETCH_THRESHOLD: 0.7,
  DEBOUNCE_DELAY: 300
} as const;

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
      const filteredPublications = PublicationFilters.filterByQuery(
        payload.records,
        currentState.currentSearchQuery
      );

      return {
        ...state,
        [status]: {
          ...currentState,
          publications: payload.records,
          filteredPublications,
          isRefreshing: false,
          isEmpty: payload.records.length === 0,
          pagination: payload.pagination,
          lastUpdated: Date.now(),
          error: undefined
        }
      };
    }

    case 'FILTER_PUBLICATIONS': {
      const { status, searchQuery } = action;
      const currentState = state[status];
      const filteredPublications = PublicationFilters.filterByQuery(
        currentState.publications,
        searchQuery
      );

      return {
        ...state,
        [status]: {
          ...currentState,
          filteredPublications,
          currentSearchQuery: searchQuery
        }
      };
    }

    case 'OPERATION_FAILURE':
      return ReducerHandlers.handleOperationFailure(state, action);

    case 'RESET_STATUS':
      return {
        ...state,
        [action.status]: StateCreators.createInitialPublicationState()
      };

    case 'RESET_ALL':
      return StateCreators.createInitialState();

    case 'UPDATE_PUBLICATION_STATUS':
      return ReducerHandlers.handleUpdatePublicationStatus(state, action);

    case 'FETCH_COUNTS_START':
      return {
        ...state,
        counts: {
          ...state.counts,
          isLoading: true,
          error: undefined
        }
      };

    case 'FETCH_COUNTS_SUCCESS':
      return {
        ...state,
        counts: {
          data: action.payload,
          isLoading: false,
          lastUpdated: Date.now(),
          error: undefined
        }
      };

    case 'FETCH_COUNTS_FAILURE':
      return {
        ...state,
        counts: {
          ...state.counts,
          isLoading: false,
          error: action.payload
        }
      };

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
    currentStatus: PublicationStatus,
    reason?: string
  ) => Promise<void>;
  readonly processBulkPublications: (
    publicationIds: readonly string[],
    action: BulkAction,
    currentStatus: PublicationStatus
  ) => Promise<BulkOperationResult>;
  readonly loadCounts: () => Promise<void>;
  readonly refreshCounts: () => Promise<void>;
  readonly canLoadMore: (status: PublicationStatus) => boolean;
  readonly getStatusData: (status: PublicationStatus) => PublicationState;
  readonly getTotalCount: (status: PublicationStatus) => number;
}

const PublicationContext = createContext<PublicationContextType | undefined>(
  undefined
);

export const PublicationProvider: React.FC<{
  readonly children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(
    publicationReducer,
    StateCreators.createInitialState()
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const initialLoadRef = useRef<boolean>(false);

  const clearAllData = useCallback(() => {
    console.log('[PublicationContext] Clearing all user data');
    dispatch({ type: 'RESET_ALL' });
    dispatch({ type: 'INVALIDATE_CACHE_AND_COUNTS' });
  }, []);

  const createAbortController = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current;
  }, []);

  const loadCounts = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'FETCH_COUNTS_START' });

      const counts = await publicationService.getCounts();
      dispatch({ type: 'FETCH_COUNTS_SUCCESS', payload: counts });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'FETCH_COUNTS_FAILURE', payload: errorMessage });
    }
  }, []);

  const refreshCounts = useCallback(async (): Promise<void> => {
    dispatch({ type: 'FETCH_COUNTS_START' });
    await loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    const handleCacheInvalidation = (): void => {
      console.log('[Cache] Invalidation callback triggered');
      dispatch({ type: 'INVALIDATE_CACHE_AND_COUNTS' });
    };

    publicationService.setOnCacheInvalidate(handleCacheInvalidation);

    try {
      if (AuthService.isInitialized()) {
        const authService = AuthService.getInstance();

        authService.setOnClearUserDataCallback(() => {
          clearAllData();
        });

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
      publicationService.setOnCacheInvalidate(undefined);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [clearAllData]);

  const loadStatus = useCallback(
    async (
      status: PublicationStatus,
      options: LoadOptions = {}
    ): Promise<void> => {
      const { searchQuery = '' } = options;

      try {
        ValidationService.validateUser(user);

        const currentState = state[status];
        if (currentState.isLoading) {
          console.log(`[loadStatus] Already loading ${status}, skipping`);
          return;
        }

        ValidationService.validatePaginationParams(
          CONFIG.INITIAL_PAGE,
          CONFIG.DEFAULT_PAGE_SIZE
        );

        const isAdmin = user.role === 'Admin';
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
          await loadCounts();
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Error al cargar publicaciones';
        dispatch({ type: 'OPERATION_FAILURE', payload: errorMessage, status });
      }
    },
    [state, createAbortController, user, loadCounts]
  );

  useEffect(() => {
    if (user && !initialLoadRef.current) {
      initialLoadRef.current = true;

      dispatch({ type: 'RESET_ALL' });

      const timeoutId = setTimeout(async () => {
        try {
          await loadCounts();
          await loadStatus(PublicationStatus.PENDING);
        } catch (error) {
          console.error(
            '[PublicationContext] Error loading initial data:',
            error
          );
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else if (!user) {
      initialLoadRef.current = false;
    }
  }, [user, loadCounts, loadStatus]);

  const loadMoreStatus = useCallback(
    async (status: PublicationStatus): Promise<void> => {
      try {
        ValidationService.validateUser(user);

        const currentState = state[status];
        if (currentState.isLoadingMore || !currentState.pagination.hasNext) {
          return;
        }

        const nextPage = currentState.pagination.page + 1;
        ValidationService.validatePaginationParams(
          nextPage,
          CONFIG.DEFAULT_PAGE_SIZE
        );

        const isAdmin = user.role === 'Admin';
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
    [user, state, createAbortController]
  );

  const refreshStatus = useCallback(
    async (status: PublicationStatus): Promise<void> => {
      try {
        ValidationService.validateUser(user);

        const currentState = state[status];
        if (currentState.isRefreshing) {
          console.log(`[refreshStatus] Already refreshing ${status}, skipping`);
          return;
        }

        const isAdmin = user.role === 'Admin';
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

        await refreshCounts();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Error al refrescar publicaciones';
        dispatch({ type: 'OPERATION_FAILURE', payload: errorMessage, status });
      }
    },
    [user, createAbortController, refreshCounts, state]
  );

  const acceptPublication = useCallback(
    async (
      publicationId: string,
      currentStatus: PublicationStatus
    ): Promise<void> => {
      try {
        dispatch({
          type: 'UPDATE_PUBLICATION_STATUS',
          publicationId,
          currentStatus,
          newStatus: PublicationStatus.ACCEPTED
        });

        await publicationService.acceptPublication(publicationId);
        await refreshStatus(currentStatus);
        await refreshCounts();
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
    [refreshCounts, refreshStatus]
  );

  const rejectPublication = useCallback(
    async (
      publicationId: string,
      currentStatus: PublicationStatus,
      reason?: string
    ): Promise<void> => {
      try {
        dispatch({
          type: 'UPDATE_PUBLICATION_STATUS',
          publicationId,
          currentStatus,
          newStatus: PublicationStatus.REJECTED
        });

        await publicationService.rejectPublication(publicationId, reason);
        await refreshStatus(currentStatus);
        await refreshCounts();
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
    [refreshCounts, refreshStatus]
  );

  const processBulkPublications = useCallback(
    async (
      publicationIds: readonly string[],
      action: BulkAction
    ): Promise<BulkOperationResult> => {
      try {
        const result = await publicationService.processBulkPublications(
          publicationIds as string[],
          action
        );

        dispatch({ type: 'INVALIDATE_CACHE_AND_COUNTS' });
        await refreshCounts();

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error en operación masiva';
        dispatch({ type: 'OPERATION_FAILURE', payload: errorMessage });
        throw error;
      }
    },
    [refreshCounts]
  );

  const filterPublications = useCallback(
    (status: PublicationStatus, searchQuery: string): void => {
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

  const resetStatus = useCallback((status: PublicationStatus): void => {
    dispatch({ type: 'RESET_STATUS', status });
  }, []);

  const resetAll = useCallback((): void => {
    dispatch({ type: 'RESET_ALL' });
  }, []);

  const canLoadMore = useCallback(
    (status: PublicationStatus): boolean => {
      const statusState = state[status];

      if (statusState.pagination.total === 0) {
        return false;
      }

      return statusState.pagination.hasNext && !statusState.isLoadingMore;
    },
    [state]
  );

  const getStatusData = useCallback(
    (status: PublicationStatus): PublicationState => state[status],
    [state]
  );

  const getTotalCount = useCallback(
    (status: PublicationStatus): number => {
      const paginationTotal = state[status].pagination.total;

      if (state.counts.data) {
        const countMap: Record<PublicationStatus, number> = {
          [PublicationStatus.PENDING]: state.counts.data.pending || 0,
          [PublicationStatus.ACCEPTED]: state.counts.data.accepted || 0,
          [PublicationStatus.REJECTED]: state.counts.data.rejected || 0
        };

        const count = countMap[status];
        return count > 0 ? count : paginationTotal;
      }

      return paginationTotal;
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
      getTotalCount
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
      getTotalCount
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
