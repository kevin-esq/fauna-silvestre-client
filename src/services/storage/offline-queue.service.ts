import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PendingPublication,
  STORAGE_KEYS,
  DRAFT_CONFIG
} from '../../domain/models/draft.models';
import { publicationService } from '../publication/publication.service';
import { draftService } from './draft.service';
import { ConsoleLogger } from '../logging/console-logger';

const logger = new ConsoleLogger('info');

export class OfflineQueueService {
  private static instance: OfflineQueueService;
  private syncInterval: number | null = null;
  private isSyncing = false;

  private constructor() {}

  public static getInstance(): OfflineQueueService {
    if (!OfflineQueueService.instance) {
      OfflineQueueService.instance = new OfflineQueueService();
    }
    return OfflineQueueService.instance;
  }

  public async addToQueue(pending: PendingPublication): Promise<void> {
    try {
      const queue = await this.getQueue();
      queue.push(pending);

      await AsyncStorage.setItem(
        STORAGE_KEYS.PENDING_PUBLICATIONS,
        JSON.stringify(queue)
      );

      logger.info(`Added to queue: ${pending.id}`);

      await draftService.updateDraftStatus(pending.draftId, 'pending_upload');
    } catch (error) {
      logger.error('Error adding to queue', error as Error);
      throw error;
    }
  }

  public async getQueue(): Promise<PendingPublication[]> {
    try {
      const queueJson = await AsyncStorage.getItem(
        STORAGE_KEYS.PENDING_PUBLICATIONS
      );

      if (!queueJson) {
        return [];
      }

      const queue: PendingPublication[] = JSON.parse(queueJson);

      return queue.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        lastAttempt: item.lastAttempt ? new Date(item.lastAttempt) : undefined
      }));
    } catch (error) {
      logger.error('Error getting queue', error as Error);
      return [];
    }
  }

  public async removeFromQueue(id: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const updatedQueue = queue.filter(item => item.id !== id);

      await AsyncStorage.setItem(
        STORAGE_KEYS.PENDING_PUBLICATIONS,
        JSON.stringify(updatedQueue)
      );

      logger.info(`Removed from queue: ${id}`);
    } catch (error) {
      logger.error('Error removing from queue', error as Error);
      throw error;
    }
  }

  public async processQueue(): Promise<void> {
    if (this.isSyncing) {
      logger.info('Already syncing, skipping...');
      return;
    }

    this.isSyncing = true;

    try {
      const queue = await this.getQueue();

      if (queue.length === 0) {
        logger.info('Queue is empty');
        return;
      }

      logger.info(`Processing ${queue.length} pending publications`);

      for (const pending of queue) {
        await this.processPendingPublication(pending);
      }
    } catch (error) {
      logger.error('Error processing queue', error as Error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processPendingPublication(
    pending: PendingPublication
  ): Promise<void> {
    try {
      await draftService.updateDraftStatus(pending.draftId, 'uploading');

      await publicationService.createPublication({
        ...pending.data,
        img: pending.imageBase64
      });

      await this.removeFromQueue(pending.id);
      await draftService.deleteDraft(pending.draftId);

      logger.info(`Publication uploaded successfully: ${pending.id}`);
    } catch (error) {
      logger.error(
        `Error uploading publication: ${pending.id}`,
        error as Error
      );

      const updatedPending: PendingPublication = {
        ...pending,
        attempts: pending.attempts + 1,
        lastAttempt: new Date(),
        error: (error as Error).message
      };

      if (updatedPending.attempts >= DRAFT_CONFIG.MAX_UPLOAD_ATTEMPTS) {
        logger.warn(
          `Max attempts reached for ${pending.id}, marking as failed`
        );

        await draftService.updateDraftStatus(
          pending.draftId,
          'failed',
          (error as Error).message
        );

        await this.removeFromQueue(pending.id);
      } else {
        await this.updateInQueue(updatedPending);

        await draftService.updateDraftStatus(
          pending.draftId,
          'pending_upload',
          (error as Error).message
        );
      }
    }
  }

  private async updateInQueue(pending: PendingPublication): Promise<void> {
    try {
      const queue = await this.getQueue();
      const index = queue.findIndex(item => item.id === pending.id);

      if (index >= 0) {
        queue[index] = pending;
        await AsyncStorage.setItem(
          STORAGE_KEYS.PENDING_PUBLICATIONS,
          JSON.stringify(queue)
        );
      }
    } catch (error) {
      logger.error('Error updating in queue', error as Error);
    }
  }

  public startAutoSync(): void {
    if (this.syncInterval) {
      logger.info('Auto sync already running');
      return;
    }

    logger.info('Starting auto sync');

    this.syncInterval = setInterval(() => {
      this.processQueue();
    }, DRAFT_CONFIG.RETRY_DELAY);
  }

  public stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      logger.info('Auto sync stopped');
    }
  }

  public async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_PUBLICATIONS);
      logger.info('Queue cleared');
    } catch (error) {
      logger.error('Error clearing queue', error as Error);
      throw error;
    }
  }

  public async getQueueStats(): Promise<{
    total: number;
    failed: number;
    pending: number;
  }> {
    try {
      const queue = await this.getQueue();

      const failed = queue.filter(
        item => item.attempts >= DRAFT_CONFIG.MAX_UPLOAD_ATTEMPTS
      ).length;

      return {
        total: queue.length,
        failed,
        pending: queue.length - failed
      };
    } catch (error) {
      logger.error('Error getting queue stats', error as Error);
      return { total: 0, failed: 0, pending: 0 };
    }
  }
}

export const offlineQueueService = OfflineQueueService.getInstance();
