import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PublicationModelResponse } from '../../domain/models/publication.models';
import type { Location } from 'react-native-get-location';
import { AnimalModelResponse } from '../../domain/models/animal.models';
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
  CatalogManagement: undefined;
  PublicationDetails: {
    publication: PublicationModelResponse;
    status: PublicationStatus;
    reason?: string | undefined;
  };
  AnimalDetails: { animal: AnimalModelResponse };
  AddPublication: undefined;

  // Catalog Management
  AnimalForm: { animal?: AnimalModelResponse };
  ImageEditor: { animal: AnimalModelResponse; refresh?: boolean };
  Catalog: undefined;

  // Stack anidado para "Agregar Publicación"
  CameraGallery: undefined;
  ImagePreview: { imageUri: string; location?: Location };
  PublicationForm: { imageUri: string; location?: Location };

  HomeTabs: undefined;
  DownloadedFiles: undefined;
  UserProfile: undefined;
  UserSettings: {
    userId: string;
  };
  ChangePassword: {
    userId: string;
  };
  UserProfileSettings: {
    userId: string;
  };
  UserProfileEdit: {
    userId: string;
  };
  UserProfilePassword: {
    userId: string;
  };
  UserProfileDelete: {
    userId: string;
  };
  UserList: undefined;
  UserCreate: undefined;
  UserEdit: {
    userId: string;
  };
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
export type CatalogManagementScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CatalogManagement'
>;
export type AnimalFormScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AnimalForm'
>;
export type ImageEditorScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ImageEditor'
>;
export type CatalogScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Catalog'
>;
export type DownloadedFilesScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'DownloadedFiles'
>;
export type UserProfileSettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'UserProfileSettings'
>;
export type UserProfileEditScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'UserProfileEdit'
>;
export type UserProfilePasswordScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'UserProfilePassword'
>;
export type UserProfileDeleteScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'UserProfileDelete'
>;
export type UserSettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'UserSettings'
>;
export type ChangePasswordScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ChangePassword'
>;
export type UserProfileScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'UserProfile'
>;
export type UserListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'UserList'
>;
export type UserCreateScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'UserCreate'
>;
export type UserEditScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'UserEdit'
>;
