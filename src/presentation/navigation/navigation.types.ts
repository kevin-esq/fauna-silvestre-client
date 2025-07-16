import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PublicationsModel } from '../../domain/models/publication.models';
import { AnimalModel } from '../../domain/models/animal.models';
import type { Location } from 'react-native-get-location';

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
    PublicationDetails: { publication: PublicationsModel };
    AnimalDetails: { animal: AnimalModel };
    AddPublication: undefined;

    // Stack anidado para "Agregar Publicación"
    CameraGallery: undefined;
    ImagePreview: { imageUri: string };
    PublicationForm: { imageUri: string, location: Location };
};

// Tipos para los props de cada pantalla, basados en el RootStackParamList
export type PublicationDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'PublicationDetails'>;
export type AnimalDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'AnimalDetails'>;
export type ImagePreviewScreenProps = NativeStackScreenProps<RootStackParamList, 'ImagePreview'>;
export type PublicationFormScreenProps = NativeStackScreenProps<RootStackParamList, 'PublicationForm'>;
