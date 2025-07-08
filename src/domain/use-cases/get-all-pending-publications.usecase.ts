import {publicationService} from "../../services/publication/publication.service";
import {PublicationsModel} from "../models/publication.models";

export default async function getAllPendingPublicationsUseCase(
    page: number,
    limit: number
): Promise<PublicationsModel[]> {
    try {
        const response = await publicationService.getAllPendingPublications(page, limit);
        return response as PublicationsModel[];
    } catch (error) {
        throw error;
    }
}