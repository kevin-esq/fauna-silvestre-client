import Animal from '../entities/animal.entity';
import { LocationResponse } from '../models/animal.models';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface ICatalogRepository {
  getAllCatalogs(page: number, size: number): Promise<Animal[]>;
  getCatalogByCommonName(commonName: string): Promise<Animal>;
  createCatalog(animal: Animal): Promise<Animal>;
  updateCatalog(id: string, animal: Animal): Promise<Animal>;
  deleteCatalog(id: string): Promise<void>;
  getLocations(catalogId: string): Promise<LocationResponse>;
}
