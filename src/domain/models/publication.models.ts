import { PublicationStatus } from '@/services/publication/publication.service';

export interface PublicationData {
  commonNoun: string;
  catalogId: number;
  animalState: number;
  description: string;
  location: string;
  img: string;
}

export interface PublicationResponse {
  recordId: number;
  commonNoun: string;
  animalState: string;
  description: string;
  img: string;
  location: string;
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
