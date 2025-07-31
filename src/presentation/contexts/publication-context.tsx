import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react';

import { useAuth } from './auth-context';

import {
  PublicationResponse,
  CountsResponse,
} from '../../domain/models/publication.models';

import { publicationService } from '../../services/publication/publication.service';
import {
  createTable,
  getDBConnection,
  loadPublications,
  savePublications,
  clearStatus,
} from '../../services/data/db.service';

type PublicationStatus = 'pending' | 'accepted' | 'rejected';

interface PublicationState {
  publications: PublicationResponse[];
  isLoading: boolean;
  page: number;
  hasMore: boolean;
}

interface State {
  pending: PublicationState;
  accepted: PublicationState;
  rejected: PublicationState;
  counts: {
    users: number;
    records: number;
  };
  error: string | null;
}

type Action =
  | { type: 'FETCH_STATUS_START'; status: PublicationStatus }
  | {
      type: 'FETCH_STATUS_SUCCESS';
      status: PublicationStatus;
      payload: PublicationResponse[];
      hasMore: boolean;
      resetPage?: boolean;
    }
  | { type: 'FETCH_COUNTS_START' }
  | { type: 'FETCH_COUNTS_SUCCESS'; payload: CountsResponse }
  | { type: 'OPERATION_FAILURE'; payload: string }
  | { type: 'RESET' };

export interface PublicationContextType {
  state: State;
  actions: {
    loadStatus: (
      status: PublicationStatus,
      searchQuery?: string,
    ) => Promise<void>;
    loadMoreStatus: (status: PublicationStatus) => Promise<void>;
    loadCounts: () => Promise<void>;
    approve: (recordId: string) => Promise<void>;
    reject: (recordId: string) => Promise<void>;
    reset: () => void;
  };
}

const PublicationContext = createContext<PublicationContextType | null>(null);

const PAGE_SIZE = 5;
const INITIAL_PAGE = 1;

const initialPublicationState: PublicationState = {
  publications: [],
  isLoading: false,
  page: INITIAL_PAGE,
  hasMore: true,
};
const initialState: State = {
  pending: initialPublicationState,
  accepted: initialPublicationState,
  rejected: initialPublicationState,
  counts: { users: 0, records: 0 },
  error: null,
};

function publicationsReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_STATUS_START':
      return {
        ...state,
        [action.status]: { ...state[action.status], isLoading: true },
        error: null,
      };
    case 'FETCH_STATUS_SUCCESS': {
      const curr = state[action.status];
      const nextPage = action.resetPage ? INITIAL_PAGE : curr.page + 1;
      const newList = action.resetPage
        ? action.payload
        : [...curr.publications, ...action.payload];
      return {
        ...state,
        [action.status]: {
          publications: newList,
          isLoading: false,
          page: nextPage,
          hasMore: action.hasMore,
        },
      };
    }
    case 'FETCH_COUNTS_START':
      return { ...state, counts: { users: 0, records: 0 }, error: null };
    case 'FETCH_COUNTS_SUCCESS':
      return { ...state, counts: action.payload };
    case 'OPERATION_FAILURE':
      return {
        ...state,
        error: action.payload,
        pending: { ...state.pending, isLoading: false },
        accepted: { ...state.accepted, isLoading: false },
        rejected: { ...state.rejected, isLoading: false },
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export const PublicationProvider = React.memo(
  ({ children }: { children: React.ReactNode }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [state, dispatch] = useReducer(publicationsReducer, initialState);

    const handleError = useCallback((error: unknown, fallback: string) => {
      const message = error instanceof Error ? error.message : fallback;
      dispatch({ type: 'OPERATION_FAILURE', payload: message });
    }, []);

    const fetchPublications = useCallback(
      async (status: PublicationStatus, page: number, size: number) => {
        const isAdmin = user?.role === 'Admin';
        console.log('[isAdmin] ', isAdmin);
        const db = await getDBConnection();
        console.log('[db] ', db);
        await createTable(db);
        console.log('[createTable] ', db);

        const offset = (page - 1) * size;
        const cached = await loadPublications(db, status, size, offset);
        console.log('[cached] ', cached);
        if (cached.length > 0) {
          return cached;
        }

        const remote = await publicationService.getPublicationsByStatus(
          status,
          page,
          size,
          isAdmin,
        );
        console.log('[remote] ', remote);
        await clearStatus(db, status);
        await savePublications(db, remote, status);
        console.log('[savePublications] ', remote);
        return remote;
      },
      [user],
    );

    const loadStatus = useCallback(
      async (status: PublicationStatus, searchQuery?: string) => {
        dispatch({ type: 'FETCH_STATUS_START', status });
        try {
          console.log('[status] ', status);
          console.log('[searchQuery] ', searchQuery);
          const all = await fetchPublications(status, INITIAL_PAGE, PAGE_SIZE);
          console.log('[all] ', all);
          requestAnimationFrame(() => {
            const filtered = searchQuery
              ? all.filter(
                  (p: PublicationResponse) =>
                    p.commonNoun
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    p.description
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                )
              : all;
            const pageData = filtered.slice(0, PAGE_SIZE);
            dispatch({
              type: 'FETCH_STATUS_SUCCESS',
              status,
              payload: pageData,
              hasMore: filtered.length > PAGE_SIZE,
              resetPage: true,
            });
          });
        } catch (err) {
          handleError(err, `Error cargando ${status}`);
        }
      },
      [fetchPublications, handleError],
    );

    const loadMore = useCallback(async (status: PublicationStatus) => {
      const curr = state[status];
      if (!user || !isAuthenticated || isLoading || curr.isLoading || !curr.hasMore) return;
    
      dispatch({ type: 'FETCH_STATUS_START', status });
      try {
        const isAdmin = user?.role === 'Admin';
        const db = await getDBConnection();
        const nextPage = curr.page + 1;
        const remote = await publicationService.getPublicationsByStatus(status, nextPage, PAGE_SIZE, isAdmin);
    
        await savePublications(db, remote, status);
    
        const all = await loadPublications(db, status, nextPage, 0);
    
        requestAnimationFrame(() => {
          const payload = all.slice(PAGE_SIZE, nextPage * PAGE_SIZE);
          dispatch({
            type: 'FETCH_STATUS_SUCCESS',
            status,
            payload,
            hasMore: remote.length === PAGE_SIZE,
          });
        });
      } catch (err) {
        handleError(err, `Error cargando más ${status}`);
      }
    }, [state, user, isAuthenticated, isLoading, handleError]);
    

    const loadCounts = useCallback(async () => {
      dispatch({ type: 'FETCH_COUNTS_START' });
      try {
        const counts = await publicationService.getCounts();
        dispatch({ type: 'FETCH_COUNTS_SUCCESS', payload: counts });
      } catch (err) {
        handleError(err, 'Error al cargar counts');
      }
    }, [handleError]);

    const approve = useCallback(
      async (id: string) => {
        if (!id) return;
        try {
          await publicationService.acceptPublication(id);
          await Promise.all([loadStatus('pending'), loadStatus('accepted')]);
        } catch (err) {
          handleError(err, 'Error al aprobar');
        }
      },
      [loadStatus, handleError],
    );

    const reject = useCallback(
      async (id: string) => {
        if (!id) return;
        try {
          await publicationService.rejectPublication(id);
          await loadStatus('pending');
        } catch (err) {
          handleError(err, 'Error al rechazar');
        }
      },
      [loadStatus, handleError],
    );

    const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

    const actions = useMemo(
      () => ({
        loadStatus,
        loadMoreStatus: loadMore,
        loadCounts,
        approve,
        reject,
        reset,
      }),
      [loadStatus, loadMore, loadCounts, approve, reject, reset],
    );
    const contextValue = useMemo(() => ({ state, actions }), [state, actions]);

    return (
      <PublicationContext.Provider value={contextValue}>
        {children}
      </PublicationContext.Provider>
    );
  },
);

export const usePublications = (): PublicationContextType => {
  const context = useContext(PublicationContext);
  if (!context)
    throw new Error(
      'usePublications must be used within a PublicationProvider',
    );
  return context;
};
