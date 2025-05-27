// // src/services/FilePickerService.ts
// import * as ImagePicker from 'expo-image-picker';
// import * as DocumentPicker from 'expo-document-picker';
// import * as FileSystem from 'expo-file-system';
// //import Exif from 'react-native-exif';
// //import { Logger } from './Logger';

// type PickedFile = {
//   uri: string;
//   name: string;
//   type: string;
//   size?: number;
//   exif?: Record<string, any>;
//   location?: {
//     latitude: number;
//     longitude: number;
//     altitude?: number;
//   };
// };

// export class FilePickerService {
//   private static readonly IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/heic'];
//   private static readonly MAX_SIZE_MB = 10;

//   //constructor(private logger: Logger) {}

//   async pickMedia(): Promise<PickedFile | null> {
//     try {
//       // Primero intentar con el selector de imágenes nativo
//       const imageResult = await this.pickFromGallery();
//       if (imageResult) return imageResult;

//       // Fallback al selector de documentos
//       return await this.pickFromFiles();
//     } catch (error) {
//      // this.logger.error('Error selecting media', error);
//       throw new Error('Failed to select media');
//     }
//   }

//   private async pickFromGallery(): Promise<PickedFile | null> {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') return null;

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: false,
//       quality: 1,
//       exif: true,
//     });

//     if (!result.assets?.[0]) return null;

//     const asset = result.assets[0];
//     return {
//       uri: asset.uri,
//       name: asset.fileName || 'image',
//       type: asset.type || 'image',
//       size: asset.fileSize,
//       exif: asset.exif,
//       location: this.extractLocationFromExif(asset.exif),
//     };
//   }

//   private async pickFromFiles(): Promise<PickedFile | null> {
//     const result = await DocumentPicker.getDocumentAsync({
//      // type: this.IMAGE_TYPES,
//       copyToCacheDirectory: false,
//     });

//     if (result.canceled || !result.assets[0]) return null;

//     const asset = result.assets[0];
//     // if (asset.size && asset.size > this.MAX_SIZE_MB * 1024 * 1024) {
//     //   throw new Error(`File size exceeds ${this.MAX_SIZE_MB}MB`);
//     // }

//     const exifData = await this.readExifData(asset.uri);
//     return {
//       uri: asset.uri,
//       name: asset.name,
//       type: asset.mimeType || 'image',
//       size: asset.size,
//       exif: exifData,
//       location: this.extractLocationFromExif(exifData),
//     };
//   }

//   private async readExifData(uri: string): Promise<Record<string, any>> {
//     try {
//       const fileInfo = await FileSystem.getInfoAsync(uri);
//       if (!fileInfo.exists) throw new Error('File not found');

//       return await Exif.getExif(uri);
//     } catch (error) {
//       this.logger.warn('Failed to read EXIF data', error);
//       return {};
//     }
//   }

//   private extractLocationFromExif(exif?: Record<string, any>): PickedFile['location'] {
//     if (!exif) return undefined;

//     const parseCoord = (value: string | number): number => {
//       if (typeof value === 'number') return value;
//       const [degrees, minutes, seconds] = value.split(',').map(Number);
//       return degrees + (minutes / 60) + (seconds / 3600);
//     };

//     try {
//       const latitude = parseCoord(exif.GPSLatitude || exif.latitude);
//       const longitude = parseCoord(exif.GPSLongitude || exif.longitude);
//       const altitude = Number(exif.GPSAltitude || exif.altitude);

//       if (!latitude || !longitude) return undefined;

//       return {
//         latitude,
//         longitude,
//         altitude: !isNaN(altitude) ? altitude : undefined,
//       };
//     } catch (error) {
//       this.logger.warn('Failed to parse location from EXIF', error);
//       return undefined;
//     }
//   }
// }