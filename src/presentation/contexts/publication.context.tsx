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
  CountsResponse
} from '@/domain/models/publication.models';
import {
  publicationService,
  PublicationStatus
} from '@/services/publication/publication.service';
import {
  createTable,
  getDBConnection,
  loadPublications,
  savePublications,
  clearStatus
} from '@/services/data/db.service';
import { SQLiteDatabase } from 'react-native-sqlite-storage';

const CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  INITIAL_PAGE: 1,
  SYNC_THRESHOLD: 5 * 60 * 1000,
  MAX_RETRIES: 3,
  PREFETCH_THRESHOLD: 0.8,
  BATCH_SIZE: 5,
  DEBOUNCE_DELAY: 300
} as const;

interface PublicationState {
  readonly publications: PublicationResponse[];
  readonly filteredPublications: PublicationResponse[];
  readonly isLoading: boolean;
  readonly isLoadingMore: boolean;
  readonly page: number;
  readonly hasMore: boolean;
  readonly lastSynced?: number;
  readonly currentSearchQuery: string;
  readonly pageSize: number;
  readonly error?: string;
  readonly retryCount: number;
}

interface State {
  readonly [PublicationStatus.PENDING]: PublicationState;
  readonly [PublicationStatus.ACCEPTED]: PublicationState;
  readonly [PublicationStatus.REJECTED]: PublicationState;
  readonly counts: {
    readonly users: number;
    readonly records: number;
    readonly loading: boolean;
    readonly lastUpdated?: number;
    readonly error?: string;
  };
  readonly error: string | null;
  readonly isOnline: boolean;
}

type Action =
  | { type: 'FETCH_STATUS_START'; status: PublicationStatus }
  | {
      type: 'FETCH_STATUS_SUCCESS';
      status: PublicationStatus;
      payload: PublicationResponse[];
      filteredPayload: PublicationResponse[];
      hasMore: boolean;
      searchQuery: string;
      resetPage: boolean;
      lastSynced: number;
    }
  | { type: 'FETCH_MORE_START'; status: PublicationStatus }
  | {
      type: 'FETCH_MORE_SUCCESS';
      status: PublicationStatus;
      payload: PublicationResponse[];
      hasMore: boolean;
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
      publication: PublicationResponse;
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
  isFiltered: boolean;
  lastSync: string | null;
}

interface SyncResult {
  publications: PublicationResponse[];
  filtered: PublicationResponse[];
  source: 'cache' | 'remote' | 'hybrid';
  hasMore: boolean;
}

const createInitialPublicationState = (): PublicationState => ({
  publications: [],
  filteredPublications: [],
  isLoading: false,
  isLoadingMore: false,
  page: CONFIG.INITIAL_PAGE,
  hasMore: true,
  currentSearchQuery: '',
  pageSize: CONFIG.DEFAULT_PAGE_SIZE,
  retryCount: 0
});

