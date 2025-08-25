import { AxiosInstance } from 'axios';
import { BaseRepository } from './base.repository';
import { ILogger } from '../../shared/types/ILogger';
import { ICatalogRepository } from '../../domain/interfaces/catalog.repository.interface';
import Animal from '../../domain/entities/animal.entity';
import {
  LocationResponse,
  ParsedLocation
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

  async getAllCatalogs(page: number, size: number): Promise<Animal[]> {
    try {
      const response = await this.api.get<Animal[]>(
        `/Animal/Catalog?page=${page}&size=${size}`
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

  async createCatalog(animal: Animal): Promise<Animal> {
    try {
      const response = await this.api.post<Animal>(
        '/Animal/new-catalog',
        animal
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(error, 'Error al crear el animal');
    }
  }

  async updateCatalog(id: string, animal: Animal): Promise<Animal> {
    try {
      const response = await this.api.patch<Animal>(
        `/Animal/update-catalog/${id}`,
        animal
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error,
        `Error al actualizar el animal con ID ${id}`
      );
    }
  }

  async deleteCatalog(id: string): Promise<void> {
    try {
      const response = await this.api.delete(`/Animal/delete-catalog/${id}`);
      this.ensureSuccessStatus(response);
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

      console.log('Coords raw:', response.data.cords); // DEBUG

      const parsedCords: ParsedLocation[] = response.data.cords.map(item => {
        const [latStr, lonStr] = item.location.split(',');
        const latitude = parseFloat(latStr);
        const longitude = parseFloat(lonStr);

        // Para debug solo comentamos filtro:
        // if (isNaN(latitude) || isNaN(longitude)) return null;

        return { latitude, longitude };
      });
      //.filter(Boolean) as ParsedLocation[]; // comentado temporalmente

      console.log('Coords parsed:', parsedCords); // DEBUG

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
}

export const catalogRepository = new CatalogRepository(
  ApiService.getInstance().client,
  logger
);
