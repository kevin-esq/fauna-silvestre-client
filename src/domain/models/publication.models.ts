export type PublicationStatus = 'pending' | 'accepted' | 'rejected';

export interface PublicationData {
  commonNoun: string;
  catalogId: number | null | undefined;
  animalState: number;
  description: string;
  location: string;
  img: string;
}

export interface PublicationResponse {
  records: PublicationModelResponse[];
  pagination: PaginationModelResponse;
}

export interface PublicationModelResponse {
  recordId: number;
  commonNoun: string;
  animalState: string;
  description: string;
  img: string;
  location: string;
  createdDate?: string;
  author?: string;
}

export interface PaginationModelResponse {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CountsResponse {
  users: number;
  records: number;
  pendingCount?: number;
  acceptedCount?: number;
  rejectedCount?: number;
}

export interface PublicationsModel {
  recordId: number;
  commonNoun: string;
  animalState: string;
  description: string;
  img: string;
  location: string;
  status: PublicationStatus;
}
