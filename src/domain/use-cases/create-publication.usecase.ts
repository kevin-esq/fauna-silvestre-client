// usecases/create-publication.usecase.ts
import { PublicationData } from "../models/publication.models";
import {PublicationService} from "../../services/publication/publication.service";

export default async function createPublicationUseCase(
    publicationService: PublicationService,
    publicationData: PublicationData,
    token: string | undefined
): Promise<void> {
    try {
        await publicationService.addPublication(publicationData, token as string);
    } catch (error) {
        throw error;
    }
}
