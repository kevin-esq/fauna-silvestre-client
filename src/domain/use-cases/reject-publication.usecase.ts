import { publicationService } from '../../services/publication/publication.service';

export default async function rejectPublicationUseCase(
  publicationId: string
): Promise<void> {
  return await publicationService.rejectPublication(publicationId);
}
