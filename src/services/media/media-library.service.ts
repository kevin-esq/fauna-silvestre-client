import { readAsync } from '@lodev09/react-native-exify';
import {
  PhotoIdentifier,
  CameraRoll
} from '@react-native-camera-roll/camera-roll';
import { NativeModules, Platform } from 'react-native';

interface NativeImageMetadata {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  width?: number;
  height?: number;
  dateTaken?: number;
  [key: string]: unknown;
}

interface MediaStoreModuleInterface {
  getImageMetadata: (uri: string) => Promise<NativeImageMetadata>;
  getImageMetadataBatch: (
    uris: string[]
  ) => Promise<(NativeImageMetadata | null)[]>;
  getAllImagesWithLocation: (limit: number) => Promise<NativeImageMetadata[]>;
  clearCache: () => Promise<void>;
}

const { MediaStoreModule } = NativeModules as {
  MediaStoreModule?: MediaStoreModuleInterface;
};

declare const __DEV__: boolean;

const IS_DEV: boolean = typeof __DEV__ !== 'undefined' && __DEV__;

if (IS_DEV) {
  console.log('🔍 Platform.OS:', Platform.OS);
  console.log('🔍 MediaStoreModule existe?', !!MediaStoreModule);
  if (MediaStoreModule) {
    console.log('🔍 MediaStoreModule métodos:', Object.keys(MediaStoreModule));
  }
}

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

interface CacheStats {
  metadataCacheSize: number;
  cameraRollCacheSize: number;
  cameraRollPhotosCacheSize: number;
  cameraRollCacheAge: number;
}

type DmsValue = string | number | number[] | undefined;

const metadataCache = new Map<string, MediaMetadata | null>();
const cameraRollCache = new Map<string, PhotoIdentifier | null>();

let cameraRollPhotosCache: PhotoIdentifier[] | null = null;
let cameraRollCacheTimestamp = 0;
const CAMERA_ROLL_CACHE_TTL = 5 * 60 * 1000;
const BATCH_SIZE = 10;
const DEFAULT_PHOTO_LIMIT = 100;
const CAMERA_ROLL_QUERY_LIMIT = 50;
const DAYS_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;
const MIN_VALID_TIMESTAMP = 1577836800000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;

function parseFraction(value: string): number {
  const parts = value.split('/');
  if (parts.length === 2) {
    const numerator = parseFloat(parts[0]);
    const denominator = parseFloat(parts[1]);
    if (denominator !== 0 && !isNaN(numerator) && !isNaN(denominator)) {
      return numerator / denominator;
    }
  }
  return parseFloat(value);
}

function dmsToDecimal(dms: DmsValue, ref?: string): number | null {
  if (dms === undefined || dms === null) {
    return null;
  }

  try {
    let degrees = 0;
    let minutes = 0;
    let seconds = 0;

    if (Array.isArray(dms)) {
      if (dms.length < 3) {
        return null;
      }
      [degrees, minutes, seconds] = dms;
    } else if (typeof dms === 'number') {
      return dms;
    } else if (typeof dms === 'string') {
      const parts = dms.split(',');

      if (parts.length >= 3) {
        degrees = parseFraction(parts[0].trim());
        minutes = parseFraction(parts[1].trim());
        seconds = parseFraction(parts[2].trim());
      } else {
        const match = dms.match(
          /(\d+(?:\.\d+)?)[°\s]+(\d+(?:\.\d+)?)['\s]+(\d+(?:\.\d+)?)/
        );
        if (!match) {
          return null;
        }
        degrees = parseFloat(match[1]);
        minutes = parseFloat(match[2]);
        seconds = parseFloat(match[3]);
      }
    } else {
      return null;
    }

    if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) {
      return null;
    }

    let decimal = degrees + minutes / 60 + seconds / 3600;

    if (ref?.toUpperCase() === 'S' || ref?.toUpperCase() === 'W') {
      decimal = -decimal;
    }

    return decimal;
  } catch (error) {
    console.error('Error parsing DMS:', error);
    return null;
  }
}

function isValidCoordinates(lat: number, lon: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= MIN_LATITUDE &&
    lat <= MAX_LATITUDE &&
    lon >= MIN_LONGITUDE &&
    lon <= MAX_LONGITUDE &&
    !(lat === 0 && lon === 0)
  );
}

function isValidNativeMetadata(
  metadata: NativeImageMetadata | null | undefined
): metadata is Required<Pick<NativeImageMetadata, 'latitude' | 'longitude'>> {
  return (
    metadata !== null &&
    metadata !== undefined &&
    typeof metadata.latitude === 'number' &&
    typeof metadata.longitude === 'number' &&
    isValidCoordinates(metadata.latitude, metadata.longitude)
  );
}

