import { readAsync } from '@lodev09/react-native-exify';
import {
  PhotoIdentifier,
  CameraRoll
} from '@react-native-camera-roll/camera-roll';

export interface MediaMetadata {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  width?: number;
  height?: number;
  creationTime?: number;
  exif?: unknown;
}

const metadataCache = new Map<string, MediaMetadata | null>();
const cameraRollCache = new Map<string, PhotoIdentifier | null>();

let cameraRollPhotosCache: PhotoIdentifier[] | null = null;
let cameraRollCacheTimestamp = 0;
const CAMERA_ROLL_CACHE_TTL = 5 * 60 * 1000;

function dmsToDecimal(
  dms: string | number | number[] | undefined,
  ref?: string
): number | null {
  if (dms === undefined) return null;

  try {
    let degrees = 0;
    let minutes = 0;
    let seconds = 0;

    if (Array.isArray(dms)) {
      if (dms.length < 3) return null;
      [degrees, minutes, seconds] = dms;
    } else if (typeof dms === 'number') {
      return dms;
    } else if (typeof dms === 'string') {
      const match = dms.match(/(\d+)\D+(\d+)\D+([\d.]+)/);
      if (!match) return null;
      degrees = parseFloat(match[1]);
      minutes = parseFloat(match[2]);
      seconds = parseFloat(match[3]);
    } else {
      return null;
    }

    let decimal = degrees + minutes / 60 + seconds / 3600;

    if (ref?.startsWith('S') || ref?.startsWith('W')) {
      decimal = -decimal;
    }

    return decimal;
  } catch (e) {
    console.error('Error parsing DMS:', e);
    return null;
  }
}

export class MediaLibraryService {
  static async extractMetadata(uri: string): Promise<MediaMetadata | null> {
    if (metadataCache.has(uri)) {
      return metadataCache.get(uri) || null;
    }

    try {
      const [exifResult, cameraRollResult] = await Promise.allSettled([
        this.extractExifMetadata(uri),
        this.getPhotoFromCameraRollOptimized(uri)
      ]);

      let metadata: MediaMetadata | null = null;

      if (exifResult.status === 'fulfilled' && exifResult.value) {
        metadata = exifResult.value;
      } else if (
        cameraRollResult.status === 'fulfilled' &&
        cameraRollResult.value
      ) {
        metadata = cameraRollResult.value;
      }

      metadataCache.set(uri, metadata);

      if (!metadata) {
        console.warn(`No se encontró metadata de ubicación para: ${uri}`);
      }

      return metadata;
    } catch (error) {
      console.error('Error leyendo metadatos:', error);
      metadataCache.set(uri, null);
      return null;
    }
  }

  private static async extractExifMetadata(
    uri: string
  ): Promise<MediaMetadata | null> {
    try {
      const tags = await readAsync(uri);
      if (!tags) return null;

      const {
        GPSLatitude,
        GPSLongitude,
        GPSLatitudeRef,
        GPSLongitudeRef,
        GPSAltitude,
        GPSDOP,
        PixelXDimension,
        PixelYDimension,
        DateTime,
        DateTimeOriginal,
        DateTimeDigitized
      } = tags;

      const latitude = dmsToDecimal(GPSLatitude, GPSLatitudeRef);
      const longitude = dmsToDecimal(GPSLongitude, GPSLongitudeRef);

      if (latitude === null || longitude === null) {
        return null;
      }

      let creationTime: number | undefined;
      const dateStr = DateTimeOriginal || DateTime || DateTimeDigitized;
      if (dateStr && typeof dateStr === 'string') {
        const formattedDate = dateStr.replace(
          /^(\d{4}):(\d{2}):(\d{2})/,
          '$1/$2/$3'
        );
        const parsedDate = new Date(formattedDate);
        if (!isNaN(parsedDate.getTime())) {
          creationTime = parsedDate.getTime();
        }
      }

      return {
        latitude,
        longitude,
        altitude: GPSAltitude ? parseFloat(GPSAltitude.toString()) : undefined,
        accuracy: GPSDOP ? parseFloat(GPSDOP.toString()) : undefined,
        width: PixelXDimension
          ? parseInt(PixelXDimension.toString())
          : undefined,
        height: PixelYDimension
          ? parseInt(PixelYDimension.toString())
          : undefined,
        creationTime,
        exif: tags
      };
    } catch (error) {
      console.error('Error extrayendo EXIF:', error);
      return null;
    }
  }

