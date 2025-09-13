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
import { databaseService } from '@/services/data/db.service';

const CONFIG = {
  DEFAULT_PAGE_SIZE: 5,
  INITIAL_PAGE: 1,
  SYNC_THRESHOLD: 5 * 60 * 1000,
  MAX_RETRIES: 2, // Reducido de 3 a 2
  PREFETCH_THRESHOLD: 0.8,
  BATCH_SIZE: 5,
  DEBOUNCE_DELAY: 300,
  DEBOUNCE_LOAD_MORE: 1000, // Aumentado para evitar spam
  AGGRESSIVE_LOADING: false, // DESHABILITADO para evitar loops
  AUTO_LOAD_DELAY: 5000, // Aumentado a 5 segundos
  CIRCUIT_BREAKER_THRESHOLD: 5000, // Aumentado a 5 segundos
  CIRCUIT_BREAKER_RAPID_CALLS: 3, // Reducido a 3 llamadas
  CIRCUIT_BREAKER_COOLDOWN: 30000, // 30 segundos de cooldown
  REQUEST_TIMEOUT: 60000, // 60 segundos para requests lentos con imágenes base64
  RETRY_DELAY_BASE: 5000, // Aumentado de 2s a 5s
  SLOW_CONNECTION_THRESHOLD: 30000, // 30 segundos para detectar conexión lenta
  MAX_CACHE_FAILURES: 5, // Máximo de fallos de cache antes de circuit breaker
  CIRCUIT_BREAKER_TIMEOUT: 30000, // 30 segundos antes de reintentar cache
  RAPID_CALL_THRESHOLD: 3000, // 3 segundos entre llamadas para prevenir bucles
  MAX_RAPID_CALLS: 5, // Máximo de llamadas rápidas antes de activar circuit breaker
  MAX_BACKGROUND_REFRESHES: 1,
  BACKGROUND_REFRESH_DELAY: 10000
} as const;

interface PublicationState {
  readonly publications: PublicationModelResponse[];
  readonly filteredPublications: PublicationModelResponse[];
  readonly isLoading: boolean;
  readonly isLoadingMore: boolean;
  readonly pagination: {
    readonly page: number;
    readonly size: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNext: boolean;
    readonly hasPrev: boolean;
  };
  readonly lastSynced?: number;
  readonly currentSearchQuery: string;
  readonly error?: string;
  readonly retryCount: number;
}

interface CountsState {
  readonly users: number;
  readonly records: number;
  readonly loading: boolean;
  readonly lastUpdated?: number;
  readonly error?: string;
}

interface State {
  readonly [PublicationStatus.PENDING]: PublicationState;
  readonly [PublicationStatus.ACCEPTED]: PublicationState;
  readonly [PublicationStatus.REJECTED]: PublicationState;
  readonly retryCount: number;
  readonly lastSync: string | null;
  readonly cacheFailures: number;
  readonly cacheCircuitBreakerUntil: number | null;
  readonly isOnline: boolean;
  readonly counts: CountsState;
  readonly error: string | null;
  readonly lastApiCall: { [key: string]: number };
}

type Action =
  | { type: 'FETCH_STATUS_START'; status: PublicationStatus }
  | {
      type: 'FETCH_STATUS_SUCCESS';
      status: PublicationStatus;
      payload: PublicationResponse;
      searchQuery: string;
      resetPage: boolean;
      lastSynced: number;
    }
  | { type: 'FETCH_MORE_START'; status: PublicationStatus }
  | {
      type: 'FETCH_MORE_SUCCESS';
      status: PublicationStatus;
      payload: PublicationResponse;
    }
  | {
      type: 'FILTER_PUBLICATIONS';
      status: PublicationStatus;
      searchQuery: string;
    }
  | { type: 'FETCH_COUNTS_START' }
  | { type: 'FETCH_COUNTS_SUCCESS'; payload: CountsResponse }
  | {
      type: 'OPERATION_FAILURE';
      payload: string;
      status?: PublicationStatus;
      retryable?: boolean;
    }
  | { type: 'RESET_STATUS'; status: PublicationStatus }
  | { type: 'RESET_ALL' }
  | { type: 'INCREMENT_CACHE_FAILURES' }
  | { type: 'RESET_CACHE_FAILURES' }
  | { type: 'ACTIVATE_CACHE_CIRCUIT_BREAKER' }
  | {
      type: 'UPDATE_PUBLICATION_OPTIMISTIC';
      recordId: string;
      fromStatus: PublicationStatus;
      toStatus: PublicationStatus;
    }
  | {
      type: 'REVERT_PUBLICATION_UPDATE';
      recordId: string;
      fromStatus: PublicationStatus;
      toStatus: PublicationStatus;
      publication: PublicationModelResponse;
    }
  | { type: 'SET_ONLINE_STATUS'; isOnline: boolean }
  | { type: 'INCREMENT_RETRY'; status: PublicationStatus };

export interface PublicationContextType {
  readonly state: State;
  readonly actions: {
    readonly loadStatus: (
      status: PublicationStatus,
      options?: LoadOptions
    ) => Promise<void>;
    readonly loadMoreStatus: (
      status: PublicationStatus,
      searchQuery?: string
    ) => Promise<void>;
    readonly filterPublications: (
      status: PublicationStatus,
      searchQuery: string
    ) => void;
    readonly loadCounts: (forceRefresh?: boolean) => Promise<void>;
    readonly approve: (recordId: string) => Promise<boolean>;
    readonly reject: (recordId: string) => Promise<boolean>;
    readonly resetStatus: (status: PublicationStatus) => void;
    readonly resetAll: () => void;
    readonly retryOperation: (status: PublicationStatus) => Promise<void>;
    readonly prefetchNextPage: (status: PublicationStatus) => Promise<void>;
  };
  readonly utils: {
    readonly canLoadMore: (status: PublicationStatus) => boolean;
    readonly shouldPrefetch: (status: PublicationStatus) => boolean;
    readonly getStatusStats: (status: PublicationStatus) => StatusStats;
  };
}

