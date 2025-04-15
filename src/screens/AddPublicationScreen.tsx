import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
/*import {
  Camera,
  useCameraDevices,
  PhotoFile,
} from "react-native-vision-camera";*/
import * as Location from "expo-location";

const AddPublicationScreen = () => {
  /*const [hasPermissions, setHasPermissions] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<PhotoFile | null>(null);
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices[0]; // or devices.find((device) => device.type === 'back');

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraStatus = await Camera.requestCameraPermission();
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cameraStatus === "granted" && status === "granted") {
        setHasPermissions(true);
      } else {
        Alert.alert(
          "Permisos insuficientes",
          "Se requieren permisos de cámara y ubicación."
        );
      }
    };

    requestPermissions();
  }, []);

  const takePhoto = async () => {
    try {
      if (cameraRef.current) {
        // Capturamos la foto con metadatos EXIF habilitados
        const photo = await (cameraRef.current.takePhoto as any)({ enableExif: true });
        setCapturedPhoto(photo);

        // Intentamos leer la ubicación de los metadatos EXIF
        if (photo.exif && photo.exif.GPSLatitude && photo.exif.GPSLongitude) {
          setLocationData({
            latitude: parseFloat(photo.exif.GPSLatitude),
            longitude: parseFloat(photo.exif.GPSLongitude),
          });
        } else {
          // Si no hay datos en EXIF, obtenemos la ubicación actual
          const loc = await Location.getCurrentPositionAsync({});
          setLocationData(loc.coords);
        }
      }
    } catch (error) {
      Alert.alert("Error al capturar foto", (error as Error).message);
    }
  };

  if (!device || !hasPermissions) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando cámara...</Text>
      </View>
    );
  }*/

  return (
   /* <View style={styles.container}>
      {capturedPhoto ? (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: "file://" + capturedPhoto.path }}
            style={styles.previewImage}
          />
          {locationData && (
            <Text style={styles.locationText}>
              Ubicación: {locationData.latitude.toFixed(2)},{" "}
              {locationData.longitude.toFixed(2)}
            </Text>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCapturedPhoto(null)}
          >
            <Text style={styles.buttonText}>Volver a tomar foto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={true}
          photo={true}
        >
          <View style={styles.captureButtonContainer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePhoto}
            />
          </View>
        </Camera>
      )}
    </View>*/""
  );
};

export default AddPublicationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
  },
  camera: {
    flex: 1,
  },
  captureButtonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#007AFF",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 16,
  },
  previewImage: {
    width: "100%",
    height: "70%",
    borderRadius: 12,
  },
  locationText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
