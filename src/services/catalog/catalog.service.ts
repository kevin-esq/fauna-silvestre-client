import { ICatalogRepository } from '@/domain/interfaces/catalog.repository.interface';
import Animal from '@/domain/entities/animal.entity';
import { ApiService } from '@/services/http/api.service';
import { CatalogRepository } from '@/data/repositories/catalog.repository';
import { ConsoleLogger } from '@/services/logging/console-logger';
import { ErrorHandlingService } from '@/services/error-handling';
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
    private readonly logger: ConsoleLogger,
    private readonly errorHandler: ErrorHandlingService
  ) {}

  async getAllCatalogs(
    page: number,
    size: number,
    signal?: AbortSignal
  ): Promise<CatalogModelResponse> {
    this.validatePaginationParams(page, size);

    this.logger.debug('Obteniendo todos los catálogos', { page, size });

    return this.errorHandler.handleWithRetry(
      () => this.catalogRepository.getAllCatalogs(page, size, signal),
      { operation: 'getAllCatalogs', params: { page, size } },
      { maxAttempts: 2 },
      this.logger
    );
  }

  async getCatalogByCommonName(commonName: string): Promise<Animal> {
    this.validateNonEmptyString(
      commonName,
      'commonName',
      'getCatalogByCommonName'
    );

    this.logger.debug('Obteniendo catálogo por nombre común', { commonName });

    return this.errorHandler.handleWithRetry(
      () => this.catalogRepository.getCatalogByCommonName(commonName),
      { operation: 'getCatalogByCommonName', params: { commonName } },
      { maxAttempts: 2 },
      this.logger
    );
  }

  async getCatalogById(catalogId: string): Promise<AnimalModelResponse> {
    this.validateId(catalogId, 'getCatalogById');

    this.logger.debug('Obteniendo catálogo por ID', { catalogId });

    return this.errorHandler.handleWithRetry(
      () => this.catalogRepository.getCatalogById(catalogId),
      { operation: 'getCatalogById', params: { catalogId } },
      { maxAttempts: 2 },
      this.logger
    );
  }

  async createCatalog(
    createAnimalRequest: CreateAnimalRequest
  ): Promise<AnimalCrudResponse> {
    this.validateCreateRequest(createAnimalRequest);

    this.logger.debug('Creando catálogo', {
      specie: createAnimalRequest.specie
    });

    const result = await this.errorHandler.handleWithRetry(
      () => this.catalogRepository.createCatalog(createAnimalRequest),
      {
        operation: 'createCatalog',
        params: { specie: createAnimalRequest.specie }
      },
      { maxAttempts: 1 }, // No retry for mutations
      this.logger
    );

    this.logger.info('Catálogo creado exitosamente', {
      specie: createAnimalRequest.specie
    });

    return result;
  }

  async updateCatalog(
    updateAnimalRequest: UpdateAnimalRequest
  ): Promise<AnimalCrudResponse> {
    this.validateUpdateRequest(updateAnimalRequest);

    this.logger.debug('Actualizando catálogo', {
      catalogId: updateAnimalRequest.catalogId
    });

    const result = await this.errorHandler.handleWithRetry(
      () => this.catalogRepository.updateCatalog(updateAnimalRequest),
      {
        operation: 'updateCatalog',
        params: { catalogId: updateAnimalRequest.catalogId }
      },
      { maxAttempts: 1 },
      this.logger
    );

    this.logger.info('Catálogo actualizado exitosamente', {
      catalogId: updateAnimalRequest.catalogId
    });

    return result;
  }

  async updateCatalogImage(
    updateAnimalImageRequest: UpdateAnimalImageRequest
  ): Promise<AnimalCrudResponse> {
    this.validateImageUpdateRequest(updateAnimalImageRequest);

    this.logger.debug('Actualizando imagen de catálogo', {
      catalogId: updateAnimalImageRequest.catalogId
    });

    const result = await this.errorHandler.handleWithRetry(
      () => this.catalogRepository.updateCatalogImage(updateAnimalImageRequest),
      {
        operation: 'updateCatalogImage',
        params: { catalogId: updateAnimalImageRequest.catalogId }
      },
      { maxAttempts: 1 },
      this.logger
    );

    this.logger.info('Imagen de catálogo actualizada exitosamente', {
      catalogId: updateAnimalImageRequest.catalogId
    });

    return result;
  }

  async deleteCatalog(id: string): Promise<DeleteAnimalResponse> {
    this.validateId(id, 'deleteCatalog');

    this.logger.debug('Eliminando catálogo', { id });

    const result = await this.errorHandler.handleWithRetry(
      () => this.catalogRepository.deleteCatalog(id),
      { operation: 'deleteCatalog', params: { id } },
      { maxAttempts: 1 },
      this.logger
    );

    this.logger.info('Catálogo eliminado exitosamente', { id });

    return result;
  }

  async getLocations(catalogId: string): Promise<LocationResponse> {
    this.validateId(catalogId, 'getLocations');

    this.logger.debug('Obteniendo ubicaciones', { catalogId });

    return this.errorHandler.handleWithRetry(
      () => this.catalogRepository.getLocations(catalogId),
      { operation: 'getLocations', params: { catalogId } },
      { maxAttempts: 2 },
      this.logger
    );
  }

  async downloadAnimalSheet(catalogId: string): Promise<Blob> {
    this.validateId(catalogId, 'downloadAnimalSheet');

    this.logger.debug('Descargando ficha de animal', { catalogId });

    const result = await this.errorHandler.handleWithRetry(
      () => this.catalogRepository.downloadAnimalSheet(catalogId),
      { operation: 'downloadAnimalSheet', params: { catalogId } },
      { maxAttempts: 2 },
      this.logger
    );

    this.logger.info('Ficha descargada exitosamente', { catalogId });

    return result;
  }

  async getCommonNouns(): Promise<CommonNounResponse[]> {
    this.logger.debug('Obteniendo nombres comunes');

    return this.errorHandler.handleWithRetry(
      () => this.catalogRepository.getCommonNouns(),
      { operation: 'getCommonNouns' },
      { maxAttempts: 2 },
      this.logger
    );
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
      const errorHandler = new ErrorHandlingService();
      const catalogRepository = new CatalogRepository(
        ApiService.getInstance().client,
        logger
      );
      this.instance = new CatalogService(
        catalogRepository,
        logger,
        errorHandler
      );
    }
    return this.instance;
  }

  static resetInstance(): void {
    // @ts-expect-error - Allow reset for testing purposes
    this.instance = undefined;
  }
}

export const catalogService = CatalogServiceFactory.getInstance();
