import {PublicationService} from "../../services/publication/publication.service";
import {PublicationsModel} from "../models/publication.models";

export default async function getAllPendingPublicationsUseCase(
    publicationService: PublicationService,
    token: string | undefined
): Promise<PublicationsModel[]> {
    try {
        const response = await publicationService.getAllPendingPublications(token as string);
        return response as PublicationsModel[];
    } catch (error) {
        throw error;
    }
}