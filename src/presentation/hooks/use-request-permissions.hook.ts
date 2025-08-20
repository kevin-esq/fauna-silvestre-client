import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import {
  check,
  request,
  openSettings,
  RESULTS,
  PermissionStatus,
  Permission,
  PERMISSIONS,
} from 'react-native-permissions';
import { Camera, CameraPermissionStatus } from 'react-native-vision-camera';

const mapCameraPermissionToStandard = (
  status: CameraPermissionStatus,
): PermissionStatus => {
  switch (status) {
    case 'granted':
      return RESULTS.GRANTED;
    case 'denied':
      return RESULTS.DENIED;
    case 'not-determined':
      return RESULTS.DENIED;
    case 'restricted':
      return RESULTS.BLOCKED;
    default:
      return RESULTS.UNAVAILABLE;
  }
};

const getPermissionsByType = (
  types: ('camera' | 'gallery' | 'location')[],
): Permission[] => {
  const permissions: Permission[] = [];

  for (const type of types) {
    switch (type) {
      case 'camera':
        break;
      case 'gallery':
        permissions.push(
          Platform.select({
            android: PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
            ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
          })!,
        );
        break;
      case 'location':
        permissions.push(
          Platform.select({
            android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
            ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
          })!,
        );
        break;
    }
  }

  return permissions;
};

export const useRequestPermissions = () => {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<
    Record<string, PermissionStatus>
  >({});

  const requestPermissions = useCallback(
    async (types: ('camera' | 'gallery' | 'location')[]) => {
      try {
        const statusMap: Record<string, PermissionStatus> = {};

        if (types.includes('camera')) {
          const cameraStatus = await Camera.requestCameraPermission();
          statusMap['camera'] = cameraStatus;
        }

        const permissions = getPermissionsByType(types);

        for (const perm of permissions) {
          const result = await request(perm);
          statusMap[perm] = result;
        }

        setPermissionStatus(statusMap);

        const allGranted = Object.values(statusMap).every(
          status => status === RESULTS.GRANTED,
        );

        if (!allGranted) {
          Alert.alert(
            'Permisos requeridos',
            'Necesitas habilitar los permisos solicitados para continuar.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Ir a ajustes', onPress: () => openSettings() },
            ],
          );
          setHasPermissions(false);
          return false;
        }

        setHasPermissions(true);
        return true;
      } catch (err) {
        console.error('Error al solicitar permisos:', err);
        return false;
      }
    },
    [],
  );

  const checkPermissions = useCallback(
    async (types: ('camera' | 'gallery' | 'location')[]) => {
      const statusMap: Record<string, PermissionStatus> = {};

      if (types.includes('camera')) {
        const cameraStatus = Camera.getCameraPermissionStatus();
        const mappedStatus = mapCameraPermissionToStandard(cameraStatus);
        statusMap['camera'] = mappedStatus;
      }

      const permissions = getPermissionsByType(types);

      for (const perm of permissions) {
        const result = await check(perm);
        statusMap[perm] = result;
      }

      const allGranted = Object.values(statusMap).every(
        status => status === RESULTS.GRANTED,
      );

      setPermissionStatus(statusMap);
      setHasPermissions(allGranted);

      return allGranted;
    },
    [],
  );

  return {
    hasPermissions,
    permissionStatus,
    requestPermissions,
    checkPermissions,
  };
};
