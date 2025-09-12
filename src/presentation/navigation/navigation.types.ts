import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PublicationModelResponse } from '../../domain/models/publication.models';
import type { Location } from 'react-native-get-location';
import Animal from '../../domain/entities/animal.entity';
import { PublicationStatus } from '@/services/publication/publication.service';

// Única fuente de verdad para todas las rutas de la aplicación.
export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // Tabs (principal)
  AdminHome: undefined;
  Home: undefined;
  Publications: undefined;
  ReviewPublication: undefined;
  ViewPublications: undefined;
  PublicationDetails: {
    publication: PublicationModelResponse;
    status: PublicationStatus;
    reason?: string | undefined;
  };
  AnimalDetails: { animal: Animal };
  AddPublication: undefined;

  // Stack anidado para "Agregar Publicación"
  CameraGallery: undefined;
  ImagePreview: { imageUri: string; location?: Location };
  PublicationForm: { imageUri: string; location?: Location };

  HomeTabs: undefined;
};

// Tipos para los props de cada pantalla, basados en el RootStackParamList
export type PublicationDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PublicationDetails'
>;
export type AnimalDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AnimalDetails'
>;
export type ImagePreviewScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ImagePreview'
>;
export type PublicationFormScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PublicationForm'
>;
export type HomeTabsProps = NativeStackScreenProps<
  RootStackParamList,
  'HomeTabs'
>;
