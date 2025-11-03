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
  private readonly repository: IPublicationRepository;
  private readonly logger: ConsoleLogger;
  private onCacheInvalidate?: (() => void) | null;

  private countsCache: CacheEntry<CountsResponse> | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000;

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

  constructor(apiService: ApiService) {
    this.repository = new PublicationRepository(
      apiService.client,
      new ConsoleLogger()
    );
    this.logger = new ConsoleLogger();
  }

  setOnCacheInvalidate(callback: (() => void) | null) {
    this.onCacheInvalidate = callback;
  }

  async createPublication(publication: PublicationData): Promise<void> {
    try {
      this.logger.debug('Creando publicación', { publication });
      await this.repository.createPublication(publication);

      this.invalidateCountsCache();

      this.logger.info('Publicación creada exitosamente');
    } catch (error) {
      this.logger.error('Error al crear publicación', error as Error);
      throw new Error('No se pudo crear la publicación');
    }
  }

  async getUserPublications(): Promise<PublicationsModel[]> {
    try {
      this.logger.debug('Obteniendo publicaciones del usuario');
      return await this.repository.getUserPublications();
    } catch (error) {
      this.logger.error(
        'Error al obtener publicaciones del usuario',
        error as Error
      );
      throw new Error('No se pudieron obtener las publicaciones del usuario');
    }
  }

  async getAllPublications(): Promise<PublicationsModel[]> {
    try {
      this.logger.debug('Obteniendo todas las publicaciones');
      return await this.repository.getAllPublications();
    } catch (error) {
      this.logger.error(
        'Error al obtener todas las publicaciones',
        error as Error
      );
      throw new Error('No se pudieron obtener las publicaciones');
    }
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

    try {
      this.logger.debug('Obteniendo publicaciones por estado', {
        status,
        page,
        size,
        forAdmin
      });

      const methodToCall = forAdmin ? handler.admin : handler.user;
      return await methodToCall(page, size);
    } catch (error) {
      this.logger.error(
        'Error al obtener publicaciones por estado',
        error as Error,
        {
          status,
          page,
          size,
          forAdmin
        }
      );
      throw new Error(
        `No se pudieron obtener las publicaciones con estado ${status}`
      );
    }
  }

  async getPublicationById(recordId: string): Promise<PublicationResponse> {
    if (!recordId?.trim()) {
      throw new Error('ID de publicación es requerido');
    }

    try {
      this.logger.debug('Obteniendo publicación por ID', { recordId });
      return await this.repository.getPublicationById(recordId);
    } catch (error) {
      this.logger.error('Error al obtener publicación por ID', error as Error, {
        recordId
      });
      throw new Error(`No se pudo obtener la publicación con ID: ${recordId}`);
    }
  }

  async acceptPublication(publicationId: string): Promise<void> {
    if (!publicationId?.trim()) {
      throw new Error('ID de publicación es requerido');
    }

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
    if (!publicationId?.trim()) {
      throw new Error('ID de publicación es requerido');
    }

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

    try {
      this.logger.debug('Obteniendo conteos desde repositorio');
      const counts = await this.repository.getCounts();

      this.countsCache = {
        data: counts,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL
      };

      return counts;
    } catch (error) {
      this.logger.debug('Error al obtener conteos', error as Error);
      throw new Error('No se pudieron obtener los conteos');
    }
  }

  async processBulkPublications(
    publicationIds: string[],
    action: 'accept' | 'reject'
  ): Promise<{ success: string[]; failed: string[] }> {
    const results = { success: [] as string[], failed: [] as string[] };

    const BATCH_SIZE = 5;
    for (let i = 0; i < publicationIds.length; i += BATCH_SIZE) {
      const batch = publicationIds.slice(i, i + BATCH_SIZE);

      const promises = batch.map(async id => {
        try {
          if (action === 'accept') {
            await this.acceptPublication(id);
          } else {
            await this.rejectPublication(id);
          }
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

    return results;
  }

  private validatePaginationParams(page: number, size: number): void {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('El número de página debe ser un entero mayor a 0');
    }
    if (!Number.isInteger(size) || size < 1 || size > 100) {
      throw new Error('El límite debe ser un entero entre 1 y 100');
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
  private static instance: PublicationService | null = null;

  static getInstance(): PublicationService {
    if (!this.instance) {
      const apiService = ApiService.getInstance();
      this.instance = new PublicationService(apiService);
    }
    return this.instance;
  }

  static createInstance(apiService?: ApiService): PublicationService {
    if (apiService) {
      return new PublicationService(apiService);
    }
    return this.getInstance();
  }
}

export const publicationService = PublicationServiceFactory.getInstance();
