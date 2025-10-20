import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { LocalFileService } from '../../services/storage/local-file.service';
import { catalogService } from '../../services/catalog/catalog.service';
import { RootStackParamList } from '../navigation/navigation.types';

interface DownloadState {
  isDownloading: boolean;
  progress: number;
  error: string | null;
  currentStep: 'idle' | 'fetching' | 'converting' | 'saving' | 'complete';
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
    error: null,
    currentStep: 'idle'
  });

  const updateProgress = useCallback(
    (progress: number, step: DownloadState['currentStep']) => {
      setDownloadState(prev => ({
        ...prev,
        progress,
        currentStep: step
      }));
    },
    []
  );

  const blobToBase64 = useCallback(
    async (blob: Blob): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onprogress = event => {
          if (event.lengthComputable) {
            const conversionProgress = 40 + (event.loaded / event.total) * 30;
            updateProgress(conversionProgress, 'converting');
          }
        };

        reader.onloadend = () => {
          if (reader.result && typeof reader.result === 'string') {
            const base64Data = reader.result.split(',')[1] || reader.result;
            updateProgress(70, 'converting');
            resolve(base64Data);
          } else {
            reject(new Error('Failed to convert blob to base64'));
          }
        };

        reader.onerror = () => reject(new Error('Error reading blob'));
        reader.readAsDataURL(blob);
      });
    },
    [updateProgress]
  );

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
        error: null,
        currentStep: 'fetching'
      });

      console.log(
        `📥 Starting download for animal ${catalogId}: ${animalName}`
      );

      updateProgress(10, 'fetching');
      const pdfBlob = await catalogService.downloadAnimalSheet(
        catalogId.toString()
      );
      updateProgress(40, 'fetching');

      console.log(`📄 Downloaded blob size: ${pdfBlob.size} bytes`);

      updateProgress(40, 'converting');
      const pdfBase64 = await blobToBase64(pdfBlob);
      updateProgress(70, 'converting');

      console.log(`📄 Converted to base64: ${pdfBase64.length} characters`);

      updateProgress(70, 'saving');
      const downloadedFile = await LocalFileService.saveAnimalSheet(
        catalogId,
        animalName,
        pdfBase64,
        'application/pdf'
      );
      updateProgress(95, 'saving');

      setDownloadState({
        isDownloading: false,
        progress: 100,
        error: null,
        currentStep: 'complete'
      });

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

      setTimeout(() => {
        setDownloadState(prev => ({
          ...prev,
          currentStep: 'idle'
        }));
      }, 2000);

      return downloadedFile;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error desconocido al descargar';

      setDownloadState({
        isDownloading: false,
        progress: 0,
        error: errorMessage,
        currentStep: 'idle'
      });

      Alert.alert(
        '❌ Error de descarga',
        `No se pudo descargar la ficha de ${animalName}: ${errorMessage}`,
        [{ text: 'OK' }]
      );

      console.error('❌ Error downloading animal sheet:', error);
      throw error;
    }
  }, [catalogId, animalName, navigate, blobToBase64, updateProgress]);

  const resetDownloadState = useCallback(() => {
    setDownloadState({
      isDownloading: false,
      progress: 0,
      error: null,
      currentStep: 'idle'
    });
  }, []);

  const getStepLabel = useCallback(() => {
    switch (downloadState.currentStep) {
      case 'fetching':
        return 'Descargando archivo...';
      case 'converting':
        return 'Procesando documento...';
      case 'saving':
        return 'Guardando en biblioteca...';
      case 'complete':
        return '¡Descarga completada!';
      default:
        return 'Preparando descarga...';
    }
  }, [downloadState.currentStep]);

  return {
    downloadState,
    handleDownloadSheet,
    resetDownloadState,
    getStepLabel,
    progressPercentage: Math.round(downloadState.progress),
    isActive:
      downloadState.isDownloading || downloadState.currentStep === 'complete'
  };
};
