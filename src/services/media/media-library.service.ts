// services/media/media-library.service.ts
import { readAsync } from '@lodev09/react-native-exify';

export interface MediaMetadata {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  width?: number;
  height?: number;
  creationTime?: number;
  exif?: any;
}

export class MediaLibraryService {
  static async extractMetadata(uri: string): Promise<MediaMetadata | null> {
    try {
      const tags = await readAsync(uri);

      if (!tags) {
        console.error(`No EXIF tags found for URI: ${uri}`);
        return null;
      }

      const {
        GPSLatitude,
        GPSLongitude,
        GPSAltitude,
        GPSDOP,
      } = tags;

      if (GPSLatitude && GPSLongitude) {
        return {
          latitude: parseFloat(GPSLatitude.toString()),
          longitude: parseFloat(GPSLongitude.toString()),
          altitude: GPSAltitude ? parseFloat(GPSAltitude.toString()) : 0,
          accuracy: GPSDOP ? parseFloat(GPSDOP.toString()) : 0,
          exif: tags,
        };
      }

      return null;
    } catch (error) {
      console.error('Error leyendo EXIF:', error);
      return null;
    }
  }
}
