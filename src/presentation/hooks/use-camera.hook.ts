import { useRef, useState, useCallback, useEffect } from 'react';
import {
  Camera,
  useCameraDevices,
  PhotoFile,
  TakePhotoOptions
} from 'react-native-vision-camera';
import { AppState } from 'react-native';
import { useRequestPermissions } from '../hooks/use-request-permissions.hook';

export type CameraPosition = 0 | 1;

export function useCamera() {
  const cameraRef = useRef<Camera>(null);
  const [isCameraReady, setCameraReady] = useState(false);
  const [isCapturing, setCapturing] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>(0);
  const [flashMode, setFlashMode] = useState<'on' | 'off' | 'auto'>('off');
  const { hasPermissions, checkPermissions } = useRequestPermissions();

  const devices = useCameraDevices();
  const device = devices[cameraPosition];

  useEffect(() => {
    checkPermissions(['camera']);
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkPermissions(['camera']);
      }
    });
    return () => subscription.remove();
  }, [checkPermissions]);

  useEffect(() => {
    setCameraReady(hasPermissions && !!device);
  }, [hasPermissions, device]);

  const takePhoto = useCallback(
    async (options?: TakePhotoOptions): Promise<PhotoFile | undefined> => {
      if (!cameraRef.current || !isCameraReady) {
        console.log('Camera not ready or no permission');
        return;
      }
      setCapturing(true);
      try {
        const photo = await cameraRef.current.takePhoto({
          flash: flashMode,
          ...options
        });
        return photo;
      } catch (e: unknown) {
        if (e instanceof Error && e.name === 'CameraRuntimeError') {
          console.error('Camera runtime error:', e.message);
        } else {
          console.error('Failed to take photo with an unexpected error:', e);
        }
      } finally {
        setCapturing(false);
      }
    },
    [cameraRef, isCameraReady, flashMode]
  );

  const flipCamera = useCallback(() => {
    setCameraPosition(prev => (prev === 0 ? 1 : 0));
  }, []);

  const toggleFlashMode = useCallback(() => {
    setFlashMode(prev => {
      if (prev === 'off') return 'on';
      if (prev === 'on') return 'auto';
      return 'off';
    });
  }, []);

  return {
    cameraRef,
    device,
    isCameraReady,
    isCapturing,
    hasPermissions,
    cameraPosition,
    flashMode,
    takePhoto,
    flipCamera,
    toggleFlashMode,
    checkPermissions
  };
}
