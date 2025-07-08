import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

export class ImagePickerService {
  static async pickFromGallery(): Promise<{
    uri: string;
    width?: number;
    height?: number;
    exif?: any;
  } | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      exif: true,
    });

    if (!result.assets || !result.assets[0]) {
      return null;
    }

    const { uri, width, height, exif } = result.assets[0];

    const { GPSLatitude, GPSLongitude } = exif ?? {};

    console.log(`Latitud: ${GPSLatitude}, Longitud: ${GPSLongitude}`);

    console.log('[ImagePickerService] Result:', result);

    return {
      uri,
      width,
      height,
      exif
    };
  }
}