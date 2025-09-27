import { useEffect, useState } from 'react';
import {
  CameraRoll,
  PhotoIdentifier
} from '@react-native-camera-roll/camera-roll';
import { Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export function useRecentImages() {
  const [images, setImages] = useState<string[]>([]);

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
          first: 20,
          assetType: 'Photos'
        });
        setImages(
          result.edges.map((edge: PhotoIdentifier) => edge.node.image.uri)
        );
      } catch (error) {
        console.error('Error cargando imágenes recientes:', error);
      }
    })();
  }, []);

  return images;
}
