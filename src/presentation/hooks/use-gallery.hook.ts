import { useNavigation } from '@react-navigation/native';
import { ImagePickerService } from '../../services/media/image-picker.service';
import { MediaLibraryService } from '../../services/media/media-library.service';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LocationObjectCoords } from 'expo-location';

type StackParamList = {
  ImagePreview: {
    imageUri: string;
    location?: LocationObjectCoords
  };
};

export function useGallery() {
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

  const pickAndNavigate = async () => {
    const result = await ImagePickerService.pickFromGallery();
    console.log("result", result);
    if (!result?.uri) return;
    const { exif } = result;

    let location;
    if (exif?.GPSLatitude && exif?.GPSLongitude) {
      location = {
        latitude: exif.GPSLatitude,
        longitude: exif.GPSLongitude,
        altitude: exif.GPSAltitude || 0,
        accuracy: exif.GPSPositionError || 0,
        altitudeAccuracy: 0,
        heading: 0,
        speed: 0,
      };
    }

    navigation.navigate('ImagePreview', {
      imageUri: result.uri,
      location
    });
  };

  const openUri = async (uri: string) => {
        const metadata = await MediaLibraryService.extractMetadata(uri);

    let location;
    if (metadata?.latitude && metadata?.longitude) {
      location = {
        latitude: metadata.latitude,
        longitude: metadata.longitude,
        altitude: metadata.altitude || 0,
        accuracy: metadata.accuracy || 0,
        altitudeAccuracy: 0,
        heading: 0,
        speed: 0,
      };
    }

    navigation.navigate('ImagePreview', {
      imageUri: uri,
      location,
    });
  };

  return { pickAndNavigate, openUri };
}