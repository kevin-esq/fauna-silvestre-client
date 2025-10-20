import { useEffect, useState, useCallback, useRef } from 'react';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { MediaLibraryService } from '@/services/media/media-library.service';

export interface RecentImage {
  uri: string;
  latitude?: number;
  longitude?: number;
  timestamp?: number;
  filename?: string;
}

interface UseRecentImagesOptions {
  limit?: number;
  autoRefresh?: boolean;
  onError?: (error: Error) => void;
  includeVideos?: boolean;
  enabled?: boolean;
}

export function useRecentImagesWithLocation(
  options: UseRecentImagesOptions = {}
) {
  const {
    limit = 50,
    autoRefresh = true,
    onError,
    includeVideos = false,
    enabled = true
  } = options;

  const [images, setImages] = useState<RecentImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const isMountedRef = useRef(true);
  const appStateRef = useRef(AppState.currentState);
  const loadingRef = useRef(false);

  const checkGalleryPermission = useCallback(async (): Promise<boolean> => {
    try {
      let permission;

      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const imagePermission = await check(
            PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          );
          const videoPermission = includeVideos
            ? await check(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO)
            : RESULTS.GRANTED;

          permission =
            imagePermission === RESULTS.GRANTED &&
            videoPermission === RESULTS.GRANTED
              ? RESULTS.GRANTED
              : imagePermission;
        } else if (Platform.Version >= 29) {
          permission = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        } else {
          permission = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        }
      } else {
        permission = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      }

      const granted = permission === RESULTS.GRANTED;
      setHasPermission(granted);
      return granted;
    } catch (err) {
      console.error('Error verificando permisos de galería:', err);
      setHasPermission(false);
      return false;
    }
  }, [includeVideos]);

  const loadRecentImages = useCallback(async () => {
    if (!enabled) {
      console.log('⏹️ Carga de imágenes deshabilitada');
      setIsLoading(false);
      return;
    }

    if (loadingRef.current) {
      console.log('⏹️ Ya hay una carga en progreso, saltando...');
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const hasPermission = await checkGalleryPermission();
      if (!hasPermission) {
        console.warn('⚠️ Permiso de galería denegado');
        setError('Permiso de galería denegado');
        setImages([]);
        return;
      }

      const result = await CameraRoll.getPhotos({
        first: limit,
        assetType: includeVideos ? 'All' : 'Photos',
        include: ['filename', 'location', 'imageSize']
      });

      if (!result.edges || result.edges.length === 0) {
        console.log('📭 No se encontraron imágenes en la galería');
        setImages([]);
        return;
      }

      console.log(`📸 Procesando ${result.edges.length} imágenes...`);

      const BATCH_SIZE = 10;
      const withLocation: RecentImage[] = [];

      for (let i = 0; i < result.edges.length; i += BATCH_SIZE) {
        if (!isMountedRef.current) break;

        const batch = result.edges.slice(i, i + BATCH_SIZE);

        const batchResults = await Promise.allSettled(
          batch.map(async edge => {
            try {
              const uri = edge.node.image.uri;
              const metadata = await MediaLibraryService.extractMetadata(uri);

              if (
                metadata?.latitude &&
                metadata?.longitude &&
                metadata.latitude !== 0 &&
                metadata.longitude !== 0
              ) {
                return {
                  uri,
                  latitude: metadata.latitude,
                  longitude: metadata.longitude,
                  timestamp: edge.node.timestamp,
                  filename: edge.node.image.filename
                };
              }
              return null;
            } catch (err) {
              console.error(
                `Error procesando imagen: ${edge.node.image.uri}`,
                err
              );
              return null;
            }
          })
        );

        batchResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            withLocation.push(result.value as RecentImage);
          }
        });

        console.log(
          `✅ Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${withLocation.length} con ubicación`
        );
      }

      if (!isMountedRef.current) return;

      console.log(
        `✨ Total: ${withLocation.length} imágenes con ubicación de ${result.edges.length}`
      );
      setImages(withLocation);
    } catch (err) {
      const error = err as Error;
      console.error('❌ Error cargando imágenes recientes:', error);

      setError(error.message || 'Error desconocido al cargar imágenes');

      if (onError) {
        onError(error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      loadingRef.current = false;
    }
  }, [limit, includeVideos, checkGalleryPermission, onError, enabled]);

  const refresh = useCallback(() => {
    console.log('🔄 Refrescando imágenes...');
    loadRecentImages();
  }, [loadRecentImages]);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      console.log('🚀 Cargando imágenes iniciales...');
      loadRecentImages();
    } else {
      console.log('⏹️ Carga inicial deshabilitada');
      setIsLoading(false);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [enabled, loadRecentImages]);

  useEffect(() => {
    if (!autoRefresh || !enabled) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('📱 App volvió a primer plano, recargando imágenes...');
        loadRecentImages();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [autoRefresh, enabled, loadRecentImages]);

  return {
    images,
    isLoading,
    error,
    hasPermission,
    refresh
  };
}
