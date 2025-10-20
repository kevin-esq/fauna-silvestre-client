import RNFS from 'react-native-fs';
import { Platform, NativeModules } from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import {} from '../catalog/catalog.service';

const getApplicationId = (): string => {
  if (Platform.OS === 'android') {
    try {
      const { ApplicationInfo } = NativeModules;
      return ApplicationInfo?.packageName || 'com.fspclientapp';
    } catch {
      return 'com.fspclientapp';
    }
  }
  return '';
};
export interface DownloadedFile {
  id: string;
  catalogId: number;
  animalName: string;
  fileName: string;
  filePath: string;
  downloadDate: Date;
  fileSize: number;
  mimeType: string;
  fileExtension?: string;
}

export class LocalFileService {
  public static readonly APP_FOLDER = 'FaunaSilvestre';
  public static readonly SHEETS_FOLDER = 'Fichas';

  private static getAppDirectory(): string {
    return Platform.select({
      ios: RNFS.DocumentDirectoryPath,
      android: `${RNFS.ExternalStorageDirectoryPath}/Android/media/${getApplicationId()}`,
      default: RNFS.DocumentDirectoryPath
    })!;
  }

  public static getSheetsDirectory(): string {
    return `${this.getAppDirectory()}/${this.APP_FOLDER}/${this.SHEETS_FOLDER}`;
  }

  static async ensureDirectoriesExist(): Promise<void> {
    const appDir = this.getAppDirectory();
    const fullAppDir = `${appDir}/${this.APP_FOLDER}`;
    const sheetsDir = this.getSheetsDirectory();

    try {
      const appDirExists = await RNFS.exists(appDir);
      if (!appDirExists) {
        await RNFS.mkdir(appDir);
        console.log(`✅ Created main directory: ${appDir}`);
      }

      const fullAppDirExists = await RNFS.exists(fullAppDir);
      if (!fullAppDirExists) {
        await RNFS.mkdir(fullAppDir);
        console.log(`✅ Created app folder: ${fullAppDir}`);
      }

      const sheetsDirExists = await RNFS.exists(sheetsDir);
      if (!sheetsDirExists) {
        await RNFS.mkdir(sheetsDir);
        console.log(`✅ Created sheets directory: ${sheetsDir}`);
      }
    } catch (error) {
      console.error('❌ Error creating directories:', error);
      throw new Error('Failed to create app directories');
    }
  }

