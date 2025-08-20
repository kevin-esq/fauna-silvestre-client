import { PublicationRepository } from '../../data/repositories/publication.repository';
import { IPublicationRepository } from '../../domain/interfaces/publication.repository.interface';
import {
  PublicationData,
  PublicationsModel,
  PublicationResponse,
  CountsResponse,
} from '../../domain/models/publication.models';
import { ApiService } from '../http/api.service';
import { ConsoleLogger } from '../logging/console-logger';

// Enum para los estados de publicación (más type-safe)
export enum PublicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

// Interfaz para opciones de paginación
export interface PaginationOptions {
  page: number;
  limit: number;
}

// Interfaz para filtros de publicaciones
export interface PublicationFilters extends PaginationOptions {
  status: PublicationStatus;
  forAdmin: boolean;
}

// Interfaz para cache de conteos
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class PublicationService {
  private readonly repository: IPublicationRepository;
  private readonly logger: ConsoleLogger;
  
  // Cache simple para conteos (TTL de 5 minutos)
  private countsCache: CacheEntry<CountsResponse> | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos en ms

  // Map para optimizar el switch-case
  private readonly statusHandlers = new Map<
    PublicationStatus,
    {
      admin: (page: number, limit: number) => Promise<PublicationResponse[]>;
      user: (page: number, limit: number) => Promise<PublicationResponse[]>;
    }
  >([
    [PublicationStatus.PENDING, {
      admin: (page, limit) => this.repository.getAllPendingPublications(page, limit),
      user: (page, limit) => this.repository.getUserPendingPublications(page, limit),
    }],
    [PublicationStatus.ACCEPTED, {
      admin: (page, limit) => this.repository.getAllAcceptedPublications(page, limit),
      user: (page, limit) => this.repository.getUserAcceptedPublications(page, limit),
    }],
    [PublicationStatus.REJECTED, {
      admin: (page, limit) => this.repository.getAllRejectedPublications(page, limit),
      user: (page, limit) => this.repository.getUserRejectedPublications(page, limit),
    }],
  ]);

  constructor(repository: IPublicationRepository, logger?: ConsoleLogger) {
    this.repository = repository;
    this.logger = logger || new ConsoleLogger('info');
  }

  /**
   * Crea una nueva publicación
   */
  async createPublication(publication: PublicationData): Promise<void> {
    try {
      this.logger.debug('Creando publicación', { publication });
      await this.repository.createPublication(publication);
      
      // Invalidar cache de conteos al crear una nueva publicación
      this.invalidateCountsCache();
      
      this.logger.info('Publicación creada exitosamente');
    } catch (error) {
      this.logger.error('Error al crear publicación', error as Error);
      throw new Error('No se pudo crear la publicación');
    }
  }

  /**
   * Obtiene las publicaciones del usuario actual
   */
  async getUserPublications(): Promise<PublicationsModel[]> {
    try {
      this.logger.debug('Obteniendo publicaciones del usuario');
      return await this.repository.getUserPublications();
    } catch (error) {
      this.logger.error('Error al obtener publicaciones del usuario', error as Error);
      throw new Error('No se pudieron obtener las publicaciones del usuario');
    }
  }

  /**
   * Obtiene todas las publicaciones (solo para admin)
   */
  async getAllPublications(): Promise<PublicationsModel[]> {
    try {
      this.logger.debug('Obteniendo todas las publicaciones');
      return await this.repository.getAllPublications();
    } catch (error) {
      this.logger.error('Error al obtener todas las publicaciones', error as Error);
      throw new Error('No se pudieron obtener las publicaciones');
    }
  }

  /**
   * Obtiene publicaciones por estado con paginación
   * Versión optimizada que usa Map en lugar de switch
   */
  async getPublicationsByStatus({
    status,
    page,
    limit,
    forAdmin,
  }: PublicationFilters): Promise<PublicationResponse[]> {
    // Validación de entrada
    this.validatePaginationParams(page, limit);
    
    const handler = this.statusHandlers.get(status);
    if (!handler) {
      throw new Error(`Estado de publicación inválido: ${status}`);
    }

    try {
      this.logger.debug('Obteniendo publicaciones por estado', {
        status,
        page,
        limit,
        forAdmin,
      });

      const methodToCall = forAdmin ? handler.admin : handler.user;
      return await methodToCall(page, limit);
    } catch (error) {
      this.logger.error('Error al obtener publicaciones por estado', error as Error, {
        status,
        page,
        limit,
        forAdmin,
      });
      throw new Error(`No se pudieron obtener las publicaciones con estado ${status}`);
    }
  }

  /**
   * Obtiene una publicación por ID
   */
  async getPublicationById(recordId: string): Promise<PublicationResponse> {
    if (!recordId?.trim()) {
      throw new Error('ID de publicación es requerido');
    }

    try {
      this.logger.debug('Obteniendo publicación por ID', { recordId });
      return await this.repository.getPublicationById(recordId);
    } catch (error) {
      this.logger.error('Error al obtener publicación por ID', error as Error, { recordId });
      throw new Error(`No se pudo obtener la publicación con ID: ${recordId}`);
    }
  }

  /**
   * Acepta una publicación
   */
  async acceptPublication(publicationId: string): Promise<void> {
    if (!publicationId?.trim()) {
      throw new Error('ID de publicación es requerido');
    }

    try {
      this.logger.debug('Aceptando publicación', { publicationId });
      await this.repository.acceptPublication(publicationId);
      
      // Invalidar cache de conteos al cambiar estado
      this.invalidateCountsCache();
      
      this.logger.info('Publicación aceptada exitosamente', { publicationId });
    } catch (error) {
      this.logger.error('Error al aceptar publicación', error as Error, { publicationId });
      throw new Error(`No se pudo aceptar la publicación con ID: ${publicationId}`);
    }
  }

  /**
   * Rechaza una publicación
   */
  async rejectPublication(publicationId: string): Promise<void> {
    if (!publicationId?.trim()) {
      throw new Error('ID de publicación es requerido');
    }

    try {
      this.logger.debug('Rechazando publicación', { publicationId });
      await this.repository.rejectPublication(publicationId);
      
      // Invalidar cache de conteos al cambiar estado
      this.invalidateCountsCache();
      
      this.logger.info('Publicación rechazada exitosamente', { publicationId });
    } catch (error) {
      this.logger.error('Error al rechazar publicación', error as Error, { publicationId });
      throw new Error(`No se pudo rechazar la publicación con ID: ${publicationId}`);
    }
  }

  /**
   * Obtiene conteos con cache
   */
  async getCounts(): Promise<CountsResponse> {
    // Verificar si el cache es válido
    if (this.isCacheValid()) {
      this.logger.debug('Retornando conteos desde cache');
      return this.countsCache!.data;
    }

    try {
      this.logger.debug('Obteniendo conteos desde repositorio');
      const counts = await this.repository.getCounts();
      
      // Guardar en cache
      this.countsCache = {
        data: counts,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL,
      };

      return counts;
    } catch (error) {
      this.logger.error('Error al obtener conteos', error as Error);
      throw new Error('No se pudieron obtener los conteos');
    }
  }

  /**
   * Procesa múltiples publicaciones en lote (método adicional útil)
   */
  async processBulkPublications(
    publicationIds: string[],
    action: 'accept' | 'reject'
  ): Promise<{ success: string[]; failed: string[] }> {
    const results = { success: [] as string[], failed: [] as string[] };
    
    // Procesar en paralelo con límite de concurrencia
    const BATCH_SIZE = 5;
    for (let i = 0; i < publicationIds.length; i += BATCH_SIZE) {
      const batch = publicationIds.slice(i, i + BATCH_SIZE);
      
      const promises = batch.map(async (id) => {
        try {
          if (action === 'accept') {
            await this.acceptPublication(id);
          } else {
            await this.rejectPublication(id);
          }
          return { id, success: true };
        } catch (error) {
          this.logger.error(`Error procesando publicación ${id}`, error as Error);
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

  // Métodos privados auxiliares
  private validatePaginationParams(page: number, limit: number): void {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('El número de página debe ser un entero mayor a 0');
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
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

// Factory para crear instancias del servicio
export class PublicationServiceFactory {
  private static instance: PublicationService | null = null;

  static getInstance(): PublicationService {
    if (!this.instance) {
      const repository = new PublicationRepository(
        ApiService.getInstance().client,
        new ConsoleLogger('debug'),
      );
      this.instance = new PublicationService(repository);
    }
    return this.instance;
  }

  static createInstance(repository?: IPublicationRepository): PublicationService {
    if (repository) {
      return new PublicationService(repository);
    }
    return this.getInstance();
  }
}

// Exportar instancia singleton (mantener compatibilidad)
export const publicationService = PublicationServiceFactory.getInstance();