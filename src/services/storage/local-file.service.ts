import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import RNFetchBlob from 'react-native-blob-util';

// Get application ID for Android file sharing
const getApplicationId = () => {
  if (Platform.OS === 'android') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ApplicationInfo } = require('react-native').NativeModules;
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
}

export class LocalFileService {
  public static readonly APP_FOLDER = 'FaunaSilvestre';
  public static readonly SHEETS_FOLDER = 'Fichas';

  /**
   * Gets the app's documents directory path
   */
  private static getAppDirectory(): string {
    return Platform.select({
      ios: RNFS.DocumentDirectoryPath,
      android: `${RNFS.ExternalStorageDirectoryPath}/Android/media/${getApplicationId()}`,
      default: RNFS.DocumentDirectoryPath
    })!;
  }

  /**
   * Gets the sheets directory path
   */
  private static getSheetsDirectory(): string {
    return `${this.getAppDirectory()}/${this.SHEETS_FOLDER}`;
  }

  /**
   * Ensures the app directories exist
   */
  static async ensureDirectoriesExist(): Promise<void> {
    const appDir = this.getAppDirectory();
    const sheetsDir = this.getSheetsDirectory();

    try {
      // Check if app directory exists, create if not
      const appDirExists = await RNFS.exists(appDir);
      if (!appDirExists) {
        await RNFS.mkdir(appDir);
        console.log(`✅ Created app directory: ${appDir}`);
      }

      // Check if sheets directory exists, create if not
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

  /**
   * Generates a WhatsApp-style filename for animal sheets
   */
  static generateFileName(catalogId: number, animalName: string): string {
    const safeAnimalName = animalName
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 30); // Limit length

    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return `Ficha_${safeAnimalName}_${catalogId}_${timestamp}.pdf`;
  }

  /**
   * Saves a PDF file to the sheets directory
   */
  static async saveAnimalSheet(
    catalogId: number,
    animalName: string,
    pdfData: string, // Base64 encoded PDF
    mimeType: string = 'application/pdf'
  ): Promise<DownloadedFile> {
    try {
      // Ensure directories exist
      await this.ensureDirectoriesExist();

      // Generate filename
      const fileName = this.generateFileName(catalogId, animalName);
      const filePath = `${this.getSheetsDirectory()}/${fileName}`;

      // Write file
      await RNFS.writeFile(filePath, pdfData, 'base64');

      // Get file stats
      const stats = await RNFS.stat(filePath);

      // Create metadata
      const downloadedFile: DownloadedFile = {
        id: `${catalogId}_${Date.now()}`,
        catalogId,
        animalName,
        fileName,
        filePath,
        downloadDate: new Date(),
        fileSize: stats.size,
        mimeType
      };

      console.log(`✅ Saved animal sheet: ${fileName} (${stats.size} bytes)`);

      // Save metadata to track downloaded files
      await this.saveDownloadedFileMetadata(downloadedFile);

      return downloadedFile;
    } catch (error) {
      console.error('❌ Error saving animal sheet:', error);
      throw new Error('Failed to save animal sheet');
    }
  }

  /**
   * Gets all downloaded files metadata
   */
  static async getDownloadedFiles(): Promise<DownloadedFile[]> {
    try {
      const metadataPath = `${this.getAppDirectory()}/downloaded_files.json`;

      const metadataExists = await RNFS.exists(metadataPath);

      if (!metadataExists) {
        return [];
      }

      const metadataContent = await RNFS.readFile(metadataPath);
      const files: DownloadedFile[] = JSON.parse(metadataContent);

      // Convert date strings back to Date objects
      return files.map(file => ({
        ...file,
        downloadDate: new Date(file.downloadDate)
      }));
    } catch (error) {
      console.error('❌ Error reading downloaded files metadata:', error);
      return [];
    }
  }

  /**
   * Saves metadata for downloaded files
   */
  private static async saveDownloadedFileMetadata(
    file: DownloadedFile
  ): Promise<void> {
    try {
      const metadataPath = `${this.getAppDirectory()}/downloaded_files.json`;
      const existingFiles = await this.getDownloadedFiles();

      // Add new file to existing files
      const updatedFiles = [...existingFiles, file];

      // Save to file
      await RNFS.writeFile(metadataPath, JSON.stringify(updatedFiles, null, 2));
    } catch (error) {
      console.error('❌ Error saving downloaded files metadata:', error);
      throw new Error('Failed to save download metadata');
    }
  }

  /**
   * Opens a downloaded file
   */
  static async openDownloadedFile(file: DownloadedFile): Promise<void> {
    try {
      const supported = await RNFS.exists(file.filePath);

      if (!supported) {
        throw new Error('File does not exist');
      }

      // Use react-native-blob-util for file opening
      // This handles Android's security restrictions properly
      await RNFetchBlob.android.actionViewIntent(file.filePath, file.mimeType);
    } catch (error) {
      console.error('❌ Error opening file:', error);
      throw new Error('Failed to open file');
    }
  }

  /**
   * Deletes a downloaded file
   */
  static async deleteDownloadedFile(fileId: string): Promise<void> {
    try {
      const files = await this.getDownloadedFiles();
      const fileToDelete = files.find(f => f.id === fileId);

      if (!fileToDelete) {
        throw new Error('File not found');
      }

      // Delete physical file
      await RNFS.unlink(fileToDelete.filePath);

      // Update metadata
      const updatedFiles = files.filter(f => f.id !== fileId);
      const metadataPath = `${this.getAppDirectory()}/downloaded_files.json`;
      await RNFS.writeFile(metadataPath, JSON.stringify(updatedFiles, null, 2));

      console.log(`✅ Deleted file: ${fileToDelete.fileName}`);
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Gets storage usage information
   */
  static async getStorageInfo(): Promise<{
    totalFiles: number;
    totalSize: number;
    sheetsDirectory: string;
  }> {
    try {
      const files = await this.getDownloadedFiles();
      const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);

      return {
        totalFiles: files.length,
        totalSize,
        sheetsDirectory: this.getSheetsDirectory()
      };
    } catch (error) {
      console.error('❌ Error getting storage info:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        sheetsDirectory: this.getSheetsDirectory()
      };
    }
  }
}
