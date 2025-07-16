import { PublicationRepository } from '../../data/repositories/publication.repository';
import { IPublicationRepository } from '../../domain/interfaces/publication.repository.interface';
import { PublicationData, PublicationsModel, PublicationResponse } from '../../domain/models/publication.models';
import { apiService } from '../http/api.service';
import { ConsoleLogger } from '../logging/console-logger';

class PublicationService {
  constructor(private readonly publicationRepository: IPublicationRepository) {}

  createPublication(publication: PublicationData): Promise<void> {
    return this.publicationRepository.createPublication(publication);
  }

  getUserPublications(): Promise<PublicationsModel[]> {
    return this.publicationRepository.getUserPublications();
  }

  getAllPublications(): Promise<PublicationsModel[]> {
    return this.publicationRepository.getAllPublications();
  }

  getUserPendingPublications(): Promise<PublicationResponse[]> {
    return this.publicationRepository.getUserPendingPublications();
  }

  getAllPendingPublications(page: number, limit: number): Promise<PublicationResponse[]> {
    return this.publicationRepository.getAllPendingPublications(page, limit);
  }

  getPublicationById(recordId: string): Promise<PublicationResponse> {
    return this.publicationRepository.getPublicationById(recordId);
  }

  acceptPublication(publicationId: string): Promise<void> {
    return this.publicationRepository.acceptPublication(publicationId);
  }

  rejectPublication(publicationId: string): Promise<void> {
    return this.publicationRepository.rejectPublication(publicationId);
  }
}

const publicationRepository = new PublicationRepository(apiService.client, new ConsoleLogger('debug'));
export const publicationService = new PublicationService(publicationRepository);