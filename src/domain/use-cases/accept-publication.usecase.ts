import {publicationService} from "../../services/publication/publication.service";

export default async function acceptPublicationUseCase(
    publicationId: string,
): Promise<void> {
    try {
        console.log("publicationId", publicationId);
        return await publicationService.acceptPublication(publicationId);
    } catch (error) {
        throw error;
    }
}   