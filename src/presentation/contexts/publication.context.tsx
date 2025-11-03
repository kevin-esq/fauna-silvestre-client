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
  PREFETCH_THRESHOLD: 0.7,
  DEBOUNCE_DELAY: 300
} as const;

interface PaginationState {
  readonly page: number;
  readonly size: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrev: boolean;
}

interface PublicationState {
  readonly publications: PublicationModelResponse[];
  readonly filteredPublications: PublicationModelResponse[];
  readonly isLoading: boolean;
  readonly isLoadingMore: boolean;
  readonly isRefreshing: boolean;
  readonly isEmpty: boolean;
  readonly pagination: PaginationState;
  readonly currentSearchQuery: string;
  readonly lastUpdated: number | null;
  readonly error?: string;
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
  readonly counts: CountsState;
}

type PublicationActionType =
  | 'FETCH_STATUS_START'
  | 'FETCH_STATUS_SUCCESS'
  | 'FETCH_MORE_START'
  | 'FETCH_MORE_SUCCESS'
  | 'REFRESH_START'
  | 'REFRESH_SUCCESS'
  | 'FILTER_PUBLICATIONS'
  | 'OPERATION_FAILURE'
  | 'RESET_STATUS'
  | 'RESET_ALL'
  | 'UPDATE_PUBLICATION_STATUS'
  | 'FETCH_COUNTS_START'
  | 'FETCH_COUNTS_SUCCESS'
  | 'FETCH_COUNTS_FAILURE'
  | 'INVALIDATE_CACHE_AND_COUNTS';

interface BaseAction<T extends PublicationActionType> {
  readonly type: T;
}

interface FetchStatusStartAction extends BaseAction<'FETCH_STATUS_START'> {
  readonly status: PublicationStatus;
}

interface FetchStatusSuccessAction extends BaseAction<'FETCH_STATUS_SUCCESS'> {
  readonly status: PublicationStatus;
  readonly payload: PublicationResponse;
  readonly searchQuery: string;
  readonly resetPage: boolean;
}

interface FetchMoreStartAction extends BaseAction<'FETCH_MORE_START'> {
  readonly status: PublicationStatus;
}

interface FetchMoreSuccessAction extends BaseAction<'FETCH_MORE_SUCCESS'> {
  readonly status: PublicationStatus;
  readonly payload: PublicationResponse;
}

interface RefreshStartAction extends BaseAction<'REFRESH_START'> {
  readonly status: PublicationStatus;
}

interface RefreshSuccessAction extends BaseAction<'REFRESH_SUCCESS'> {
  readonly status: PublicationStatus;
  readonly payload: PublicationResponse;
}

interface FilterPublicationsAction extends BaseAction<'FILTER_PUBLICATIONS'> {
  readonly status: PublicationStatus;
  readonly searchQuery: string;
}

interface OperationFailureAction extends BaseAction<'OPERATION_FAILURE'> {
  readonly payload: string;
  readonly status?: PublicationStatus;
}

interface ResetStatusAction extends BaseAction<'RESET_STATUS'> {
  readonly status: PublicationStatus;
}

interface UpdatePublicationStatusAction
  extends BaseAction<'UPDATE_PUBLICATION_STATUS'> {
  readonly publicationId: string;
  readonly currentStatus: PublicationStatus;
  readonly newStatus: PublicationStatus;
}

interface FetchCountsSuccessAction extends BaseAction<'FETCH_COUNTS_SUCCESS'> {
  readonly payload: CountsResponse;
}

interface FetchCountsFailureAction extends BaseAction<'FETCH_COUNTS_FAILURE'> {
  readonly payload: string;
}

type Action =
  | FetchStatusStartAction
  | FetchStatusSuccessAction
  | FetchMoreStartAction
  | FetchMoreSuccessAction
  | RefreshStartAction
  | RefreshSuccessAction
  | FilterPublicationsAction
  | OperationFailureAction
  | ResetStatusAction
  | BaseAction<'RESET_ALL'>
  | UpdatePublicationStatusAction
  | BaseAction<'FETCH_COUNTS_START'>
  | FetchCountsSuccessAction
  | FetchCountsFailureAction
  | BaseAction<'INVALIDATE_CACHE_AND_COUNTS'>;

interface LoadOptions {
  readonly searchQuery?: string;
  readonly forceRefresh?: boolean;
}

