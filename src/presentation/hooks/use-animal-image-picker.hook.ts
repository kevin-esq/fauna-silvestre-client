import { useCallback } from 'react';
import { useGallery } from './use-gallery.hook';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
  PhotoQuality
} from 'react-native-image-picker';

interface UseAnimalImagePickerProps {
  onImageSelected?: (imageUri: string, base64?: string) => void;
  onImageError?: (error: string) => void;
}

interface UseAnimalImagePickerReturn {
  openCamera: () => void;
  openGallery: () => void;
  openGalleryWithNavigation: () => void;
}

/**
 * Hook especializado para selección de imágenes de animales
 * Integra useGallery con funcionalidad específica para el contexto de animales
 */
export const useAnimalImagePicker = ({
  onImageSelected,
  onImageError
}: UseAnimalImagePickerProps = {}): UseAnimalImagePickerReturn => {
  const { pickAndNavigate } = useGallery();

  // Función para abrir la cámara directamente
  const openCamera = useCallback(() => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 1 as PhotoQuality,
      includeBase64: true,
      maxWidth: 1024,
      maxHeight: 1024
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        if (response.errorMessage) {
          onImageError?.(response.errorMessage);
        }
        return;
      }

      const asset = response.assets?.[0];
      if (asset?.uri) {
        onImageSelected?.(asset.uri, asset.base64);
      }
    });
  }, [onImageSelected, onImageError]);

  // Función para abrir la galería directamente
  const openGallery = useCallback(() => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 1 as PhotoQuality,
      includeBase64: true,
      maxWidth: 1024,
      maxHeight: 1024,
      selectionLimit: 1
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        if (response.errorMessage) {
          onImageError?.(response.errorMessage);
        }
        return;
      }

      const asset = response.assets?.[0];
      if (asset?.uri) {
        onImageSelected?.(asset.uri, asset.base64);
      }
    });
  }, [onImageSelected, onImageError]);

  // Función para abrir galería con navegación (usa useGallery)
  const openGalleryWithNavigation = useCallback(() => {
    pickAndNavigate();
  }, [pickAndNavigate]);

  return {
    openCamera,
    openGallery,
    openGalleryWithNavigation
  };
};
