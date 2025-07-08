import {publicationService} from "../../services/publication/publication.service";

export default async function rejectPublicationUseCase(
    publicationId: string,
): Promise<void> {
    try {
        return await publicationService.rejectPublication(publicationId);
    } catch (error) {
        throw error;
    }
}   