  static generateFileName(catalogId: number, animalName: string): string {
    const safeAnimalName = animalName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .toUpperCase()
      .substring(0, 30);

    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, '0')}${String(now.getDate()).padStart(
      2,
      '0'
    )}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return `${safeAnimalName}-${timestamp}-FSP${catalogId}.pdf`;
  }

  private static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'pdf';
  }

  static async saveAnimalSheet(
    catalogId: number,
    animalName: string,
    pdfData: string,
    mimeType: string = 'application/pdf'
  ): Promise<DownloadedFile> {
    try {
      await this.ensureDirectoriesExist();

      const fileName = this.generateFileName(catalogId, animalName);
      const filePath = `${this.getSheetsDirectory()}/${fileName}`;

      await RNFS.writeFile(filePath, pdfData, 'base64');

      const stats = await RNFS.stat(filePath);

      const downloadedFile: DownloadedFile = {
        id: `${catalogId}_${Date.now()}`,
        catalogId,
        animalName,
        fileName,
        filePath,
        downloadDate: new Date(),
        fileSize: stats.size,
        mimeType,
        fileExtension: this.getFileExtension(fileName)
      };

      console.log(`✅ Saved animal sheet: ${fileName} (${stats.size} bytes)`);

      await this.saveDownloadedFileMetadata(downloadedFile);

      return downloadedFile;
    } catch (error) {
      console.error('❌ Error saving animal sheet:', error);
      throw new Error('Failed to save animal sheet');
    }
  }

  static async getDownloadedFiles(): Promise<DownloadedFile[]> {
    try {
      const metadataPath = `${this.getAppDirectory()}/${this.APP_FOLDER}/downloaded_files.json`;

      const metadataExists = await RNFS.exists(metadataPath);

      if (!metadataExists) {
        return [];
      }

      const metadataContent = await RNFS.readFile(metadataPath);
      const files: DownloadedFile[] = JSON.parse(metadataContent);

      return files.map(file => ({
        ...file,
        downloadDate: new Date(file.downloadDate),
        fileExtension:
          file.fileExtension || this.getFileExtension(file.fileName)
      }));
    } catch (error) {
      console.error('❌ Error reading downloaded files metadata:', error);
      return [];
    }
  }

  private static async saveDownloadedFileMetadata(
    file: DownloadedFile
  ): Promise<void> {
    try {
      const metadataPath = `${this.getAppDirectory()}/${this.APP_FOLDER}/downloaded_files.json`;
      const existingFiles = await this.getDownloadedFiles();

      const filteredFiles = existingFiles.filter(f => f.id !== file.id);

      const updatedFiles = [...filteredFiles, file];

      await this.ensureDirectoriesExist();

      await RNFS.writeFile(metadataPath, JSON.stringify(updatedFiles, null, 2));

      console.log(`✅ Saved metadata for ${file.fileName}`);
    } catch (error) {
      console.error('❌ Error saving downloaded files metadata:', error);
      throw new Error('Failed to save download metadata');
    }
  }

  static async openDownloadedFile(file: DownloadedFile): Promise<boolean> {
    try {
      const fileExists = await RNFS.exists(file.filePath);

      if (!fileExists) {
        console.error(`❌ File not found: ${file.filePath}`);
        return false;
      }

      if (Platform.OS === 'android') {
        await RNFetchBlob.android.actionViewIntent(
          file.filePath,
          file.mimeType
        );
        return true;
      } else {
        console.log(`📱 iOS file opening for: ${file.fileName}`);
        return true;
      }
    } catch (error) {
      console.error('❌ Error opening file:', error);
      return false;
    }
  }

  static async deleteDownloadedFile(fileId: string): Promise<boolean> {
    try {
      const files = await this.getDownloadedFiles();
      const fileToDelete = files.find(f => f.id === fileId);

      if (!fileToDelete) {
        console.error(`❌ File with ID ${fileId} not found in metadata`);
        return false;
      }

      const fileExists = await RNFS.exists(fileToDelete.filePath);

      if (fileExists) {
        await RNFS.unlink(fileToDelete.filePath);
        console.log(`✅ Deleted physical file: ${fileToDelete.fileName}`);
      } else {
        console.warn(
          `⚠️ Physical file not found, but deleting metadata: ${fileToDelete.fileName}`
        );
      }

      const updatedFiles = files.filter(f => f.id !== fileId);
      const metadataPath = `${this.getAppDirectory()}/${this.APP_FOLDER}/downloaded_files.json`;

      await RNFS.writeFile(metadataPath, JSON.stringify(updatedFiles, null, 2));
      console.log(
        `✅ Updated metadata, removed file: ${fileToDelete.fileName}`
      );

      return true;
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      return false;
    }
  }

  static async deleteAllDownloadedFiles(): Promise<{
    success: number;
    errors: number;
  }> {
    try {
      const files = await this.getDownloadedFiles();
      let successCount = 0;
      let errorCount = 0;

      for (const file of files) {
        try {
          const success = await this.deleteDownloadedFile(file.id);
          if (success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Error deleting file ${file.fileName}:`, error);
        }
      }

      console.log(
        `🗑️ Delete all completed: ${successCount} success, ${errorCount} errors`
      );
      return { success: successCount, errors: errorCount };
    } catch (error) {
      console.error('❌ Error in deleteAllDownloadedFiles:', error);
      const files = await this.getDownloadedFiles();
      return { success: 0, errors: files.length };
    }
  }

  private static readonly STORAGE_DEFAULTS = {
    ANDROID: {
      TOTAL: 16 * 1024 * 1024 * 1024,
      FREE: 4 * 1024 * 1024 * 1024
    },
    IOS: {
      TOTAL: 64 * 1024 * 1024 * 1024,
      FREE: 8 * 1024 * 1024 * 1024
    }
  } as const;

  private static async getDeviceStorageCapacity(): Promise<{
    totalCapacity: number;
    freeSpace: number;
  }> {
    try {
      if (Platform.OS === 'android') {
        const storagePath =
          RNFetchBlob.fs.dirs.SDCardDir || RNFetchBlob.fs.dirs.DocumentDir;

        try {
          const exists = await RNFetchBlob.fs.exists(storagePath);

          if (exists) {
            console.log('Storage path accessible:', storagePath);
          }

          return {
            totalCapacity: this.STORAGE_DEFAULTS.ANDROID.TOTAL,
            freeSpace: this.STORAGE_DEFAULTS.ANDROID.FREE
          };
        } catch (error) {
          console.warn(
            'Could not access storage path, using Android defaults:',
            error
          );
          return {
            totalCapacity: this.STORAGE_DEFAULTS.ANDROID.TOTAL,
            freeSpace: this.STORAGE_DEFAULTS.ANDROID.FREE
          };
        }
      }

      return {
        totalCapacity: this.STORAGE_DEFAULTS.IOS.TOTAL,
        freeSpace: this.STORAGE_DEFAULTS.IOS.FREE
      };
    } catch (error) {
      console.error('Error getting device storage capacity:', error);

      return {
        totalCapacity: this.STORAGE_DEFAULTS.ANDROID.TOTAL,
        freeSpace: this.STORAGE_DEFAULTS.ANDROID.FREE
      };
    }
  }

  static async getStorageInfo(): Promise<{
    totalFiles: number;
    totalSize: number;
    totalCapacity: number;
    sheetsDirectory: string;
    freeSpace: number;
    usedPercentage: number;
  }> {
    try {
      const files = await this.getDownloadedFiles();
      const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);

      const { totalCapacity, freeSpace } =
        await this.getDeviceStorageCapacity();

      const usedPercentage =
        totalCapacity > 0
          ? Math.min((totalSize / totalCapacity) * 100, 100)
          : 0;

      const estimatedFreeSpace = Math.max(0, freeSpace - totalSize);

      return {
        totalFiles: files.length,
        totalSize,
        totalCapacity,
        sheetsDirectory: this.getSheetsDirectory(),
        freeSpace: estimatedFreeSpace,
        usedPercentage
      };
    } catch (error) {
      console.error('❌ Error getting storage info:', error);

      const defaultCapacity =
        Platform.OS === 'ios'
          ? this.STORAGE_DEFAULTS.IOS.TOTAL
          : this.STORAGE_DEFAULTS.ANDROID.TOTAL;

      const defaultFree =
        Platform.OS === 'ios'
          ? this.STORAGE_DEFAULTS.IOS.FREE
          : this.STORAGE_DEFAULTS.ANDROID.FREE;

      return {
        totalFiles: 0,
        totalSize: 0,
        totalCapacity: defaultCapacity,
        sheetsDirectory: this.getSheetsDirectory(),
        freeSpace: defaultFree,
        usedPercentage: 0
      };
    }
  }

  static async verifyFileExists(fileId: string): Promise<boolean> {
    try {
      const files = await this.getDownloadedFiles();
      const file = files.find(f => f.id === fileId);

      if (!file) return false;

      return await RNFS.exists(file.filePath);
    } catch (error) {
      console.error('❌ Error verifying file existence:', error);
      return false;
    }
  }

  static async getFileById(fileId: string): Promise<DownloadedFile | null> {
    try {
      const files = await this.getDownloadedFiles();
      return files.find(f => f.id === fileId) || null;
    } catch (error) {
      console.error('❌ Error getting file by ID:', error);
      return null;
    }
  }
}
