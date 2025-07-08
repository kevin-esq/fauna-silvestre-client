import {PublicationService} from "../../services/publication/publication.service";

export default async function rejectPublicationUseCase(
    publicationService: PublicationService,
    publicationId: string,
    token: string | undefined
): Promise<void> {
    try {
        return await publicationService.rejectPublication(publicationId, token as string);
    } catch (error) {
        throw error;
    }
}