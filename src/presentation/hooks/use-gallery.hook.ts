import { useNavigation } from '@react-navigation/native';
import {
  launchImageLibrary,
  ImagePickerResponse
} from 'react-native-image-picker';
import { MediaLibraryService } from '../../services/media/media-library.service';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const parseCoordinate = (value: unknown): number => {
  if (typeof value === 'number') {
    return value;
  }
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

type StackParamList = {
  ImagePreview: {
    imageUri: string;
    location?: {
      latitude: number;
      longitude: number;
      altitude: number;
      accuracy: number;
      altitudeAccuracy: number;
      heading: number;
      speed: number;
    };
  };
};

export function useGallery() {
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

  const pickAndNavigate = async () => {
    const response: ImagePickerResponse = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 1
    });

    const asset = response?.assets?.[0];

    if (!asset?.uri) return;

    const metadata = await MediaLibraryService.extractMetadata(asset.uri);

    let location;
    if (metadata) {
      location = {
        latitude: parseCoordinate(metadata.latitude),
        longitude: parseCoordinate(metadata.longitude),
        altitude: parseCoordinate(metadata.altitude),
        accuracy: parseCoordinate(metadata.accuracy),
        altitudeAccuracy: 0,
        heading: 0,
        speed: 0
      };
    }

    navigation.navigate('ImagePreview', {
      imageUri: asset.uri,
      location
    });
  };

  const openUri = async (uri: string) => {
    const metadata = await MediaLibraryService.extractMetadata(uri);

    let location;
    if (metadata) {
      location = {
        latitude: parseCoordinate(metadata.latitude),
        longitude: parseCoordinate(metadata.longitude),
        altitude: parseCoordinate(metadata.altitude),
        accuracy: parseCoordinate(metadata.accuracy),
        altitudeAccuracy: 0,
        heading: 0,
        speed: 0
      };
    }

    navigation.navigate('ImagePreview', {
      imageUri: uri,
      location
    });
  };

  return { pickAndNavigate, openUri };
}
