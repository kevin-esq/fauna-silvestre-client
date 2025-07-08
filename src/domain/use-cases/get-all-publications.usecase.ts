import {publicationService} from "../../services/publication/publication.service";
import {PublicationsModel} from "../models/publication.models";

export default async function getAllPublicationsUseCase(
): Promise<PublicationsModel[]> {
    try {
        const response = await publicationService.getAllPublications();
        return response as PublicationsModel[];
    } catch (error) {
        throw error;
    }
}