import { useState, useCallback, useMemo } from 'react';
import {
  AnimalModelResponse,
  UpdateAnimalImageRequest
} from '@/domain/models/animal.models';
import { useAnimalImagePicker } from './use-animal-image-picker.hook';
import { catalogService } from '@/services/catalog/catalog.service';
import { useNavigationActions } from '../navigation/navigation-provider';

interface UseImageEditorProps {
  animal: AnimalModelResponse;
  onImageUpdated?: () => void;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
  onInfo?: (message: string) => void;
  onConfirm?: (message: string, onConfirm: () => void) => void;
  updateListState?: (updatedAnimal: AnimalModelResponse) => void;
  onRefresh?: () => void;
}

interface UseImageEditorReturn {
  currentImage: string;
  originalImage: string;
  isSaving: boolean;
  hasChanges: boolean;

  handleImageChange: (newImage: string) => void;
  handleSave: () => Promise<void>;
  handleRemoveImage: () => void;
  handleBack: () => void;
  openCamera: () => void;
  openGallery: () => void;
}

export const useImageEditor = ({
  animal,
  onImageUpdated,
  onError,
  onSuccess,
  onInfo,
  onConfirm,
  updateListState,
  onRefresh
}: UseImageEditorProps): UseImageEditorReturn => {
  const [currentImage, setCurrentImage] = useState(animal?.image || '');
  const [isSaving, setIsSaving] = useState(false);
  const originalImage = animal?.image || '';
  const getCurrentImageUrl = useCallback((image: string) => {
    if (!image) return image;
    const timestampIndex = image.indexOf('?timestamp=');
    if (timestampIndex === -1) return image;
    return image.substring(0, timestampIndex);
  }, []);

  const currentImageUrl = getCurrentImageUrl(currentImage);
  const originalImageUrl = getCurrentImageUrl(originalImage);

  const hasChanges = useMemo(() => {
    return currentImageUrl !== originalImageUrl;
  }, [currentImageUrl, originalImageUrl]);

  const navigation = useNavigationActions();

  const { openCamera, openGallery } = useAnimalImagePicker({
    onImageSelected: (imageUri: string, base64?: string) => {
      if (base64) {
        setCurrentImage(base64);
        onSuccess?.('Imagen seleccionada correctamente');
      }
    },
    onImageError: (error: string) => {
      const errorMessage = `Error al seleccionar imagen: ${error}`;
      onError?.(errorMessage);
    }
  });

  const handleImageChange = useCallback((newImage: string) => {
    setCurrentImage(newImage);
  }, []);
  const handleRemoveImage = useCallback(() => {
    onConfirm?.(
      '¿Estás seguro de que quieres eliminar la imagen actual?',
      () => {
        setCurrentImage('');
      }
    );
  }, [onConfirm]);

  const handleSave = useCallback(async () => {
    if (!animal) {
      onError?.('Animal no encontrado');
      return;
    }

    if (!hasChanges) {
      onInfo?.('No hay cambios para guardar');
      return;
    }

    setIsSaving(true);

    try {
      const updateRequest: UpdateAnimalImageRequest = {
        catalogId: animal.catalogId,
        image: currentImage
      };

      const response = await catalogService.updateCatalogImage(updateRequest);

      if (response.error) {
        throw new Error(response.message);
      }

      onSuccess?.('La imagen del animal se ha actualizado correctamente');
      onImageUpdated?.();
      updateListState?.({ ...animal, image: currentImage });
      onRefresh?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido al guardar';
      onError?.(`Error al guardar la imagen: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  }, [
    animal,
    currentImage,
    hasChanges,
    onImageUpdated,
    onError,
    onSuccess,
    onInfo,
    updateListState,
    onRefresh
  ]);

  const handleBack = useCallback(() => {
    if (hasChanges) {
      onConfirm?.(
        '¿Estás seguro de que quieres salir? Se perderán los cambios no guardados.',
        () => {
          navigation.goBack();
        }
      );
    } else {
      navigation.goBack();
    }
  }, [hasChanges, navigation, onConfirm]);

  return {
    currentImage,
    originalImage,
    isSaving,
    hasChanges,
    handleImageChange,
    handleSave,
    handleRemoveImage,
    handleBack,
    openCamera,
    openGallery
  };
};