const initialState: State = {
  [PublicationStatus.PENDING]: createInitialPublicationState(),
  [PublicationStatus.ACCEPTED]: createInitialPublicationState(),
  [PublicationStatus.REJECTED]: createInitialPublicationState(),
  counts: {
    users: 0,
    records: 0,
    loading: false
  },
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
      const newPublications = action.resetPage
        ? action.payload
        : [...currentState.publications, ...action.payload];

      const newFiltered = action.resetPage
        ? action.filteredPayload
        : [...currentState.filteredPublications, ...action.filteredPayload];

      return {
        ...state,
        [action.status]: {
          ...currentState,
          publications: newPublications,
          filteredPublications: newFiltered,
          isLoading: false,
          isLoadingMore: false,
          page: action.resetPage
            ? CONFIG.INITIAL_PAGE + 1
            : currentState.page + 1,
          hasMore: action.hasMore,
          lastSynced: action.lastSynced,
          currentSearchQuery: action.searchQuery,
          retryCount: 0,
          error: undefined
        }
      };
    }

    case 'FETCH_MORE_SUCCESS': {
      const currentState = state[action.status];
      const searchQuery = currentState.currentSearchQuery;

      if (action.payload.length === 0) {
        return {
          ...state,
          [action.status]: {
            ...currentState,
            isLoadingMore: false,
            hasMore: false
          }
        };
      }

      let newFiltered: PublicationResponse[];
      if (searchQuery) {
        const filtered = action.payload.filter(
          p =>
            p.commonNoun?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        newFiltered = [...currentState.filteredPublications, ...filtered];
      } else {
        newFiltered = [...currentState.filteredPublications, ...action.payload];
      }

      return {
        ...state,
        [action.status]: {
          ...currentState,
          publications: [...currentState.publications, ...action.payload],
          filteredPublications: newFiltered,
          isLoadingMore: false,
          page: currentState.page + 1,
          hasMore: action.hasMore,
          retryCount: 0
        }
      };
    }

    case 'FILTER_PUBLICATIONS': {
      const currentState = state[action.status];
      const searchQuery = action.searchQuery.toLowerCase();

      const filtered = searchQuery
        ? currentState.publications.filter(
            pub =>
              pub.commonNoun?.toLowerCase().includes(searchQuery) ||
              pub.description?.toLowerCase().includes(searchQuery)
          )
        : currentState.publications;

      return {
        ...state,
        [action.status]: {
          ...currentState,
          filteredPublications: filtered,
          currentSearchQuery: action.searchQuery,
          hasMore:
            filtered.length < currentState.publications.length ||
            currentState.hasMore
        }
      };
    }

    case 'UPDATE_PUBLICATION_OPTIMISTIC': {
      const { recordId, fromStatus } = action;
      const currentState = state[fromStatus];

      const updatedPublications = currentState.publications.filter(
        pub => pub.recordId.toString() !== recordId
      );

      const updatedFiltered = currentState.filteredPublications.filter(
        pub => pub.recordId.toString() !== recordId
      );

      return {
        ...state,
        [fromStatus]: {
          ...currentState,
          publications: updatedPublications,
          filteredPublications: updatedFiltered
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
          ]
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
      const baseState = {
        ...state,
        error: action.payload
      };

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

const PublicationContext = createContext<PublicationContextType | null>(null);

export const PublicationProvider = React.memo(
  ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [state, dispatch] = useReducer(publicationsReducer, initialState);

    const dbConnectionRef = useRef<Promise<SQLiteDatabase> | null>(null);
    const prefetchingRef = useRef<Set<string>>(new Set());
    const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
    const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

    const backgroundRefreshRef = useRef<Map<string, boolean>>(new Map());

    const getDB = useCallback(async (): Promise<SQLiteDatabase> => {
      if (!dbConnectionRef.current) {
        dbConnectionRef.current = getDBConnection().then(async db => {
          await createTable(db);
          return db;
        });
      }
      return dbConnectionRef.current;
    }, []);

    const retryCountersRef = useRef<Map<string, number>>(new Map());

    const handleError = useCallback(
      (
        error: unknown,
        fallback: string,
        status?: PublicationStatus,
        retryable = false
      ) => {
        const message = error instanceof Error ? error.message : fallback;
        console.error(`[PublicationContext] ${fallback}:`, error);

        const isNetworkError =
          message.includes('CanceledError') ||
          message.includes('No response') ||
          message.includes('Network Error') ||
          message.includes('ECONNREFUSED');

        if (status && retryable) {
          const currentCount = retryCountersRef.current.get(status) || 0;
          const maxRetries = isNetworkError ? 2 : CONFIG.MAX_RETRIES;

          if (currentCount >= maxRetries) {
            console.warn(`Max retries reached for ${status}, not retrying`);
            retryable = false;
            retryCountersRef.current.set(status, 0);
          } else {
            retryCountersRef.current.set(status, currentCount + 1);
          }
        }

        dispatch({
          type: 'OPERATION_FAILURE',
          payload: isNetworkError
            ? 'Error de conexión. Verifica tu internet.'
            : message,
          status,
          retryable
        });
      },
      []
    );

    const cancelPreviousRequest = useCallback((key: string) => {
      const controller = abortControllersRef.current.get(key);
      if (controller) {
        controller.abort();
        abortControllersRef.current.delete(key);
      }
    }, []);

    const MAX_BACKGROUND_REFRESHES = 3;
    const refreshCountRef = useRef<Map<string, number>>(new Map());

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

        if (forceRefresh && page === 1) {
          const refreshKey = `refresh-${status}`;
          if (backgroundRefreshRef.current.get(refreshKey)) {
            console.log(`Background refresh already in progress for ${status}`);
            throw new Error('Refresh already in progress');
          }
          backgroundRefreshRef.current.set(refreshKey, true);
        }

        cancelPreviousRequest(requestKey);
        const controller = new AbortController();
        abortControllersRef.current.set(requestKey, controller);

        try {
          if (useCache && !searchQuery && !forceRefresh && page === 1) {
            try {
              const db = await getDB();
              const cached = await loadPublications(db, status, size, 0);

              if (cached.length > 0) {
                console.log(
                  `[Cache Hit] ${cached.length} publications for ${status}`
                );

                const currentState = state[status];
                const shouldRefresh =
                  !currentState.lastSynced ||
                  Date.now() - currentState.lastSynced > CONFIG.SYNC_THRESHOLD;

                if (shouldRefresh) {
                  const refreshCount = refreshCountRef.current.get(status) || 0;
                  if (refreshCount < MAX_BACKGROUND_REFRESHES) {
                    refreshCountRef.current.set(status, refreshCount + 1);
                    setTimeout(() => {
                      syncPublications(status, page, size, {
                        ...options,
                        forceRefresh: true
                      })
                        .catch(err =>
                          console.warn('Background refresh failed:', err)
                        )
                        .finally(() => {
                          backgroundRefreshRef.current.delete(
                            `refresh-${status}`
                          );
                        });
                    }, 5000);
                  }
                }

                return {
                  publications: cached,
                  filtered: cached,
                  source: 'cache',
                  hasMore: cached.length >= size
                };
              }
            } catch (cacheError) {
              console.warn(
                'Cache access failed, falling back to remote:',
                cacheError
              );
            } finally {
              abortControllersRef.current.delete(requestKey);
            }
          }

          const startTime = Date.now();
          const remote = await publicationService.getPublicationsByStatus({
            status,
            page,
            size,
            forAdmin: isAdmin
          });

          const loadTime = Date.now() - startTime;
          console.log(
            `[Remote Load] ${remote.length} publications in ${loadTime}ms`
          );

          if (!searchQuery && remote.length > 0) {
            getDB()
              .then(async db => {
                if (page === 1) {
                  await clearStatus(db, status);
                }
                await savePublications(db, remote, status);
                console.log(
                  `[Cache Update] ${remote.length} publications saved`
                );
              })
              .catch(err => console.warn('Cache save failed:', err));
          }

          return {
            publications: remote,
            filtered: remote,
            source: 'remote',
            hasMore: remote.length >= size
          };
        } catch (err) {
          if (
            err instanceof Error &&
            err.message.includes('Failed to load publications')
          ) {
            throw new Error('Error de base de datos local');
          }

          if (useCache && !searchQuery) {
            try {
              const db = await getDB();
              const cached = await loadPublications(db, status, size, 0);
              if (cached.length > 0) {
                console.log(
                  `[Cache Fallback] Using cached data due to network error`
                );
                return {
                  publications: cached,
                  filtered: cached,
                  source: 'cache',
                  hasMore: false
                };
              }
            } catch (cacheError) {
              console.warn('Cache fallback also failed:', cacheError);
            }
          }

          throw err;
        } finally {
          abortControllersRef.current.delete(requestKey);
        }
      },
      [user, state, getDB, cancelPreviousRequest]
    );

    const prefetchNextPage = useCallback(
      async (status: PublicationStatus) => {
        const prefetchKey = `${status}-${state[status].page}`;

        if (prefetchingRef.current.has(prefetchKey)) {
          return;
        }

        prefetchingRef.current.add(prefetchKey);

        try {
          await syncPublications(
            status,
            state[status].page + 1,
            state[status].pageSize,
            { useCache: false }
          );
          console.log(`[Prefetch] Next page for ${status} loaded`);
        } catch (error) {
          console.warn(`[Prefetch] Failed for ${status}:`, error);
        } finally {
          prefetchingRef.current.delete(prefetchKey);
        }
      },
      [state, syncPublications]
    );

    const loadStatus = useCallback(
      async (status: PublicationStatus, options: LoadOptions = {}) => {
        const { searchQuery = '', forceRefresh = false } = options;

        const loadKey = `load-${status}-${searchQuery}`;
        if (abortControllersRef.current.has(loadKey)) {
          console.log(`Load already in progress for ${loadKey}`);
          return;
        }

        console.log(
          `[LoadStatus] ${status} - Query: "${searchQuery}" - Force: ${forceRefresh}`
        );
        dispatch({ type: 'FETCH_STATUS_START', status });

        const controller = new AbortController();
        abortControllersRef.current.set(loadKey, controller);

        try {
          const result = await syncPublications(
            status,
            CONFIG.INITIAL_PAGE,
            state[status].pageSize,
            { searchQuery, forceRefresh, useCache: !searchQuery }
          );

          retryCountersRef.current.set(status, 0);

          dispatch({
            type: 'FETCH_STATUS_SUCCESS',
            status,
            payload: result.publications,
            filteredPayload: result.filtered,
            hasMore: result.hasMore,
            resetPage: true,
            searchQuery,
            lastSynced: Date.now()
          });
        } catch (err) {
          handleError(err, `Error loading ${status}`, status, true);
        } finally {
          abortControllersRef.current.delete(loadKey);
        }
      },
      [state, syncPublications, handleError]
    );

    const loadMore = useCallback(
      async (status: PublicationStatus, searchQuery = '') => {
        const currentState = state[status];
        console.log('🔍 LoadMore Debug:', {
          hasMore: currentState.hasMore,
          isLoadingMore: currentState.isLoadingMore,
          currentPage: currentState.page,
          totalPublications: currentState.publications.length,
          canLoadMore: currentState.hasMore && !currentState.isLoadingMore
        });

        if (!currentState.hasMore || currentState.isLoadingMore) {
          console.log('❌ Cannot load more:', {
            hasMore: currentState.hasMore,
            isLoadingMore: currentState.isLoadingMore
          });
          return;
        }

        dispatch({ type: 'FETCH_MORE_START', status });

        try {
          const result = await syncPublications(
            status,
            currentState.page,
            currentState.pageSize,
            { searchQuery, useCache: !searchQuery }
          );

          dispatch({
            type: 'FETCH_MORE_SUCCESS',
            status,
            payload: result.publications,
            hasMore: result.hasMore
          });
        } catch (err) {
          handleError(err, `Error loading more ${status}`, status, true);
        }
      },
      [state, syncPublications, handleError]
    );

    const filterPublications = useCallback(
      (status: PublicationStatus, searchQuery: string) => {
        const timerId = debounceTimersRef.current.get(status);
        if (timerId) {
          clearTimeout(timerId);
        }

        const newTimerId = setTimeout(() => {
          dispatch({
            type: 'FILTER_PUBLICATIONS',
            status,
            searchQuery
          });
          debounceTimersRef.current.delete(status);
        }, CONFIG.DEBOUNCE_DELAY);

        debounceTimersRef.current.set(status, newTimerId);
      },
      []
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
          handleError(err, 'Error loading counts');
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

          handleError(error, `Error ${action}ing publication`);
          return false;
        }
      },
      [state, getDB, loadCounts, handleError]
    );

    const approve = useCallback(
      (recordId: string) =>
        updatePublicationStatus(
          recordId,
          PublicationStatus.PENDING,
          PublicationStatus.ACCEPTED,
          'accept'
        ),
      [updatePublicationStatus]
    );

    const reject = useCallback(
      (recordId: string) =>
        updatePublicationStatus(
          recordId,
          PublicationStatus.PENDING,
          PublicationStatus.REJECTED,
          'reject'
        ),
      [updatePublicationStatus]
    );

    const retryOperation = useCallback(
      async (status: PublicationStatus) => {
        const currentState = state[status];
        if (currentState.retryCount >= CONFIG.MAX_RETRIES) {
          console.warn(`Max retries reached for ${status}`);
          return;
        }

        dispatch({ type: 'INCREMENT_RETRY', status });
        await loadStatus(status, { forceRefresh: true });
      },
      [state, loadStatus]
    );

    const utils = useMemo(
      () => ({
        canLoadMore: (status: PublicationStatus) => {
          const currentState = state[status];
          return (
            currentState.hasMore &&
            !currentState.isLoadingMore &&
            !currentState.isLoading
          );
        },

        shouldPrefetch: (status: PublicationStatus) => {
          const currentState = state[status];
          const threshold = Math.floor(
            currentState.pageSize * CONFIG.PREFETCH_THRESHOLD
          );
          return (
            currentState.filteredPublications.length >= threshold &&
            currentState.hasMore
          );
        },

        getStatusStats: (status: PublicationStatus): StatusStats => {
          const currentState = state[status];
          return {
            totalItems: currentState.publications.length,
            filteredItems: currentState.filteredPublications.length,
            currentPage: currentState.page,
            isFiltered: currentState.currentSearchQuery.length > 0,
            lastSync: currentState.lastSynced
              ? new Date(currentState.lastSynced).toLocaleTimeString()
              : null
          };
        }
      }),
      [state]
    );

    const actions = useMemo(
      () => ({
        loadStatus,
        loadMoreStatus: loadMore,
        filterPublications,
        loadCounts,
        approve,
        reject,
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
        approve,
        reject,
        retryOperation,
        prefetchNextPage
      ]
    );

    const contextValue = useMemo(
      () => ({ state, actions, utils }),
      [state, actions, utils]
    );

    useEffect(() => {
      const debounceTimers = debounceTimersRef.current;
      const abortControllers = abortControllersRef.current;
      const prefetching = prefetchingRef.current;

      return () => {
        debounceTimers.forEach(timer => clearTimeout(timer));
        debounceTimers.clear();

        abortControllers.forEach(controller => controller.abort());
        abortControllers.clear();

        prefetching.clear();
      };
    }, []);

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
      isLoading: state[status].isLoading,
      isLoadingMore: state[status].isLoadingMore,
      hasMore: state[status].hasMore,
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
