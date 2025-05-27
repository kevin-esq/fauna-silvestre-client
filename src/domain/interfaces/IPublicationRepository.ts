import {PublicationData} from "../models/PublicationModels";

export interface IPublicationRepository {
    createPublication(data: PublicationData): Promise<void>;
}