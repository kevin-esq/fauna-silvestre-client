import {PublicationsModel} from "../models/publication.models";
import {publicationService} from "../../services/publication/publication.service";

export default async function getUserPublicationsUseCase(
): Promise<PublicationsModel[]> {
    const response = await publicationService.getUserPublications();
    return response as PublicationsModel[];
}
