// usecases/create-publication.usecase.ts
import {PublicationResponse, PublicationsModel} from "../models/publication.models";
import {PublicationService} from "../../services/publication/publication.service";

export default async function getUserPublicationsUseCase(
    publicationService: PublicationService,
    token: string | undefined
): Promise<PublicationsModel[]> {
    try {
        const response = await publicationService.getUserPublications(token as string);
        return response as PublicationsModel[];
    } catch (error) {
        throw error;
    }
}
