import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Platform,
  NativeModules,
  AppState,
  AppStateStatus
} from 'react-native';
import {
  check,
  request,
  RESULTS,
  PermissionStatus,
  Permission,
  PERMISSIONS,
  openSettings
} from 'react-native-permissions';
import { Camera, CameraPermissionStatus } from 'react-native-vision-camera';

const { AllFilesPermission } = NativeModules;

export type PermissionType =
  | 'camera'
  | 'gallery'
  | 'location'
  | 'allFiles'
  | 'fullGallery';

export const checkAllFilesAccess = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  try {
    return await AllFilesPermission.hasAllFilesAccess();
  } catch (error) {
    console.error('Error checking all files access:', error);
    return false;
  }
};

export const openAllFilesSettings = () => {
  if (Platform.OS === 'android') {
    try {
      AllFilesPermission.openAllFilesSettings();
    } catch (error) {
      console.error('Error opening all files settings:', error);
    }
  }
};

const mapCameraPermissionToStandard = (
  status: CameraPermissionStatus
): PermissionStatus => {
  switch (status) {
    case 'granted':
      return RESULTS.GRANTED;
    case 'denied':
    case 'not-determined':
      return RESULTS.DENIED;
    case 'restricted':
      return RESULTS.BLOCKED;
    default:
      return RESULTS.UNAVAILABLE;
  }
};

const getPermissionsByType = (
  types: PermissionType[]
): Record<string, Permission | null> => {
  const map: Record<string, Permission | null> = {};

  for (const type of types) {
    switch (type) {
      case 'camera':
        map['camera'] = null;
        break;

      case 'gallery':
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          map['gallery'] = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
        } else if (Platform.OS === 'android' && Platform.Version >= 29) {
          map['gallery'] = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        } else if (Platform.OS === 'ios') {
          map['gallery'] = PERMISSIONS.IOS.PHOTO_LIBRARY;
        }
        break;

      case 'fullGallery':
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          map['readImages'] = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
          map['readVideo'] = PERMISSIONS.ANDROID.READ_MEDIA_VIDEO;
        } else if (Platform.OS === 'android' && Platform.Version >= 29) {
          map['readStorage'] = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        } else if (Platform.OS === 'ios') {
          map['photoLibrary'] = PERMISSIONS.IOS.PHOTO_LIBRARY;
          map['photoLibraryAddOnly'] = PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY;
        }
        break;

      case 'location':
        map['location'] = Platform.select({
          android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        })!;
        break;

      case 'allFiles':
        map['allFiles'] = null;
        break;
    }
  }

  return map;
};

