import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import {
  DraftPublication,
  STORAGE_KEYS,
  DRAFT_CONFIG,
  DraftStatus
} from '@/domain/models/draft.models';
import { ConsoleLogger } from '@/services/logging/console-logger';

const logger = new ConsoleLogger('info');

export class DraftService {
  private static instance: DraftService;
  private draftsDir: string;

  private constructor() {
    this.draftsDir = `${RNFS.DocumentDirectoryPath}/drafts`;
    this.initializeDraftsDirectory();
  }

  public static getInstance(): DraftService {
    if (!DraftService.instance) {
      DraftService.instance = new DraftService();
    }
    return DraftService.instance;
  }

  private async initializeDraftsDirectory(): Promise<void> {
    try {
      const exists = await RNFS.exists(this.draftsDir);
      if (!exists) {
        await RNFS.mkdir(this.draftsDir);
        logger.info('Drafts directory created');
      }
    } catch (error) {
      logger.error('Error creating drafts directory', error as Error);
    }
  }

  public async saveDraft(draft: DraftPublication): Promise<void> {
    try {
      const imagePath = await this.saveImageLocally(draft.id, draft.imageUri);

      const draftToSave: DraftPublication = {
        ...draft,
        imageUri: imagePath,
        updatedAt: new Date()
      };

      const drafts = await this.getAllDrafts();

      if (drafts.length >= DRAFT_CONFIG.MAX_DRAFTS) {
        const oldestDraft = drafts.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        )[0];
        await this.deleteDraft(oldestDraft.id);
      }

      const existingIndex = drafts.findIndex(d => d.id === draft.id);

      if (existingIndex >= 0) {
        drafts[existingIndex] = draftToSave;
      } else {
        drafts.push(draftToSave);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));

      logger.info(`Draft saved: ${draft.id}`);
    } catch (error) {
      logger.error('Error saving draft', error as Error);
      throw error;
    }
  }

  public async getAllDrafts(): Promise<DraftPublication[]> {
    try {
      const draftsJson = await AsyncStorage.getItem(STORAGE_KEYS.DRAFTS);

      if (!draftsJson) {
        return [];
      }

      const drafts: DraftPublication[] = JSON.parse(draftsJson);

      return drafts.map(draft => ({
        ...draft,
        createdAt: new Date(draft.createdAt),
        updatedAt: new Date(draft.updatedAt)
      }));
    } catch (error) {
      logger.error('Error getting drafts', error as Error);
      return [];
    }
  }

  public async getDraftById(id: string): Promise<DraftPublication | null> {
    try {
      const drafts = await this.getAllDrafts();
      return drafts.find(d => d.id === id) || null;
    } catch (error) {
      logger.error('Error getting draft by id', error as Error);
      return null;
    }
  }

  public async deleteDraft(id: string): Promise<void> {
    try {
      const drafts = await this.getAllDrafts();
      const draftToDelete = drafts.find(d => d.id === id);

      if (!draftToDelete) {
        logger.warn(`Draft not found: ${id}`);
        return;
      }

      await this.deleteImageLocally(id);

      const updatedDrafts = drafts.filter(d => d.id !== id);

      await AsyncStorage.setItem(
        STORAGE_KEYS.DRAFTS,
        JSON.stringify(updatedDrafts)
      );

      logger.info(`Draft deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting draft', error as Error);
      throw error;
    }
  }

  public async updateDraftStatus(
    id: string,
    status: DraftStatus,
    error?: string
  ): Promise<void> {
    try {
      const drafts = await this.getAllDrafts();
      const draftIndex = drafts.findIndex(d => d.id === id);

      if (draftIndex < 0) {
        logger.warn(`Draft not found: ${id}`);
        return;
      }

      drafts[draftIndex] = {
        ...drafts[draftIndex],
        status,
        lastError: error,
        updatedAt: new Date()
      };

      await AsyncStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));

      logger.info(`Draft status updated: ${id} -> ${status}`);
    } catch (error) {
      logger.error('Error updating draft status', error as Error);
      throw error;
    }
  }

  public async clearAllDrafts(): Promise<void> {
    try {
      const drafts = await this.getAllDrafts();
      for (const draft of drafts) {
        await this.deleteImageLocally(draft.id);
      }

      await AsyncStorage.removeItem(STORAGE_KEYS.DRAFTS);

      logger.info('All drafts cleared');
    } catch (error) {
      logger.error('Error clearing drafts', error as Error);
      throw error;
    }
  }

  private async saveImageLocally(
    draftId: string,
    imageUri: string
  ): Promise<string> {
    try {
      const fileName = `${draftId}.jpg`;
      const destPath = `${this.draftsDir}/${fileName}`;

      await RNFS.copyFile(imageUri, destPath);

      logger.info(`Image saved locally: ${destPath}`);
      return `file://${destPath}`;
    } catch (error) {
      logger.error('Error saving image locally', error as Error);
      throw error;
    }
  }

  private async deleteImageLocally(draftId: string): Promise<void> {
    try {
      const fileName = `${draftId}.jpg`;
      const imagePath = `${this.draftsDir}/${fileName}`;

      const exists = await RNFS.exists(imagePath);
      if (exists) {
        await RNFS.unlink(imagePath);
        logger.info(`Image deleted: ${imagePath}`);
      }
    } catch (error) {
      logger.error('Error deleting image', error as Error);
    }
  }

  public async getDraftStats(): Promise<{
    total: number;
    byStatus: Record<DraftStatus, number>;
  }> {
    try {
      const drafts = await this.getAllDrafts();

      const byStatus: Record<DraftStatus, number> = {
        draft: 0,
        pending_upload: 0,
        uploading: 0,
        failed: 0
      };

      drafts.forEach(draft => {
        byStatus[draft.status] = (byStatus[draft.status] || 0) + 1;
      });

      return {
        total: drafts.length,
        byStatus
      };
    } catch (error) {
      logger.error('Error getting draft stats', error as Error);
      return {
        total: 0,
        byStatus: { draft: 0, pending_upload: 0, uploading: 0, failed: 0 }
      };
    }
  }
}

export const draftService = DraftService.getInstance();
