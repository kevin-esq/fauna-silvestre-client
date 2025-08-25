import { publicationService } from '../../services/publication/publication.service';
import { PublicationsModel } from '../models/publication.models';

export default async function getAllPublicationsUseCase(): Promise<
  PublicationsModel[]
> {
  const response = await publicationService.getAllPublications();
  return response as PublicationsModel[];
}
