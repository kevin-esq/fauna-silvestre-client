import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme, Theme } from '../../contexts/theme.context';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { AnimalModelResponse } from '@/domain/models/animal.models';
import { createStyles } from './image-editor-screen.styles';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CatalogAnimalCard } from '../catalog/catalog-animals-screen';
import { useImageEditor } from '../../hooks/use-image-editor.hook';

// ==================== COMPONENTES MEMORIZADOS ====================

/**
 * Header del editor
 */
const EditorHeader = React.memo<{
  animalName: string;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}>(({ animalName, onBack, onSave, isSaving, hasChanges, theme, styles }) => (
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.backButton}
      onPress={onBack}
      accessibilityRole="button"
      accessibilityLabel="Volver"
    >
      <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
    </TouchableOpacity>

    <View style={styles.headerContent}>
      <Text style={styles.headerTitle}>Editor de Imagen</Text>
      <Text style={styles.headerSubtitle}>{animalName}</Text>
    </View>

    <TouchableOpacity
      style={[
        styles.saveButton,
        (!hasChanges || isSaving) && styles.saveButtonDisabled
      ]}
      onPress={onSave}
      disabled={!hasChanges || isSaving}
      accessibilityRole="button"
      accessibilityLabel="Guardar imagen"
    >
      {isSaving ? (
        <ActivityIndicator size="small" color={theme.colors.textOnPrimary} />
      ) : (
        <Ionicons
          name="checkmark"
          size={24}
          color={theme.colors.textOnPrimary}
        />
      )}
    </TouchableOpacity>
  </View>
));

/**
 * Sección de edición de imagen
 */
const ImageEditSection = React.memo<{
  animal: AnimalModelResponse;
  currentImage: string;
  openCamera: () => void;
  openGallery: () => void;
  onRemoveImage: () => void;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}>(
  ({
    animal,
    currentImage,
    openCamera,
    openGallery,
    onRemoveImage,
    theme,
    styles
  }) => {
    // Crear animal temporal con la imagen actual
    const animalWithCurrentImage: AnimalModelResponse = useMemo(
      () => ({
        ...animal,
        image: currentImage.startsWith('data:')
          ? currentImage
          : currentImage.startsWith('/')
            ? `data:image/jpeg;base64,${currentImage}`
            : currentImage || ''
      }),
      [animal, currentImage]
    );

    return (
      <View style={styles.imageEditContainer}>
        <Text style={styles.sectionTitle}>Imagen Actual</Text>

        {/* Preview del animal con la imagen actual */}
        <View style={styles.animalCardContainer}>
          <CatalogAnimalCard
            animal={animalWithCurrentImage}
            onPress={() => {}}
            theme={theme}
            index={0}
            viewMode="grid"
          />
        </View>

        {/* Controles de imagen */}
        <View style={styles.imageControlsContainer}>
          {currentImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{
                  uri: animalWithCurrentImage.image,
                  cache: 'reload'
                }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={onRemoveImage}
                accessibilityRole="button"
                accessibilityLabel="Eliminar imagen"
              >
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={theme.colors.error}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons
                name="image-outline"
                size={64}
                color={theme.colors.placeholder}
              />
              <Text style={styles.noImageText}>Sin imagen</Text>
            </View>
          )}
        </View>

        {/* Botones de acción */}
        <View style={styles.cameraActions}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={openCamera}
            accessibilityRole="button"
            accessibilityLabel="Tomar foto con cámara"
          >
            <Ionicons
              name="camera"
              size={24}
              color={theme.colors.textOnPrimary}
            />
            <Text style={styles.cameraButtonText}>Cámara</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.galleryButton}
            onPress={openGallery}
            accessibilityRole="button"
            accessibilityLabel="Seleccionar de galería"
          >
            <Ionicons name="images" size={24} color={theme.colors.forest} />
            <Text style={styles.galleryButtonText}>Galería</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.helpText}>
          📸 Usa la cámara o selecciona una imagen de tu galería para actualizar
          la foto del animal
        </Text>
      </View>
    );
  }
);

/**
 * Sección de información del animal
 */
const AnimalInfoSection = React.memo<{
  animal: AnimalModelResponse;
  styles: ReturnType<typeof createStyles>;
}>(({ animal, styles }) => (
  <View style={styles.infoContainer}>
    <Text style={styles.sectionTitle}>Información del Animal</Text>
    <View style={styles.infoGrid}>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Nombre Común:</Text>
        <Text style={styles.infoValue}>{animal.commonNoun}</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Especie:</Text>
        <Text style={styles.infoValue}>{animal.specie}</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Categoría:</Text>
        <Text style={styles.infoValue}>{animal.category}</Text>
      </View>
      {animal.description && (
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Descripción:</Text>
          <Text style={styles.infoValue} numberOfLines={3}>
            {animal.description}
          </Text>
        </View>
      )}
    </View>
  </View>
));

// ==================== COMPONENTE PRINCIPAL ====================

const ImageEditorScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigationActions();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const routeParams = route.params as {
    animal: AnimalModelResponse;
    refresh?: boolean;
  };
  const animal = routeParams?.animal;

  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

  // Hook de edición de imágenes
  const {
    currentImage,
    isSaving,
    hasChanges,
    handleSave,
    handleRemoveImage,
    handleBack,
    openCamera,
    openGallery
  } = useImageEditor({
    animal: animal!,
    onImageUpdated: () => {
      navigation.goBack();
    },
    onError: error => {
      console.error('Image Editor Error:', error);
    },
    onRefresh: () => {
      navigation.setParams({ refresh: true });
    }
  });

  const onBackPress = useCallback(() => {
    handleBack();
  }, [handleBack]);

  if (!animal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Animal no encontrado</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <EditorHeader
        animalName={animal.commonNoun}
        onBack={onBackPress}
        onSave={handleSave}
        isSaving={isSaving}
        hasChanges={hasChanges}
        theme={theme}
        styles={styles}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ImageEditSection
          animal={animal}
          currentImage={currentImage}
          openCamera={openCamera}
          openGallery={openGallery}
          onRemoveImage={handleRemoveImage}
          theme={theme}
          styles={styles}
        />

        <AnimalInfoSection animal={animal} styles={styles} />

        {/* Spacer para el scroll */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

EditorHeader.displayName = 'EditorHeader';
ImageEditSection.displayName = 'ImageEditSection';
AnimalInfoSection.displayName = 'AnimalInfoSection';
ImageEditorScreen.displayName = 'ImageEditorScreen';

export default ImageEditorScreen;
