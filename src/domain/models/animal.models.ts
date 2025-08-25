export interface AnimalModel {
  id: string;
  commonName: string;
  catalogId: number;
  scientificName: string;
  status: string;
  statusColor: string;
  image: string;
}

export interface ParsedLocation {
  latitude: number;
  longitude: number;
}

export interface LocationResponse {
  catalogId: number;
  cords: ParsedLocation[];
}
