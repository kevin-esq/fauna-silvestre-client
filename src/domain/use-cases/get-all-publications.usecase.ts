import {PublicationService} from "../../services/publication/publication.service";
import {PublicationsModel} from "../models/publication.models";

export default async function getAllPublicationsUseCase(
    publicationService: PublicationService,
    token: string | undefined
): Promise<PublicationsModel[]> {
    try {
        const response = await publicationService.getAllPublications(token as string);
        return response as PublicationsModel[];
    } catch (error) {
        throw error;
    }
}