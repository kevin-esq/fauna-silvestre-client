export type PublicationStatus = 'pending' | 'accepted' | 'rejected';

export interface PublicationData {
  commonNoun: string;
  catalogId: number;
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
  // Optimizaciones para imágenes
  imgPath?: string; // Ruta del archivo local
  thumbnailPath?: string; // Ruta de la miniatura local
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
