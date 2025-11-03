import { useRef, useState, useCallback, useEffect } from 'react';
import {
  Camera,
  useCameraDevices,
  PhotoFile,
  TakePhotoOptions
} from 'react-native-vision-camera';
import { AppState } from 'react-native';
import { useRequestPermissions } from '../permissions/use-request-permissions.hook';

export type CameraPosition = 0 | 1;

export function useCamera() {
  const cameraRef = useRef<Camera>(null);
  const [isCameraReady, setCameraReady] = useState(false);
  const [isCapturing, setCapturing] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>(0);
  const [flashMode, setFlashMode] = useState<'on' | 'off' | 'auto'>('off');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const { hasPermissions, permissionStatus, checkPermissions } =
    useRequestPermissions();

  const devices = useCameraDevices();
  const device = devices[cameraPosition];

  const checkCameraAccess = useCallback(async () => {
    const hasCameraPermission = permissionStatus['camera'] === 'granted';
    const hasLocationPermission = permissionStatus['location'] === 'granted';

    const isReady =
      hasPermissions &&
      hasCameraPermission &&
      hasLocationPermission &&
      !!device;

    console.log('📷 Estado de cámara:', {
      hasPermissions,
      hasCameraPermission,
      hasLocationPermission,
      hasDevice: !!device,
      isCameraReady: isReady,
      retryCount: retryCountRef.current
    });

    if (!isReady && retryCountRef.current < maxRetries) {
      console.log(
        `🔄 Reintentando acceso a cámara (${retryCountRef.current + 1}/${maxRetries})...`
      );
      setIsRetrying(true);
      retryCountRef.current += 1;

      await checkPermissions(['camera', 'gallery', 'location', 'allFiles']);

      setTimeout(() => {
        setIsRetrying(false);
      }, 1000);
    } else if (!isReady && retryCountRef.current >= maxRetries) {
      console.error('❌ Cámara restringida después de reintentos');
      setCameraError(
        'Cámara restringida. Por favor, verifica los permisos en configuración.'
      );
      setCameraReady(false);
    } else if (isReady) {
      retryCountRef.current = 0;
      setCameraError(null);
      setCameraReady(true);
    }
  }, [hasPermissions, permissionStatus, device, checkPermissions, maxRetries]);

  useEffect(() => {
    checkCameraAccess();
  }, [checkCameraAccess]);

  useEffect(() => {
    const initPermissions = async () => {
      await checkPermissions(['camera', 'gallery', 'location', 'allFiles']);
    };

    initPermissions();

    const subscription = AppState.addEventListener('change', async state => {
      if (state === 'active') {
        await checkPermissions(['camera', 'gallery', 'location', 'allFiles']);
      }
    });

    return () => subscription.remove();
  }, [checkPermissions]);

  const takePhoto = useCallback(
    async (options?: TakePhotoOptions): Promise<PhotoFile | undefined> => {
      if (!cameraRef.current || !isCameraReady) {
        console.log('❌ Cámara no lista o sin permisos');
        return;
      }

      setCapturing(true);
      try {
        const photo = await cameraRef.current.takePhoto({
          flash: flashMode,
          ...options
        });
        console.log('✅ Foto tomada exitosamente');
        return photo;
      } catch (e: unknown) {
        if (e instanceof Error && e.name === 'CameraRuntimeError') {
          console.error(
            '❌ Error de cámara en tiempo de ejecución:',
            e.message
          );
        } else {
          console.error('❌ Error inesperado al tomar foto:', e);
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
    cameraError,
    isRetrying,
    takePhoto,
    flipCamera,
    toggleFlashMode,
    retryCamera: checkCameraAccess
  };
}
