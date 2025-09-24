import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  LocalFileService,
  DownloadedFile
} from '../../services/storage/local-file.service';
import { catalogService } from '../../services/catalog/catalog.service';

interface DownloadedFilesState {
  files: DownloadedFile[];
  isLoading: boolean;
  error: string | null;
  storageInfo: {
    totalFiles: number;
    totalSize: number;
    sheetsDirectory: string;
  };
}

/**
 * Converts a Blob to base64 string
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading blob'));
    reader.readAsDataURL(blob);
  });
};

export const useDownloadedFiles = () => {
  const [state, setState] = useState<DownloadedFilesState>({
    files: [],
    isLoading: false,
    error: null,
    storageInfo: {
      totalFiles: 0,
      totalSize: 0,
      sheetsDirectory: ''
    }
  });

  /**
   * Loads all downloaded files from local storage
   */
  const loadDownloadedFiles = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const files = await LocalFileService.getDownloadedFiles();
      const storageInfo = await LocalFileService.getStorageInfo();

      // Sort files by download date (newest first)
      const sortedFiles = files.sort(
        (a, b) =>
          new Date(b.downloadDate).getTime() -
          new Date(a.downloadDate).getTime()
      );

      setState(prev => ({
        ...prev,
        files: sortedFiles,
        storageInfo,
        isLoading: false
      }));

      console.log(`📋 Loaded ${files.length} downloaded files`);
    } catch (error) {
      console.error('❌ Error loading downloaded files:', error);
      setState(prev => ({
        ...prev,
        error: 'Error al cargar las fichas descargadas',
        isLoading: false
      }));
    }
  }, []);

  /**
   * Downloads and saves an animal sheet
   */
  const downloadAnimalSheet = useCallback(
    async (
      catalogId: number,
      animalName: string
    ): Promise<DownloadedFile | null> => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        console.log(
          `📥 Starting download for animal ${catalogId}: ${animalName}`
        );

        // Download PDF from server
        const pdfBlob = await catalogService.downloadAnimalSheet(
          catalogId.toString()
        );

        // Convert blob to base64
        const pdfBase64 = await blobToBase64(pdfBlob);

        // Save to local storage
        const downloadedFile = await LocalFileService.saveAnimalSheet(
          catalogId,
          animalName,
          pdfBase64,
          'application/pdf'
        );

        // Reload files list
        await loadDownloadedFiles();

        console.log(
          `✅ Successfully downloaded and saved: ${downloadedFile.fileName}`
        );

        return downloadedFile;
      } catch (error) {
        console.error('❌ Error downloading animal sheet:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido';

        setState(prev => ({
          ...prev,
          error: `Error al descargar la ficha: ${errorMessage}`,
          isLoading: false
        }));

        Alert.alert(
          'Error de descarga',
          `No se pudo descargar la ficha de ${animalName}: ${errorMessage}`,
          [{ text: 'OK' }]
        );

        return null;
      }
    },
    [loadDownloadedFiles]
  );

  /**
   * Opens a downloaded file
   */
  const openDownloadedFile = useCallback(async (file: DownloadedFile) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await LocalFileService.openDownloadedFile(file);

      console.log(`📱 Opened file: ${file.fileName}`);
    } catch (error) {
      console.error('❌ Error opening file:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';

      setState(prev => ({
        ...prev,
        error: `Error al abrir la ficha: ${errorMessage}`,
        isLoading: false
      }));

      Alert.alert(
        'Error al abrir',
        `No se pudo abrir la ficha ${file.fileName}: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Deletes a downloaded file
   */
  const deleteDownloadedFile = useCallback(
    async (fileId: string) => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        await LocalFileService.deleteDownloadedFile(fileId);

        // Reload files list
        await loadDownloadedFiles();

        console.log(`🗑️ Deleted downloaded file: ${fileId}`);
      } catch (error) {
        console.error('❌ Error deleting file:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido';

        setState(prev => ({
          ...prev,
          error: `Error al eliminar la ficha: ${errorMessage}`,
          isLoading: false
        }));

        Alert.alert(
          'Error al eliminar',
          `No se pudo eliminar la ficha: ${errorMessage}`,
          [{ text: 'OK' }]
        );
      }
    },
    [loadDownloadedFiles]
  );

  /**
   * Deletes all downloaded files
   */
  const deleteAllFiles = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const files = state.files;

      // Delete all files
      for (const file of files) {
        await LocalFileService.deleteDownloadedFile(file.id);
      }

      // Reload files list
      await loadDownloadedFiles();

      console.log(`🗑️ Deleted all ${files.length} downloaded files`);
    } catch (error) {
      console.error('❌ Error deleting all files:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';

      setState(prev => ({
        ...prev,
        error: `Error al eliminar todas las fichas: ${errorMessage}`,
        isLoading: false
      }));

      Alert.alert(
        'Error al eliminar',
        `No se pudieron eliminar todas las fichas: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    }
  }, [state.files, loadDownloadedFiles]);

  /**
   * Formats file size for display
   */
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }, []);

  /**
   * Formats download date for display
   */
  const formatDownloadDate = useCallback((date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      if (diffInHours === 0) {
        return 'Hace unos minutos';
      } else if (diffInHours === 1) {
        return 'Hace 1 hora';
      } else {
        return `Hace ${diffInHours} horas`;
      }
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      return days === 1 ? 'Hace 1 día' : `Hace ${days} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }, []);

  /**
   * Clears any error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Refresh files list
   */
  const refreshFiles = useCallback(async () => {
    await loadDownloadedFiles();
  }, [loadDownloadedFiles]);

  // Load files on mount
  useEffect(() => {
    loadDownloadedFiles();
  }, [loadDownloadedFiles]);

  return {
    // State
    files: state.files,
    isLoading: state.isLoading,
    error: state.error,
    storageInfo: state.storageInfo,

    // Actions
    downloadAnimalSheet,
    openDownloadedFile,
    deleteDownloadedFile,
    deleteAllFiles,
    refreshFiles,
    clearError,

    // Utilities
    formatFileSize,
    formatDownloadDate
  };
};
