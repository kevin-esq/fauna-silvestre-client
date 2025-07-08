import {PublicationsModel} from "../models/publication.models";
import {publicationService} from "../../services/publication/publication.service";

export default async function getUserPublicationsUseCase(
): Promise<PublicationsModel[]> {
    try {
        const response = await publicationService.getUserPublications();
        return response as PublicationsModel[];
    } catch (error) {
        throw error;
    }
}
