// publication-context.tsx
import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { useAuth } from './auth-context';
import { useLoading } from './loading-context';
import { PublicationsModel, PublicationResponse, CountsResponse } from '../../domain/models/publication.models';
import { publicationService } from '../../services/publication/publication.service';

type PublicationStatus = 'pending' | 'accepted' | 'rejected';

interface PublicationState {
  publications: PublicationResponse[];
  isLoading: boolean;
  page: number;
  hasMore: boolean;
}

interface State {
  all: {
    publications: PublicationsModel[];
    isLoading: boolean;
  };
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
  | { type: 'FETCH_ALL_START' }
  | { type: 'FETCH_ALL_SUCCESS'; payload: PublicationsModel[] }
  | { type: 'FETCH_STATUS_START'; status: PublicationStatus }
  | { 
      type: 'FETCH_STATUS_SUCCESS'; 
      status: PublicationStatus; 
      payload: PublicationResponse[];
      hasMore: boolean;
    }
  | { 
      type: 'FETCH_STATUS_MORE_SUCCESS'; 
      status: PublicationStatus; 
      payload: PublicationResponse[];
      hasMore: boolean;
    }
    | { type: 'FETCH_COUNTS_START' }
    | { type: 'FETCH_COUNTS_SUCCESS'; payload: CountsResponse }
  | { type: 'OPERATION_FAILURE'; payload: string }
  | { type: 'RESET' };

export interface PublicationContextType {
  state: State;
  actions: {
    loadAll: () => Promise<void>;
    loadStatus: (status: PublicationStatus) => Promise<void>;
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

const initialState: State = {
  all: { publications: [], isLoading: false },
  pending: { publications: [], isLoading: false, page: INITIAL_PAGE, hasMore: true },
  accepted: { publications: [], isLoading: false, page: INITIAL_PAGE, hasMore: true },
  rejected: { publications: [], isLoading: false, page: INITIAL_PAGE, hasMore: true },
  counts: { users: 0, records: 0 },
  error: null,
};

const publicationsReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'FETCH_ALL_START':
      return {
        ...state,
        all: { ...state.all, isLoading: true },
        error: null,
      };
      
    case 'FETCH_ALL_SUCCESS':
      return {
        ...state,
        all: { publications: action.payload, isLoading: false },
      };
      
    case 'FETCH_STATUS_START':
      return {
        ...state,
        [action.status]: {
          ...state[action.status],
          isLoading: true,
        },
        error: null,
      };
      
    case 'FETCH_STATUS_SUCCESS':
      return {
        ...state,
        [action.status]: {
          publications: action.payload,
          isLoading: false,
          page: INITIAL_PAGE,
          hasMore: action.hasMore,
        },
      };
      
    case 'FETCH_STATUS_MORE_SUCCESS': {
      const currentState = state[action.status];
      return {
        ...state,
        [action.status]: {
          publications: [...currentState.publications, ...action.payload],
          isLoading: false,
          page: currentState.page + 1,
          hasMore: action.hasMore,
        },
      };
    }

    case 'FETCH_COUNTS_START':
      return {
        ...state,
        counts: { users: 0, records: 0 },
        error: null,
      };

    case 'FETCH_COUNTS_SUCCESS':
      return {
        ...state,
        counts: action.payload,
        };
      
    case 'OPERATION_FAILURE':
      return {
        ...state,
        all: { ...state.all, isLoading: false },
        pending: { ...state.pending, isLoading: false },
        accepted: { ...state.accepted, isLoading: false },
        rejected: { ...state.rejected, isLoading: false },
        error: action.payload,
      };
      
    case 'RESET':
      return initialState;
      
    default:
      return state;
  }
};

export const PublicationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [state, dispatch] = useReducer(publicationsReducer, initialState);

  const handleError = useCallback((e: unknown, fallback: string) => {
    const message = e instanceof Error ? e.message : fallback;
    dispatch({ type: 'OPERATION_FAILURE', payload: message });
  }, []);

  const loadAll = useCallback(async () => {
    if (!user) {
      dispatch({ type: 'RESET' });
      return;
    }
    dispatch({ type: 'FETCH_ALL_START' });

    try {
      const publications = user.role === 'Admin'
        ? await publicationService.getAllPublications()
        : await publicationService.getUserPublications();
      
      dispatch({ type: 'FETCH_ALL_SUCCESS', payload: publications });
    } catch (e) {
      handleError(e, 'Error al cargar publicaciones.');
    }
  }, [user, handleError]);

