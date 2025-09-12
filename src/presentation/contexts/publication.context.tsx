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
import {
  createTables,
  getDBConnection,
  loadPublications,
  savePublications,
  clearStatus
} from '@/services/data/db.service';
import { SQLiteDatabase } from 'react-native-sqlite-storage';

const CONFIG = {
  DEFAULT_PAGE_SIZE: 5,
  INITIAL_PAGE: 1,
  SYNC_THRESHOLD: 5 * 60 * 1000,
  MAX_RETRIES: 1,
  PREFETCH_THRESHOLD: 0.8,
  BATCH_SIZE: 5,
  DEBOUNCE_DELAY: 300,
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
  readonly counts: CountsState;
  readonly error: string | null;
  readonly isOnline: boolean;
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
  isOnline: true
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

      const publications = action.resetPage
        ? validPublications
        : [...currentState.publications, ...validPublications];

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

      const allPublications = [
        ...currentState.publications,
        ...validNewPublications
      ];
      const filteredPublications = filterPublicationsByQuery(
        allPublications,
        searchQuery
      );

      return {
        ...state,
        [action.status]: {
          ...currentState,
          publications: allPublications,
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

    default:
      return state;
  }
}

// Custom hooks for specific functionality
const useDBConnection = () => {
  const connectionRef = useRef<Promise<SQLiteDatabase> | null>(null);

  const getDB = useCallback(async (): Promise<SQLiteDatabase> => {
    connectionRef.current ??= getDBConnection().then(async db => {
      await createTables(db);
      return db;
    });
    return connectionRef.current;
  }, []);

  return { getDB };
};

const useRequestManagement = () => {
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const prefetchingRef = useRef<Set<string>>(new Set());
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const backgroundRefreshRef = useRef<Map<string, boolean>>(new Map());
  const retryCountersRef = useRef<Map<string, number>>(new Map());
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

const useErrorHandler = () => {
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

      return {
        type: 'OPERATION_FAILURE' as const,
        payload: isNetworkError
          ? 'Error de conexión. Verifica tu internet.'
          : message,
        status,
        retryable
      };
    },
    []
  );
};

const PublicationContext = createContext<PublicationContextType | null>(null);

