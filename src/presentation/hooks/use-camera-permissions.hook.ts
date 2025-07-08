import { useEffect, useState } from "react";
import { Platform, Alert } from "react-native";
import { Camera } from "react-native-vision-camera";
import CameraRoll from "@react-native-camera-roll/camera-roll";
import { request, PERMISSIONS, RESULTS, PermissionStatus } from "react-native-permissions";

export const useCameraPermissions = () => {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [recentImages, setRecentImages] = useState<string[]>([]);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Solicitar permiso de cámara
        const cameraStatus: PermissionStatus = await Camera.requestCameraPermission();

        // Solicitar permisos según plataforma
        let photoPermission: PermissionStatus = RESULTS.DENIED;
        let locationPermission: PermissionStatus = RESULTS.DENIED;

        if (Platform.OS === "android") {
          photoPermission = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
          locationPermission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        } else {
          photoPermission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
          locationPermission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        }

        const allGranted =
          cameraStatus === "granted" &&
          photoPermission === "granted" &&
          locationPermission === "granted";

        if (!allGranted) {
          Alert.alert(
            "Permisos requeridos",
            "Activa los permisos de cámara, galería y ubicación."
          );
          return;
        }

        setHasPermissions(true);

        // Obtener últimas imágenes
        const photos = await CameraRoll.CameraRoll.getPhotos({
          first: 10,
          assetType: "Photos",
        });

        setRecentImages(photos.edges.map((edge) => edge.node.image.uri));
      } catch (error) {
        Alert.alert("Error al solicitar permisos", (error as Error).message);
      }
    };

    requestPermissions();
  }, []);

  return { hasPermissions, recentImages };
};
