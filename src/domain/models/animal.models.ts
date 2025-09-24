export interface CatalogModelResponse {
  catalog: AnimalModelResponse[];
  pagination: PaginationModelResponse;
}

export interface AnimalModelResponse {
  catalogId: number;
  specie: string;
  commonNoun: string;
  description: string;
  habits: string;
  habitat: string;
  reproduction: string;
  distribution: string;
  feeding: string;
  category: string;
  image: string;
}

export interface PaginationModelResponse {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ParsedLocation {
  latitude: number;
  longitude: number;
}

export interface LocationResponse {
  catalogId: number;
  cords: ParsedLocation[];
}

export interface CommonNounResponse {
  catalogId: number;
  commonNoun: string;
}

export interface CreateAnimalRequest {
  specie: string;
  commonNoun: string;
  description: string;
  habits: string;
  habitat: string;
  reproduction: string;
  distribution: string;
  feeding: string;
  category: string;
  image: string; // base64
}

export interface UpdateAnimalRequest {
  catalogId: number;
  specie: string;
  commonNoun: string;
  description: string;
  habits: string;
  habitat: string;
  reproduction: string;
  distribution: string;
  feeding: string;
  category: string;
}

export interface UpdateAnimalImageRequest {
  catalogId: number;
  image: string; // base64
}

export interface AnimalCrudResponse {
  error: boolean;
  message: string;
}

export interface DeleteAnimalResponse {
  error: boolean;
  message: string;
}
