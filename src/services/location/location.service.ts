import { Platform } from 'react-native';
import Geolocation, {
  GeoCoordinates,
  GeoOptions,
} from 'react-native-geolocation-service';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';

export class LocationService {
  private static async requestLocationPermission(): Promise<boolean> {
    const permissionType =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    let status = await check(permissionType);
    if (status === RESULTS.DENIED) {
      status = await request(permissionType);
    }

    return status === RESULTS.GRANTED;
  }

  static async getCurrentCoords(): Promise<GeoCoordinates> {
    const granted = await LocationService.requestLocationPermission();
    if (!granted) {
      throw new Error('Permisos de ubicación denegados');
    }

    return new Promise<GeoCoordinates>((resolve, reject) => {
      const options: GeoOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      };

      Geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        (error) => reject(new Error(`Error obteniendo ubicación: ${error.message}`)),
        options
      );
    });
  }
}
