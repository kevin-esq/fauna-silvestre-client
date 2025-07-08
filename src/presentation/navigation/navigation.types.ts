import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PublicationsModel } from '../../domain/models/publication.models';
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
    PublicationDetails: { publication: PublicationsModel };
    AnimalDetails: { animal: any };
    AddPublication: undefined;

    // Stack anidado para "Agregar Publicación"
    CameraGallery: undefined;
    ImagePreview: { imageUri: string };
    PublicationForm: { imageUri: string };
};

// Tipos para los props de cada pantalla, basados en el RootStackParamList
export type PublicationDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'PublicationDetails'>;
export type AnimalDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'AnimalDetails'>;
export type ImagePreviewScreenProps = NativeStackScreenProps<RootStackParamList, 'ImagePreview'>;
export type PublicationFormScreenProps = NativeStackScreenProps<RootStackParamList, 'PublicationForm'>;
