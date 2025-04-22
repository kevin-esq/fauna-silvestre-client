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
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 1,
      exif: true,
    });

    if (!result.assets?.[0]) return null;

    return {
      uri: result.assets[0].uri,
      width: result.assets[0].width,
      height: result.assets[0].height,
      exif: result.assets[0].exif
    };
  }
}