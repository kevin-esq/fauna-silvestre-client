import { AxiosInstance } from 'axios';
import { BaseRepository } from './base.repository';
import { ILogger } from '../../shared/types/ILogger';
import { ICatalogRepository } from '../../domain/interfaces/catalog.repository.interface';
import Animal from '../../domain/entities/animal.entity';
import {
  CatalogModelResponse,
  LocationResponse,
  ParsedLocation,
  AnimalModelResponse,
  CommonNounResponse,
  CreateAnimalRequest,
  UpdateAnimalRequest,
  UpdateAnimalImageRequest,
  AnimalCrudResponse,
  DeleteAnimalResponse
} from '../../domain/models/animal.models';
import { ApiService } from '../../services/http/api.service';
import { ConsoleLogger } from '../../services/logging/console-logger';

const logger = new ConsoleLogger('info');
export class CatalogRepository
  extends BaseRepository
  implements ICatalogRepository
{
  constructor(api: AxiosInstance, logger: ILogger) {
    super(api, logger);
  }

  async getAllCatalogs(
    page: number,
    size: number,
    signal?: AbortSignal
  ): Promise<CatalogModelResponse> {
    try {
      const response = await this.api.get<CatalogModelResponse>(
        `/Animal/Catalog?page=${page}&size=${size}`,
        { signal }
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error as Error,
        'Error al obtener todos los animales'
      );
    }
  }

  async getCatalogByCommonName(commonName: string): Promise<Animal> {
    try {
      const response = await this.api.get<Animal>(
        `/Animal/byCommonNoun/${commonName}`
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error,
        `Error al obtener el animal con nombre común ${commonName}`
      );
    }
  }

  async getCatalogById(catalogId: string): Promise<AnimalModelResponse> {
    try {
      const response = await this.api.get<AnimalModelResponse>(
        `/Animal/by-Id/${catalogId}`
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error,
        `Error al obtener el animal con ID ${catalogId}`
      );
    }
  }

  async createCatalog(
    createAnimalRequest: CreateAnimalRequest
  ): Promise<AnimalCrudResponse> {
    try {
      console.log('Creating catalog with request:', createAnimalRequest);
      const response = await this.api.post<AnimalCrudResponse>(
        '/Admin/new-catalog',
        createAnimalRequest
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(error, 'Error al crear el animal');
    }
  }

  async updateCatalog(
    updateAnimalRequest: UpdateAnimalRequest
  ): Promise<AnimalCrudResponse> {
    try {
      const response = await this.api.patch<AnimalCrudResponse>(
        '/Admin/catalog',
        updateAnimalRequest
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error,
        `Error al actualizar el animal con ID ${updateAnimalRequest.catalogId}`
      );
    }
  }

  async updateCatalogImage(
    updateAnimalImageRequest: UpdateAnimalImageRequest
  ): Promise<AnimalCrudResponse> {
    try {
      const response = await this.api.patch<AnimalCrudResponse>(
        '/Admin/catalog-img',
        updateAnimalImageRequest
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error,
        `Error al actualizar la imagen del animal con ID ${updateAnimalImageRequest.catalogId}`
      );
    }
  }

  async deleteCatalog(id: string): Promise<DeleteAnimalResponse> {
    try {
      const response = await this.api.delete<DeleteAnimalResponse>(
        `/Animal/delete-catalog/${id}`
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error,
        `Error al eliminar el animal con ID ${id}`
      );
    }
  }

  async getLocations(catalogId: string): Promise<LocationResponse> {
    try {
      const response = await this.api.get<{
        catalogId: number;
        cords: { location: string }[];
      }>(`/Animal/map/${catalogId}`);

      this.ensureSuccessStatus(response);

      const parsedCords: ParsedLocation[] = response.data.cords.map(item => {
        const [latStr, lonStr] = item.location.split(',');
        const latitude = parseFloat(latStr);
        const longitude = parseFloat(lonStr);

        return { latitude, longitude };
      });

      return {
        catalogId: response.data.catalogId,
        cords: parsedCords
      };
    } catch (error) {
      throw this.handleHttpError(
        error,
        `Error al obtener ubicaciones del catálogo con ID ${catalogId}`
      );
    }
  }

  async downloadAnimalSheet(catalogId: string): Promise<Blob> {
    try {
      const response = await this.api.get(
        `/Animal/bibliographic/${catalogId}`,
        {
          responseType: 'blob',
          headers: {
            Accept: 'application/pdf'
          }
        }
      );

      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error,
        `Error al descargar la ficha del animal con ID ${catalogId}`
      );
    }
  }

  async getCommonNouns(): Promise<CommonNounResponse[]> {
    try {
      const response = await this.api.get<CommonNounResponse[]>(
        '/Animal/common-noun'
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error,
        'Error al obtener los nombres comunes de animales'
      );
    }
  }
}

export const catalogRepository = new CatalogRepository(
  ApiService.getInstance().client,
  logger
);
