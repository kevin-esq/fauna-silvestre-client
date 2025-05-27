import { useNavigation } from '@react-navigation/native';
import { ImagePickerService } from '../../services/media/ImagePickerService';
import { MediaLibraryService } from '../../services/media/MediaLibraryService';
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
    const metadata = await MediaLibraryService.extractMetadata(result.uri);
    console.log("metadata", metadata);
    navigation.navigate('ImagePreview', {
      imageUri: result.uri,
      location: {
        latitude: metadata.latitude,
        longitude: metadata.longitude,
        altitude: metadata.altitude || 0,
        accuracy: metadata.accuracy || 0,
        altitudeAccuracy:  0,
        heading:  0,
        speed:  0,
      }
    });
  };

  const openUri = async (uri: string) => {
    const metadata = await MediaLibraryService.extractMetadata(uri);
    navigation.navigate('ImagePreview', {
      imageUri: uri,
      location: {
        latitude: metadata.latitude,
        longitude: metadata.longitude,
        altitude: metadata.altitude || 0,
        accuracy: metadata.accuracy || 0,
        altitudeAccuracy:  0,
        heading:  0,
        speed:  0,
      }
    });
  };

  return { pickAndNavigate, openUri };
}