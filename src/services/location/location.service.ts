import * as Location from 'expo-location';
import { LocationObjectCoords } from 'expo-location';

export class LocationService {
  static async getCurrentCoords(): Promise<LocationObjectCoords | null> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') throw new Error('Permisos de ubicación denegados');
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return loc.coords;
  }
}