function createMetadataFromNative(native: NativeImageMetadata): MediaMetadata {
  return {
    latitude: native.latitude!,
    longitude: native.longitude!,
    altitude: native.altitude,
    accuracy: undefined,
    width: native.width,
    height: native.height,
    creationTime: native.dateTaken,
    exif: native
  };
}

export class MediaLibraryService {
  static async extractMetadata(uri: string): Promise<MediaMetadata | null> {
    const cached = metadataCache.get(uri);
    if (cached !== undefined) {
      return cached;
    }

    try {
      const nativeMetadata = await this.tryNativeMetadata(uri);
      if (nativeMetadata) {
        metadataCache.set(uri, nativeMetadata);
        return nativeMetadata;
      }

      const fallbackMetadata = await this.tryFallbackMetadata(uri);
      metadataCache.set(uri, fallbackMetadata);

      if (!fallbackMetadata && IS_DEV) {
        console.warn(`⚠️ No se encontró metadata de ubicación para: ${uri}`);
      }

      return fallbackMetadata;
    } catch (error) {
      if (IS_DEV) {
        console.error('❌ Error leyendo metadatos:', error);
      }
      metadataCache.set(uri, null);
      return null;
    }
  }

  private static async tryNativeMetadata(
    uri: string
  ): Promise<MediaMetadata | null> {
    if (Platform.OS !== 'android' || !MediaStoreModule) {
      return null;
    }

    try {
      if (IS_DEV) {
        console.log('📱 [MediaStore] Intentando leer URI:', uri);
      }

      const nativeMetadata = await MediaStoreModule.getImageMetadata(uri);

      if (isValidNativeMetadata(nativeMetadata)) {
        const metadata = createMetadataFromNative(nativeMetadata);

        if (IS_DEV) {
          console.log('✅ [MediaStore] Metadatos encontrados:', {
            lat: metadata.latitude.toFixed(6),
            lon: metadata.longitude.toFixed(6),
            alt: metadata.altitude?.toFixed(2),
            date: metadata.creationTime
              ? new Date(metadata.creationTime).toISOString()
              : 'N/A'
          });
        }

        return metadata;
      }

      if (IS_DEV) {
        console.log('⚠️ [MediaStore] Respuesta sin coordenadas válidas');
      }
      return null;
    } catch (error) {
      if (IS_DEV) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.log('❌ [MediaStore] Error:', errorMessage);
      }
      return null;
    }
  }

  private static async tryFallbackMetadata(
    uri: string
  ): Promise<MediaMetadata | null> {
    if (IS_DEV) {
      console.log('🔄 [Fallback] Intentando EXIF y CameraRoll...');
    }

    const [exifResult, cameraRollResult] = await Promise.allSettled([
      this.extractExifMetadata(uri),
      this.getPhotoFromCameraRollOptimized(uri)
    ]);

    if (exifResult.status === 'fulfilled' && exifResult.value) {
      if (IS_DEV) {
        console.log('✅ [EXIF] Metadatos encontrados');
        console.log({
          lat: exifResult.value.latitude.toFixed(6),
          lon: exifResult.value.longitude.toFixed(6),
          alt: exifResult.value.altitude?.toFixed(2),
          date: exifResult.value.creationTime
            ? new Date(exifResult.value.creationTime).toISOString()
            : 'N/A'
        });
      }
      return exifResult.value;
    }

    if (cameraRollResult.status === 'fulfilled' && cameraRollResult.value) {
      if (IS_DEV) {
        console.log('✅ [CameraRoll] Metadatos encontrados');
        console.log({
          lat: cameraRollResult.value.latitude.toFixed(6),
          lon: cameraRollResult.value.longitude.toFixed(6),
          alt: cameraRollResult.value.altitude?.toFixed(2),
          date: cameraRollResult.value.creationTime
            ? new Date(cameraRollResult.value.creationTime).toISOString()
            : 'N/A'
        });
      }
      return cameraRollResult.value;
    }

    return null;
  }

  private static async extractExifMetadata(
    uri: string
  ): Promise<MediaMetadata | null> {
    try {
      const tags = await readAsync(uri);
      if (!tags) {
        return null;
      }

      const {
        GPSLatitude,
        GPSLongitude,
        GPSLatitudeRef,
        GPSLongitudeRef,
        GPSAltitude,
        GPSAltitudeRef,
        GPSDOP,
        PixelXDimension,
        PixelYDimension,
        DateTime,
        DateTimeOriginal,
        DateTimeDigitized
      } = tags;

      const latitude = dmsToDecimal(GPSLatitude, GPSLatitudeRef);
      const longitude = dmsToDecimal(GPSLongitude, GPSLongitudeRef);

      if (
        latitude === null ||
        longitude === null ||
        !isValidCoordinates(latitude, longitude)
      ) {
        return null;
      }

      let altitude: number | undefined;
      if (GPSAltitude !== undefined && GPSAltitude !== null) {
        try {
          const altValue =
            typeof GPSAltitude === 'string'
              ? parseFraction(GPSAltitude)
              : parseFloat(String(GPSAltitude));

          if (!isNaN(altValue)) {
            const altRef = String(GPSAltitudeRef) === '1' ? -1 : 1;
            altitude = altValue * altRef;
          }
        } catch (err) {
          if (IS_DEV) {
            console.warn('Error parsing altitude:', err);
          }
        }
      }

      const creationTime = this.parseExifDateTime(
        DateTimeOriginal || DateTimeDigitized || DateTime
      );

      return {
        latitude,
        longitude,
        altitude,
        accuracy: this.parseOptionalNumber(GPSDOP),
        width: this.parseOptionalInteger(PixelXDimension),
        height: this.parseOptionalInteger(PixelYDimension),
        creationTime,
        exif: tags
      };
    } catch (error) {
      if (IS_DEV) {
        console.error('Error extrayendo EXIF:', error);
      }
      return null;
    }
  }

  private static parseExifDateTime(dateValue: unknown): number | undefined {
    if (typeof dateValue !== 'string') {
      return undefined;
    }

    try {
      const isoDate = dateValue.replace(
        /^(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/,
        '$1-$2-$3T$4:$5:$6'
      );

      const parsedDate = new Date(isoDate);

      if (isNaN(parsedDate.getTime())) {
        const fallbackDate = dateValue.replace(
          /^(\d{4}):(\d{2}):(\d{2})/,
          '$1-$2-$3'
        );
        const parsedFallback = new Date(fallbackDate);
        return isNaN(parsedFallback.getTime())
          ? undefined
          : parsedFallback.getTime();
      }

      return parsedDate.getTime();
    } catch (error) {
      if (IS_DEV) {
        console.warn('Error parsing EXIF date:', dateValue, error);
      }
      return undefined;
    }
  }

  private static parseOptionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? undefined : parsed;
  }

  private static parseOptionalInteger(value: unknown): number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? undefined : parsed;
  }

  private static async getPhotoFromCameraRollOptimized(
    uri: string
  ): Promise<MediaMetadata | null> {
    const cached = cameraRollCache.get(uri);
    if (cached !== undefined) {
      return cached ? this.photoToMetadata(cached) : null;
    }

    try {
      const photo =
        (await this.findPhotoInCachedResults(uri)) ||
        (await this.findPhotoWithDirectQuery(uri));

      cameraRollCache.set(uri, photo);
      return photo ? this.photoToMetadata(photo) : null;
    } catch (error) {
      if (IS_DEV) {
        console.error('Error obteniendo foto desde CameraRoll:', error);
      }
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
      return cameraRollPhotosCache.find(p => p.node.image.uri === uri) ?? null;
    }

    return null;
  }

  private static async findPhotoWithDirectQuery(
    uri: string
  ): Promise<PhotoIdentifier | null> {
    try {
      const photos = await CameraRoll.getPhotos({
        first: CAMERA_ROLL_QUERY_LIMIT,
        assetType: 'Photos',
        include: ['location', 'imageSize'],
        fromTime: this.estimatePhotoTime(uri),
        toTime: Date.now()
      });

      this.updateCameraRollCache(photos.edges);

      return photos.edges.find(p => p.node.image.uri === uri) ?? null;
    } catch (error) {
      if (IS_DEV) {
        console.error('Error en consulta directa de CameraRoll:', error);
      }
      return null;
    }
  }

  private static updateCameraRollCache(photos: PhotoIdentifier[]): void {
    const now = Date.now();
    if (
      !cameraRollPhotosCache ||
      now - cameraRollCacheTimestamp >= CAMERA_ROLL_CACHE_TTL
    ) {
      cameraRollPhotosCache = photos;
      cameraRollCacheTimestamp = now;
    }
  }

  private static estimatePhotoTime(uri: string): number {
    try {
      const timestampMatch = uri.match(/(\d{10,13})/);
      if (timestampMatch) {
        const timestamp = parseInt(timestampMatch[1], 10);

        const normalizedTimestamp =
          timestamp < 10000000000 ? timestamp * 1000 : timestamp;

        if (
          normalizedTimestamp > MIN_VALID_TIMESTAMP &&
          normalizedTimestamp < Date.now()
        ) {
          return Math.max(0, normalizedTimestamp - ONE_DAY_MS);
        }
      }
    } catch (error) {
      if (IS_DEV) {
        console.warn('Error estimando tiempo de foto desde URI:', error);
      }
    }

    return Date.now() - DAYS_IN_MILLISECONDS;
  }

  private static photoToMetadata(photo: PhotoIdentifier): MediaMetadata | null {
    const { location, image, timestamp } = photo.node;

    if (
      !location ||
      typeof location.latitude !== 'number' ||
      typeof location.longitude !== 'number'
    ) {
      return null;
    }

    const { latitude, longitude, altitude } = location;

    if (!isValidCoordinates(latitude, longitude)) {
      return null;
    }

    return {
      latitude,
      longitude,
      altitude: altitude ?? undefined,
      accuracy: undefined,
      width: image.width,
      height: image.height,
      creationTime: timestamp ? timestamp * 1000 : undefined,
      exif: null
    };
  }

  static async extractMetadataBatch(
    uris: string[]
  ): Promise<(MediaMetadata | null)[]> {
    if (Platform.OS === 'android' && MediaStoreModule) {
      const nativeResults = await this.tryNativeBatch(uris);
      if (nativeResults) {
        return nativeResults;
      }
    }

    return this.processBatchWithFallback(uris);
  }

  private static async tryNativeBatch(
    uris: string[]
  ): Promise<(MediaMetadata | null)[] | null> {
    try {
      if (IS_DEV) {
        console.log(
          '📦 Procesando batch con MediaStoreModule:',
          uris.length,
          'imágenes'
        );
      }

      const results = await MediaStoreModule!.getImageMetadataBatch(uris);

      return results.map((item, index) => {
        if (isValidNativeMetadata(item)) {
          const metadata = createMetadataFromNative(item);
          metadataCache.set(uris[index], metadata);
          return metadata;
        }
        metadataCache.set(uris[index], null);
        return null;
      });
    } catch (error) {
      if (IS_DEV) {
        console.error('Error en batch nativo, usando fallback:', error);
      }
      return null;
    }
  }

  private static async processBatchWithFallback(
    uris: string[]
  ): Promise<(MediaMetadata | null)[]> {
    const results: (MediaMetadata | null)[] = [];

    for (let i = 0; i < uris.length; i += BATCH_SIZE) {
      const batch = uris.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(uri => this.extractMetadata(uri))
      );
      results.push(...batchResults);
    }

    return results;
  }

  static async getAllPhotosWithLocation(
    limit: number = DEFAULT_PHOTO_LIMIT
  ): Promise<MediaMetadata[]> {
    if (Platform.OS !== 'android' || !MediaStoreModule) {
      if (IS_DEV) {
        console.warn(
          'getAllPhotosWithLocation solo está disponible en Android con módulo nativo'
        );
      }
      return [];
    }

    try {
      if (IS_DEV) {
        console.log(
          '🔍 Obteniendo fotos con ubicación desde MediaStore, limit:',
          limit
        );
      }

      const images = await MediaStoreModule.getAllImagesWithLocation(limit);

      const validImages = images
        .filter(
          img =>
            img.latitude !== undefined &&
            img.longitude !== undefined &&
            isValidCoordinates(img.latitude, img.longitude)
        )
        .map(img => ({
          latitude: img.latitude!,
          longitude: img.longitude!,
          altitude: img.altitude,
          accuracy: undefined,
          width: img.width,
          height: img.height,
          creationTime: img.dateTaken,
          exif: img
        }));

      if (IS_DEV) {
        console.log(
          `✅ Encontradas ${validImages.length} fotos con ubicación válida`
        );
      }

      return validImages;
    } catch (error) {
      if (IS_DEV) {
        console.error('Error obteniendo fotos con ubicación:', error);
      }
      return [];
    }
  }

  static clearCache(): void {
    metadataCache.clear();
    cameraRollCache.clear();
    cameraRollPhotosCache = null;
    cameraRollCacheTimestamp = 0;

    if (Platform.OS === 'android' && MediaStoreModule) {
      MediaStoreModule.clearCache().catch(() => {
        if (IS_DEV) {
          console.warn('Error clearing native MediaStoreModule cache');
        }
      });
    }
  }

  static getCacheStats(): CacheStats {
    return {
      metadataCacheSize: metadataCache.size,
      cameraRollCacheSize: cameraRollCache.size,
      cameraRollPhotosCacheSize: cameraRollPhotosCache?.length ?? 0,
      cameraRollCacheAge: Date.now() - cameraRollCacheTimestamp
    };
  }
}
