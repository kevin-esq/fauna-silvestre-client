import { PublicationResponse } from '../models/publication.models';
import { publicationService } from '../../services/publication/publication.service';

export default async function getUserPendingPublications(): Promise<
  PublicationResponse[]
> {
  const response = await publicationService.getUserPendingPublications();
  console.log(response as PublicationResponse[]);
  return response as PublicationResponse[];
}
