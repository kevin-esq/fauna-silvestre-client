import {PublicationData, PublicationResponse, PublicationsModel} from "../models/publication.models";

export interface IPublicationRepository {
    createPublication(data: PublicationData): Promise<void>;
    getUserPendingPublications(page: number, limit: number): Promise<PublicationResponse[]>;
    getUserAcceptedPublications(page: number, limit: number): Promise<PublicationResponse[]>;
    getUserPublications(): Promise<PublicationsModel[]>;
    getUserRejectedPublications(page: number, limit: number): Promise<PublicationResponse[]>;
    getPublicationById(recordId: string): Promise<PublicationResponse>;
    getAllPublications(): Promise<PublicationsModel[]>;
    getAllPendingPublications(page: number, limit: number): Promise<PublicationResponse[]>;
    getAllAcceptedPublications(page: number, limit: number): Promise<PublicationResponse[]>;
    getAllRejectedPublications(page: number, limit: number): Promise<PublicationResponse[]>;
    acceptPublication(publicationId: string): Promise<void>;
    rejectPublication(publicationId: string): Promise<void>;
}