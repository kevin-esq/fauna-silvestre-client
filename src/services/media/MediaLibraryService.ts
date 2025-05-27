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

      return {
        latitude: info.location?.latitude || 0,
        longitude: info.location?.longitude || 0,
        altitude: null,
        accuracy: null,
        width: info.width,
        height: info.height,
        creationTime: info.creationTime,
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