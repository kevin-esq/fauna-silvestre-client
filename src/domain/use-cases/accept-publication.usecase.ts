import {publicationService} from "../../services/publication/publication.service";

export default async function acceptPublicationUseCase(
    publicationId: string,
): Promise<void> {
    await publicationService.acceptPublication(publicationId);
}