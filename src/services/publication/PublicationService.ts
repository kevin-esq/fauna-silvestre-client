import {HttpClient} from "../http/ApiProvider";
import {ConsoleLogger} from "../logging/ConsoleLogger";
import {PublicationRepository} from "../../data/repositories/PublicationRepository";
import {PublicationData} from "../../domain/models/PublicationModels";

export class PublicationService {
    constructor(
        private readonly logger: ConsoleLogger,
        private readonly httpClient: HttpClient,
        private readonly publicationRepository: PublicationRepository
    ) {
    }

    async addPublication(publicationData: PublicationData, token: string | null) {
        try {
            this.logger.debug('[PublicationService] Starting publication creation', {publicationData});
            this.logger.info('[PublicationService]', {token});
            this.httpClient.setAuthToken(token);
            await this.publicationRepository.createPublication(publicationData);
        } catch (error) {
            this.logger.error('[PublicationService] Error creating publication', error as Error, {publicationData});
        }
    }
}
