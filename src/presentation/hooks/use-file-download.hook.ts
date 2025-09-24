import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { LocalFileService } from '../../services/storage/local-file.service';
import { catalogService } from '../../services/catalog/catalog.service';
import { RootStackParamList } from '../navigation/navigation.types';

interface DownloadState {
  isDownloading: boolean;
  progress: number;
  error: string | null;
}

export const useFileDownload = (
  catalogId?: number,
  animalName?: string,
  navigate?: <T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ) => void
) => {
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isDownloading: false,
    progress: 0,
    error: null
  });

  /**
   * Converts a Blob to base64 string
   */
  const blobToBase64 = useCallback(async (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          // Remove the data:application/pdf;base64, prefix if present
          const base64Data = reader.result.split(',')[1] || reader.result;
          resolve(base64Data);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading blob'));
      reader.readAsDataURL(blob);
    });
  }, []);

  const handleDownloadSheet = useCallback(async () => {
    if (!catalogId || !animalName) {
      Alert.alert(
        'Error',
        'No se puede descargar: información del animal incompleta'
      );
      return;
    }

    try {
      setDownloadState({
        isDownloading: true,
        progress: 0,
        error: null
      });

      console.log(
        `📥 Starting download for animal ${catalogId}: ${animalName}`
      );

      // Download PDF from server
      const pdfBlob = await catalogService.downloadAnimalSheet(
        catalogId.toString()
      );

      console.log(`📄 Downloaded blob size: ${pdfBlob.size} bytes`);

      // Convert blob to base64
      const pdfBase64 = await blobToBase64(pdfBlob);

      console.log(`📄 Converted to base64: ${pdfBase64.length} characters`);

      // Save to local storage using our new service
      const downloadedFile = await LocalFileService.saveAnimalSheet(
        catalogId,
        animalName,
        pdfBase64,
        'application/pdf'
      );

      setDownloadState({
        isDownloading: false,
        progress: 100,
        error: null
      });

      // Show success message
      Alert.alert(
        '✅ Descarga completada',
        `La ficha de ${animalName} se ha guardado correctamente en tu biblioteca personal.\n\n📁 Puedes verla en "Fichas Descargadas"`,
        [
          {
            text: 'OK',
            style: 'default'
          },
          {
            text: 'Ver biblioteca',
            onPress: () => {
              if (navigate) {
                navigate('DownloadedFiles');
              } else {
                console.log(
                  '📱 Navigation not available, user can access via tab'
                );
              }
            }
          }
        ]
      );

      console.log(
        `✅ Successfully downloaded and saved: ${downloadedFile.fileName}`
      );

      return downloadedFile;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error desconocido al descargar';

      setDownloadState({
        isDownloading: false,
        progress: 0,
        error: errorMessage
      });

      Alert.alert(
        '❌ Error de descarga',
        `No se pudo descargar la ficha de ${animalName}: ${errorMessage}`,
        [{ text: 'OK' }]
      );

      console.error('❌ Error downloading animal sheet:', error);
      throw error;
    }
  }, [catalogId, animalName, navigate, blobToBase64]);

  const resetDownloadState = useCallback(() => {
    setDownloadState({
      isDownloading: false,
      progress: 0,
      error: null
    });
  }, []);

  return {
    downloadState,
    handleDownloadSheet,
    resetDownloadState
  };
};
