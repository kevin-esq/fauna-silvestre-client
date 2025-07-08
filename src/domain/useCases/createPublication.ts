// usecases/createPublication.ts
import { PublicationData } from "../models/PublicationModels";
import {PublicationService} from "../../services/publication/PublicationService";

export default async function createPublication(
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
