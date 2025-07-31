import { PublicationRepository } from '../../data/repositories/publication.repository';
import { IPublicationRepository } from '../../domain/interfaces/publication.repository.interface';
import {
  PublicationData,
  PublicationsModel,
  PublicationResponse,
  CountsResponse,
} from '../../domain/models/publication.models';
import { apiService } from '../http/api.service';
import { ConsoleLogger } from '../logging/console-logger';

export class PublicationService {
  private readonly repository: IPublicationRepository;

  constructor(repository: IPublicationRepository) {
    this.repository = repository;
  }

  async createPublication(publication: PublicationData): Promise<void> {
    await this.repository.createPublication(publication);
  }

  async getUserPublications(): Promise<PublicationsModel[]> {
    return await this.repository.getUserPublications();
  }

  async getAllPublications(): Promise<PublicationsModel[]> {
    return await this.repository.getAllPublications();
  }

  async getPublicationsByStatus(
    status: 'pending' | 'accepted' | 'rejected',
    page: number,
    limit: number,
    forAdmin: boolean,
  ): Promise<PublicationResponse[]> {
    switch (status) {
      case 'pending':
        return forAdmin
          ? await this.repository.getAllPendingPublications(page, limit)
          : await this.repository.getUserPendingPublications(page, limit);
      case 'accepted':
        return forAdmin
          ? await this.repository.getAllAcceptedPublications(page, limit)
          : await this.repository.getUserAcceptedPublications(page, limit);
      case 'rejected':
        return forAdmin
          ? await this.repository.getAllRejectedPublications(page, limit)
          : await this.repository.getUserRejectedPublications(page, limit);
      default:
        throw new Error(`Estado de publicación desconocido: ${status}`);
    }
  }

  async getPublicationById(recordId: string): Promise<PublicationResponse> {
    return await this.repository.getPublicationById(recordId);
  }

  async acceptPublication(publicationId: string): Promise<void> {
    await this.repository.acceptPublication(publicationId);
  }

  async rejectPublication(publicationId: string): Promise<void> {
    await this.repository.rejectPublication(publicationId);
  }

  async getCounts(): Promise<CountsResponse> {
    return await this.repository.getCounts();
  }
}

const publicationRepository = new PublicationRepository(
  apiService.client,
  new ConsoleLogger('debug'),
);
export const publicationService = new PublicationService(publicationRepository);
