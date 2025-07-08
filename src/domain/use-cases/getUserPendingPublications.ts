// usecases/create-publication.usecase.ts
import {PublicationResponse} from "../models/publication.models";
import {PublicationService} from "../../services/publication/publication.service";

export default async function getUserPendingPublications(
    publicationService: PublicationService,
    token: string | undefined
): Promise<PublicationResponse[]> {
    try {
        const response = await publicationService.getUserPendingPublications(token as string);
        console.log(response as PublicationResponse[]);
        return response as PublicationResponse[];
    } catch (error) {
        throw error;
    }
}
