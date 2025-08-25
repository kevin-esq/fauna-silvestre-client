import {
  CountsResponse,
  PublicationData,
  PublicationResponse,
  PublicationsModel
} from '../models/publication.models';

export interface IPublicationRepository {
  createPublication(data: PublicationData): Promise<void>;
  getUserPendingPublications(
    page: number,
    size: number
  ): Promise<PublicationResponse[]>;
  getUserAcceptedPublications(
    page: number,
    size: number
  ): Promise<PublicationResponse[]>;
  getUserPublications(): Promise<PublicationsModel[]>;
  getUserRejectedPublications(
    page: number,
    size: number
  ): Promise<PublicationResponse[]>;
  getPublicationById(recordId: string): Promise<PublicationResponse>;
  getAllPublications(): Promise<PublicationsModel[]>;
  getAllPendingPublications(
    page: number,
    size: number
  ): Promise<PublicationResponse[]>;
  getAllAcceptedPublications(
    page: number,
    size: number
  ): Promise<PublicationResponse[]>;
  getAllRejectedPublications(
    page: number,
    size: number
  ): Promise<PublicationResponse[]>;
  acceptPublication(publicationId: string): Promise<void>;
  rejectPublication(publicationId: string): Promise<void>;
  getCounts(): Promise<CountsResponse>;
}
