import { PhotoFile } from 'react-native-vision-camera';

export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  width?: number;
  height?: number;
}

interface PhotoMetadata {
  width?: number;
  height?: number;
  GPSLatitude?: string | number;
  GPSLongitude?: string | number;
  latitude?: string | number;
  longitude?: string | number;
  GPSAltitude?: string | number;
  GPSHPositioningError?: string | number;
}

function isMetadata(obj: unknown): obj is PhotoMetadata {
  return typeof obj === 'object' && obj !== null;
}

export async function metaToLocation(
  photo: PhotoFile
): Promise<Location | null> {
  const metadata = photo.metadata;
  if (!isMetadata(metadata)) return null;

  const toNumber = (value: unknown): number | undefined => {
    if (value === undefined || value === null) return undefined;
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(num) ? undefined : num;
  };

  return {
    width: toNumber(metadata.width) ?? undefined,
    height: toNumber(metadata.height) ?? undefined,
    latitude: toNumber(metadata.GPSLatitude ?? metadata.latitude) || 0,
    longitude: toNumber(metadata.GPSLongitude ?? metadata.longitude) || 0,
    altitude: toNumber(metadata.GPSAltitude),
    accuracy: toNumber(metadata.GPSHPositioningError)
  };
}
