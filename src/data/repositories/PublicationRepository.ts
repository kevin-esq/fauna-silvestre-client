import {BaseRepository} from "./BaseRepository";
import {IPublicationRepository} from "../../domain/interfaces/IPublicationRepository";
import {PublicationData} from "../../domain/models/PublicationModels";
import {AxiosInstance} from "axios";
import {ILogger} from "../../shared/types/ILogger";


export class PublicationRepository extends BaseRepository implements IPublicationRepository {

    constructor(
        protected readonly api: AxiosInstance,
        protected readonly logger: ILogger
    ) {
        super(api, logger);
    }

    async createPublication(data: PublicationData): Promise<void> {
        try {
            await this.api.post("/Animal/NewRecord", data);
        } catch (error) {
            console.error("Error al crear la publicación:", error);
            throw error;
        }
    }
}