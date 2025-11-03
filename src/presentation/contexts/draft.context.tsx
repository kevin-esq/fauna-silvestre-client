import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode
} from 'react';
import {
  DraftPublication,
  PendingPublication,
  AnimalState
} from '@/domain/models/draft.models';
import { draftService } from '@/services/storage/draft.service';
import { offlineQueueService } from '@/services/storage/offline-queue.service';
import { useNetworkStatus } from '@/presentation/hooks/common/use-network-status.hook';
import { ValidationService } from '@/services/validation';
import { ConsoleLogger } from '@/services/logging/console-logger';
import { CommonNounResponse } from '@/domain/models/animal.models';
import type { DraftContextType } from './draft/types';
import RNFS from 'react-native-fs';

const logger = new ConsoleLogger('info');

const DraftContext = createContext<DraftContextType | undefined>(undefined);

export const DraftProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [drafts, setDrafts] = useState<DraftPublication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const { isConnected } = useNetworkStatus();

  const loadDrafts = useCallback(async () => {
    try {
      const allDrafts = await draftService.getAllDrafts();
      setDrafts(allDrafts);

      const queue = await offlineQueueService.getQueue();
      setPendingCount(queue.length);
    } catch (err) {
      logger.error('Error loading drafts', err as Error);
    }
  }, []);

  const createDraft = useCallback(
    async (
      imageUri: string,
      description: string,
      selectedAnimal: CommonNounResponse | null,
      customAnimalName: string,
      animalState: AnimalState,
      location?: { latitude: number; longitude: number }
    ): Promise<DraftPublication> => {
      setIsLoading(true);
      setError(null);

      try {
        const draft: DraftPublication = {
          id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          imageUri,
          description,
          selectedAnimal,
          customAnimalName,
          animalState,
          location,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'draft',
          uploadAttempts: 0
        };

        await draftService.saveDraft(draft);
        await loadDrafts();

        logger.info(`Draft created: ${draft.id}`);
        return draft;
      } catch (err) {
        const errorMessage = 'Error creating draft';
        setError(errorMessage);
        logger.error(errorMessage, err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loadDrafts]
  );

  const updateDraft = useCallback(
    async (draft: DraftPublication): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await draftService.saveDraft(draft);
        await loadDrafts();
        logger.info(`Draft updated: ${draft.id}`);
      } catch (err) {
        const errorMessage = 'Error updating draft';
        setError(errorMessage);
        logger.error(errorMessage, err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loadDrafts]
  );

  const deleteDraft = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await draftService.deleteDraft(id);
        await loadDrafts();
        logger.info(`Draft deleted: ${id}`);
      } catch (err) {
        const errorMessage = 'Error deleting draft';
        setError(errorMessage);
        logger.error(errorMessage, err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loadDrafts]
  );

  const getDraftById = useCallback(
    async (id: string): Promise<DraftPublication | null> => {
      try {
        return await draftService.getDraftById(id);
      } catch (err) {
        logger.error('Error getting draft by id', err as Error);
        return null;
      }
    },
    []
  );

  const submitDraft = useCallback(
    async (draftId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const draft = await draftService.getDraftById(draftId);

        if (!draft) {
          throw new Error('Draft not found');
        }

        ValidationService.validateId(draftId, 'submitDraft');

        const imageBase64 = await RNFS.readFile(
          draft.imageUri.replace('file://', ''),
          'base64'
        );

        const pending: PendingPublication = {
          id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          draftId: draft.id,
          imageBase64,
          data: {
            description: draft.description,
            commonNoun: draft.customAnimalName,
            catalogId: draft.selectedAnimal?.catalogId || 0,
            animalState: draft.animalState,
            location: draft.location
              ? `${draft.location.latitude},${draft.location.longitude}`
              : ''
          },
          attempts: 0,
          createdAt: new Date()
        };

        await offlineQueueService.addToQueue(pending);

        if (isConnected) {
          await offlineQueueService.processQueue();
        }

        await loadDrafts();
        logger.info(`Draft submitted: ${draftId}`);
      } catch (err) {
        const errorMessage = 'Error submitting draft';
        setError(errorMessage);
        logger.error(errorMessage, err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, loadDrafts]
  );

  const retryFailedDrafts = useCallback(async (): Promise<void> => {
    if (!isConnected) {
      setError('No internet connection');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await offlineQueueService.processQueue();
      await loadDrafts();
      logger.info('Retrying failed drafts');
    } catch (err) {
      const errorMessage = 'Error retrying drafts';
      setError(errorMessage);
      logger.error(errorMessage, err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, loadDrafts]);

  const clearAllDrafts = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await draftService.clearAllDrafts();
      await offlineQueueService.clearQueue();
      setDrafts([]);
      setPendingCount(0);
      logger.info('All drafts cleared');
    } catch (err) {
      const errorMessage = 'Error clearing drafts';
      setError(errorMessage);
      logger.error(errorMessage, err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshDrafts = useCallback(async (): Promise<void> => {
    await loadDrafts();
  }, [loadDrafts]);

  useEffect(() => {
    if (isConnected) {
      offlineQueueService.startAutoSync();

      offlineQueueService.processQueue();
    } else {
      offlineQueueService.stopAutoSync();
    }
  }, [isConnected]);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const value = useMemo(
    () => ({
      drafts,
      isLoading,
      error,
      isOnline: isConnected,
      pendingCount,
      createDraft,
      updateDraft,
      deleteDraft,
      getDraftById,
      submitDraft,
      retryFailedDrafts,
      clearAllDrafts,
      refreshDrafts
    }),
    [
      drafts,
      isLoading,
      error,
      isConnected,
      pendingCount,
      createDraft,
      updateDraft,
      deleteDraft,
      getDraftById,
      submitDraft,
      retryFailedDrafts,
      clearAllDrafts,
      refreshDrafts
    ]
  );

  return (
    <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
  );
};

export const useDraftContext = (): DraftContextType => {
  const context = useContext(DraftContext);

  if (!context) {
    throw new Error('useDraftContext must be used within DraftProvider');
  }

  return context;
};
