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

export class CatalogService {
  // Configuration constants
  private static readonly MIN_PAGE_NUMBER = 1;
  private static readonly MAX_PAGE_SIZE = 100;
  private static readonly MIN_PAGE_SIZE = 1;

  constructor(
    private readonly catalogRepository: ICatalogRepository,
    private readonly logger: ConsoleLogger
  ) {}

  async getAllCatalogs(
    page: number,
    size: number,
    signal?: AbortSignal
  ): Promise<CatalogModelResponse> {
    this.validatePaginationParams(page, size);

    try {
      this.logger.debug('Obteniendo todos los catálogos', { page, size });
      return await this.catalogRepository.getAllCatalogs(page, size, signal);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.debug('Request cancelado por el usuario');
        throw error;
      }
      this.logger.error('Error al obtener catálogos', error as Error, {
        page,
        size
      });
      throw error;
    }
  }

  async getCatalogByCommonName(commonName: string): Promise<Animal> {
    this.validateNonEmptyString(commonName, 'commonName', 'getCatalogByCommonName');

    try {
      this.logger.debug('Obteniendo catálogo por nombre común', { commonName });
      return await this.catalogRepository.getCatalogByCommonName(commonName);
    } catch (error) {
      this.logger.error(
        'Error al obtener catálogo por nombre común',
        error as Error,
        { commonName }
      );
      throw error;
    }
  }

  async getCatalogById(catalogId: string): Promise<AnimalModelResponse> {
    this.validateId(catalogId, 'getCatalogById');

    try {
      this.logger.debug('Obteniendo catálogo por ID', { catalogId });
      return await this.catalogRepository.getCatalogById(catalogId);
    } catch (error) {
      this.logger.error('Error al obtener catálogo por ID', error as Error, {
        catalogId
      });
      throw error;
    }
  }

  async createCatalog(
    createAnimalRequest: CreateAnimalRequest
  ): Promise<AnimalCrudResponse> {
    this.validateCreateRequest(createAnimalRequest);

    try {
      this.logger.debug('Creando catálogo', {
        specie: createAnimalRequest.specie
      });
      const result = await this.catalogRepository.createCatalog(createAnimalRequest);
      this.logger.info('Catálogo creado exitosamente', {
        specie: createAnimalRequest.specie
      });
      return result;
    } catch (error) {
      this.logger.error('Error al crear catálogo', error as Error, {
        specie: createAnimalRequest.specie
      });
      throw error;
    }
  }

  async updateCatalog(
    updateAnimalRequest: UpdateAnimalRequest
  ): Promise<AnimalCrudResponse> {
    this.validateUpdateRequest(updateAnimalRequest);

    try {
      this.logger.debug('Actualizando catálogo', {
        catalogId: updateAnimalRequest.catalogId
      });
      const result = await this.catalogRepository.updateCatalog(updateAnimalRequest);
      this.logger.info('Catálogo actualizado exitosamente', {
        catalogId: updateAnimalRequest.catalogId
      });
      return result;
    } catch (error) {
      this.logger.error('Error al actualizar catálogo', error as Error, {
        catalogId: updateAnimalRequest.catalogId
      });
      throw error;
    }
  }

  async updateCatalogImage(
    updateAnimalImageRequest: UpdateAnimalImageRequest
  ): Promise<AnimalCrudResponse> {
    this.validateImageUpdateRequest(updateAnimalImageRequest);

    try {
      this.logger.debug('Actualizando imagen de catálogo', {
        catalogId: updateAnimalImageRequest.catalogId
      });
      const result = await this.catalogRepository.updateCatalogImage(
        updateAnimalImageRequest
      );
      this.logger.info('Imagen de catálogo actualizada exitosamente', {
        catalogId: updateAnimalImageRequest.catalogId
      });
      return result;
    } catch (error) {
      this.logger.error(
        'Error al actualizar imagen de catálogo',
        error as Error,
        { catalogId: updateAnimalImageRequest.catalogId }
      );
      throw error;
    }
  }

  async deleteCatalog(id: string): Promise<DeleteAnimalResponse> {
    this.validateId(id, 'deleteCatalog');

    try {
      this.logger.debug('Eliminando catálogo', { id });
      const result = await this.catalogRepository.deleteCatalog(id);
      this.logger.info('Catálogo eliminado exitosamente', { id });
      return result;
    } catch (error) {
      this.logger.error('Error al eliminar catálogo', error as Error, { id });
      throw error;
    }
  }

  async getLocations(catalogId: string): Promise<LocationResponse> {
    this.validateId(catalogId, 'getLocations');

    try {
      this.logger.debug('Obteniendo ubicaciones', { catalogId });
      return await this.catalogRepository.getLocations(catalogId);
    } catch (error) {
      this.logger.error('Error al obtener ubicaciones', error as Error, {
        catalogId
      });
      throw error;
    }
  }

  async downloadAnimalSheet(catalogId: string): Promise<Blob> {
    this.validateId(catalogId, 'downloadAnimalSheet');

    try {
      this.logger.debug('Descargando ficha de animal', { catalogId });
      const result = await this.catalogRepository.downloadAnimalSheet(catalogId);
      this.logger.info('Ficha descargada exitosamente', { catalogId });
      return result;
    } catch (error) {
      this.logger.error('Error al descargar ficha', error as Error, {
        catalogId
      });
      throw error;
    }
  }

  async getCommonNouns(): Promise<CommonNounResponse[]> {
    try {
      this.logger.debug('Obteniendo nombres comunes');
      return await this.catalogRepository.getCommonNouns();
    } catch (error) {
      this.logger.error('Error al obtener nombres comunes', error as Error);
      throw error;
    }
  }

  // Validation methods
  private validateId(id: string, context: string): void {
    if (!id?.trim()) {
      throw new Error(`ID es requerido para ${context}`);
    }
  }

  private validateNonEmptyString(
    value: string,
    fieldName: string,
    context: string
  ): void {
    if (!value?.trim()) {
      throw new Error(`${fieldName} es requerido para ${context}`);
    }
  }

  private validatePaginationParams(page: number, size: number): void {
    if (!Number.isInteger(page) || page < CatalogService.MIN_PAGE_NUMBER) {
      throw new Error(
        `El número de página debe ser un entero mayor o igual a ${CatalogService.MIN_PAGE_NUMBER}`
      );
    }
    if (
      !Number.isInteger(size) ||
      size < CatalogService.MIN_PAGE_SIZE ||
      size > CatalogService.MAX_PAGE_SIZE
    ) {
      throw new Error(
        `El límite debe ser un entero entre ${CatalogService.MIN_PAGE_SIZE} y ${CatalogService.MAX_PAGE_SIZE}`
      );
    }
  }

  private validateCreateRequest(request: CreateAnimalRequest): void {
    if (!request) {
      throw new Error('CreateAnimalRequest es requerido');
    }
    if (!request.specie?.trim()) {
      throw new Error('La especie es requerida');
    }
    if (!request.commonNoun?.trim()) {
      throw new Error('El nombre común es requerido');
    }
  }

  private validateUpdateRequest(request: UpdateAnimalRequest): void {
    if (!request) {
      throw new Error('UpdateAnimalRequest es requerido');
    }
    if (!request.catalogId) {
      throw new Error('El catalogId es requerido para actualizar');
    }
  }

  private validateImageUpdateRequest(request: UpdateAnimalImageRequest): void {
    if (!request) {
      throw new Error('UpdateAnimalImageRequest es requerido');
    }
    if (!request.catalogId) {
      throw new Error('El catalogId es requerido para actualizar imagen');
    }
    if (!request.image?.trim()) {
      throw new Error('La imagen es requerida');
    }
  }
}

export class CatalogServiceFactory {
  private static instance: CatalogService;

  static getInstance(): CatalogService {
    if (!this.instance) {
      const logger = new ConsoleLogger('debug');
      const catalogRepository = new CatalogRepository(
        ApiService.getInstance().client,
        logger
      );
      this.instance = new CatalogService(catalogRepository, logger);
    }
    return this.instance;
  }

  static resetInstance(): void {
    // @ts-expect-error - Allow reset for testing purposes
    this.instance = undefined;
  }
}

export const catalogService = CatalogServiceFactory.getInstance();
