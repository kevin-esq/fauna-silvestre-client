import { useCallback, useState } from 'react';
import Location, {
  Location as LocationInterface,
  type Location as LocationType
} from 'react-native-get-location';
import { useNavigationActions } from '@/presentation/navigation/navigation-provider';
import { useLoading } from '@/presentation/contexts/loading.context';
import { PhotoFile } from 'react-native-vision-camera';
import { MediaLibraryService } from '@/services/media/media-library.service';

interface CameraHook {
  takePhoto: () => Promise<PhotoFile | undefined>;
  isCapturing: boolean;
}

interface FreezeHook {
  showFreeze: (photoPath: string) => void;
  hideFreeze: () => void;
  clearFreeze: () => void;
}

interface UseCameraActionsProps {
  cameraHook: CameraHook;
  freezeHook: FreezeHook;
  onError?: (message: string) => void;
}

export const useCameraActions = ({
  cameraHook,
  freezeHook,
  onError
}: UseCameraActionsProps) => {
  const { navigate } = useNavigationActions();
  const { showLoading, hideLoading } = useLoading();
  const { takePhoto, isCapturing } = cameraHook;
  const { showFreeze, hideFreeze } = freezeHook;

  const [activeThumbnail, setActiveThumbnail] = useState<string | null>(null);

  const parseCoordinate = (value: unknown): number => {
    if (value == null) return 0;
    if (typeof value === 'number') return value;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const handleCapture = useCallback(async () => {
    if (isCapturing) return;

    showLoading();
    try {
      const photo = await takePhoto();
      if (!photo) {
        onError?.('No se pudo capturar la foto.');
        return;
      }

      showFreeze(photo.path);

      let location: LocationType | null = null;
      try {
        location = await Location.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        });
      } catch (locationError) {
        console.warn('Could not get location:', locationError);
      }

      setTimeout(() => {
        hideFreeze();
        navigate('ImagePreview', {
          imageUri: `file://${photo.path}`,
          location: location || undefined
        });
      }, 800);
    } catch (error) {
      console.error('Error capturing photo:', error);
      onError?.(
        'Ocurrió un error al capturar la foto. Por favor, inténtalo de nuevo.'
      );
    } finally {
      hideLoading();
    }
  }, [
    isCapturing,
    takePhoto,
    navigate,
    showLoading,
    hideLoading,
    showFreeze,
    hideFreeze,
    onError
  ]);

  const handleThumbnailPress = useCallback(
    async (uri: string) => {
      try {
        setActiveThumbnail(uri);

        const metadata = await MediaLibraryService.extractMetadata(uri);
        const location: LocationInterface = {
          latitude: parseCoordinate(metadata?.latitude),
          longitude: parseCoordinate(metadata?.longitude),
          altitude: parseCoordinate(metadata?.altitude),
          accuracy: parseCoordinate(metadata?.accuracy),
          speed: 0,
          time: Date.now(),
          bearing: 0,
          provider: '',
          verticalAccuracy: 0,
          course: 0
        };

        navigate('ImagePreview', { imageUri: uri, location });
      } catch (error) {
        console.error('Error opening thumbnail:', error);
        onError?.('No se pudo abrir la imagen.');
      } finally {
        setTimeout(() => setActiveThumbnail(null), 200);
      }
    },
    [navigate, onError]
  );

  const handleConfirm = useCallback(
    (uri: string, location: LocationType) => {
      navigate('ImagePreview', { imageUri: uri, location });
    },
    [navigate]
  );

  return {
    activeThumbnail,
    handleCapture,
    handleThumbnailPress,
    handleConfirm
  };
};
