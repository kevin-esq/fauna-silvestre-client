import { Camera, PhotoFile } from 'react-native-vision-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { metaToLocation } from '../utils/metaParser';

export type FlashMode = 'off' | 'on' | 'auto';

export interface TakePhotoOptions {
  abortSignal?: AbortSignal;
  onCaptureProgress?: (progress: number) => void;
}

/** Error para indicar que el usuario canceló la captura */
export class CaptureCancelledError extends Error {
  constructor() {
    super('Captura cancelada por el usuario');
    this.name = 'AbortError';
  }
}

/** PhotoFile extendido con ubicación opcional */
export interface ProcessedPhoto extends PhotoFile {
  location?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
}

export class CameraService {
  constructor(
    private cameraRef: React.RefObject<Camera>
  ) {}
  /** Toma la foto y respeta abortSignal */
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
      ? { flash: flashMode, includeLocation: true }
      : { includeLocation: true };

      const photo = await this.cameraRef.current.takePhoto(captureOpts);

    if (options?.abortSignal?.aborted) {
      throw new CaptureCancelledError();
    }
    return this.processPhoto(photo, options);
  }

  /** Redimensiona y extrae ubicación EXIF */
  private async processPhoto(
    photo: PhotoFile,
    options?: TakePhotoOptions
  ): Promise<ProcessedPhoto> {
    try {
      // redimensionar
      const manipulated = await ImageManipulator.manipulateAsync(
        `file://${photo.path}`,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      if (options?.abortSignal?.aborted) {
        throw new CaptureCancelledError();
      }

      // extraer GPS
      const location = await metaToLocation(photo).catch(() => null);
      if (options?.abortSignal?.aborted) {
        throw new CaptureCancelledError();
      }

      options?.onCaptureProgress?.(100);
      return {
        ...photo,
        path: manipulated.uri.replace('file://', ''),
        metadata: photo.metadata,
        location: location || undefined,
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
