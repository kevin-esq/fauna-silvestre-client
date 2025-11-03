import { PublicationModelResponse } from '@/domain/models/publication.models';

export class PublicationFilters {
  /**
   * Filter publications by search query (commonNoun, description, location)
   */
  public static filterByQuery(
    publications: readonly PublicationModelResponse[],
    searchQuery: string
  ): PublicationModelResponse[] {
    if (!searchQuery.trim()) return [...publications];

    const query = searchQuery.toLowerCase().trim();
    return publications.filter(
      publication =>
        publication.commonNoun?.toLowerCase().includes(query) ||
        publication.description?.toLowerCase().includes(query) ||
        publication.location?.toLowerCase().includes(query)
    );
  }
}