export const PublicationProvider = React.memo(
  ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [state, dispatch] = useReducer(publicationsReducer, initialState);
    const { getDB } = useDBConnection();
    const requestManager = useRequestManagement();
    const handleError = useErrorHandler();

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
          useCache && !searchQuery && !forceRefresh && page === 1;
        const makePagination = (len: number) => ({
          page: 1,
          size: len,
          total: len,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        });
        const makeCacheResult = (
          records: PublicationModelResponse[]
        ): SyncResult => ({
          response: { records, pagination: makePagination(records.length) },
          source: 'cache'
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
          if (requestManager.backgroundRefreshRef.current.get(refreshKey)) return;
          requestManager.refreshCountRef.current.set(status, refreshCount + 1);
          setTimeout(() => {
            void runBackgroundRefresh();
          }, CONFIG.BACKGROUND_REFRESH_DELAY);
        };

        const tryCacheFirst = async (): Promise<SyncResult | null> => {
          if (!shouldUseCacheFirst()) return null;
          try {
            const db = await getDB();
            const cached = await loadPublications(db, status, size, 0, {
              pageNumber: page,
              orderBy: 'loadOrder'
            });
            const validCached = validatePublications(cached);
            if (validCached.length > 0) {
              console.log(
                `[Cache Hit] ${validCached.length} publications for ${status} page ${page}`
              );
              scheduleBackgroundRefreshIfNeeded();
              return makeCacheResult(validCached);
            }
          } catch (cacheError) {
            console.warn(
              'Cache access failed, falling back to remote:',
              cacheError
            );
          }
          return null;
        };

        const loadFromRemote = async (): Promise<SyncResult> => {
          // console.log(`[Remote Load] Requesting ${status} publications for ${isAdmin ? 'admin' : 'user'}, page ${page}, size ${size}`);
          const response = await publicationService.getPublicationsByStatus({
            status,
            page,
            size,
            forAdmin: isAdmin
          });
          if (!response) throw new Error('No response received from server');

          const publications = validatePublications(response.records);
          const pagination =
            response.pagination || makePagination(publications.length);

          // const loadTime = Date.now() - startTime;
          // console.log(
          //   `[Remote Load] ${status}: ${publications.length} publications in ${loadTime}ms (${isAdmin ? 'admin' : 'user'})`
          // );

          if (!searchQuery && publications.length > 0) {
            getDB()
              .then(async db => {
                if (page === 1) {
                  await clearStatus(db, status, {
                    onlyOldPages: false,
                    currentPage: 1
                  });
                }
                const saveResult = await savePublications(
                  db,
                  publications,
                  status,
                  {
                    pageNumber: page,
                    pagination,
                    upsert: true
                  }
                );
                console.log(
                  `[Cache Update] ${saveResult.saved} publications saved for ${status} page ${page}, ${saveResult.errors} errors`
                );
              })
              .catch(err => console.warn('Cache save failed:', err));
          }

          return {
            response: { records: publications, pagination },
            source: 'remote'
          };
        };

        const tryCacheFallback = async (): Promise<SyncResult | null> => {
          if (!(useCache && !searchQuery)) return null;
          try {
            const db = await getDB();
            const cached = await loadPublications(db, status, size, 0, {
              pageNumber: page,
              orderBy: 'loadOrder'
            });
            const validCached = validatePublications(cached);
            if (validCached.length > 0) {
              console.log(
                `[Cache Fallback] Using ${validCached.length} cached items for ${status} page ${page} due to network error`
              );
              return makeCacheResult(validCached);
            }
          } catch (cacheError) {
            console.warn('Cache fallback also failed:', cacheError);
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
      [user, state, getDB, requestManager]
    );

    const loadStatus = useCallback(
      async (status: PublicationStatus, options: LoadOptions = {}) => {
        const { searchQuery = '', forceRefresh = false } = options;
        const currentState = state[status];
        const loadKey = `load-${status}-${searchQuery}`;

        // Cancel all other status requests when switching tabs
        const allStatuses: PublicationStatus[] = [PublicationStatus.PENDING, PublicationStatus.ACCEPTED, PublicationStatus.REJECTED];
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

          requestManager.retryCountersRef.current.set(status, 0);

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
      [state, syncPublications, handleError, requestManager]
    );

    const loadMore = useCallback(
      async (status: PublicationStatus, searchQuery = '') => {
        const currentState = state[status];


        if (!currentState.pagination.hasNext || currentState.isLoadingMore) {
          return;
        }

        dispatch({ type: 'FETCH_MORE_START', status });

        try {
          const nextPage = currentState.pagination.page + 1;
          const result = await syncPublications(
            status,
            nextPage,
            currentState.pagination.size,
            { searchQuery, useCache: !searchQuery }
          );

          dispatch({
            type: 'FETCH_MORE_SUCCESS',
            status,
            payload: result.response
          });
        } catch (err) {
          const errorAction = handleError(
            err,
            `Error loading more ${status}`,
            status,
            true
          );
          dispatch(errorAction);
        }
      },
      [state, syncPublications, handleError]
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

        requestManager.debounceTimersRef.current.set(status, newTimerId);
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

          const db = await getDB();
          await db.executeSql(
            `UPDATE publications SET status = ? WHERE recordId = ?`,
            [toStatus, recordId]
          );

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
      [state, getDB, loadCounts, handleError]
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
          console.warn(`Max retries reached for ${status}`);
          return;
        }

        // Don't retry if already loading or loading more
        if (currentState.isLoading || currentState.isLoadingMore) {
          console.log(`Retry blocked for ${status}: already loading`);
          return;
        }

        dispatch({ type: 'INCREMENT_RETRY', status });

        // Add delay before retry to avoid rapid successive attempts
        await new Promise(resolve => setTimeout(resolve, 1000 * (currentState.retryCount + 1)));
        await loadStatus(status, { forceRefresh: true });
      },
      [state, loadStatus]
    );

    // Memoized action creators
    const actions = useMemo(
      () => ({
        loadStatus,
        loadMoreStatus: loadMore,
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
          const canLoad = (
            currentState.pagination.hasNext &&
            !currentState.isLoadingMore
          );
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
