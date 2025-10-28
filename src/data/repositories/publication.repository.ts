import { AxiosInstance } from 'axios';
import { BaseRepository } from './base.repository';
import { ILogger } from '../../shared/types/ILogger';
import { IPublicationRepository } from '../../domain/interfaces/publication.repository.interface';
import {
  CountsResponse,
  PublicationData,
  PublicationResponse,
  PublicationsModel,
  PublicationModelResponse
} from '../../domain/models/publication.models';
import { PublicationStatus } from '../../services/publication/publication.service';

export class PublicationRepository
  extends BaseRepository
  implements IPublicationRepository
{
  constructor(api: AxiosInstance, logger: ILogger) {
    super(api, logger);
  }

  private mapWithStatus(
    data: PublicationModelResponse[],
    status: PublicationStatus
  ): PublicationsModel[] {
    return data.map(pub => ({ ...pub, status }));
  }

  async createPublication(publication: PublicationData): Promise<void> {
    try {
      const response = await this.api.post('/Animal/NewRecord', publication);
      this.ensureSuccessStatus(response);
    } catch (error) {
      throw this.handleHttpError(error, 'Error al crear la publicación');
    }
  }

  async getUserPublications(): Promise<PublicationsModel[]> {
    try {
      const [accepted, rejected, pending] = await Promise.all([
        this.api.get<PublicationResponse>(
          '/Animal/AnimalRecordByUser/Accepted'
        ),
        this.api.get<PublicationResponse>(
          '/Animal/AnimalRecordByUser/Rejected'
        ),
        this.api.get<PublicationResponse>('/Animal/AnimalRecordByUser/Pending')
      ]);

      this.ensureSuccessStatus(accepted);
      this.ensureSuccessStatus(rejected);
      this.ensureSuccessStatus(pending);

      return [
        ...this.mapWithStatus(
          accepted.data.records,
          PublicationStatus.ACCEPTED
        ),
        ...this.mapWithStatus(
          rejected.data.records,
          PublicationStatus.REJECTED
        ),
        ...this.mapWithStatus(pending.data.records, PublicationStatus.PENDING)
      ];
    } catch (error) {
      throw this.handleHttpError(
        error,
        'Error al obtener las publicaciones del usuario'
      );
    }
  }

  async getAllPublications(): Promise<PublicationsModel[]> {
    try {
      const [accepted, rejected, pending] = await Promise.all([
        this.api.get<PublicationResponse>(
          '/Admin/all-records/Accepted?page=1&size=10'
        ),
        this.api.get<PublicationResponse>(
          '/Admin/all-records/Rejected?page=1&size=10'
        ),
        this.api.get<PublicationResponse>(
          '/Admin/all-records/Pending?page=1&size=10'
        )
      ]);

      this.ensureSuccessStatus(accepted);
      this.ensureSuccessStatus(rejected);
      this.ensureSuccessStatus(pending);

      return [
        ...this.mapWithStatus(
          accepted.data.records,
          PublicationStatus.ACCEPTED
        ),
        ...this.mapWithStatus(
          rejected.data.records,
          PublicationStatus.REJECTED
        ),
        ...this.mapWithStatus(pending.data.records, PublicationStatus.PENDING)
      ];
    } catch (error) {
      throw this.handleHttpError(
        error,
        'Error al obtener todas las publicaciones'
      );
    }
  }

  async getUserPendingPublications(
    page: number,
    size: number
  ): Promise<PublicationResponse> {
    try {
      const response = await this.api.get<PublicationResponse>(
        `/Animal/AnimalRecordByUser/Pending?page=${page}&size=${size}`
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error,
        'Error al obtener las publicaciones pendientes del usuario'
      );
    }
  }

  async getUserRejectedPublications(
    page: number,
    size: number
  ): Promise<PublicationResponse> {
    try {
      const response = await this.api.get<PublicationResponse>(
        `/Animal/AnimalRecordByUser/Rejected?page=${page}&size=${size}`
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error,
        'Error al obtener las publicaciones rechazadas del usuario'
      );
    }
  }

  async getAllPendingPublications(
    page: number,
    size: number
  ): Promise<PublicationResponse> {
    try {
      const response = await this.api.get<PublicationResponse>(
        `/Admin/all-records/Pending?page=${page}&size=${size}`
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error,
        'Error al obtener todas las publicaciones pendientes'
      );
    }
  }

  async getUserAcceptedPublications(
    page: number,
    size: number
  ): Promise<PublicationResponse> {
    try {
      const response = await this.api.get<PublicationResponse>(
        `/Animal/AnimalRecordByUser/Accepted?page=${page}&size=${size}`
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error,
        'Error al obtener las publicaciones aceptadas del usuario'
      );
    }
  }

  async getAllAcceptedPublications(
    page: number,
    size: number
  ): Promise<PublicationResponse> {
    try {
      const response = await this.api.get<PublicationResponse>(
        `/Admin/all-records/Accepted?page=${page}&size=${size}`
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error,
        'Error al obtener todas las publicaciones aceptadas'
      );
    }
  }

  async getAllRejectedPublications(
    page: number,
    size: number
  ): Promise<PublicationResponse> {
    try {
      const response = await this.api.get<PublicationResponse>(
        `/Admin/all-records/Rejected?page=${page}&size=${size}`
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error,
        'Error al obtener todas las publicaciones rechazadas'
      );
    }
  }

  async getPublicationById(recordId: string): Promise<PublicationResponse> {
    try {
      const response = await this.api.get<PublicationResponse>(
        `/Animal/AnimalRecord/${recordId}`
      );
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error,
        `Error al obtener la publicación con ID ${recordId}`
      );
    }
  }

  async acceptPublication(publicationId: string): Promise<void> {
    try {
      const response = await this.api.patch('/Admin/process-record', {
        recordId: Number(publicationId),
        status: 'Accepted',
        RejectedReason: ''
      });
      this.ensureSuccessStatus(response);
    } catch (error) {
      throw this.handleHttpError(error, 'Error al aceptar la publicación');
    }
  }

  async rejectPublication(
    publicationId: string,
    reason?: string
  ): Promise<void> {
    try {
      const response = await this.api.patch('/Admin/process-record', {
        recordId: Number(publicationId),
        status: 'Rejected',
        RejectedReason: reason || ''
      });
      this.ensureSuccessStatus(response);
    } catch (error) {
      throw this.handleHttpError(error, 'Error al rechazar la publicación');
    }
  }

  async getCounts(): Promise<CountsResponse> {
    try {
      const response = await this.api.get<CountsResponse>('/Admin/statistic');
      this.ensureSuccessStatus(response);
      return response.data;
    } catch (error) {
      throw this.handleHttpError(
        error,
        'Error al obtener las estadísticas de administración'
      );
    }
  }
}
