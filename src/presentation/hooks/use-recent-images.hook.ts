import { useEffect, useState } from 'react';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { MediaLibraryService } from '@/services/media/media-library.service';

export interface RecentImage {
  uri: string;
  latitude?: number;
  longitude?: number;
}

export function useRecentImagesWithLocation() {
  const [images, setImages] = useState<RecentImage[]>([]);

  useEffect(() => {
    (async () => {
      let permission;

      if (Platform.OS === 'android') {
        permission = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
      } else {
        permission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      }

      if (permission !== RESULTS.GRANTED) {
        console.warn('Permiso de galería denegado');
        return;
      }

      try {
        const result = await CameraRoll.getPhotos({
          first: 50,
          assetType: 'Photos'
        });

        const withLocation: RecentImage[] = [];
        for (const edge of result.edges) {
          const uri = edge.node.image.uri;
          const metadata = await MediaLibraryService.extractMetadata(uri);

          if (metadata?.latitude && metadata?.longitude) {
            withLocation.push({
              uri,
              latitude: metadata.latitude,
              longitude: metadata.longitude
            });
          }
        }

        setImages(withLocation);
      } catch (error) {
        console.error('Error cargando imágenes recientes:', error);
      }
    })();
  }, []);

  return images;
}
