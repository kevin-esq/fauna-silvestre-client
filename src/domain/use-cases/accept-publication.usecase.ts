import {PublicationService} from "../../services/publication/publication.service";

export default async function acceptPublicationUseCase(
    publicationService: PublicationService,
    publicationId: string,
    token: string | undefined
): Promise<void> {
    try {
        console.log("publicationId", publicationId);
        return await publicationService.acceptPublication(publicationId, token as string);
    } catch (error) {
        throw error;
    }
}