import { PublicationFilters } from '@/utils/publication-filters';
import {
  State,
  FetchStatusStartAction,
  FetchStatusSuccessAction,
  FetchMoreSuccessAction,
  OperationFailureAction,
  UpdatePublicationStatusAction
} from './types';

export class ReducerHandlers {
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
