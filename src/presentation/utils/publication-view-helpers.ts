import { PublicationsModel } from '@/domain/models/publication.models';
import {
  ViewGroupBy,
  ViewSortBy
} from '@/services/storage/publication-view-preferences.service';

export function sortPublications(
  publications: PublicationsModel[],
  sortBy: ViewSortBy
): PublicationsModel[] {
  const sorted = [...publications];

  switch (sortBy) {
    case 'date-desc':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.createdDate || 0).getTime();
        const dateB = new Date(b.createdDate || 0).getTime();
        return dateB - dateA;
      });

    case 'date-asc':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.createdDate || 0).getTime();
        const dateB = new Date(b.createdDate || 0).getTime();
        return dateA - dateB;
      });

    case 'name-asc':
      return sorted.sort((a, b) =>
        a.commonNoun.localeCompare(b.commonNoun, 'es')
      );

    case 'name-desc':
      return sorted.sort((a, b) =>
        b.commonNoun.localeCompare(a.commonNoun, 'es')
      );

    case 'status':
      const statusOrder = { pending: 0, accepted: 1, rejected: 2 };
      return sorted.sort(
        (a, b) => statusOrder[a.status] - statusOrder[b.status]
      );

    default:
      return sorted;
  }
}

export function groupPublications(
  publications: PublicationsModel[],
  groupBy: ViewGroupBy
): Record<string, PublicationsModel[]> {
  if (groupBy === 'none') {
    return { all: publications };
  }

  return publications.reduce(
    (groups, pub) => {
      let key = '';

      switch (groupBy) {
        case 'animal':
          key = pub.commonNoun;
          break;

        case 'date':
          if (pub.createdDate) {
            const date = new Date(pub.createdDate);
            key = date.toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long'
            });
          } else {
            key = 'Sin fecha';
          }
          break;

        case 'status':
          const statusLabels = {
            pending: 'Pendientes',
            accepted: 'Aceptadas',
            rejected: 'Rechazadas'
          };
          key = statusLabels[pub.status] || 'Sin estado';
          break;
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(pub);
      return groups;
    },
    {} as Record<string, PublicationsModel[]>
  );
}

export function processPublications(
  publications: PublicationsModel[],
  sortBy: ViewSortBy,
  groupBy: ViewGroupBy
): Record<string, PublicationsModel[]> {
  const sorted = sortPublications(publications, sortBy);
  const grouped = groupPublications(sorted, groupBy);
  return grouped;
}

export function toSectionListData(
  grouped: Record<string, PublicationsModel[]>
): Array<{ title: string; data: PublicationsModel[] }> {
  return Object.entries(grouped)
    .map(([title, data]) => ({ title, data }))
    .filter(section => section.data.length > 0);
}
