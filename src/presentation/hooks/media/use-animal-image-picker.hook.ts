import { useCallback } from 'react';
import { useGallery } from '@/presentation/hooks/camera/use-gallery.hook';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
  PhotoQuality,
  CameraOptions,
  ImageLibraryOptions
} from 'react-native-image-picker';
import { Platform } from 'react-native';

interface UseAnimalImagePickerProps {
  onImageSelected?: (imageUri: string, base64?: string) => void;
  onImageError?: (error: string) => void;
}

interface UseAnimalImagePickerReturn {
  openCamera: () => Promise<void>;
  openGallery: () => Promise<void>;
  openGalleryWithNavigation: () => void;
}

export const useAnimalImagePicker = ({
  onImageSelected,
  onImageError
}: UseAnimalImagePickerProps = {}): UseAnimalImagePickerReturn => {
  const { pickAndNavigate } = useGallery();

  const openCamera = useCallback(async () => {
    try {
      const options: CameraOptions = {
        mediaType: 'photo' as MediaType,
        quality: 0.8 as PhotoQuality,
        includeBase64: true,
        maxWidth: 1024,
        maxHeight: 1024,
        saveToPhotos: false,
        cameraType: 'back',

        durationLimit: 30,
        videoQuality: 'high',

        includeExtra: false
      };

      const cameraPromise = launchCamera(options);

      let response: ImagePickerResponse;
      if (Platform.OS === 'android') {
        response = await Promise.race([
          cameraPromise,
          new Promise<ImagePickerResponse>((_, reject) =>
            setTimeout(() => reject(new Error('Camera timeout')), 10000)
          )
        ]);
      } else {
        response = await cameraPromise;
      }

      if (response.didCancel) {
        console.log('User cancelled camera picker');
        return;
      }

      if (response.errorCode) {
        const errorMessage =
          response.errorMessage || 'Error desconocido al abrir la cámara';
        console.error('Camera Error:', response.errorCode, errorMessage);

        if (
          response.errorCode === 'others' &&
          response.errorMessage?.includes('cancelled')
        ) {
          console.log('Camera was dismissed by user');
          return;
        }

        onImageError?.(errorMessage);
        return;
      }

      if (!response.assets || response.assets.length === 0) {
        console.warn('No assets returned from camera');
        onImageError?.('No se pudo capturar la imagen');
        return;
      }

      const asset = response.assets[0];

      if (asset?.uri) {
        console.log('Image captured successfully:', asset.uri);

        setTimeout(() => {
          onImageSelected?.(asset.uri!, asset.base64);
        }, 100);
      } else {
        console.warn('Asset without URI');
        onImageError?.('La imagen capturada no es válida');
      }
    } catch (error) {
      console.error('Exception in openCamera:', error);

      if (error instanceof Error && error.message === 'Camera timeout') {
        console.log(
          'Camera was closed due to timeout, assuming user cancellation'
        );
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Error al abrir la cámara';
      onImageError?.(errorMessage);
    }
  }, [onImageSelected, onImageError]);

  const openGallery = useCallback(async () => {
    try {
      const options: ImageLibraryOptions = {
        mediaType: 'photo' as MediaType,
        quality: 0.8 as PhotoQuality,
        includeBase64: true,
        maxWidth: 1024,
        maxHeight: 1024,
        selectionLimit: 1,
        includeExtra: false
      };

      const response: ImagePickerResponse = await launchImageLibrary(options);

      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (response.errorCode) {
        const errorMessage =
          response.errorMessage || 'Error desconocido al abrir la galería';
        console.error('Gallery Error:', response.errorCode, errorMessage);
        onImageError?.(errorMessage);
        return;
      }

      if (!response.assets || response.assets.length === 0) {
        console.warn('No assets returned from gallery');
        onImageError?.('No se pudo seleccionar la imagen');
        return;
      }

      const asset = response.assets[0];

      if (asset?.uri) {
        console.log('Image selected successfully:', asset.uri);

        setTimeout(() => {
          onImageSelected?.(asset.uri!, asset.base64);
        }, 100);
      } else {
        console.warn('Asset without URI');
        onImageError?.('La imagen seleccionada no es válida');
      }
    } catch (error) {
      console.error('Exception in openGallery:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Error al abrir la galería';
      onImageError?.(errorMessage);
    }
  }, [onImageSelected, onImageError]);

  const openGalleryWithNavigation = useCallback(() => {
    pickAndNavigate();
  }, [pickAndNavigate]);

  return {
    openCamera,
    openGallery,
    openGalleryWithNavigation
  };
};
