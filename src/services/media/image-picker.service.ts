// services/image-picker/image-picker.service.ts
import * as ImagePicker from '@react-native-camera-roll/camera-roll';

export class ImagePickerService {
  static async pickFromGallery(): Promise<{
    uri: string;
    width?: number;
    height?: number;
  } | null> {
    const result = await ImagePicker.CameraRoll.getPhotos({
      first: 1,
      assetType: 'Photos',
    });

    if (!result.edges || !result.edges[0]) {
      return null;
    }

    const { uri, width, height } = result.edges[0].node.image;

    console.log('[ImagePickerService] Result:', result);

    return {
      uri,
      width,
      height,
    };
  }
}