interface LoadOptions {
  searchQuery?: string;
  forceRefresh?: boolean;
  useCache?: boolean;
}

interface StatusStats {
  totalItems: number;
  filteredItems: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  isFiltered: boolean;
  lastSync: string | null;
}

interface SyncResult {
  response: PublicationResponse;
  source: 'cache' | 'remote' | 'hybrid';
}

// Pure function factories
const createInitialPaginationState = () => ({
  page: CONFIG.INITIAL_PAGE,
  size: CONFIG.DEFAULT_PAGE_SIZE,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false
});

const createInitialPublicationState = (): PublicationState => ({
  publications: [],
  filteredPublications: [],
  isLoading: false,
  isLoadingMore: false,
  pagination: createInitialPaginationState(),
  currentSearchQuery: '',
  retryCount: 0
});

const createInitialCountsState = (): CountsState => ({
  users: 0,
  records: 0,
  loading: false
});

// Validation utilities
const validatePublications = (data: unknown): PublicationModelResponse[] => {
  if (!Array.isArray(data)) {
    console.warn('Invalid publications data - not an array:', typeof data);
    return [];
  }
  return data.filter(Boolean);
};

const validatePagination = (
  pagination: unknown,
  fallback: PublicationState['pagination']
) => {
  if (!pagination || typeof pagination !== 'object') {
    return fallback;
  }
  return pagination as PublicationState['pagination'];
};

// Search utility
const filterPublicationsByQuery = (
  publications: PublicationModelResponse[],
  query: string
): PublicationModelResponse[] => {
  if (!query) return publications;

  const searchTerm = query.toLowerCase();
  return publications.filter(
    pub =>
      pub.commonNoun?.toLowerCase().includes(searchTerm) ||
      pub.description?.toLowerCase().includes(searchTerm)
  );
};

const initialState: State = {
  [PublicationStatus.PENDING]: createInitialPublicationState(),
  [PublicationStatus.ACCEPTED]: createInitialPublicationState(),
  [PublicationStatus.REJECTED]: createInitialPublicationState(),
  counts: createInitialCountsState(),
  error: null,
  isOnline: true,
  retryCount: 0,
  lastSync: null,
  cacheFailures: 0,
  cacheCircuitBreakerUntil: null,
  lastApiCall: {}
};

function publicationsReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.isOnline };

    case 'FETCH_STATUS_START':
      return {
        ...state,
        [action.status]: {
          ...state[action.status],
          isLoading: true,
          isLoadingMore: false,
          error: undefined
        },
        error: null
      };

    case 'FETCH_MORE_START':
      return {
        ...state,
        [action.status]: {
          ...state[action.status],
          isLoadingMore: true
        }
      };

    case 'FETCH_STATUS_SUCCESS': {
      const currentState = state[action.status];
      const { records: newPublications, pagination } = action.payload;

      // console.log(`[REDUCER] FETCH_STATUS_SUCCESS for ${action.status}:`, {
      //   newPublicationsCount: newPublications?.length || 0,
      //   firstRecordId: newPublications?.[0]?.recordId,
      //   resetPage: action.resetPage
      // });

      const validPublications = validatePublications(newPublications);
      const validPagination = validatePagination(
        pagination,
        currentState.pagination
      );

      // For optimized pagination with memory management
      // Only keep a limited number of pages in memory (current + previous pages)
      const maxPagesInMemory = 3;
      const currentPage = validPagination.page || 1;

      let publications: PublicationModelResponse[];

      if (action.resetPage || currentPage === 1) {
        // Fresh start or first page
        publications = validPublications;
      } else {
        // Append new page but limit memory usage
        const allPublications = [
          ...currentState.publications,
          ...validPublications
        ];
        const totalPages = Math.ceil(
          allPublications.length / validPagination.size
        );

        if (totalPages > maxPagesInMemory) {
          // Keep only the last maxPagesInMemory worth of data
          const itemsToKeep = maxPagesInMemory * validPagination.size;
          publications = allPublications.slice(-itemsToKeep);
        } else {
          publications = allPublications;
        }
      }

      const filteredPublications = filterPublicationsByQuery(
        publications,
        action.searchQuery
      );

      // console.log(`[REDUCER] Final state for ${action.status}:`, {
      //   totalPublications: publications.length,
      //   filteredPublications: filteredPublications.length,
      //   firstPublicationId: publications[0]?.recordId
      // });

      return {
        ...state,
        [action.status]: {
          ...currentState,
          publications,
          filteredPublications,
          isLoading: false,
          isLoadingMore: false,
          pagination: validPagination,
          lastSynced: action.lastSynced,
          currentSearchQuery: action.searchQuery,
          retryCount: 0,
          error: undefined
        }
      };
    }

    case 'FETCH_MORE_SUCCESS': {
      const currentState = state[action.status];
      const { records: newPublications, pagination } = action.payload;
      const searchQuery = currentState.currentSearchQuery;

      const validNewPublications = validatePublications(newPublications);
      const validPagination = validatePagination(
        pagination,
        currentState.pagination
      );

      if (validNewPublications.length === 0) {
        return {
          ...state,
          [action.status]: {
            ...currentState,
            isLoadingMore: false,
            pagination: {
              ...currentState.pagination,
              hasNext: false
            }
          }
        };
      }

      // Apply memory management for load more as well
      const maxPagesInMemory = 3;
      const allPublications = [
        ...currentState.publications,
        ...validNewPublications
      ];

      // Limit memory usage by keeping only recent pages
      const pageSize = validPagination.size || CONFIG.DEFAULT_PAGE_SIZE;
      const maxItemsInMemory = maxPagesInMemory * pageSize;

      const publications =
        allPublications.length > maxItemsInMemory
          ? allPublications.slice(-maxItemsInMemory)
          : allPublications;
      const filteredPublications = filterPublicationsByQuery(
        publications,
        searchQuery
      );

      return {
        ...state,
        [action.status]: {
          ...currentState,
          publications,
          filteredPublications,
          isLoadingMore: false,
          pagination: validPagination,
          retryCount: 0
        }
      };
    }

    case 'FILTER_PUBLICATIONS': {
      const currentState = state[action.status];
      const filteredPublications = filterPublicationsByQuery(
        currentState.publications,
        action.searchQuery
      );

      return {
        ...state,
        [action.status]: {
          ...currentState,
          filteredPublications,
          currentSearchQuery: action.searchQuery
        }
      };
    }

    case 'UPDATE_PUBLICATION_OPTIMISTIC': {
      const { recordId, fromStatus } = action;
      const currentState = state[fromStatus];
      const recordIdStr = recordId;

      const updatedPublications = currentState.publications.filter(
        pub => pub.recordId.toString() !== recordIdStr
      );

      const updatedFiltered = currentState.filteredPublications.filter(
        pub => pub.recordId.toString() !== recordIdStr
      );

      return {
        ...state,
        [fromStatus]: {
          ...currentState,
          publications: updatedPublications,
          filteredPublications: updatedFiltered,
          pagination: {
            ...currentState.pagination,
            total: Math.max(0, currentState.pagination.total - 1)
          }
        }
      };
    }

    case 'REVERT_PUBLICATION_UPDATE': {
      const { fromStatus, publication } = action;
      const currentState = state[fromStatus];

      return {
        ...state,
        [fromStatus]: {
          ...currentState,
          publications: [...currentState.publications, publication],
          filteredPublications: [
            ...currentState.filteredPublications,
            publication
          ],
          pagination: {
            ...currentState.pagination,
            total: currentState.pagination.total + 1
          }
        }
      };
    }

    case 'FETCH_COUNTS_START':
      return {
        ...state,
        counts: {
          ...state.counts,
          loading: true,
          error: undefined
        }
      };

    case 'FETCH_COUNTS_SUCCESS':
      return {
        ...state,
        counts: {
          users: action.payload.users,
          records: action.payload.records,
          loading: false,
          lastUpdated: Date.now(),
          error: undefined
        }
      };

    case 'OPERATION_FAILURE': {
      const baseState = { ...state, error: action.payload };

      if (action.status) {
        return {
          ...baseState,
          [action.status]: {
            ...state[action.status],
            isLoading: false,
            isLoadingMore: false,
            error: action.payload,
            retryCount: action.retryable
              ? state[action.status].retryCount + 1
              : 0
          }
        };
      }

      return {
        ...baseState,
        counts: {
          ...state.counts,
          loading: false,
          error: action.payload
        }
      };
    }

    case 'INCREMENT_RETRY':
      return {
        ...state,
        [action.status]: {
          ...state[action.status],
          retryCount: state[action.status].retryCount + 1
        }
      };

    case 'RESET_STATUS':
      return {
        ...state,
        [action.status]: createInitialPublicationState()
      };

    case 'RESET_ALL':
      return initialState;

    case 'INCREMENT_CACHE_FAILURES':
      return {
        ...state,
        cacheFailures: state.cacheFailures + 1
      };

    case 'RESET_CACHE_FAILURES':
      return {
        ...state,
        cacheFailures: 0,
        cacheCircuitBreakerUntil: null
      };

    case 'ACTIVATE_CACHE_CIRCUIT_BREAKER':
      return {
        ...state,
        cacheCircuitBreakerUntil: Date.now() + CONFIG.CIRCUIT_BREAKER_TIMEOUT
      };

    default:
      return state;
  }
}

// Custom hooks for specific functionality

const useRequestManager = () => {
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const prefetchingRef = useRef<Set<string>>(new Set());
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const backgroundRefreshRef = useRef<Map<string, boolean>>(new Map());
  const retryCountersRef = useRef<Map<string, number[]>>(new Map());
  const refreshCountRef = useRef<Map<string, number>>(new Map());

  const cancelPreviousRequest = useCallback((key: string) => {
    const controller = abortControllersRef.current.get(key);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(key);
    }
  }, []);

  const cleanup = useCallback(() => {
    debounceTimersRef.current.forEach(timer => clearTimeout(timer));
    debounceTimersRef.current.clear();
    abortControllersRef.current.forEach(controller => controller.abort());
    abortControllersRef.current.clear();
    prefetchingRef.current.clear();
  }, []);

  return {
    abortControllersRef,
    prefetchingRef,
    debounceTimersRef,
    backgroundRefreshRef,
    retryCountersRef,
    refreshCountRef,
    cancelPreviousRequest,
    cleanup
  };
};

const useErrorHandler = (requestManager: ReturnType<typeof useRequestManager>) => {
  return useCallback(
    (
      error: unknown,
      fallback: string,
      status?: PublicationStatus,
      retryable = false
    ) => {
      const message = error instanceof Error ? error.message : fallback;
      console.error(`[PublicationContext] ${fallback}:`, error);

      const isNetworkError = [
        'CanceledError',
        'No response',
        'Network Error',
        'ECONNREFUSED'
      ].some(errorType => message.includes(errorType));

      // Track error for circuit breaker
      if (status && isNetworkError) {
        const now = Date.now();
        const errorHistory = requestManager.retryCountersRef.current.get(status) || [];
        errorHistory.push(now);
        // Keep only recent errors
        const recentErrors = errorHistory.filter((errorTime: number) => now - errorTime < CONFIG.CIRCUIT_BREAKER_COOLDOWN);
        requestManager.retryCountersRef.current.set(status, recentErrors);

        console.warn(`[Circuit Breaker] Network error recorded for ${status}. Recent failures: ${recentErrors.length}/${CONFIG.CIRCUIT_BREAKER_RAPID_CALLS}`);
      }

      return {
        type: 'OPERATION_FAILURE' as const,
        payload: isNetworkError
          ? 'Error de conexión. Verifica tu internet.'
          : message,
        status,
        retryable
      };
    },
    [requestManager.retryCountersRef]
  );
};