  const loadStatus = useCallback(async (status: PublicationStatus) => {
    if (!user) {
      dispatch({ type: 'RESET' });
      return;
    }
    dispatch({ type: 'FETCH_STATUS_START', status });

    try {
      let publications: PublicationResponse[] = [];
      
      switch (status) {
        case 'pending':
          publications = user.role === 'Admin' ? await publicationService.getAllPendingPublications(INITIAL_PAGE, PAGE_SIZE) : await publicationService.getUserPendingPublications(INITIAL_PAGE, PAGE_SIZE);
          break;
        case 'accepted':
          publications = user.role === 'Admin' ? await publicationService.getAllAcceptedPublications(INITIAL_PAGE, PAGE_SIZE) : await publicationService.getUserAcceptedPublications(INITIAL_PAGE, PAGE_SIZE);
          break;
        case 'rejected':
          publications = user.role === 'Admin' ? await publicationService.getAllRejectedPublications(INITIAL_PAGE, PAGE_SIZE) : await publicationService.getUserRejectedPublications(INITIAL_PAGE, PAGE_SIZE);
          break;
      }
      
      const hasMore = publications.length === PAGE_SIZE;
      
      dispatch({ 
        type: 'FETCH_STATUS_SUCCESS', 
        status, 
        payload: publications,
        hasMore
      });
    } catch (e) {
      handleError(e, `Error al cargar publicaciones ${status}.`);
    }
  }, [user, handleError]);

  const loadMoreStatus = useCallback(async (status: PublicationStatus) => {
    const currentState = state[status];
    if (!user || currentState.isLoading || !currentState.hasMore) {
      dispatch({ type: 'RESET' });
      return;
    }

    dispatch({ type: 'FETCH_STATUS_START', status });

    try {
      let publications: PublicationResponse[] = [];
      const nextPage = currentState.page + 1;
      
      switch (status) {
        case 'pending':
          publications = user.role === 'Admin' ? await publicationService.getAllPendingPublications(nextPage, PAGE_SIZE) : await publicationService.getUserPendingPublications(nextPage, PAGE_SIZE);
          break;
        case 'accepted':
          publications = user.role === 'Admin' ? await publicationService.getAllAcceptedPublications(nextPage, PAGE_SIZE) : await publicationService.getUserAcceptedPublications(nextPage, PAGE_SIZE);
          break;
        case 'rejected':
          publications = user.role === 'Admin' ? await publicationService.getAllRejectedPublications(nextPage, PAGE_SIZE) : await publicationService.getUserRejectedPublications(nextPage, PAGE_SIZE);
          break;
      }
      
      const hasMore = publications.length === PAGE_SIZE;
      
      dispatch({ 
        type: 'FETCH_STATUS_MORE_SUCCESS', 
        status, 
        payload: publications,
        hasMore
      });
    } catch (e) {
      handleError(e, 'Error al cargar más publicaciones.');
    }
  }, [user, state, handleError]);

  const loadCounts = useCallback(async () => {
    dispatch({ type: 'FETCH_COUNTS_START' });

    try {
      const counts = await publicationService.getCounts();
      dispatch({
        type: 'FETCH_COUNTS_SUCCESS',
        payload: {
          users: counts.users,
          records: counts.records,
        },
      });
    } catch (e) {
      handleError(e, 'Error al cargar los conteos de publicaciones.');
    }
  }, [handleError]);

  const approve = useCallback(async (recordId: string) => {
    if (!recordId) {
      dispatch({ type: 'RESET' });
      return;
    }
    showLoading();

    try {
      await publicationService.acceptPublication(recordId);
      await Promise.allSettled([
        loadStatus('pending'),
        loadAll()
      ]);
    } catch (e) {
      handleError(e, 'Error al aprobar la publicación.');
    } finally {
      hideLoading();
    }
  }, [loadStatus, loadAll, handleError, showLoading, hideLoading]);

  const reject = useCallback(async (recordId: string) => {
    if (!recordId) {
      dispatch({ type: 'RESET' });
      return;
    }
    showLoading();

    try {
      await publicationService.rejectPublication(recordId);
      await loadStatus('pending');
    } catch (e) {
      handleError(e, 'Error al rechazar la publicación.');
    } finally {
      hideLoading();
    }
  }, [loadStatus, handleError, showLoading, hideLoading]);

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const contextValue = useMemo<PublicationContextType>(() => ({
    state,
    actions: {
      loadAll,
      loadStatus,
      loadMoreStatus,
      loadCounts,
      approve,
      reject,
      reset,
    },
  }), [
    state,
    loadAll,
    loadStatus,
    loadMoreStatus,
    loadCounts,
    approve,
    reject,
    reset
  ]);

  return (
    <PublicationContext.Provider value={contextValue}>
      {children}
    </PublicationContext.Provider>
  );
};

export const usePublications = (): PublicationContextType => {
  const context = useContext(PublicationContext);
  if (!context) {
    throw new Error('usePublications must be used within a PublicationProvider');
  }
  return context;
};