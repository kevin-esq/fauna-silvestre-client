import Animal from '../entities/animal.entity';
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
} from '../models/animal.models';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface ICatalogRepository {
  getAllCatalogs(
    page: number,
    size: number,
    signal?: AbortSignal
  ): Promise<CatalogModelResponse>;
  getCatalogByCommonName(commonName: string): Promise<Animal>;
  getCatalogById(catalogId: string): Promise<AnimalModelResponse>;
  createCatalog(
    createAnimalRequest: CreateAnimalRequest
  ): Promise<AnimalCrudResponse>;
  updateCatalog(
    updateAnimalRequest: UpdateAnimalRequest
  ): Promise<AnimalCrudResponse>;
  updateCatalogImage(
    updateAnimalImageRequest: UpdateAnimalImageRequest
  ): Promise<AnimalCrudResponse>;
  deleteCatalog(id: string): Promise<DeleteAnimalResponse>;
  getLocations(catalogId: string): Promise<LocationResponse>;
  downloadAnimalSheet(catalogId: string): Promise<Blob>;
  getCommonNouns(): Promise<CommonNounResponse[]>;
}
