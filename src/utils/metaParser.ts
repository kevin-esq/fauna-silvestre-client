import { PhotoFile } from "react-native-vision-camera";

export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  width?: number;
  height?: number;
}

export async function metaToLocation(photo: PhotoFile): Promise<Location | null> {
  const metadata: any = photo.metadata;
  if (!metadata) return null;

  const toNumber = (value: any): number | undefined => {
    if (value === undefined || value === null) return undefined;
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(num) ? undefined : num;
  };

  return {
    width: metadata.width,
    height: metadata.height,
    latitude: toNumber(metadata.GPSLatitude ?? metadata.latitude),
    longitude: toNumber(metadata.GPSLongitude ?? metadata.longitude),
    altitude: toNumber(metadata.GPSAltitude),
    accuracy: toNumber(metadata.GPSHPositioningError)
  };
}