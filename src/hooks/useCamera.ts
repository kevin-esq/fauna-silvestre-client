import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera } from 'react-native-vision-camera';
import {
  CameraService,
  CaptureCancelledError,
  FlashMode,
  ProcessedPhoto,
  TakePhotoOptions,
} from '../services/CameraService';
import { Alert, InteractionManager } from 'react-native';

export function useCamera() {
  const cameraRef = useRef<Camera>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const processingRef = useRef(false);

  const [isCapturing, setIsCapturing] = useState(false);
  const [position, setPosition] = useState<0 | 1>(0);
  const [flashMode, setFlashMode] = useState<FlashMode>('off');

  const service = useRef(new CameraService(cameraRef)).current;

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      processingRef.current = false;
    };
  }, []);

  const takePhoto = useCallback(async (): Promise<string> => {
    //flashMode encendido
    if (processingRef.current || !cameraRef.current) {
      throw new Error('Cámara no disponible');
    }
    processingRef.current = true;
    setIsCapturing(true);
    abortControllerRef.current = new AbortController();
    try {
      const photo: ProcessedPhoto = await service.takePhoto(
        position === 0,
        flashMode,
        {
        abortSignal: abortControllerRef.current.signal,
        onCaptureProgress: (progress) => {
          if (progress === 100) {
            processingRef.current = false;
          }
          setIsCapturing(progress !== 100);
        }
      });

      await InteractionManager.runAfterInteractions();
      return `file://${photo.path}`;
    } catch (err: any) {
      if (!(err instanceof CaptureCancelledError)) {
        Alert.alert('Error al tomar foto', err.message || 'Error desconocido');
      }
      throw err;
    } finally {
      processingRef.current = false;
      setIsCapturing(false);
      abortControllerRef.current = null;
    }
  }, [position, service, flashMode]);

  const cancelCapture = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsCapturing(false);
    processingRef.current = false;
  }, []);

  const toggleFlashMode = useCallback(() => {
    const modes: FlashMode[] = ['off', 'on', 'auto'];
    setFlashMode((prev) => modes[(modes.indexOf(prev) + 1) % modes.length]);
  }, []);

  const flipCamera = useCallback(() => {
    setPosition((prev) => service.flipPosition(prev));
  }, [service]);

  return {
    cameraRef,
    isCapturing,
    position,
    flashMode,
    takePhoto,
    toggleFlashMode,
    flipCamera,
    cancelCapture,
  };
}
