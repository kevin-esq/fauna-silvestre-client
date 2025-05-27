  import * as ImagePicker from "expo-image-picker";

  const requestPermission = async (
    requestFn: () => Promise<ImagePicker.PermissionResponse>,
    errorMessage: string
  ): Promise<boolean> => {
    const { status } = await requestFn();
    if (status !== "granted") {
      alert(errorMessage);
      return false;
    }
    return true;
  };

  export const pickImageFromCamera = async (): Promise<string | null> => {
    const granted = await requestPermission(
      ImagePicker.requestCameraPermissionsAsync,
      "Se requieren permisos de cámara para usar esta función."
    );
    if (!granted) return null;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });

    return !result.canceled && result.assets?.length ? result.assets[0].uri : null;
  };

  export const pickImageFromGallery = async (): Promise<string | null> => {
    const granted = await requestPermission(
      ImagePicker.requestMediaLibraryPermissionsAsync,
      "Se requieren permisos de galería para usar esta función."
    );
    if (!granted) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    return !result.canceled && result.assets?.length ? result.assets[0].uri : null;
  };
