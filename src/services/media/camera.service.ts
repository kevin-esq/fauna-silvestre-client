import { Camera, PhotoFile } from 'react-native-vision-camera';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { metaToLocation } from '../../shared/utils/metaParser';

export type FlashMode = 'off' | 'on' | 'auto';

export interface TakePhotoOptions {
  abortSignal?: AbortSignal;
  onCaptureProgress?: (progress: number) => void;
}

export class CaptureCancelledError extends Error {
  constructor() {
    super('Captura cancelada por el usuario');
    this.name = 'AbortError';
  }
}

export interface ProcessedPhoto extends PhotoFile {
  location?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
}

export class CameraService {
  constructor(private cameraRef: React.RefObject<Camera>) {}

  async takePhoto(
    useFlashFront: boolean,
    flashMode: FlashMode,
    options?: TakePhotoOptions
  ): Promise<ProcessedPhoto> {
    if (!this.cameraRef.current) {
      throw new Error('Cámara no iniciada');
    }
    if (options?.abortSignal?.aborted) {
      throw new CaptureCancelledError();
    }

    const captureOpts = useFlashFront
      ? { flash: flashMode, enableHighQualityPhotos: true }
      : { enableHighQualityPhotos: true };

    const photo = await this.cameraRef.current.takePhoto(captureOpts);

    if (options?.abortSignal?.aborted) {
      throw new CaptureCancelledError();
    }

    return this.processPhoto(photo, options);
  }

  private async processPhoto(
    photo: PhotoFile,
    options?: TakePhotoOptions
  ): Promise<ProcessedPhoto> {
    try {
      const originalWidth = photo.width || 1080;
      const originalHeight = photo.height || originalWidth;
      const targetWidth = 1080;
      const targetHeight = Math.round(
        (originalHeight / originalWidth) * targetWidth
      );

      const resized = await ImageResizer.createResizedImage(
        photo.path,
        targetWidth,
        targetHeight,
        'JPEG',
        80
      );

      if (options?.abortSignal?.aborted) {
        throw new CaptureCancelledError();
      }

      const location = await metaToLocation(photo).catch(() => null);

      if (options?.abortSignal?.aborted) {
        throw new CaptureCancelledError();
      }

      options?.onCaptureProgress?.(100);

      return {
        ...photo,
        path: resized.uri.replace('file://', ''),
        width: targetWidth,
        height: targetHeight,
        metadata: photo.metadata,
        location: location || undefined
      };
    } catch (e) {
      if (e instanceof CaptureCancelledError) throw e;
      console.error('Error procesando foto:', e);
      return photo as ProcessedPhoto;
    }
  }

  toggleFlash(current: FlashMode): FlashMode {
    const modes: FlashMode[] = ['off', 'on', 'auto'];
    return modes[(modes.indexOf(current) + 1) % modes.length];
  }

  flipPosition(current: 0 | 1): 0 | 1 {
    return current === 0 ? 1 : 0;
  }
}
