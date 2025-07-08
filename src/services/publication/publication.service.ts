import { publicationRepository } from '../../data/repositories/publication.repository';
import { IPublicationRepository } from '../../domain/interfaces/publication.repository.interface';
import { PublicationData, PublicationResponse, PublicationsModel } from '../../domain/models/publication.models';

class PublicationService {
  constructor(private readonly publicationRepo: IPublicationRepository) {}

  async addPublication(publicationData: PublicationData): Promise<void> {
    return this.publicationRepo.createPublication(publicationData);
  }

  async getUserPendingPublications(): Promise<PublicationResponse[]> {
    return this.publicationRepo.getUserPendingPublications();
  }

  async getUserPublications(): Promise<PublicationsModel[]> {
    return this.publicationRepo.getUserPublications();
  }

  async getPublicationById(recordId: string): Promise<PublicationResponse> {
    return this.publicationRepo.getPublicationById(recordId);
  }

  async getAllPublications(): Promise<PublicationsModel[]> {
    return this.publicationRepo.getAllPublications();
  }

    async getAllPendingPublications(page: number, limit: number): Promise<PublicationResponse[]> {
        return this.publicationRepo.getAllPendingPublications(page, limit);
  }

  async acceptPublication(publicationId: string): Promise<void> {
    return this.publicationRepo.acceptPublication(publicationId);
  }

  async rejectPublication(publicationId: string): Promise<void> {
    return this.publicationRepo.rejectPublication(publicationId);
  }
}

export const publicationService = new PublicationService(publicationRepository);