import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { useAuth } from "./auth-context";
import { useLoading } from "./loading-context";
import { PublicationsModel, PublicationResponse } from "../../domain/models/publication.models";
import { publicationService } from "../../services/publication/publication.service";

// --- STATE AND ACTION TYPES FOR REDUCER ---

interface State {
    all: { publications: PublicationsModel[]; isLoading: boolean; };
    pending: {
        publications: PublicationResponse[];
        isLoading: boolean;
        page: number;
        hasMore: boolean;
    };
    error: string | null;
}

type Action =
    | { type: 'FETCH_ALL_START' }
    | { type: 'FETCH_ALL_SUCCESS'; payload: PublicationsModel[] }
    | { type: 'FETCH_PENDING_START' }
    | { type: 'FETCH_PENDING_SUCCESS'; payload: PublicationResponse[] } // For refresh
    | { type: 'FETCH_PENDING_MORE_SUCCESS'; payload: PublicationResponse[] } // For loading more
    | { type: 'SET_PENDING_HAS_MORE'; payload: boolean }
    | { type: 'OPERATION_FAILURE'; payload: string };

// --- CONTEXT TYPE (Public API) ---

export interface PublicationContextType {
    all: { publications: PublicationsModel[]; isLoading: boolean; load: () => Promise<void>; };
    pending: {
        publications: PublicationResponse[];
        isLoading: boolean;
        error: string | null;
        hasMore: boolean;
        load: () => Promise<void>;
        loadMore: () => Promise<void>;
        approve: (recordId: string) => Promise<void>;
        reject: (recordId: string) => Promise<void>;
    };
}

const PublicationContext = createContext<PublicationContextType | null>(null);

// --- REDUCER ---

const initialState: State = {
    all: { publications: [], isLoading: false },
    pending: { publications: [], isLoading: false, page: 1, hasMore: true },
    error: null,
};

const publicationsReducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'FETCH_ALL_START':
            return { ...state, all: { ...state.all, isLoading: true }, error: null };
        case 'FETCH_ALL_SUCCESS':
            return { ...state, all: { publications: action.payload, isLoading: false } };
        case 'FETCH_PENDING_START':
            return { ...state, pending: { ...state.pending, isLoading: true }, error: null };
        case 'FETCH_PENDING_SUCCESS': // Refresh
            return {
                ...state,
                pending: {
                    ...state.pending,
                    publications: action.payload,
                    isLoading: false,
                    page: 1,
                    hasMore: action.payload.length > 0,
                },
            };
        case 'FETCH_PENDING_MORE_SUCCESS': // Load More
            return {
                ...state,
                pending: {
                    ...state.pending,
                    publications: [...state.pending.publications, ...action.payload],
                    isLoading: false,
                    page: state.pending.page + 1,
                },
            };
        case 'SET_PENDING_HAS_MORE':
            return { ...state, pending: { ...state.pending, hasMore: action.payload } };
        case 'OPERATION_FAILURE':
            return { 
                ...state, 
                all: { ...state.all, isLoading: false },
                pending: { ...state.pending, isLoading: false },
                error: action.payload 
            };
        default:
            return state;
    }
};

// --- PROVIDER ---

export const PublicationProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const { showLoading, hideLoading } = useLoading();
    const [state, dispatch] = useReducer(publicationsReducer, initialState);
    const PAGE_SIZE = 10;

    const loadAllPublications = useCallback(async () => {
        if (!user) return;
        dispatch({ type: 'FETCH_ALL_START' });
        try {
            const publications = user.role === 'Admin'
                ? await publicationService.getAllPublications()
                : await publicationService.getUserPublications();
            dispatch({ type: 'FETCH_ALL_SUCCESS', payload: publications });
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Error al cargar publicaciones.';
            dispatch({ type: 'OPERATION_FAILURE', payload: message });
        }
    }, [user]);

    const loadPendingPublications = useCallback(async () => {
        if (user?.role !== 'Admin') return;
        dispatch({ type: 'FETCH_PENDING_START' });
        try {
            const publications = await publicationService.getAllPendingPublications(1, PAGE_SIZE);
            dispatch({ type: 'FETCH_PENDING_SUCCESS', payload: publications });
            dispatch({ type: 'SET_PENDING_HAS_MORE', payload: publications.length === PAGE_SIZE });
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Error al cargar publicaciones pendientes.';
            dispatch({ type: 'OPERATION_FAILURE', payload: message });
        }
    }, [user]);

    const loadMorePendingPublications = useCallback(async () => {
        if (user?.role !== 'Admin' || state.pending.isLoading || !state.pending.hasMore) return;
        dispatch({ type: 'FETCH_PENDING_START' });
        try {
            const nextPage = state.pending.page + 1;
            const publications = await publicationService.getAllPendingPublications(nextPage, PAGE_SIZE);
            if (publications.length > 0) {
                dispatch({ type: 'FETCH_PENDING_MORE_SUCCESS', payload: publications });
            }
            if (publications.length < PAGE_SIZE) {
                dispatch({ type: 'SET_PENDING_HAS_MORE', payload: false });
            }
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Error al cargar más publicaciones.';
            dispatch({ type: 'OPERATION_FAILURE', payload: message });
        }
    }, [user, state.pending.isLoading, state.pending.hasMore, state.pending.page]);

    const approvePublication = useCallback(async (recordId: string) => {
        showLoading();
        try {
            await publicationService.acceptPublication(recordId);
            await Promise.all([loadPendingPublications(), loadAllPublications()]);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Error al aprobar la publicación.';
            dispatch({ type: 'OPERATION_FAILURE', payload: message });
        } finally {
            hideLoading();
        }
    }, [loadPendingPublications, loadAllPublications, showLoading, hideLoading]);

    const rejectPublication = useCallback(async (recordId: string) => {
        showLoading();
        try {
            await publicationService.rejectPublication(recordId);
            await loadPendingPublications();
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Error al rechazar la publicación.';
            dispatch({ type: 'OPERATION_FAILURE', payload: message });
        } finally {
            hideLoading();
        }
    }, [loadPendingPublications, showLoading, hideLoading]);

    const contextValue = useMemo((): PublicationContextType => ({
        all: {
            ...state.all,
            load: loadAllPublications,
        },
        pending: {
            ...state.pending,
            error: state.error,
            load: loadPendingPublications,
            loadMore: loadMorePendingPublications,
            approve: approvePublication,
            reject: rejectPublication,
        },
    }), [state, loadAllPublications, loadPendingPublications, loadMorePendingPublications, approvePublication, rejectPublication]);

    return (
        <PublicationContext.Provider value={contextValue}>
            {children}
        </PublicationContext.Provider>
    );
};

// --- HOOK ---

export const usePublications = (): PublicationContextType => {
    const context = useContext(PublicationContext);
    if (!context) {
        throw new Error('usePublications must be used within a PublicationProvider');
    }
    return context;
};