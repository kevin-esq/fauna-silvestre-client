import { PhotoFile } from 'react-native-vision-camera';

export type GeoLocation = {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
};

interface PhotoMetadata {
  GPSLatitude?: string | number;
  GPSLongitude?: string | number;
  GPSAltitude?: string | number;
  GPSHPositioningError?: string | number;
}

function isMetadata(meta: unknown): meta is PhotoMetadata {
  if (typeof meta !== 'object' || meta === null) return false;
  return (
    'GPSLatitude' in meta ||
    'GPSLongitude' in meta ||
    'GPSAltitude' in meta ||
    'GPSHPositioningError' in meta
  );
}

export const metaToLocation = (photo: PhotoFile): GeoLocation | null => {
  const { metadata } = photo;
  if (!isMetadata(metadata)) return null;

  const latitude = parseCoordinate(metadata.GPSLatitude);
  const longitude = parseCoordinate(metadata.GPSLongitude);

  const altitude = parseNumber(metadata.GPSAltitude);
  const accuracy = parseNumber(metadata.GPSHPositioningError);

  if (latitude == null || longitude == null) return null;

  return { latitude, longitude, altitude, accuracy };
};

function parseNumber(value: unknown): number | undefined {
  if (value == null) return undefined;
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function parseCoordinate(value: unknown): number | null {
  const num = parseNumber(value);
  return num != null ? num : null;
}