export const useRequestPermissions = () => {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<
    Record<string, PermissionStatus>
  >({});
  const [isRequesting, setIsRequesting] = useState(false);
  const [missingPermissions, setMissingPermissions] = useState<
    PermissionType[]
  >([]);
  const [blockedPermissions, setBlockedPermissions] = useState<
    PermissionType[]
  >([]);

  const isCheckingRef = useRef(false);
  const lastCheckTimeRef = useRef(0);
  const appStateRef = useRef(AppState.currentState);

  const updatePermissionsState = useCallback(
    (statusMap: Record<string, PermissionStatus>) => {
      const allGranted = Object.values(statusMap).every(
        status => status === RESULTS.GRANTED
      );


      setPermissionStatus(statusMap);
      setHasPermissions(allGranted);

      return allGranted;
    },
    []
  );

  const checkPermissions = useCallback(
    async (types: PermissionType[]) => {
      if (isCheckingRef.current) {
        return {
          allGranted: hasPermissions,
          missingPermissions: [],
          blockedPermissions: []
        };
      }

      const now = Date.now();
      if (now - lastCheckTimeRef.current < 500) {
        return {
          allGranted: hasPermissions,
          missingPermissions: [],
          blockedPermissions: []
        };
      }

      try {
        isCheckingRef.current = true;
        lastCheckTimeRef.current = now;


        const statusMap: Record<string, PermissionStatus> = {};
        const permissionsMap = getPermissionsByType(types);
        const missing: PermissionType[] = [];
        const blocked: PermissionType[] = [];

        if (types.includes('camera')) {
          const cameraStatus = await Camera.getCameraPermissionStatus();
          statusMap['camera'] = mapCameraPermissionToStandard(cameraStatus);

          if (
            statusMap['camera'] === RESULTS.BLOCKED ||
            statusMap['camera'] === RESULTS.UNAVAILABLE
          ) {
            blocked.push('camera');
            missing.push('camera');
          } else if (statusMap['camera'] !== RESULTS.GRANTED) {
            missing.push('camera');
          }
        }

        const permissionChecks = Object.entries(permissionsMap)
          //eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, perm]) => perm !== null)
          .map(async ([key, perm]) => {
            if (perm) {
              const result = await check(perm);
              statusMap[key] = result;

              if (
                result === RESULTS.BLOCKED ||
                result === RESULTS.UNAVAILABLE
              ) {
                if (key === 'location') {
                  blocked.push('location');
                  missing.push('location');
                } else if (
                  key === 'gallery' ||
                  key === 'readImages' ||
                  key === 'readStorage' ||
                  key === 'photoLibrary'
                ) {
                  if (!blocked.includes('gallery')) {
                    blocked.push('gallery');
                  }
                  if (!missing.includes('gallery')) {
                    missing.push('gallery');
                  }
                }
              } else if (result !== RESULTS.GRANTED) {
                if (
                  key === 'gallery' ||
                  key === 'readImages' ||
                  key === 'readStorage' ||
                  key === 'photoLibrary'
                ) {
                  if (!missing.includes('gallery')) {
                    missing.push('gallery');
                  }
                } else if (key === 'location') {
                  if (!missing.includes('location')) {
                    missing.push('location');
                  }
                }
              }
            }
          });

        await Promise.all(permissionChecks);

        if (Platform.OS === 'android' && types.includes('allFiles')) {
          const hasAllFilesAccess = await checkAllFilesAccess();
          statusMap['allFiles'] = hasAllFilesAccess
            ? RESULTS.GRANTED
            : RESULTS.DENIED;
          if (!hasAllFilesAccess) {
            missing.push('allFiles');
          }
        }


        const uniqueMissing = Array.from(new Set(missing));
        const uniqueBlocked = Array.from(new Set(blocked));

        setMissingPermissions(uniqueMissing);

        setBlockedPermissions(prev => {
          if (uniqueBlocked.length === 0) {
            const stillBlocked = prev.filter(blockedPerm => {
              return uniqueMissing.includes(blockedPerm);
            });

            console.log(
              '🔄 Limpiando permisos bloqueados que ahora están concedidos'
            );
            return stillBlocked;
          }

          const combined = Array.from(new Set([...prev, ...uniqueBlocked]));
          console.log(
            '🔄 Actualizando blockedPermissions - Previo:',
            prev,
            'Nuevo:',
            combined
          );
          return combined;
        });

        const allGranted = updatePermissionsState(statusMap);

        return {
          allGranted,
          missingPermissions: uniqueMissing,
          blockedPermissions: uniqueBlocked
        };
      } catch (err) {
        console.error('❌ Error al verificar permisos:', err);
        return {
          allGranted: false,
          missingPermissions: [],
          blockedPermissions: []
        };
      } finally {
        isCheckingRef.current = false;
      }
    },
    [hasPermissions, updatePermissionsState]
  );

  const requestAlertPermissions = useCallback(
    async (types: PermissionType[]) => {
      if (isRequesting) {
        return false;
      }

      try {
        setIsRequesting(true);

        const statusMap: Record<string, PermissionStatus> = {};
        const permissionsMap = getPermissionsByType(types);
        const newBlocked: PermissionType[] = [];
        const alreadyBlocked: PermissionType[] = [];

        for (const [key, perm] of Object.entries(permissionsMap)) {
          if (perm) {
            const currentStatus = await check(perm);
            if (
              currentStatus === RESULTS.BLOCKED ||
              currentStatus === RESULTS.UNAVAILABLE
            ) {
              if (key === 'location' && !alreadyBlocked.includes('location')) {
                alreadyBlocked.push('location');
              } else if (
                (key === 'gallery' ||
                  key === 'readImages' ||
                  key === 'readStorage' ||
                  key === 'photoLibrary') &&
                !alreadyBlocked.includes('gallery')
              ) {
                alreadyBlocked.push('gallery');
              }
            }
          }
        }

        if (types.includes('camera')) {
          const currentCameraStatus = await Camera.getCameraPermissionStatus();
          const mappedStatus =
            mapCameraPermissionToStandard(currentCameraStatus);
          if (
            mappedStatus === RESULTS.BLOCKED ||
            mappedStatus === RESULTS.UNAVAILABLE
          ) {
            alreadyBlocked.push('camera');
          }
        }

        if (alreadyBlocked.length > 0) {
          setBlockedPermissions(prev => {
            const updated = Array.from(new Set([...prev, ...alreadyBlocked]));
            return updated;
          });
          return false;
        }

        if (types.includes('camera')) {
          const cameraStatus = await Camera.requestCameraPermission();
          statusMap['camera'] = mapCameraPermissionToStandard(cameraStatus);

          if (
            statusMap['camera'] === RESULTS.BLOCKED ||
            statusMap['camera'] === RESULTS.UNAVAILABLE
          ) {
            newBlocked.push('camera');
          }
        }

        const permissionRequests = Object.entries(permissionsMap)
          //eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, perm]) => perm !== null)
          .map(async ([key, perm]) => {
            if (perm) {

              const beforeStatus = await check(perm);

              const result = await request(perm);
              statusMap[key] = result;

              if (
                result === RESULTS.BLOCKED ||
                result === RESULTS.UNAVAILABLE
              ) {
                if (key === 'location' && !newBlocked.includes('location')) {
                  newBlocked.push('location');
                } else if (
                  (key === 'gallery' ||
                    key === 'readImages' ||
                    key === 'readStorage' ||
                    key === 'photoLibrary') &&
                  !newBlocked.includes('gallery')
                ) {
                  newBlocked.push('gallery');
                }
              } else if (result === RESULTS.DENIED) {
                console.log(
                  `❌ ${key} fue DENEGADO (aún se puede volver a solicitar)`
                );
              } else if (result === RESULTS.GRANTED) {
              }
            }
          });

        await Promise.all(permissionRequests);

        console.log(
          '🎯 RequestAlertPermissions - Status Map completo:',
          statusMap
        );

        if (newBlocked.length > 0) {
          setBlockedPermissions(prev => {
            const updated = Array.from(new Set([...prev, ...newBlocked]));
            return updated;
          });
        }

        const allRequestedGranted = types.every(type => {
          if (type === 'camera') {
            const granted = statusMap['camera'] === RESULTS.GRANTED;
            return granted;
          }
          if (type === 'gallery') {
            const granted =
              statusMap['gallery'] === RESULTS.GRANTED ||
              statusMap['readImages'] === RESULTS.GRANTED ||
              statusMap['readStorage'] === RESULTS.GRANTED ||
              statusMap['photoLibrary'] === RESULTS.GRANTED;
            return granted;
          }
          if (type === 'location') {
            const granted = statusMap['location'] === RESULTS.GRANTED;
            return granted;
          }
          return true;
        });


        return allRequestedGranted;
      } catch (err) {
        console.error('❌ Error al solicitar permisos con alerta:', err);
        return false;
      } finally {
        setIsRequesting(false);
      }
    },
    [isRequesting]
  );

  const requestAllFilesPermission = useCallback(() => {
    openAllFilesSettings();
  }, []);

  const openAppSettings = useCallback(() => {
    openSettings().catch(() => {
      console.error('❌ No se pudo abrir la configuración');
    });
  }, []);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        await checkPermissions(['camera', 'gallery', 'location', 'allFiles']);
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [checkPermissions]);

  const resetPermissions = useCallback(() => {
    setHasPermissions(false);
    setPermissionStatus({});
    setMissingPermissions([]);
    setBlockedPermissions([]);
    isCheckingRef.current = false;
    lastCheckTimeRef.current = 0;
  }, []);

  return {
    hasPermissions,
    permissionStatus,
    isRequesting,
    missingPermissions,
    blockedPermissions,
    requestAlertPermissions,
    requestAllFilesPermission,
    checkPermissions,
    resetPermissions,
    openAllFilesSettings,
    openAppSettings
  };
};
