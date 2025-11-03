import { PublicationStatus } from '@/services/publication/publication.service';
import { State, PublicationState, CountsState } from './types';

const CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  INITIAL_PAGE: 1
} as const;

export class StateCreators {
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
