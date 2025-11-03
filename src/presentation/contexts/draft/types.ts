import {
  DraftPublication,
  AnimalState
} from '@/domain/models/draft.models';
import { CommonNounResponse } from '@/domain/models/animal.models';

export interface DraftContextType {
  drafts: DraftPublication[];
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  pendingCount: number;

  createDraft: (
    imageUri: string,
    description: string,
    selectedAnimal: CommonNounResponse | null,
    customAnimalName: string,
    animalState: AnimalState,
    location?: { latitude: number; longitude: number }
  ) => Promise<DraftPublication>;
  updateDraft: (draft: DraftPublication) => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;
  getDraftById: (id: string) => Promise<DraftPublication | null>;

  submitDraft: (draftId: string) => Promise<void>;
  retryFailedDrafts: () => Promise<void>;
  clearAllDrafts: () => Promise<void>;

  refreshDrafts: () => Promise<void>;
}

export interface DraftState {
  drafts: DraftPublication[];
  isLoading: boolean;
  error: string | null;
  pendingCount: number;
}
