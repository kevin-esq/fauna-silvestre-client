import * as MediaLibrary from 'expo-media-library';
import { AssetInfo } from 'expo-media-library';

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
  static async extractMetadata(uri: string): Promise<MediaMetadata> {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      const info: AssetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);

      const { exif, location, width, height, creationTime } = info;
      const exifData: any = exif;

      // Prioritize EXIF data as it's more raw
      if (exifData?.GPSLatitude && exifData?.GPSLongitude) {
        return {
          latitude: exifData.GPSLatitude,
          longitude: exifData.GPSLongitude,
          altitude: exifData.GPSAltitude,
          accuracy: exifData.GPSPositionError, // Approximation
          width,
          height,
          creationTime,
          exif: exifData,
        };
      }

      // Fallback to location object
      if (location) {
        return {
          latitude: location.latitude,
          longitude: location.longitude,
          width,
          height,
          creationTime,
        };
      }

      // If no location data, return what we have
      return {
        latitude: 0,
        longitude: 0,
        width,
        height,
        creationTime,
      };
    } catch (error) {
      console.error('Error obteniendo metadatos:', error);
      return {
        latitude: 0,
        longitude: 0
      };
    }
  }
}