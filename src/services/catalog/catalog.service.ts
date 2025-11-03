import { ICatalogRepository } from '@/domain/interfaces/catalog.repository.interface';
import Animal from '@/domain/entities/animal.entity';
import { ApiService } from '@/services/http/api.service';
import { CatalogRepository } from '@/data/repositories/catalog.repository';
import { ConsoleLogger } from '@/services/logging/console-logger';
import {
  CatalogModelResponse,
  LocationResponse,
  AnimalModelResponse,
  CommonNounResponse,
  CreateAnimalRequest,
  UpdateAnimalRequest,
  UpdateAnimalImageRequest,
  AnimalCrudResponse,
  DeleteAnimalResponse
} from '@/domain/models/animal.models';

class CatalogService {
  constructor(private catalogRepository: ICatalogRepository) {}

  async getAllCatalogs(
    page: number,
    size: number,
    signal?: AbortSignal
  ): Promise<CatalogModelResponse> {
    return this.catalogRepository.getAllCatalogs(page, size, signal);
  }

  async getCatalogByCommonName(commonName: string): Promise<Animal> {
    return this.catalogRepository.getCatalogByCommonName(commonName);
  }

  async getCatalogById(catalogId: string): Promise<AnimalModelResponse> {
    return this.catalogRepository.getCatalogById(catalogId);
  }

  async createCatalog(
    createAnimalRequest: CreateAnimalRequest
  ): Promise<AnimalCrudResponse> {
    return this.catalogRepository.createCatalog(createAnimalRequest);
  }

  async updateCatalog(
    updateAnimalRequest: UpdateAnimalRequest
  ): Promise<AnimalCrudResponse> {
    return this.catalogRepository.updateCatalog(updateAnimalRequest);
  }

  async updateCatalogImage(
    updateAnimalImageRequest: UpdateAnimalImageRequest
  ): Promise<AnimalCrudResponse> {
    return this.catalogRepository.updateCatalogImage(updateAnimalImageRequest);
  }

  async deleteCatalog(id: string): Promise<DeleteAnimalResponse> {
    return this.catalogRepository.deleteCatalog(id);
  }

  async getLocations(catalogId: string): Promise<LocationResponse> {
    return this.catalogRepository.getLocations(catalogId);
  }

  async downloadAnimalSheet(catalogId: string): Promise<Blob> {
    return this.catalogRepository.downloadAnimalSheet(catalogId);
  }

  async getCommonNouns(): Promise<CommonNounResponse[]> {
    return this.catalogRepository.getCommonNouns();
  }
}

const catalogRepository = new CatalogRepository(
  ApiService.getInstance().client,
  new ConsoleLogger('debug')
);
export const catalogService = new CatalogService(catalogRepository);
