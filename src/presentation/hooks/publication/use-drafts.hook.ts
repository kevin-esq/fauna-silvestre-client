import { useState, useEffect, useCallback } from 'react';
import { DraftPublication } from '@/domain/models/draft.models';
import { draftService } from '@/services/storage/draft.service';
import { ConsoleLogger } from '@/services/logging/console-logger';

const logger = new ConsoleLogger('info');

export const useDrafts = () => {
  const [drafts, setDrafts] = useState<DraftPublication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDrafts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allDrafts = await draftService.getAllDrafts();
      setDrafts(allDrafts);
      logger.info(`Loaded ${allDrafts.length} drafts`);
    } catch (err) {
      const errorMessage = 'Error loading drafts';
      setError(errorMessage);
      logger.error(errorMessage, err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveDraft = useCallback(
    async (draft: DraftPublication): Promise<void> => {
      try {
        await draftService.saveDraft(draft);
        await loadDrafts();
        logger.info(`Draft saved: ${draft.id}`);
      } catch (err) {
        const errorMessage = 'Error saving draft';
        setError(errorMessage);
        logger.error(errorMessage, err as Error);
        throw err;
      }
    },
    [loadDrafts]
  );

  const deleteDraft = useCallback(
    async (id: string): Promise<void> => {
      try {
        await draftService.deleteDraft(id);
        await loadDrafts();
        logger.info(`Draft deleted: ${id}`);
      } catch (err) {
        const errorMessage = 'Error deleting draft';
        setError(errorMessage);
        logger.error(errorMessage, err as Error);
        throw err;
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

  const updateDraftStatus = useCallback(
    async (
      id: string,
      status: DraftPublication['status'],
      error?: string
    ): Promise<void> => {
      try {
        await draftService.updateDraftStatus(id, status, error);
        await loadDrafts();
      } catch (err) {
        logger.error('Error updating draft status', err as Error);
        throw err;
      }
    },
    [loadDrafts]
  );

  const clearAllDrafts = useCallback(async (): Promise<void> => {
    try {
      await draftService.clearAllDrafts();
      setDrafts([]);
      logger.info('All drafts cleared');
    } catch (err) {
      const errorMessage = 'Error clearing drafts';
      setError(errorMessage);
      logger.error(errorMessage, err as Error);
      throw err;
    }
  }, []);

  const getStats = useCallback(async () => {
    try {
      return await draftService.getDraftStats();
    } catch (err) {
      logger.error('Error getting draft stats', err as Error);
      return {
        total: 0,
        byStatus: { draft: 0, pending_upload: 0, uploading: 0, failed: 0 }
      };
    }
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  return {
    drafts,
    isLoading,
    error,
    loadDrafts,
    saveDraft,
    deleteDraft,
    getDraftById,
    updateDraftStatus,
    clearAllDrafts,
    getStats
  };
};
