import {
  PublicationResponse,
  PublicationModelResponse,
  CountsResponse
} from '@/domain/models/publication.models';
import { PublicationStatus } from '@/services/publication/publication.service';

export interface PaginationState {
  readonly page: number;
  readonly size: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrev: boolean;
}

export interface PublicationState {
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

export interface CountsState {
  readonly data: CountsResponse | null;
  readonly isLoading: boolean;
  readonly lastUpdated: number | null;
  readonly error?: string;
}

export interface State {
  readonly [PublicationStatus.PENDING]: PublicationState;
  readonly [PublicationStatus.ACCEPTED]: PublicationState;
  readonly [PublicationStatus.REJECTED]: PublicationState;
  readonly counts: CountsState;
}

export type PublicationActionType =
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

export interface BaseAction<T extends PublicationActionType> {
  readonly type: T;
}

export interface FetchStatusStartAction extends BaseAction<'FETCH_STATUS_START'> {
  readonly status: PublicationStatus;
}

export interface FetchStatusSuccessAction
  extends BaseAction<'FETCH_STATUS_SUCCESS'> {
  readonly status: PublicationStatus;
  readonly payload: PublicationResponse;
  readonly searchQuery: string;
  readonly resetPage: boolean;
}

export interface FetchMoreStartAction extends BaseAction<'FETCH_MORE_START'> {
  readonly status: PublicationStatus;
}

export interface FetchMoreSuccessAction
  extends BaseAction<'FETCH_MORE_SUCCESS'> {
  readonly status: PublicationStatus;
  readonly payload: PublicationResponse;
}

export interface RefreshStartAction extends BaseAction<'REFRESH_START'> {
  readonly status: PublicationStatus;
}

export interface RefreshSuccessAction extends BaseAction<'REFRESH_SUCCESS'> {
  readonly status: PublicationStatus;
  readonly payload: PublicationResponse;
}

export interface FilterPublicationsAction
  extends BaseAction<'FILTER_PUBLICATIONS'> {
  readonly status: PublicationStatus;
  readonly searchQuery: string;
}

export interface OperationFailureAction extends BaseAction<'OPERATION_FAILURE'> {
  readonly payload: string;
  readonly status?: PublicationStatus;
}

export interface ResetStatusAction extends BaseAction<'RESET_STATUS'> {
  readonly status: PublicationStatus;
}

export interface UpdatePublicationStatusAction
  extends BaseAction<'UPDATE_PUBLICATION_STATUS'> {
  readonly publicationId: string;
  readonly currentStatus: PublicationStatus;
  readonly newStatus: PublicationStatus;
}

export interface FetchCountsSuccessAction
  extends BaseAction<'FETCH_COUNTS_SUCCESS'> {
  readonly payload: CountsResponse;
}

export interface FetchCountsFailureAction
  extends BaseAction<'FETCH_COUNTS_FAILURE'> {
  readonly payload: string;
}

export type Action =
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

export interface LoadOptions {
  readonly searchQuery?: string;
  readonly forceRefresh?: boolean;
}

export type BulkAction = 'accept' | 'reject';

export interface BulkOperationResult {
  readonly success: string[];
  readonly failed: string[];
}
