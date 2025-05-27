import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';

export function useRecentImages() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      const recentAlbum = await MediaLibrary.getAlbumAsync('Camera');
      if (status !== 'granted') return;
      const result = await MediaLibrary.getAssetsAsync({ first: 20, mediaType: 'photo', sortBy: [MediaLibrary.SortBy.creationTime], album: recentAlbum });
      setImages(result.assets.map(a => a.uri));
    })();
  }, []);

  return images;
}