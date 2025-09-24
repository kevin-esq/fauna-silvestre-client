import {
  launchCamera,
  launchImageLibrary,
  CameraOptions,
  ImageLibraryOptions
} from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';

const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

export const pickImageFromCamera = async (): Promise<string | null> => {
  const hasCameraPermission = await requestCameraPermission();
  const hasStoragePermission = await requestStoragePermission();

  if (!hasCameraPermission || !hasStoragePermission) {
    console.log(
      'Se requieren permisos para acceder a la cámara y almacenamiento.'
    );
    return null;
  }

  const options: CameraOptions = {
    mediaType: 'photo',
    quality: 0.7,
    saveToPhotos: true
  };

  return new Promise(resolve => {
    launchCamera(options, response => {
      if (
        response.didCancel ||
        response.errorCode ||
        !response.assets?.length
      ) {
        resolve(null);
      } else {
        resolve(response.assets[0].uri || null);
      }
    });
  });
};

export const pickImageFromGallery = async (): Promise<string | null> => {
  const hasStoragePermission = await requestStoragePermission();
  if (!hasStoragePermission) {
    console.log('Se requieren permisos para acceder a la galería.');
    return null;
  }

  const options: ImageLibraryOptions = {
    mediaType: 'photo',
    quality: 1,
    selectionLimit: 1
  };

  return new Promise(resolve => {
    launchImageLibrary(options, response => {
      if (
        response.didCancel ||
        response.errorCode ||
        !response.assets?.length
      ) {
        resolve(null);
      } else {
        resolve(response.assets[0].uri || null);
      }
    });
  });
};
