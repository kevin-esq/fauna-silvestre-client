import { Platform } from 'react-native';
import { Camera, CameraPermissionStatus } from 'react-native-vision-camera';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export type PermissionStatus = CameraPermissionStatus;

class CameraService {
  private static instance: CameraService;

  private constructor() {}

  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  public async getCameraPermission(): Promise<PermissionStatus> {
    let status = Camera.getCameraPermissionStatus();
    if (status === 'not-determined') {
      status = await Camera.requestCameraPermission();
    }
    return status;
  }

  public async getLocationPermission(): Promise<boolean> {
    const permission = Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    })!;

    const result = await request(permission);
    return result === RESULTS.GRANTED;
  }
}

export default CameraService.getInstance();
