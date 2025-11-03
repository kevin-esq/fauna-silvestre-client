import { PublicationRepository } from '@/data/repositories/publication.repository';
import { IPublicationRepository } from '@/domain/interfaces/publication.repository.interface';
import {
  PublicationData,
  PublicationsModel,
  PublicationResponse,
  CountsResponse
} from '@/domain/models/publication.models';
import { ApiService } from '@/services/http/api.service';
import { ConsoleLogger } from '@/services/logging/console-logger';
import { ErrorHandlingService } from '@/services/error-handling';

export enum PublicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export interface PaginationOptions {
  page: number;
  size: number;
}
export interface PublicationFilters extends PaginationOptions {
  status: PublicationStatus;
  forAdmin: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class PublicationService {
  // Configuration constants
  private static readonly DEFAULT_BATCH_SIZE = 5;
  private static readonly MAX_PAGE_SIZE = 100;
  private static readonly MIN_PAGE_SIZE = 1;
  private static readonly MIN_PAGE_NUMBER = 1;
  private static readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  private readonly repository: IPublicationRepository;
  private readonly logger: ConsoleLogger;
  private readonly errorHandler: ErrorHandlingService;
  private onCacheInvalidate?: () => void;

  private countsCache: CacheEntry<CountsResponse> | null = null;

  private readonly statusHandlers = new Map<
    PublicationStatus,
    {
      admin: (page: number, size: number) => Promise<PublicationResponse>;
      user: (page: number, size: number) => Promise<PublicationResponse>;
    }
  >([
    [
      PublicationStatus.PENDING,
      {
        admin: (page, size) =>
          this.repository.getAllPendingPublications(page, size),
        user: (page, size) =>
          this.repository.getUserPendingPublications(page, size)
      }
    ],
    [
      PublicationStatus.ACCEPTED,
      {
        admin: (page, size) =>
          this.repository.getAllAcceptedPublications(page, size),
        user: (page, size) =>
          this.repository.getUserAcceptedPublications(page, size)
      }
    ],
    [
      PublicationStatus.REJECTED,
      {
        admin: (page, size) =>
          this.repository.getAllRejectedPublications(page, size),
        user: (page, size) =>
          this.repository.getUserRejectedPublications(page, size)
      }
    ]
  ]);

  constructor(apiService: ApiService, errorHandler?: ErrorHandlingService) {
    this.logger = new ConsoleLogger();
    this.errorHandler = errorHandler || new ErrorHandlingService();
    this.repository = new PublicationRepository(
      apiService.client,
      this.logger
    );
  }

  setOnCacheInvalidate(callback?: () => void) {
    this.onCacheInvalidate = callback;
  }

  async createPublication(publication: PublicationData): Promise<void> {
    this.logger.debug('Creando publicación', { publication });

    await this.errorHandler.handleWithRetry(
      async () => {
        await this.repository.createPublication(publication);
        this.invalidateCountsCache();
      },
      { operation: 'createPublication' },
      { maxAttempts: 1 },
      this.logger
    );

    this.logger.info('Publicación creada exitosamente');
  }

  async getUserPublications(): Promise<PublicationsModel[]> {
    this.logger.debug('Obteniendo publicaciones del usuario');

    return this.errorHandler.handleWithRetry(
      () => this.repository.getUserPublications(),
      { operation: 'getUserPublications' },
      { maxAttempts: 2 },
      this.logger
    );
  }

  async getAllPublications(): Promise<PublicationsModel[]> {
    this.logger.debug('Obteniendo todas las publicaciones');

    return this.errorHandler.handleWithRetry(
      () => this.repository.getAllPublications(),
      { operation: 'getAllPublications' },
      { maxAttempts: 2 },
      this.logger
    );
  }

  async getPublicationsByStatus({
    status,
    page,
    size,
    forAdmin
  }: PublicationFilters): Promise<PublicationResponse> {
    this.validatePaginationParams(page, size);

    const handler = this.statusHandlers.get(status);
    if (!handler) {
      throw new Error(`Estado de publicación inválido: ${status}`);
    }

    this.logger.debug('Obteniendo publicaciones por estado', {
      status,
      page,
      size,
      forAdmin
    });

    const methodToCall = forAdmin ? handler.admin : handler.user;

    return this.errorHandler.handleWithRetry(
      () => methodToCall(page, size),
      { operation: 'getPublicationsByStatus', params: { status, page, size, forAdmin } },
      { maxAttempts: 2 },
      this.logger
    );
  }

  async getPublicationById(recordId: string): Promise<PublicationResponse> {
    this.validatePublicationId(recordId, 'getPublicationById');

    this.logger.debug('Obteniendo publicación por ID', { recordId });

    return this.errorHandler.handleWithRetry(
      () => this.repository.getPublicationById(recordId),
      { operation: 'getPublicationById', params: { recordId } },
      { maxAttempts: 2 },
      this.logger
    );
  }

  async acceptPublication(publicationId: string): Promise<void> {
    this.validatePublicationId(publicationId, 'acceptPublication');

    try {
      this.logger.debug('Aceptando publicación', { publicationId });
      await this.repository.acceptPublication(publicationId);

      this.invalidateCountsCache();
      this.onCacheInvalidate?.();

      this.logger.info('Publicación aceptada exitosamente', { publicationId });
    } catch (error) {
      this.logger.error('Error al aceptar publicación', error as Error, {
        publicationId
      });
      throw error;
    }
  }

  async rejectPublication(
    publicationId: string,
    reason?: string
  ): Promise<void> {
    this.validatePublicationId(publicationId, 'rejectPublication');

    try {
      this.logger.debug('Rechazando publicación', { publicationId, reason });
      await this.repository.rejectPublication(publicationId, reason);

      this.invalidateCountsCache();
      this.onCacheInvalidate?.();

      this.logger.info('Publicación rechazada exitosamente', {
        publicationId,
        reason
      });
    } catch (error) {
      this.logger.error('Error al rechazar publicación', error as Error, {
        publicationId
      });
      throw error;
    }
  }

  async getCounts(): Promise<CountsResponse> {
    if (this.isCacheValid()) {
      this.logger.debug('Retornando conteos desde cache');
      return this.countsCache!.data;
    }

    this.logger.debug('Obteniendo conteos desde repositorio');

    const counts = await this.errorHandler.handleWithRetry(
      () => this.repository.getCounts(),
      { operation: 'getCounts' },
      { maxAttempts: 2 },
      this.logger
    );

    this.countsCache = {
      data: counts,
      timestamp: Date.now(),
      ttl: PublicationService.CACHE_TTL_MS
    };

    return counts;
  }

  async processBulkPublications(
    publicationIds: string[],
    action: 'accept' | 'reject'
  ): Promise<{ success: string[]; failed: string[] }> {
    const results = { success: [] as string[], failed: [] as string[] };

    const actionHandler = action === 'accept'
      ? (id: string) => this.acceptPublication(id)
      : (id: string) => this.rejectPublication(id);

    for (let i = 0; i < publicationIds.length; i += PublicationService.DEFAULT_BATCH_SIZE) {
      const batch = publicationIds.slice(i, i + PublicationService.DEFAULT_BATCH_SIZE);

      const promises = batch.map(async id => {
        try {
          await actionHandler(id);
          return { id, success: true };
        } catch (error) {
          this.logger.error(
            `Error procesando publicación ${id}`,
            error as Error
          );
          return { id, success: false };
        }
      });

      const batchResults = await Promise.allSettled(promises);
      batchResults.forEach((result, index) => {
        const id: string = batch[index];
        if (result.status === 'fulfilled' && result.value.success) {
          results.success.push(id);
        } else {
          results.failed.push(id);
        }
      });
    }

    // Invalidate cache if any operations succeeded
    if (results.success.length > 0) {
      this.invalidateCountsCache();
      this.onCacheInvalidate?.();
    }

    return results;
  }

  private validatePaginationParams(page: number, size: number): void {
    if (!Number.isInteger(page) || page < PublicationService.MIN_PAGE_NUMBER) {
      throw new Error(
        `El número de página debe ser un entero mayor o igual a ${PublicationService.MIN_PAGE_NUMBER}`
      );
    }
    if (
      !Number.isInteger(size) ||
      size < PublicationService.MIN_PAGE_SIZE ||
      size > PublicationService.MAX_PAGE_SIZE
    ) {
      throw new Error(
        `El límite debe ser un entero entre ${PublicationService.MIN_PAGE_SIZE} y ${PublicationService.MAX_PAGE_SIZE}`
      );
    }
  }

  private validatePublicationId(id: string, context: string): void {
    if (!id?.trim()) {
      throw new Error(`ID de publicación es requerido para ${context}`);
    }
  }

  private isCacheValid(): boolean {
    return (
      this.countsCache !== null &&
      Date.now() - this.countsCache.timestamp < this.countsCache.ttl
    );
  }

  private invalidateCountsCache(): void {
    this.countsCache = null;
    this.logger.debug('Cache de conteos invalidado');
  }
}

export class PublicationServiceFactory {
  private static instance: PublicationService;

  static getInstance(): PublicationService {
    if (!this.instance) {
      const apiService = ApiService.getInstance();
      this.instance = new PublicationService(apiService);
    }
    return this.instance;
  }

  static resetInstance(): void {
    // @ts-expect-error - Allow reset for testing purposes
    this.instance = undefined;
  }
}

export const publicationService = PublicationServiceFactory.getInstance();
