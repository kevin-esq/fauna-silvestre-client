import { AxiosInstance } from 'axios';
import { BaseRepository } from "./base.repository";
import { ILogger } from "../../shared/types/ILogger";
import { IPublicationRepository } from "../../domain/interfaces/publication.repository.interface";
import {
    PublicationData,
    PublicationResponse,
    PublicationsModel,
    PublicationStatus
} from "../../domain/models/publication.models";

export class PublicationRepository extends BaseRepository implements IPublicationRepository {

    constructor(api: AxiosInstance, logger: ILogger) {
        super(api, logger);
    }

    private mapWithStatus(data: PublicationResponse[], status: PublicationStatus): PublicationsModel[] {
        return data.map(pub => ({ ...pub, status }));
    }

    async createPublication(publication: PublicationData): Promise<void> {
        try {
            const response = await this.api.post('/Animal/NewRecord', publication);

            this.ensureSuccessStatus(response);
        } catch (error) {
            console.log(error);
            throw this.handleHttpError(error, 'Error al crear la publicación');
        }
    }

    async getUserPublications(): Promise<PublicationsModel[]> {
        try {
            const [accepted, rejected, pending] = await Promise.all([
                this.api.get<PublicationResponse[]>('/Animal/AnimalRecordByUser/Accepted'),
                this.api.get<PublicationResponse[]>('/Animal/AnimalRecordByUser/Rejected'),
                this.api.get<PublicationResponse[]>('/Animal/AnimalRecordByUser/Pending')
            ]);

            this.ensureSuccessStatus(accepted);
            this.ensureSuccessStatus(rejected);
            this.ensureSuccessStatus(pending);

            return [
                ...this.mapWithStatus(accepted.data, 'accepted'),
                ...this.mapWithStatus(rejected.data, 'rejected'),
                ...this.mapWithStatus(pending.data, 'pending')
            ];
        } catch (error) {
            throw this.handleHttpError(error, 'Error al obtener las publicaciones del usuario');
        }
    }
    
    async getAllPublications(): Promise<PublicationsModel[]> {
        try {
            const [accepted, rejected, pending] = await Promise.all([
                this.api.get<PublicationResponse[]>('/Animal/all-records/Accepted'),
                this.api.get<PublicationResponse[]>('/Animal/all-records/Rejected'),
                this.api.get<PublicationResponse[]>('/Animal/all-records/Pending')
            ]);

            this.ensureSuccessStatus(accepted);
            this.ensureSuccessStatus(rejected);
            this.ensureSuccessStatus(pending);

            return [
                ...this.mapWithStatus(accepted.data, 'accepted'),
                ...this.mapWithStatus(rejected.data, 'rejected'),
                ...this.mapWithStatus(pending.data, 'pending')
            ];
        } catch (error) {
            throw this.handleHttpError(error, 'Error al obtener todas las publicaciones');
        }
    }

    async getUserPendingPublications(): Promise<PublicationResponse[]> {
        try {
            const response = await this.api.get<PublicationResponse[]>('/Animal/AnimalRecordByUser/Pending');
            this.ensureSuccessStatus(response);
            return response.data;
        } catch (error) {
            throw this.handleHttpError(error, 'Error al obtener las publicaciones pendientes del usuario');
        }
    }

        async getAllPendingPublications(page: number, limit: number): Promise<PublicationResponse[]> {
        try {
                        const response = await this.api.get<PublicationResponse[]>(`/Animal/all-records/Pending?page=${page}&limit=${limit}`);
            this.ensureSuccessStatus(response);
            return response.data;
        } catch (error) {
            throw this.handleHttpError(error, 'Error al obtener todas las publicaciones pendientes');
        }
    }

    async getPublicationById(recordId: string): Promise<PublicationResponse> {
        try {
            const response = await this.api.get<PublicationResponse>(`/Animal/AnimalRecord/${recordId}`);
            this.ensureSuccessStatus(response);
            return response.data;
        } catch (error) {
            throw this.handleHttpError(error, `Error al obtener la publicación con ID ${recordId}`);
        }
    }

    async acceptPublication(publicationId: string): Promise<void> {
        try {
            const response = await this.api.patch(`/Animal/process-record/${publicationId}?status=Accepted`);
            this.ensureSuccessStatus(response);
        } catch (error) {
            throw this.handleHttpError(error, 'Error al aceptar la publicación');
        }
    }

    async rejectPublication(publicationId: string): Promise<void> {
        try {
            const response = await this.api.patch(`/Animal/process-record/${publicationId}?status=Rejected`);
            this.ensureSuccessStatus(response);
        } catch (error) {
            throw this.handleHttpError(error, 'Error al rechazar la publicación');
        }
    }
}
