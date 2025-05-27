// utils/metadataUtils.ts
import { PhotoFile } from 'react-native-vision-camera';

export type GeoLocation = {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
};

export const metaToLocation = (photo: any): GeoLocation | null => {
  const { metadata } = photo;
  if (!metadata) return null;

  return {
    latitude: parseCoordinate(metadata.GPSLatitude),
    longitude: parseCoordinate(metadata.GPSLongitude),
    altitude: parseNumber(metadata.GPSAltitude),
    accuracy: parseNumber(metadata.GPSHPositioningError),
  };
};

const parseNumber = (value: unknown): number | undefined => {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const parseCoordinate = (value: unknown): number => {
  const num = parseNumber(value);
  if (num === undefined) throw new Error('Invalid coordinate');
  return num;
};