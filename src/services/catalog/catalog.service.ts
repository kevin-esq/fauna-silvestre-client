import { ICatalogRepository } from "../../domain/interfaces/catalog.repository.interface";
import Animal from "../../domain/entities/animal.entity";
import { ApiService } from "../../services/http/api.service";
import { CatalogRepository } from "../../data/repositories/catalog.repository";
import { ConsoleLogger } from "../logging/console-logger";
import { LocationResponse } from "../../domain/models/animal.models";

class CatalogService {
    constructor(private catalogRepository: ICatalogRepository) { }

    async getAllCatalogs(page: number, size: number): Promise<Animal[]> {
        return this.catalogRepository.getAllCatalogs(page, size);
    }

    async getCatalogByCommonName(commonName: string): Promise<Animal> {
        return this.catalogRepository.getCatalogByCommonName(commonName);
    }

    async createCatalog(animal: Animal): Promise<Animal> {
        return this.catalogRepository.createCatalog(animal);
    }

    async updateCatalog(id: string, animal: Animal): Promise<Animal> {
        return this.catalogRepository.updateCatalog(id, animal);
    }

    async deleteCatalog(id: string): Promise<void> {
        return this.catalogRepository.deleteCatalog(id);
    }

    async getLocations(catalogId: string): Promise<LocationResponse> {
        return this.catalogRepository.getLocations(catalogId);
    }
}

const catalogRepository = new CatalogRepository(ApiService.getInstance().client, new ConsoleLogger('debug'));
export const catalogService = new CatalogService(catalogRepository);