  private static async getPhotoFromCameraRollOptimized(
    uri: string
  ): Promise<MediaMetadata | null> {
    if (cameraRollCache.has(uri)) {
      const cached = cameraRollCache.get(uri);
      return cached ? this.photoToMetadata(cached) : null;
    }

    try {
      const photo =
        (await this.findPhotoInCachedResults(uri)) ||
        (await this.findPhotoWithDirectQuery(uri));

      cameraRollCache.set(uri, photo);
      return photo ? this.photoToMetadata(photo) : null;
    } catch (error) {
      console.error('Error obteniendo foto desde CameraRoll:', error);
      cameraRollCache.set(uri, null);
      return null;
    }
  }

  private static async findPhotoInCachedResults(
    uri: string
  ): Promise<PhotoIdentifier | null> {
    const now = Date.now();

    if (
      cameraRollPhotosCache &&
      now - cameraRollCacheTimestamp < CAMERA_ROLL_CACHE_TTL
    ) {
      return cameraRollPhotosCache.find(p => p.node.image.uri === uri) || null;
    }

    return null;
  }

  private static async findPhotoWithDirectQuery(
    uri: string
  ): Promise<PhotoIdentifier | null> {
    try {
      const photos = await CameraRoll.getPhotos({
        first: 50,
        assetType: 'Photos',
        include: ['location', 'imageSize'],
        fromTime: this.estimatePhotoTime(uri),
        toTime: Date.now()
      });

      const now = Date.now();
      if (
        !cameraRollPhotosCache ||
        now - cameraRollCacheTimestamp >= CAMERA_ROLL_CACHE_TTL
      ) {
        cameraRollPhotosCache = photos.edges;
        cameraRollCacheTimestamp = now;
      }

      return photos.edges.find(p => p.node.image.uri === uri) || null;
    } catch (error) {
      console.error('Error en consulta directa de CameraRoll:', error);
      return null;
    }
  }

  private static estimatePhotoTime(uri: string): number {
    try {
      const timestampMatch = uri.match(/(\d{10,13})/);
      if (timestampMatch) {
        const timestamp = parseInt(timestampMatch[1]);
        if (timestamp > 1577836800000) {
          return Math.max(0, timestamp - 24 * 60 * 60 * 1000);
        }
      }
    } catch (error) {
      console.warn('Error estimando tiempo de foto desde URI:', error);
    }

    return Date.now() - 30 * 24 * 60 * 60 * 1000;
  }

  private static photoToMetadata(photo: PhotoIdentifier): MediaMetadata | null {
    const { location, image } = photo.node;

    if (!location) return null;

    const { latitude, longitude, altitude } = location;

    return {
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      altitude: altitude ?? undefined,
      accuracy: undefined,
      width: image.width,
      height: image.height,
      creationTime: photo.node.timestamp * 1000,
      exif: null
    };
  }

  static async extractMetadataBatch(
    uris: string[]
  ): Promise<(MediaMetadata | null)[]> {
    const batchSize = 10;
    const results: (MediaMetadata | null)[] = [];

    for (let i = 0; i < uris.length; i += batchSize) {
      const batch = uris.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(uri => this.extractMetadata(uri))
      );
      results.push(...batchResults);
    }

    return results;
  }

  static clearCache(): void {
    metadataCache.clear();
    cameraRollCache.clear();
    cameraRollPhotosCache = null;
    cameraRollCacheTimestamp = 0;
  }

  static getCacheStats(): {
    metadataCacheSize: number;
    cameraRollCacheSize: number;
    cameraRollPhotosCacheSize: number;
    cameraRollCacheAge: number;
  } {
    return {
      metadataCacheSize: metadataCache.size,
      cameraRollCacheSize: cameraRollCache.size,
      cameraRollPhotosCacheSize: cameraRollPhotosCache?.length || 0,
      cameraRollCacheAge: Date.now() - cameraRollCacheTimestamp
    };
  }
}
