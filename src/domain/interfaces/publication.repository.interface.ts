import {PublicationData, PublicationResponse, PublicationsModel} from "../models/publication.models";

export interface IPublicationRepository {
    createPublication(data: PublicationData): Promise<void>;
    getUserPendingPublications(): Promise<PublicationResponse[]>;
    getUserPublications(): Promise<PublicationsModel[]>;
    getPublicationById(recordId: string): Promise<PublicationResponse>;
    getAllPublications(): Promise<PublicationsModel[]>;
    getAllPendingPublications(page: number, limit: number): Promise<PublicationResponse[]>;
    acceptPublication(publicationId: string): Promise<void>;
    rejectPublication(publicationId: string): Promise<void>;
}