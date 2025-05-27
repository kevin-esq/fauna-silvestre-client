import { useEffect, useState } from "react";
import * as MediaLibrary from "expo-media-library";
import * as Location from "expo-location";
import { Camera } from "react-native-vision-camera";
import { Alert } from "react-native";

export const useCameraPermissions = () => {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [recentImages, setRecentImages] = useState<string[]>([]);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const cameraStatus = await Camera.requestCameraPermission();
        const mediaStatus = await MediaLibrary.requestPermissionsAsync();
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

        const allGranted =
          cameraStatus === "granted" &&
          mediaStatus.status === "granted" &&
          locationStatus === "granted";

        if (!allGranted) {
          Alert.alert("Permisos requeridos", "Activa los permisos de cámara, galería y ubicación.");
          return;
        }

        setHasPermissions(true);
        const assets = await MediaLibrary.getAssetsAsync({
          mediaType: "photo",
          sortBy: "creationTime",
          first: 10,
        });

        setRecentImages(assets.assets.map((a) => a.uri));
      } catch (error) {
        Alert.alert("Error al solicitar permisos", (error as Error).message);
      }
    };

    requestPermissions();
  }, []);

  return { hasPermissions, recentImages };
};