import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import {
  LocalFileService,
  DownloadedFile
} from '../../services/storage/local-file.service';
import { catalogService } from '../../services/catalog/catalog.service';
import RNFetchBlob from 'react-native-blob-util';

interface DownloadedFilesState {
  files: DownloadedFile[];
  isLoading: boolean;
  error: string | null;
  storageInfo: {
    totalFiles: number;
    totalSize: number;
    totalCapacity: number;
    sheetsDirectory: string;
    freeSpace: number;
    usedPercentage: number;
  };
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading blob'));
    reader.readAsDataURL(blob);
  });
};

const STORAGE_DEFAULTS = {
  ANDROID: {
    TOTAL: 16 * 1024 * 1024 * 1024,
    FREE: 4 * 1024 * 1024 * 1024
  },
  IOS: {
    TOTAL: 64 * 1024 * 1024 * 1024,
    FREE: 8 * 1024 * 1024 * 1024
  },
  FALLBACK: {
    TOTAL: 16 * 1024 * 1024 * 1024,
    FREE: 2 * 1024 * 1024 * 1024
  }
} as const;

interface StorageCapacity {
  totalCapacity: number;
  freeSpace: number;
}

const getStorageCapacity = async (): Promise<StorageCapacity> => {
  try {
    if (Platform.OS === 'android') {
      return await getAndroidStorageCapacity();
    }

    return {
      totalCapacity: STORAGE_DEFAULTS.IOS.TOTAL,
      freeSpace: STORAGE_DEFAULTS.IOS.FREE
    };
  } catch (error) {
    console.error('Error getting storage capacity:', error);
    return {
      totalCapacity: STORAGE_DEFAULTS.FALLBACK.TOTAL,
      freeSpace: STORAGE_DEFAULTS.FALLBACK.FREE
    };
  }
};

const getAndroidStorageCapacity = async (): Promise<StorageCapacity> => {
  const storagePath =
    RNFetchBlob.fs.dirs.SDCardDir || RNFetchBlob.fs.dirs.DocumentDir;

  try {
    const exists = await RNFetchBlob.fs.exists(storagePath);

    if (exists) {
      const stats = await RNFetchBlob.fs.stat(storagePath);
      console.log('Storage path stats:', stats);
    }

    return {
      totalCapacity: STORAGE_DEFAULTS.ANDROID.TOTAL,
      freeSpace: STORAGE_DEFAULTS.ANDROID.FREE
    };
  } catch (error) {
    console.warn('Could not access storage path, using defaults:', error);
    return {
      totalCapacity: STORAGE_DEFAULTS.ANDROID.TOTAL,
      freeSpace: STORAGE_DEFAULTS.ANDROID.FREE
    };
  }
};

export const useDownloadedFiles = () => {
  const [state, setState] = useState<DownloadedFilesState>({
    files: [],
    isLoading: false,
    error: null,
    storageInfo: {
      totalFiles: 0,
      totalSize: 0,
      totalCapacity: 0,
      sheetsDirectory: '',
      freeSpace: 0,
      usedPercentage: 0
    }
  });

  const loadDownloadedFiles = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const files = await LocalFileService.getDownloadedFiles();
      const storageCapacity = await getStorageCapacity();

      const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);

      const usedPercentage = Math.min(
        (totalSize / storageCapacity.totalCapacity) * 100,
        100
      );

      const storageInfo = {
        totalFiles: files.length,
        totalSize,
        totalCapacity: storageCapacity.totalCapacity,
        sheetsDirectory: await LocalFileService.getSheetsDirectory(),
        freeSpace: storageCapacity.freeSpace,
        usedPercentage
      };

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

      console.log(
        `📋 Loaded ${files.length} downloaded files, total size: ${totalSize} bytes`
      );
    } catch (error) {
      console.error('❌ Error loading downloaded files:', error);
      setState(prev => ({
        ...prev,
        error: 'Error al cargar las fichas descargadas',
        isLoading: false
      }));
    }
  }, []);

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

        const pdfBlob = await catalogService.downloadAnimalSheet(
          catalogId.toString()
        );

        const pdfBase64 = await blobToBase64(pdfBlob);

        const downloadedFile = await LocalFileService.saveAnimalSheet(
          catalogId,
          animalName,
          pdfBase64,
          'application/pdf'
        );

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

  const openDownloadedFile = useCallback(async (file: DownloadedFile) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const success = await LocalFileService.openDownloadedFile(file);

      if (!success) {
        throw new Error('No se pudo abrir el archivo');
      }

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
        `No se pudo abrir la ficha ${file.animalName}: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const deleteDownloadedFile = useCallback(
    async (fileId: string) => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        console.log(`🗑️ Attempting to delete file with ID: ${fileId}`);

        const fileToDelete = state.files.find(file => file.id === fileId);

        if (!fileToDelete) {
          throw new Error(`File with ID ${fileId} not found`);
        }

        const success = await LocalFileService.deleteDownloadedFile(fileId);

        if (!success) {
          throw new Error('File deletion returned false');
        }

        await loadDownloadedFiles();

        console.log(`✅ Successfully deleted file: ${fileToDelete.fileName}`);

        Alert.alert(
          '✅ Ficha eliminada',
          `La ficha "${fileToDelete.animalName}" ha sido eliminada correctamente.`,
          [{ text: 'OK' }]
        );
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
    [state.files, loadDownloadedFiles]
  );

  const deleteAllFiles = useCallback(async () => {
    try {
      if (state.files.length === 0) {
        Alert.alert('Info', 'No hay fichas para eliminar.');
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      console.log(`🗑️ Attempting to delete all ${state.files.length} files`);

      let successCount = 0;
      let errorCount = 0;

      for (const file of state.files) {
        try {
          const success = await LocalFileService.deleteDownloadedFile(file.id);
          if (success) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to delete file: ${file.fileName}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error deleting file ${file.fileName}:`, error);
        }
      }

      await loadDownloadedFiles();

      console.log(
        `✅ Deletion completed: ${successCount} success, ${errorCount} errors`
      );

      if (errorCount === 0) {
        Alert.alert(
          '✅ Todas las fichas eliminadas',
          `Se han eliminado correctamente ${successCount} fichas.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '⚠️ Eliminación parcial',
          `Se eliminaron ${successCount} fichas, pero ${errorCount} no se pudieron eliminar.`,
          [{ text: 'OK' }]
        );
      }
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

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }, []);

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

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshFiles = useCallback(async () => {
    await loadDownloadedFiles();
  }, [loadDownloadedFiles]);

  useEffect(() => {
    loadDownloadedFiles();
  }, [loadDownloadedFiles]);

  return {
    files: state.files,
    isLoading: state.isLoading,
    error: state.error,
    storageInfo: state.storageInfo,

    downloadAnimalSheet,
    openDownloadedFile,
    deleteDownloadedFile,
    deleteAllFiles,
    refreshFiles,
    clearError,

    formatFileSize,
    formatDownloadDate
  };
};
