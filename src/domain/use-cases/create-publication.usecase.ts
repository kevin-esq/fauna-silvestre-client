import { PublicationData } from '../models/publication.models';
import { publicationService } from '../../services/publication/publication.service';

export default async function createPublicationUseCase(
  publicationData: PublicationData
): Promise<void> {
  await publicationService.createPublication(publicationData);
}
