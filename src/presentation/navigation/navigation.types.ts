import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PublicationResponse, PublicationStatus } from '../../domain/models/publication.models';
import type { Location } from 'react-native-get-location';
import Animal from '../../domain/entities/animal.entity';

// Única fuente de verdad para todas las rutas de la aplicación.
export type RootStackParamList = {
    // Auth
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;

    // Drawer (principal)
    AdminHome: undefined;
    Home: undefined;
    Publications: undefined;
    ReviewPublication: undefined;
    ViewPublications: undefined;
    PublicationDetails: { publication: PublicationResponse, status: PublicationStatus, reason?: string };
    AnimalDetails: { animal: Animal };
    AddPublication: undefined;

    // Stack anidado para "Agregar Publicación"
    CameraGallery: undefined;
    ImagePreview: { imageUri: string, location?: Location };
    PublicationForm: { imageUri: string, location?: Location };
};

// Tipos para los props de cada pantalla, basados en el RootStackParamList
export type PublicationDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'PublicationDetails'>;
export type AnimalDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'AnimalDetails'>;
export type ImagePreviewScreenProps = NativeStackScreenProps<RootStackParamList, 'ImagePreview'>;
export type PublicationFormScreenProps = NativeStackScreenProps<RootStackParamList, 'PublicationForm'>;