type BulkAction = 'accept' | 'reject';

interface BulkOperationResult {
  readonly success: string[];
  readonly failed: string[];
}

class PublicationFilters {
  public static filterByQuery(
    publications: readonly PublicationModelResponse[],
    searchQuery: string
  ): PublicationModelResponse[] {
    if (!searchQuery.trim()) return [...publications];

    const query = searchQuery.toLowerCase().trim();
    return publications.filter(
      publication =>
        publication.commonNoun?.toLowerCase().includes(query) ||
        publication.description?.toLowerCase().includes(query) ||
        publication.location?.toLowerCase().includes(query)
    );
  }
}


class ValidationUtils {
  public static validatePaginationParams(page: number, size: number): void {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('El número de página debe ser un entero mayor a 0');
    }

    if (!Number.isInteger(size) || size < 1 || size > 100) {
      throw new Error('El límite debe ser un entero entre 1 y 100');
    }
  }

  public static validateUser(user: User | null): asserts user is User {
    if (!user?.role) {
      throw new Error('User not authenticated');
    }
  }
}

class StateCreators {
  public static createInitialPublicationState(): PublicationState {
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

  public static createInitialCountsState(): CountsState {
    return {
      data: null,
      isLoading: false,
      lastUpdated: null,
      error: undefined
    };
  }

  public static createInitialState(): State {
    return {
      [PublicationStatus.PENDING]: this.createInitialPublicationState(),
      [PublicationStatus.ACCEPTED]: this.createInitialPublicationState(),
      [PublicationStatus.REJECTED]: this.createInitialPublicationState(),
      counts: this.createInitialCountsState()
    };
  }
}

class ReducerHandlers {
  public static handleFetchStart(
    state: State,
    action: FetchStatusStartAction
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

  public static handleFetchSuccess(
    state: State,
    action: FetchStatusSuccessAction
  ): State {
    const { status, payload, searchQuery, resetPage } = action;
    const currentState = state[status];

    const newPublications = resetPage
      ? payload.records
      : [...currentState.publications, ...payload.records];

    const filteredPublications = PublicationFilters.filterByQuery(
      newPublications,
      searchQuery
    );

    return {
      ...state,
      [status]: {
        ...currentState,
        publications: newPublications,
        filteredPublications,
        isLoading: false,
        isEmpty: newPublications.length === 0,
        pagination: payload.pagination,
        currentSearchQuery: searchQuery,
        lastUpdated: Date.now(),
        error: undefined
      }
    };
  }

  public static handleFetchMoreSuccess(
    state: State,
    action: FetchMoreSuccessAction
  ): State {
    const { status, payload } = action;
    const currentState = state[status];

    const allPublications = [...currentState.publications, ...payload.records];
    const limitedPublications = allPublications;

    const filteredPublications = PublicationFilters.filterByQuery(
      limitedPublications,
      currentState.currentSearchQuery
    );

    return {
      ...state,
      [status]: {
        ...currentState,
        publications: limitedPublications,
        filteredPublications,
        isLoadingMore: false,
        isEmpty: limitedPublications.length === 0,
        pagination: payload.pagination,
        lastUpdated: Date.now(),
        error: undefined
      }
    };
  }

  public static handleOperationFailure(
    state: State,
    action: OperationFailureAction
  ): State {
    const { payload: errorMessage, status } = action;

    if (status) {
      return {
        ...state,
        [status]: {
          ...state[status],
          isLoading: false,
          isLoadingMore: false,
          isRefreshing: false,
          error: errorMessage
        }
      };
    }

    return state;
  }

  public static handleUpdatePublicationStatus(
    state: State,
    action: UpdatePublicationStatusAction
  ): State {
    const { publicationId, currentStatus, newStatus } = action;
    const fromState = state[currentStatus];
    const toState = state[newStatus];

    const publication = fromState.publications.find(
      pub => pub.recordId.toString() === publicationId
    );

    if (!publication) return state;

    const updatedFromPublications = fromState.publications.filter(
      pub => pub.recordId.toString() !== publicationId
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
      console.log('[PublicationContext] User changed, loading initial data');
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
        ValidationUtils.validateUser(user);

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

      return (
        statusState.pagination.hasNext &&
        !statusState.isLoadingMore
      );
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
