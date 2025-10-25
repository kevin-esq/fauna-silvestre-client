import { CommonNounResponse } from './animal.models';

export enum AnimalState {
  Alive = 1,
  Dead = 2
}

export interface Location {
  latitude: number;
  longitude: number;
}

export type DraftStatus = 'draft' | 'pending_upload' | 'uploading' | 'failed';

export interface DraftPublication {
  id: string;
  imageUri: string;
  description: string;
  selectedAnimal: CommonNounResponse | null;
  customAnimalName: string;
  animalState: AnimalState;
  location?: Location;
  createdAt: Date;
  updatedAt: Date;
  status: DraftStatus;
  uploadAttempts?: number;
  lastError?: string;
}

export interface PendingPublication {
  id: string;
  draftId: string;
  imageBase64: string;
  data: {
    description: string;
    commonNoun: string;
    catalogId: number;
    animalState: AnimalState;
    location: string;
  };
  attempts: number;
  lastAttempt?: Date;
  error?: string;
  createdAt: Date;
}

export const STORAGE_KEYS = {
  DRAFTS: '@drafts',
  PENDING_PUBLICATIONS: '@pending_publications',
  AUTO_SAVE_ENABLED: '@auto_save_enabled',
  AUTO_SAVE_INTERVAL: '@auto_save_interval'
} as const;

export const DRAFT_CONFIG = {
  MAX_DRAFTS: 20,
  AUTO_SAVE_INTERVAL: 30000,
  MAX_UPLOAD_ATTEMPTS: 5,
  RETRY_DELAY: 30000,
  IMAGE_QUALITY: 0.8
} as const;
