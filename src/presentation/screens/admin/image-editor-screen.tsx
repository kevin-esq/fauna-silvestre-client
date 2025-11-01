import React, { useCallback, useMemo, useState } from 'react';
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
import { AnimalCardVariant } from '../../components/animal/animal-card-variants.component';
import { ViewLayout } from '@/services/storage/catalog-view-preferences.service';
import { useImageEditor } from '../../hooks/use-image-editor.hook';
import { emitEvent, AppEvents } from '@/shared/utils/event-emitter';
import CustomModal from '../../components/ui/custom-modal.component';

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

const LAYOUT_OPTIONS: Array<{
  value: ViewLayout;
  label: string;
  icon: string;
}> = [
  { value: 'card', label: 'Tarjeta', icon: 'card' },
  { value: 'list', label: 'Lista', icon: 'list' },
  { value: 'grid', label: 'Cuadrícula', icon: 'grid' },
  { value: 'timeline', label: 'Línea', icon: 'time' }
];

const ImagePreviewSection = React.memo<{
  animal: AnimalModelResponse;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}>(({ animal, theme, styles }) => {
  const [selectedLayout, setSelectedLayout] = useState<ViewLayout>('card');

  return (
    <View>
      <View style={styles.previewHeader}>
        <Text style={styles.sectionTitle}>Vista Previa</Text>
        <View style={styles.layoutSelector}>
          {LAYOUT_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.layoutButton,
                selectedLayout === option.value && styles.layoutButtonActive
              ]}
              onPress={() => setSelectedLayout(option.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={option.icon as never}
                size={18}
                color={
                  selectedLayout === option.value
                    ? theme.colors.textOnPrimary
                    : theme.colors.textSecondary
                }
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.animalCardContainer}>
        <AnimalCardVariant
          animal={animal}
          onPress={() => {}}
          layout={selectedLayout}
          density="comfortable"
          showImages={true}
          highlightStatus={false}
          showCategory={true}
          showSpecies={true}
          showHabitat={true}
          showDescription={true}
          reducedMotion={false}
        />
      </View>
    </View>
  );
});

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
        <ImagePreviewSection
          animal={animalWithCurrentImage}
          theme={theme}
          styles={styles}
        />

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
        <Text style={styles.infoLabel}>Clase:</Text>
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

  const [modalState, setModalState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showModal = (
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setModalState({ visible: true, title, message, onConfirm });
  };

  const closeModal = () => {
    setModalState({ visible: false, title: '', message: '' });
  };

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
      emitEvent(AppEvents.ANIMAL_UPDATED);
      navigation.goBack();
    },
    onError: error => {
      showModal('Error', error);
    },
    onSuccess: message => {
      showModal('Éxito', message);
    },
    onInfo: message => {
      showModal('Info', message);
    },
    onConfirm: (message, callback) => {
      showModal('Confirmación', message, callback);
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

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <CustomModal
        isVisible={modalState.visible}
        onClose={closeModal}
        title={modalState.title}
        description={modalState.message}
        buttons={
          modalState.onConfirm
            ? [
                {
                  label: 'Cancelar',
                  onPress: closeModal,
                  variant: 'outline' as const
                },
                {
                  label: 'Confirmar',
                  onPress: () => {
                    modalState.onConfirm?.();
                    closeModal();
                  }
                }
              ]
            : [{ label: 'OK', onPress: closeModal }]
        }
      />
    </SafeAreaView>
  );
};

EditorHeader.displayName = 'EditorHeader';
ImageEditSection.displayName = 'ImageEditSection';
AnimalInfoSection.displayName = 'AnimalInfoSection';
ImageEditorScreen.displayName = 'ImageEditorScreen';

export default ImageEditorScreen;