const PublicationContext = createContext<PublicationContextType | null>(null);

export const PublicationProvider = React.memo(
  ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [state, dispatch] = useReducer(publicationsReducer, initialState);
    // Database service is initialized automatically when needed
    const requestManager = useRequestManager();
    const handleError = useErrorHandler(requestManager);

    const syncPublications = useCallback(
      async (
        status: PublicationStatus,
        page: number,
        size: number,
        options: LoadOptions = {}
      ): Promise<SyncResult> => {
        const { searchQuery, forceRefresh = false, useCache = true } = options;
        const isAdmin = user?.role === 'Admin';
        const requestKey = `sync-${status}-${page}`;

        // Small helpers to flatten logic and reduce complexity
        const shouldUseCacheFirst = () =>
          useCache && !searchQuery && !forceRefresh;
        const makePagination = (len: number) => ({
          page: 1,
          size: len,
          total: len,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        });
        const runBackgroundRefresh = async () => {
          try {
            await syncPublications(status, page, size, {
              ...options,
              forceRefresh: true
            });
          } catch (err) {
            console.warn('Background refresh failed:', err);
          } finally {
            requestManager.backgroundRefreshRef.current.delete(
              `refresh-${status}`
            );
          }
        };

        const scheduleBackgroundRefreshIfNeeded = () => {
          const currentState = state[status];
          const needsRefresh =
            !currentState.lastSynced ||
            Date.now() - currentState.lastSynced > CONFIG.SYNC_THRESHOLD;
          if (!needsRefresh) return;
          const refreshCount =
            requestManager.refreshCountRef.current.get(status) || 0;
          if (refreshCount >= CONFIG.MAX_BACKGROUND_REFRESHES) return;
          const refreshKey = `refresh-${status}`;
          if (requestManager.backgroundRefreshRef.current.get(refreshKey))
            return;
          requestManager.refreshCountRef.current.set(status, refreshCount + 1);
          setTimeout(() => {
            void runBackgroundRefresh();
          }, CONFIG.BACKGROUND_REFRESH_DELAY);
        };

        const tryCacheFirst = async (): Promise<SyncResult | null> => {
          if (!shouldUseCacheFirst()) return null;

          // Check circuit breaker
          if (
            state.cacheCircuitBreakerUntil &&
            Date.now() < state.cacheCircuitBreakerUntil
          ) {
            console.log('[Cache] Circuit breaker active, skipping cache');
            return null;
          }

          try {
            await databaseService.initialize();
            // Calculate proper offset for incremental loading
            const offset = (page - 1) * size;
            const cached = await databaseService.loadPublications(
              status,
              size,
              offset
            );
            const validCached = validatePublications(cached);
            if (validCached.length > 0) {
              console.log(
                `[Cache Hit] ${validCached.length} publications for ${status} page ${page} (offset: ${offset}, size: ${size})`
              );
              // Reset cache failures on successful cache hit
              if (state.cacheFailures > 0) {
                dispatch({ type: 'RESET_CACHE_FAILURES' });
              }
              scheduleBackgroundRefreshIfNeeded();

              // Get total count from cache metadata to determine hasNext correctly
              const cacheMetadata =
                await databaseService.getCacheMetadata(status);
              console.log(
                `[Cache Metadata] Retrieved ${cacheMetadata.length} entries for ${status}:`,
                cacheMetadata
              );

              // Calculate total from cache metadata or fall back to conservative estimate
              let totalFromCache = validCached.length;
              let hasNext = false;
              const currentOffset = (page - 1) * size;

              if (cacheMetadata.length > 0) {
                totalFromCache = Math.max(
                  ...cacheMetadata.map(
                    (m: { totalCount: number }) => m.totalCount
                  )
                );
                console.log(
                  `[Cache Total] Using metadata total: ${totalFromCache}`
                );
                hasNext = currentOffset + validCached.length < totalFromCache;
              } else {
                console.warn(
                  '[Cache Total] No metadata found, using conservative estimate'
                );
                // Conservative fallback: only show hasNext if we have a full page AND we're on page 1
                // This prevents infinite pagination when we don't have metadata
                if (page === 1 && validCached.length === size) {
                  // We have a full first page, there might be more
                  totalFromCache = validCached.length + 1;
                  hasNext = true;
                } else {
                  // Either not page 1 or not a full page - assume we're at the end
                  totalFromCache = (page - 1) * size + validCached.length;
                  hasNext = false;
                }
              }

              console.log(
                `[Cache Pagination] page=${page}, size=${size}, offset=${currentOffset}, cached=${validCached.length}, total=${totalFromCache}, hasNext=${hasNext}`
              );
              return {
                response: {
                  records: validCached,
                  pagination: {
                    hasNext,
                    hasPrev: page > 1,
                    total: totalFromCache,
                    totalPages: Math.ceil(totalFromCache / size),
                    page,
                    size
                  }
                },
                source: 'cache'
              };
            }
          } catch (cacheError) {
            console.warn(
              'Cache access failed, falling back to remote:',
              cacheError
            );
            // Increment cache failures and activate circuit breaker if needed
            dispatch({ type: 'INCREMENT_CACHE_FAILURES' });
            if (state.cacheFailures + 1 >= CONFIG.MAX_CACHE_FAILURES) {
              console.warn(
                '[Cache] Too many failures, activating circuit breaker'
              );
              dispatch({ type: 'ACTIVATE_CACHE_CIRCUIT_BREAKER' });
            }
          }
          return null;
        };

        const loadFromRemote = async (): Promise<SyncResult> => {
          console.log(
            `[Remote Load] Requesting ${status} publications for ${isAdmin ? 'admin' : 'user'}, page ${page}, size ${size} (may be slow due to base64 images)`
          );

          // Crear AbortController con timeout extendido para imágenes base64
          const timeoutController = new AbortController();
          const timeoutId = setTimeout(() => {
            timeoutController.abort();
          }, CONFIG.REQUEST_TIMEOUT);

          try {
            const response = await publicationService.getPublicationsByStatus({
              status,
              page,
              size,
              forAdmin: isAdmin
            });

            clearTimeout(timeoutId);
            if (!response) throw new Error('No response received from server');

            const publications = validatePublications(response.records);
            const pagination =
              response.pagination || makePagination(publications.length);

            // const loadTime = Date.now() - startTime;
            // console.log(
            //   `[Remote Load] ${status}: ${publications.length} publications in ${loadTime}ms (${isAdmin ? 'admin' : 'user'})`
            // );

            if (!searchQuery && publications.length > 0) {
              databaseService
                .initialize()
                .then(async () => {
                  // Only clear cache on first page AND when force refresh is requested
                  // This prevents the infinite loop of clearing cache on every load
                  if (page === 1 && forceRefresh) {
                    console.log(
                      `[Cache Clear] Clearing cache for ${status} due to force refresh`
                    );
                    await databaseService.clearCache(status);
                  }
                  await databaseService.savePublications(
                    publications,
                    status,
                    page,
                    pagination.total
                  );
                  console.log(
                    `[Cache Update] ${publications.length} publications saved for ${status} page ${page}`
                  );
                })
                .catch((err: Error) => console.warn('Cache save failed:', err));
            }

            return {
              response: { records: publications, pagination },
              source: 'remote'
            };
          } catch (error) {
            clearTimeout(timeoutId);
            if ((error as Error).name === 'AbortError') {
              throw new Error(
                'Request timeout - El servidor está tardando mucho en responder debido a las imágenes'
              );
            }
            throw error;
          }
        };

        const tryCacheFallback = async (): Promise<SyncResult | null> => {
          if (!(useCache && !searchQuery)) return null;

          // Check circuit breaker for fallback as well
          if (
            state.cacheCircuitBreakerUntil &&
            Date.now() < state.cacheCircuitBreakerUntil
          ) {
            console.log(
              '[Cache Fallback] Circuit breaker active, skipping cache fallback'
            );
            return null;
          }

          try {
            await databaseService.initialize();
            // Calculate proper offset for incremental loading
            const offset = (page - 1) * size;
            const cached = await databaseService.loadPublications(
              status,
              size,
              offset
            );
            const validCached = validatePublications(cached);
            if (validCached.length > 0) {
              console.log(
                `[Cache Fallback] Using ${validCached.length} cached items for ${status} page ${page} (offset: ${offset}) due to network error`
              );

              // Get total count for proper pagination
              const cacheMetadata =
                await databaseService.getCacheMetadata(status);
              const totalCount = cacheMetadata.reduce(
                (sum, meta) => sum + meta.totalCount,
                0
              );
              const totalPages = Math.ceil(totalCount / size);
              const hasNext = page < totalPages;

              return {
                response: {
                  records: validCached,
                  pagination: {
                    page,
                    size,
                    total: totalCount,
                    totalPages,
                    hasNext,
                    hasPrev: page > 1
                  }
                },
                source: 'cache'
              };
            }
          } catch (cacheError) {
            console.warn('Cache fallback also failed:', cacheError);
            // Increment cache failures for fallback errors too
            dispatch({ type: 'INCREMENT_CACHE_FAILURES' });
            if (state.cacheFailures + 1 >= CONFIG.MAX_CACHE_FAILURES) {
              console.warn(
                '[Cache Fallback] Too many failures, activating circuit breaker'
              );
              dispatch({ type: 'ACTIVATE_CACHE_CIRCUIT_BREAKER' });
            }
          }
          return null;
        };

        // Handle background refresh lock
        if (forceRefresh && page === 1) {
          const refreshKey = `refresh-${status}`;
          if (requestManager.backgroundRefreshRef.current.get(refreshKey)) {
            console.log(`Refresh already in progress for ${status}`);
            throw new Error('Refresh already in progress');
          }
          requestManager.backgroundRefreshRef.current.set(refreshKey, true);
        }

        requestManager.cancelPreviousRequest(requestKey);
        const controller = new AbortController();
        requestManager.abortControllersRef.current.set(requestKey, controller);

        try {
          const cacheFirst = await tryCacheFirst();
          if (cacheFirst) return cacheFirst;

          // 2) Load from server
          const remote = await loadFromRemote();
          return remote;
        } catch (err) {
          const cacheFallback = await tryCacheFallback();
          if (cacheFallback) return cacheFallback;
          throw err;
        } finally {
          requestManager.abortControllersRef.current.delete(requestKey);
        }
      },
      [user, state, requestManager]
    );

    const loadStatus = useCallback(
      async (status: PublicationStatus, options: LoadOptions = {}) => {
        const { searchQuery = '', forceRefresh = false } = options;
        const currentState = state[status];
        const loadKey = `load-${status}-${searchQuery}`;

        // Circuit breaker for rapid calls
        const now = Date.now();
        const lastCallKey = `${status}_${user?.role === 'Admin' ? 'admin' : 'user'}`;
        const lastCall = state.lastApiCall[lastCallKey] || 0;
        const timeSinceLastCall = now - lastCall;
        if (timeSinceLastCall < CONFIG.CIRCUIT_BREAKER_TIMEOUT) {
          console.log(
            `[Circuit Breaker] Blocking rapid call for ${status}, last call was ${timeSinceLastCall}ms ago`
          );
          throw new Error(`Too many rapid requests for ${status}`);
        }

        // Track rapid calls and activate global circuit breaker if needed
        const rapidCallsKey = `rapid-calls-${status}`;
        const rapidCallsData = requestManager.retryCountersRef.current.get(rapidCallsKey) || [];
        const rapidCalls = Array.isArray(rapidCallsData) ? rapidCallsData.length : 0;

        if (now - lastCall < CONFIG.RAPID_CALL_THRESHOLD) {
          const newRapidCalls = rapidCalls + 1;
          // Store as array of timestamps for consistency with the Map type
          const rapidCallsArray = Array.isArray(rapidCallsData) ? rapidCallsData : [];
          rapidCallsArray.push(now);
          requestManager.retryCountersRef.current.set(
            rapidCallsKey,
            rapidCallsArray
          );

          if (newRapidCalls >= CONFIG.MAX_RAPID_CALLS) {
            console.error(
              `[EMERGENCY CIRCUIT BREAKER] Too many rapid calls detected for ${status}. Activating emergency stop.`
            );
            dispatch({ type: 'ACTIVATE_CACHE_CIRCUIT_BREAKER' });
            return;
          }
        } else {
          // Reset rapid call counter if enough time has passed
          requestManager.retryCountersRef.current.set(rapidCallsKey, []);
        }

        requestManager.refreshCountRef.current.set(rapidCallsKey, now);

        // Cancel all other status requests when switching tabs
        const allStatuses: PublicationStatus[] = [
          PublicationStatus.PENDING,
          PublicationStatus.ACCEPTED,
          PublicationStatus.REJECTED
        ];
        allStatuses.forEach(otherStatus => {
          if (otherStatus !== status) {
            const otherLoadKey = `load-${otherStatus}-${searchQuery}`;
            requestManager.cancelPreviousRequest(otherLoadKey);
            const otherSyncKey = `sync-${otherStatus}`;
            requestManager.cancelPreviousRequest(otherSyncKey);
          }
        });

        // Prevent duplicate requests
        if (requestManager.abortControllersRef.current.has(loadKey)) {
          console.log(`Load already in progress for ${loadKey}`);
          return;
        }

        // Prevent loading if already loading
        if (currentState.isLoading && !forceRefresh) {
          console.log(`Status ${status} already loading, skipping`);
          return;
        }

        // Additional check: if we have recent data and no force refresh, skip
        // Reducir tiempo de "recent data" para ser más agresivo en sincronización
        if (
          !forceRefresh &&
          currentState.lastSynced &&
          now - currentState.lastSynced < 1000 && // 1 segundo (reducido de 5)
          currentState.publications.length > 0
        ) {
          console.log(
            `[Skip Load] Recent data exists for ${status}, skipping unnecessary load`
          );
          return;
        }

        dispatch({ type: 'FETCH_STATUS_START', status });
        const controller = new AbortController();
        requestManager.abortControllersRef.current.set(loadKey, controller);

        try {
          const result = await syncPublications(
            status,
            CONFIG.INITIAL_PAGE,
            currentState.pagination.size || CONFIG.DEFAULT_PAGE_SIZE,
            { searchQuery, forceRefresh, useCache: !searchQuery }
          );

          requestManager.retryCountersRef.current.set(status, []);

          dispatch({
            type: 'FETCH_STATUS_SUCCESS',
            status,
            payload: result.response,
            resetPage: true,
            searchQuery,
            lastSynced: Date.now()
          });
        } catch (err) {
          const errorAction = handleError(
            err,
            `Error loading ${status}`,
            status,
            true
          );
          dispatch(errorAction);
        } finally {
          requestManager.abortControllersRef.current.delete(loadKey);
        }
      },
      [handleError, requestManager, state, syncPublications, user?.role]
    );

    const loadMore = useCallback(
      async (status: PublicationStatus, searchQuery = '') => {
        const currentState = state[status];

        if (!currentState.pagination.hasNext || currentState.isLoadingMore) {
          return;
        }

        // Circuit breaker: prevent loadMore if too many recent failures
        const now = Date.now();
        const recentErrors = requestManager.retryCountersRef.current.get(status) || [];
        const recentFailures = recentErrors.filter((errorTime: number) => now - errorTime < CONFIG.CIRCUIT_BREAKER_COOLDOWN);

        // Also check rapid calls for this specific operation
        const rapidCallsKey = `rapid-calls-${status}`;
        const rapidCallsData = requestManager.retryCountersRef.current.get(rapidCallsKey) || [];
        const recentRapidCalls = Array.isArray(rapidCallsData) ? rapidCallsData.filter((callTime: number) => now - callTime < CONFIG.RAPID_CALL_THRESHOLD) : [];

        // Use >= for strict threshold enforcement
        if (recentFailures.length >= CONFIG.CIRCUIT_BREAKER_RAPID_CALLS) {
          console.warn(`[Circuit Breaker] LoadMore blocked for ${status} due to recent failures (${recentFailures.length}/${CONFIG.CIRCUIT_BREAKER_RAPID_CALLS})`);
          return;
        }

        if (recentRapidCalls.length >= CONFIG.MAX_RAPID_CALLS) {
          console.warn(`[Circuit Breaker] LoadMore blocked for ${status} due to rapid calls (${recentRapidCalls.length}/${CONFIG.MAX_RAPID_CALLS})`);
          return;
        }

        // Pre-register this attempt to prevent race conditions
        const loadMoreAttemptKey = `loadmore-${status}`;
        const loadMoreAttempts = requestManager.retryCountersRef.current.get(loadMoreAttemptKey) || [];
        loadMoreAttempts.push(now);
        requestManager.retryCountersRef.current.set(loadMoreAttemptKey, loadMoreAttempts);

        // Check if we're making too many loadMore attempts
        const recentLoadMoreAttempts = loadMoreAttempts.filter((attemptTime: number) => now - attemptTime < CONFIG.RAPID_CALL_THRESHOLD);
        if (recentLoadMoreAttempts.length > CONFIG.CIRCUIT_BREAKER_RAPID_CALLS) {
          console.warn(`[Circuit Breaker] LoadMore blocked for ${status} due to too many attempts (${recentLoadMoreAttempts.length}/${CONFIG.CIRCUIT_BREAKER_RAPID_CALLS})`);
          dispatch({
            type: 'OPERATION_FAILURE',
            status,
            payload: 'Circuit breaker activated - too many failed attempts',
            retryable: false
          });
          return;
        }

        dispatch({ type: 'FETCH_MORE_START', status });

        try {
          const nextPage = currentState.pagination.page + 1;
          const result = await syncPublications(
            status,
            nextPage,
            currentState.pagination.size || CONFIG.DEFAULT_PAGE_SIZE,
            { searchQuery, useCache: !searchQuery }
          );

          dispatch({
            type: 'FETCH_MORE_SUCCESS',
            status,
            payload: result.response
          });
        } catch (err) {
          // Track this error for circuit breaker
          const now = Date.now();
          const errorHistory = requestManager.retryCountersRef.current.get(status) || [];
          errorHistory.push(now);
          // Keep only recent errors
          const recentErrors = errorHistory.filter((errorTime: number) => now - errorTime < CONFIG.CIRCUIT_BREAKER_COOLDOWN);
          requestManager.retryCountersRef.current.set(status, recentErrors);

          console.warn(`[Circuit Breaker] LoadMore error recorded for ${status}. Recent failures: ${recentErrors.length}/${CONFIG.CIRCUIT_BREAKER_RAPID_CALLS}`);

          const errorAction = handleError(
            err,
            `Error loading more ${status}`,
            status,
            true
          );
          dispatch(errorAction);
        }
      },
      [state, syncPublications, handleError, requestManager.retryCountersRef]
    );

    const filterPublications = useCallback(
      (status: PublicationStatus, searchQuery: string) => {
        const timerId = requestManager.debounceTimersRef.current.get(status);
        if (timerId) {
          clearTimeout(timerId);
        }

        const newTimerId = setTimeout(() => {
          dispatch({
            type: 'FILTER_PUBLICATIONS',
            status,
            searchQuery
          });
          requestManager.debounceTimersRef.current.delete(status);
        }, CONFIG.DEBOUNCE_DELAY);

        requestManager.debounceTimersRef.current.set(
          status,
          newTimerId as NodeJS.Timeout
        );
      },
      [requestManager]
    );

    const loadCounts = useCallback(
      async (forceRefresh = false) => {
        const { counts } = state;

        if (
          !forceRefresh &&
          counts.lastUpdated &&
          Date.now() - counts.lastUpdated < CONFIG.SYNC_THRESHOLD
        ) {
          return;
        }

        try {
          dispatch({ type: 'FETCH_COUNTS_START' });
          const countsData = await publicationService.getCounts();
          dispatch({ type: 'FETCH_COUNTS_SUCCESS', payload: countsData });
        } catch (err) {
          const errorAction = handleError(err, 'Error loading counts');
          dispatch(errorAction);
        }
      },
      [state, handleError]
    );

    const updatePublicationStatus = useCallback(
      async (
        recordId: string,
        fromStatus: PublicationStatus,
        toStatus: PublicationStatus,
        action: 'accept' | 'reject'
      ): Promise<boolean> => {
        const publication = state[fromStatus].publications.find(
          p => p.recordId.toString() === recordId
        );

        if (!publication) {
          throw new Error('Publication not found');
        }

        dispatch({
          type: 'UPDATE_PUBLICATION_OPTIMISTIC',
          recordId,
          fromStatus,
          toStatus
        });

        try {
          if (action === 'accept') {
            await publicationService.acceptPublication(recordId);
          } else {
            await publicationService.rejectPublication(recordId);
          }

          await databaseService.initialize();
          // Note: The new database service doesn't expose direct SQL execution
          // Status updates are handled through the API and cache refresh

          await loadCounts(true);
          return true;
        } catch (error) {
          dispatch({
            type: 'REVERT_PUBLICATION_UPDATE',
            recordId,
            fromStatus,
            toStatus,
            publication
          });

          const errorAction = handleError(
            error,
            `Error ${action}ing publication`
          );
          dispatch(errorAction);
          return false;
        }
      },
      [state, loadCounts, handleError]
    );

    const prefetchNextPage = useCallback(
      async (status: PublicationStatus) => {
        const currentState = state[status];
        const nextPage = currentState.pagination.page + 1;

        if (!currentState.pagination.hasNext) {
          return;
        }

        const prefetchKey = `${status}-${nextPage}`;

        if (requestManager.prefetchingRef.current.has(prefetchKey)) {
          return;
        }

        requestManager.prefetchingRef.current.add(prefetchKey);

        try {
          await syncPublications(
            status,
            nextPage,
            currentState.pagination.size,
            { useCache: false }
          );
          console.log(`[Prefetch] Next page for ${status} loaded`);
        } catch (error) {
          console.warn(`[Prefetch] Failed for ${status}:`, error);
        } finally {
          requestManager.prefetchingRef.current.delete(prefetchKey);
        }
      },
      [state, syncPublications, requestManager]
    );

    const retryOperation = useCallback(
      async (status: PublicationStatus) => {
        const currentState = state[status];
        if (currentState.retryCount >= CONFIG.MAX_RETRIES) {
          console.warn(`[Circuit Breaker] Max retries reached for ${status}, stopping auto-retry`);
          return;
        }

        // Don't retry if already loading or loading more
        if (currentState.isLoading || currentState.isLoadingMore) {
          console.log(`[Circuit Breaker] Retry blocked for ${status}: already loading`);
          return;
        }

        // Circuit breaker: check for recent failures
        const now = Date.now();
        const recentErrors = requestManager.retryCountersRef.current.get(status) || [];
        const recentFailures = recentErrors.filter((errorTime: number) => now - errorTime < CONFIG.CIRCUIT_BREAKER_COOLDOWN);

        if (recentFailures.length >= CONFIG.CIRCUIT_BREAKER_RAPID_CALLS) {
          console.warn(`[Circuit Breaker] Too many recent failures for ${status}, cooling down for ${CONFIG.CIRCUIT_BREAKER_COOLDOWN/1000}s`);
          return;
        }

        dispatch({ type: 'INCREMENT_RETRY', status });

        // Exponential backoff with longer delays for slow backend
        const retryDelay =
          CONFIG.RETRY_DELAY_BASE * Math.pow(2, currentState.retryCount);
        console.log(
          `[Retry] Waiting ${retryDelay}ms before retry attempt ${currentState.retryCount + 1}/${CONFIG.MAX_RETRIES} for ${status}`
        );
        await new Promise(resolve => setTimeout(resolve, retryDelay));

        // Only retry if we're still in a valid state
        const latestState = state[status];
        if (!latestState.isLoading && !latestState.isLoadingMore) {
          await loadStatus(status, { forceRefresh: true });
        }
      },
      [state, loadStatus, requestManager.retryCountersRef]
    );

    const actions = useMemo(
      () => ({
        loadStatus: (
          status: PublicationStatus,
          options: { forceRefresh?: boolean; searchQuery?: string } = {}
        ) => loadStatus(status, options),
        loadMoreStatus: (status: PublicationStatus, searchQuery = '') =>
          loadMore(status, searchQuery),
        filterPublications,
        loadCounts,
        approve: (recordId: string) =>
          updatePublicationStatus(
            recordId,
            PublicationStatus.PENDING,
            PublicationStatus.ACCEPTED,
            'accept'
          ),
        reject: (recordId: string) =>
          updatePublicationStatus(
            recordId,
            PublicationStatus.PENDING,
            PublicationStatus.REJECTED,
            'reject'
          ),
        resetStatus: (status: PublicationStatus) =>
          dispatch({ type: 'RESET_STATUS', status }),
        resetAll: () => dispatch({ type: 'RESET_ALL' }),
        retryOperation,
        prefetchNextPage
      }),
      [
        loadStatus,
        loadMore,
        filterPublications,
        loadCounts,
        updatePublicationStatus,
        retryOperation,
        prefetchNextPage
      ]
    );

    const utils = useMemo(
      () => ({
        canLoadMore: (status: PublicationStatus) => {
          const currentState = state[status];
          // For pagination, we only need to check hasNext and isLoadingMore
          // isLoading is for initial load, not for pagination
          const canLoad =
            currentState.pagination.hasNext && !currentState.isLoadingMore;
          return canLoad;
        },

        shouldPrefetch: (status: PublicationStatus) => {
          const currentState = state[status];
          const threshold = Math.floor(
            currentState.pagination.size * CONFIG.PREFETCH_THRESHOLD
          );
          return (
            currentState.filteredPublications.length >= threshold &&
            currentState.pagination.hasNext
          );
        },

        getStatusStats: (status: PublicationStatus): StatusStats => {
          const currentState = state[status];
          return {
            totalItems: currentState.pagination.total,
            filteredItems: currentState.filteredPublications.length,
            currentPage: currentState.pagination.page,
            totalPages: currentState.pagination.totalPages,
            hasNext: currentState.pagination.hasNext,
            hasPrev: currentState.pagination.hasPrev,
            isFiltered: currentState.currentSearchQuery.length > 0,
            lastSync: currentState.lastSynced
              ? new Date(currentState.lastSynced).toLocaleTimeString()
              : null
          };
        }
      }),
      [state]
    );

    const contextValue = useMemo(
      () => ({ state, actions, utils }),
      [state, actions, utils]
    );

    useEffect(() => {
      return () => {
        requestManager.cleanup();
      };
    }, [requestManager]);

    return (
      <PublicationContext.Provider value={contextValue}>
        {children}
      </PublicationContext.Provider>
    );
  }
);

PublicationProvider.displayName = 'PublicationProvider';

export const usePublications = (): PublicationContextType => {
  const context = useContext(PublicationContext);
  if (!context) {
    throw new Error(
      'usePublications must be used within a PublicationProvider'
    );
  }
  return context;
};

export const usePublicationStatus = (status: PublicationStatus) => {
  const { state, actions, utils } = usePublications();

  return useMemo(
    () => ({
      data: state[status],
      publications: state[status].filteredPublications,
      isLoading: state[status].isLoading,
      isLoadingMore: state[status].isLoadingMore,
      pagination: state[status].pagination,
      error: state[status].error,
      canLoadMore: utils.canLoadMore(status),
      shouldPrefetch: utils.shouldPrefetch(status),
      stats: utils.getStatusStats(status),
      load: (options?: LoadOptions) => actions.loadStatus(status, options),
      loadMore: (searchQuery?: string) =>
        actions.loadMoreStatus(status, searchQuery),
      filter: (searchQuery: string) =>
        actions.filterPublications(status, searchQuery),
      reset: () => actions.resetStatus(status),
      retry: () => actions.retryOperation(status),
      prefetch: () => actions.prefetchNextPage(status)
    }),
    [status, state, actions, utils]
  );
};
