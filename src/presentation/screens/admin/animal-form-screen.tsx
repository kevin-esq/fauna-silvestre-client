import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  AppState,
  AppStateStatus
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5Icons from 'react-native-vector-icons/FontAwesome5';
import { useAnimalForm } from '@/presentation/hooks/forms/use-animal-form.hook';
import { useAnimalImagePicker } from '@/presentation/hooks/media/use-animal-image-picker.hook';
import { useTheme, Theme } from '@/presentation/contexts/theme.context';
import { useNavigationActions } from '@/presentation/navigation/navigation-provider';
import { AnimalModelResponse } from '@/domain/models/animal.models';
import { createStyles } from '@/presentation/screens/admin/animal-form-screen.styles';
import { useRoute } from '@react-navigation/native';
import { AnimalCardVariant } from '@/presentation/components/animal/animal-card-variants.component';
import { ViewLayout } from '@/services/storage/catalog-view-preferences.service';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRequestPermissions } from '@/presentation/hooks/permissions/use-request-permissions.hook';
import CustomModal from '@/presentation/components/ui/custom-modal.component';
import { emitEvent, AppEvents } from '@/shared/utils/event-emitter';

const VERTEBRATE_CLASSES = [
  'Mamíferos',
  'Aves',
  'Reptiles',
  'Anfibios',
  'Peces'
];

interface ModalState {
  isVisible: boolean;
  type:
    | 'discard'
    | 'success'
    | 'error'
    | 'imageSuccess'
    | 'cameraPermission'
    | 'galleryPermission'
    | 'blockedPermission';
  title: string;
  description: string;
  onConfirm?: () => void;
}

const FormHeader = React.memo<{
  isEditMode: boolean;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  isValid: boolean;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}>(({ isEditMode, onBack, onSave, isSaving, isValid, theme, styles }) => (
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.backButton}
      onPress={onBack}
      accessibilityRole="button"
      accessibilityLabel="Volver"
    >
      <Ionicons
        name="arrow-back"
        size={theme.iconSizes.medium}
        color={theme.colors.text}
      />
    </TouchableOpacity>

    <Text style={styles.headerTitle}>
      {isEditMode ? 'Editar Animal' : 'Nuevo Animal'}
    </Text>

    <TouchableOpacity
      style={[
        styles.saveButton,
        (!isValid || isSaving) && styles.saveButtonDisabled
      ]}
      onPress={onSave}
      disabled={!isValid || isSaving}
      accessibilityRole="button"
      accessibilityLabel={isEditMode ? 'Actualizar animal' : 'Crear animal'}
    >
      {isSaving ? (
        <ActivityIndicator size="small" color={theme.colors.textOnPrimary} />
      ) : (
        <Ionicons
          name="checkmark"
          size={theme.iconSizes.medium}
          color={theme.colors.textOnPrimary}
        />
      )}
    </TouchableOpacity>
  </View>
));

const FormField = React.memo<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  required?: boolean;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}>(
  ({
    label,
    value,
    onChangeText,
    error,
    placeholder,
    multiline = false,
    numberOfLines = 1,
    maxLength,
    required = false,
    theme,
    styles
  }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.requiredMark}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.textInputMultiline,
          error && styles.textInputError
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        textAlignVertical={multiline ? 'top' : 'center'}
        accessibilityLabel={label}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {maxLength && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  )
);

const ClassSelector = React.memo<{
  selectedClass: string;
  onClassSelect: (animalClass: string) => void;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}>(({ selectedClass, onClassSelect, theme, styles }) => {
  const getClassIcon = (animalClass: string) => {
    switch (animalClass) {
      case 'Mamíferos':
        return { name: 'paw', type: 'fa5' };
      case 'Aves':
        return { name: 'bird', type: 'material' };
      case 'Reptiles':
        return { name: 'snake', type: 'material' };
      case 'Anfibios':
        return { name: 'frog', type: 'fa5' };
      case 'Peces':
        return { name: 'fish', type: 'ionicons' };
      default:
        return { name: 'help-circle-outline', type: 'ionicons' };
    }
  };

  const renderIcon = (animalClass: string, isSelected: boolean) => {
    const icon = getClassIcon(animalClass);
    const iconColor = isSelected
      ? theme.colors.textOnPrimary
      : theme.colors.text;

    if (icon.type === 'material') {
      return (
        <MaterialCommunityIcons
          name={icon.name}
          size={24}
          color={iconColor}
          style={{ marginRight: theme.spacing.small }}
        />
      );
    } else if (icon.type === 'fa5') {
      return (
        <FontAwesome5Icons
          name={icon.name}
          size={24}
          color={iconColor}
          style={{ marginRight: theme.spacing.small }}
        />
      );
    }
    return (
      <Ionicons
        name={icon.name}
        size={24}
        color={iconColor}
        style={{ marginRight: theme.spacing.small }}
      />
    );
  };

  return (
    <View style={styles.classSelectorContainer}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.spacing.tiny
        }}
      >
        <MaterialCommunityIcons
          name="dna"
          size={20}
          color={theme.colors.text}
          style={{ marginRight: theme.spacing.small }}
        />
        <Text style={styles.classSelectorLabel}>Clase de Vertebrado *</Text>
      </View>
      <Text style={styles.classSelectorSubtext}>
        Selecciona la clase del animal
      </Text>

      <View style={styles.classOptionsContainer}>
        {VERTEBRATE_CLASSES.map((animalClass, index) => {
          const isSelected = selectedClass === animalClass;
          return (
            <TouchableOpacity
              key={animalClass}
              onPress={() => onClassSelect(animalClass)}
              activeOpacity={0.7}
              style={[
                styles.classOption,
                isSelected && styles.classOptionSelected,
                index % 2 === 0 && { marginRight: theme.spacing.small }
              ]}
            >
              {renderIcon(animalClass, isSelected)}
              <Text
                style={[
                  styles.classLabel,
                  isSelected && styles.classLabelSelected
                ]}
              >
                {animalClass}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const FormSection = React.memo<{
  title: string;
  icon: string;
  iconType?: 'ionicons' | 'material';
  children: React.ReactNode;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}>(({ title, icon, iconType = 'ionicons', children, theme, styles }) => (
  <View style={styles.sectionContainer}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {iconType === 'material' ? (
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={theme.colors.primary}
          style={{ marginRight: theme.spacing.small }}
        />
      ) : (
        <Ionicons
          name={icon}
          size={24}
          color={theme.colors.primary}
          style={{ marginRight: theme.spacing.small }}
        />
      )}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
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

const AnimalPreview = React.memo<{
  animal: Partial<AnimalModelResponse>;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}>(({ animal, theme, styles }) => {
  const [selectedLayout, setSelectedLayout] = useState<ViewLayout>('card');

  const previewAnimal: AnimalModelResponse = {
    catalogId: animal.catalogId || 0,
    commonNoun: animal.commonNoun || 'Nuevo Animal',
    specie: animal.specie || 'Especie no especificada',
    category: animal.category || 'Sin Clase',
    description: animal.description || 'Sin descripción',
    image: animal.image?.startsWith('/')
      ? `data:image/jpeg;base64,${animal.image}`
      : animal.image || '',
    habits: animal.habits || '',
    habitat: animal.habitat || '',
    feeding: animal.feeding || '',
    reproduction: animal.reproduction || '',
    distribution: animal.distribution || ''
  };

  if (!animal.commonNoun) {
    return (
      <View style={styles.previewPlaceholder}>
        <Ionicons
          name="eye-outline"
          size={theme.iconSizes.xlarge}
          color={theme.colors.placeholder}
        />
        <Text style={styles.previewPlaceholderText}>
          Completa los campos para ver la vista previa
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.previewContainer}>
      <View style={styles.previewHeader}>
        <Text style={styles.previewTitle}>Vista Previa</Text>
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
      <AnimalCardVariant
        animal={previewAnimal}
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
  );
});

const AnimalFormScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigationActions();
  const route = useRoute();
  const routeParams = route.params as { animal?: AnimalModelResponse };
  const initialAnimal = routeParams?.animal;
  const insets = useSafeAreaInsets();

  const { state, actions, isEditMode } = useAnimalForm(initialAnimal);
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

  const {
    requestAlertPermissions,
    checkPermissions,
    blockedPermissions,
    openAppSettings
  } = useRequestPermissions();

  const [modalState, setModalState] = useState<ModalState>({
    isVisible: false,
    type: 'success',
    title: '',
    description: ''
  });

  const [isReturningFromCamera, setIsReturningFromCamera] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active' && isReturningFromCamera) {
          console.log('App returned from camera');
          setIsReturningFromCamera(false);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [isReturningFromCamera]);

  const showModal = useCallback(
    (
      type: ModalState['type'],
      title: string,
      description: string,
      onConfirm?: () => void
    ) => {
      setModalState({
        isVisible: true,
        type,
        title,
        description,
        onConfirm
      });
    },
    []
  );

  const { openCamera, openGallery } = useAnimalImagePicker({
    onImageSelected: (imageUri: string, base64?: string) => {
      if (base64) {
        actions.updateField('image', base64);
        showModal(
          'imageSuccess',
          'Éxito',
          'La imagen se ha seleccionado correctamente'
        );
      }
    },
    onImageError: (error: string) => {
      showModal('error', 'Error', `No se pudo seleccionar la imagen: ${error}`);
    }
  });

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isVisible: false }));
  }, []);

  const handleCameraPermission = useCallback(async () => {
    try {
      const { allGranted } = await checkPermissions(['camera']);

      if (allGranted) {
        setIsReturningFromCamera(true);
        await openCamera();
        setIsReturningFromCamera(false);
        return;
      }

      if (blockedPermissions.includes('camera')) {
        showModal(
          'blockedPermission',
          'Permiso de Cámara Bloqueado',
          'Para usar la cámara, debes habilitar el permiso en la configuración de tu dispositivo.',
          () => {
            closeModal();
            openAppSettings();
          }
        );
        return;
      }

      const granted = await requestAlertPermissions(['camera']);

      if (granted) {
        setIsReturningFromCamera(true);
        await openCamera();
        setIsReturningFromCamera(false);
      } else {
        showModal(
          'cameraPermission',
          'Permiso de Cámara Necesario',
          'Para tomar fotos del animal, necesitamos acceso a tu cámara.',
          async () => {
            closeModal();
            const retryGranted = await requestAlertPermissions(['camera']);
            if (retryGranted) {
              setIsReturningFromCamera(true);
              await openCamera();
              setIsReturningFromCamera(false);
            }
          }
        );
      }
    } catch (error) {
      console.error('Error in handleCameraPermission:', error);
      setIsReturningFromCamera(false);
      showModal(
        'error',
        'Error',
        'Ocurrió un error al intentar abrir la cámara'
      );
    }
  }, [
    checkPermissions,
    blockedPermissions,
    requestAlertPermissions,
    openAppSettings,
    showModal,
    closeModal,
    openCamera
  ]);

  const handleGalleryPermission = useCallback(async () => {
    try {
      const { allGranted } = await checkPermissions(['gallery']);

      if (allGranted) {
        await openGallery();
        return;
      }

      if (blockedPermissions.includes('gallery')) {
        showModal(
          'blockedPermission',
          'Permiso de Galería Bloqueado',
          'Para acceder a tus fotos, debes habilitar el permiso en la configuración de tu dispositivo.',
          () => {
            closeModal();
            openAppSettings();
          }
        );
        return;
      }

      const granted = await requestAlertPermissions(['gallery']);

      if (granted) {
        await openGallery();
      } else {
        showModal(
          'galleryPermission',
          'Permiso de Galería Necesario',
          'Para seleccionar fotos del animal, necesitamos acceso a tu galería.',
          async () => {
            closeModal();
            const retryGranted = await requestAlertPermissions(['gallery']);
            if (retryGranted) {
              await openGallery();
            }
          }
        );
      }
    } catch (error) {
      console.error('Error in handleGalleryPermission:', error);
      showModal(
        'error',
        'Error',
        'Ocurrió un error al intentar abrir la galería'
      );
    }
  }, [
    checkPermissions,
    blockedPermissions,
    requestAlertPermissions,
    openAppSettings,
    showModal,
    closeModal,
    openGallery
  ]);

  const handleBack = useCallback(() => {
    if (Object.values(state.formData).some(value => value.trim() !== '')) {
      showModal(
        'discard',
        'Descartar cambios',
        '¿Estás seguro de que quieres salir? Se perderán los cambios no guardados.',
        () => {
          closeModal();
          navigation.goBack();
        }
      );
    } else {
      navigation.goBack();
    }
  }, [state.formData, navigation, showModal, closeModal]);

  const handleSave = useCallback(async () => {
    const result = await actions.saveAnimal();
    if (!result?.error) {
      emitEvent(AppEvents.ANIMAL_UPDATED);
      showModal('success', 'Éxito', 'Animal guardado correctamente');
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } else {
      showModal(
        'error',
        'Error',
        result?.message ||
          'No se pudo guardar el animal. Por favor, intenta nuevamente.'
      );
    }
  }, [actions, navigation, showModal]);

  const createFieldHandler = useCallback(
    (field: keyof typeof state.formData) => (value: string) =>
      actions.updateField(field, value),
    [actions, state]
  );

  const handleClassSelect = useCallback(
    (animalClass: string) => {
      actions.updateField('category', animalClass);
    },
    [actions]
  );

  const getModalButtons = useCallback(() => {
    switch (modalState.type) {
      case 'discard':
        return [
          {
            label: 'Cancelar',
            onPress: closeModal,
            variant: 'outline' as const
          },
          {
            label: 'Salir',
            onPress: () => {
              modalState.onConfirm?.();
            },
            variant: 'danger' as const
          }
        ];
      case 'cameraPermission':
      case 'galleryPermission':
        return [
          {
            label: 'Cancelar',
            onPress: closeModal,
            variant: 'outline' as const
          },
          {
            label: 'Permitir',
            onPress: () => {
              modalState.onConfirm?.();
            },
            variant: 'primary' as const
          }
        ];
      case 'blockedPermission':
        return [
          {
            label: 'Cancelar',
            onPress: closeModal,
            variant: 'outline' as const
          },
          {
            label: 'Abrir Configuración',
            onPress: () => {
              modalState.onConfirm?.();
            },
            variant: 'primary' as const
          }
        ];
      case 'error':
      case 'success':
      case 'imageSuccess':
        return [
          {
            label: 'Aceptar',
            onPress: closeModal,
            variant: 'primary' as const
          }
        ];
      default:
        return [];
    }
  }, [modalState, closeModal]);

  return (
    <SafeAreaView style={styles.container}>
      <FormHeader
        isEditMode={isEditMode}
        onBack={handleBack}
        onSave={handleSave}
        isSaving={state.isSaving}
        isValid={state.isValid}
        theme={theme}
        styles={styles}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormSection
            title="Información Básica"
            icon="document-text"
            theme={theme}
            styles={styles}
          >
            <FormField
              label="Nombre Común"
              value={state.formData.commonNoun}
              onChangeText={createFieldHandler('commonNoun')}
              error={state.errors.commonNoun}
              placeholder="Ej: Jaguar"
              maxLength={50}
              required
              theme={theme}
              styles={styles}
            />

            <FormField
              label="Especie"
              value={state.formData.specie}
              onChangeText={createFieldHandler('specie')}
              error={state.errors.specie}
              placeholder="Ej: Panthera onca"
              maxLength={100}
              required
              theme={theme}
              styles={styles}
            />

            <ClassSelector
              selectedClass={state.formData.category}
              onClassSelect={handleClassSelect}
              theme={theme}
              styles={styles}
            />
            {state.errors.category && (
              <Text style={styles.errorText}>{state.errors.category}</Text>
            )}
          </FormSection>

          <FormSection
            title="Descripción"
            icon="book"
            theme={theme}
            styles={styles}
          >
            <FormField
              label="Descripción General"
              value={state.formData.description}
              onChangeText={createFieldHandler('description')}
              error={state.errors.description}
              placeholder="Describe las características principales del animal..."
              multiline
              numberOfLines={4}
              maxLength={1000}
              required
              theme={theme}
              styles={styles}
            />
          </FormSection>

          <FormSection
            title="Características"
            icon="search"
            theme={theme}
            styles={styles}
          >
            <FormField
              label="Hábitos"
              value={state.formData.habits}
              onChangeText={createFieldHandler('habits')}
              error={state.errors.habits}
              placeholder="Describe los hábitos del animal..."
              multiline
              numberOfLines={3}
              maxLength={500}
              required
              theme={theme}
              styles={styles}
            />

            <FormField
              label="Hábitat"
              value={state.formData.habitat}
              onChangeText={createFieldHandler('habitat')}
              error={state.errors.habitat}
              placeholder="Describe el hábitat natural..."
              multiline
              numberOfLines={3}
              maxLength={500}
              required
              theme={theme}
              styles={styles}
            />

            <FormField
              label="Alimentación"
              value={state.formData.feeding}
              onChangeText={createFieldHandler('feeding')}
              error={state.errors.feeding}
              placeholder="Describe la dieta y alimentación..."
              multiline
              numberOfLines={3}
              maxLength={500}
              required
              theme={theme}
              styles={styles}
            />

            <FormField
              label="Reproducción"
              value={state.formData.reproduction}
              onChangeText={createFieldHandler('reproduction')}
              error={state.errors.reproduction}
              placeholder="Describe el proceso reproductivo..."
              multiline
              numberOfLines={3}
              maxLength={500}
              required
              theme={theme}
              styles={styles}
            />

            <FormField
              label="Distribución"
              value={state.formData.distribution}
              onChangeText={createFieldHandler('distribution')}
              error={state.errors.distribution}
              placeholder="Describe la distribución geográfica..."
              multiline
              numberOfLines={3}
              maxLength={500}
              required
              theme={theme}
              styles={styles}
            />
          </FormSection>

          {!isEditMode && (
            <FormSection
              title="Imagen del Animal"
              icon="camera"
              theme={theme}
              styles={styles}
            >
              {state.formData.image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{
                      uri: state.formData.image.startsWith('/')
                        ? `data:image/jpeg;base64,${state.formData.image}`
                        : state.formData.image
                    }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => actions.updateField('image', '')}
                    accessibilityRole="button"
                    accessibilityLabel="Eliminar imagen"
                  >
                    <Ionicons
                      name="close-circle"
                      size={theme.iconSizes.medium}
                      color={theme.colors.error}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageSelectionContainer}>
                  <Ionicons
                    name="image-outline"
                    size={theme.iconSizes.xlarge}
                    color={theme.colors.primary}
                    style={{ marginBottom: theme.spacing.small }}
                  />
                  <Text style={styles.imageSelectionText}>
                    Selecciona una imagen para el animal
                  </Text>
                  <View style={styles.imageButtonsContainer}>
                    <TouchableOpacity
                      style={styles.cameraButton}
                      onPress={handleCameraPermission}
                      accessibilityRole="button"
                      accessibilityLabel="Tomar foto con cámara"
                    >
                      <Ionicons
                        name="camera"
                        size={theme.iconSizes.medium}
                        color={theme.colors.textOnPrimary}
                      />
                      <Text style={styles.cameraButtonText}>Cámara</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.galleryButton}
                      onPress={handleGalleryPermission}
                      accessibilityRole="button"
                      accessibilityLabel="Seleccionar de galería"
                    >
                      <Ionicons
                        name="images"
                        size={theme.iconSizes.medium}
                        color={theme.colors.forest}
                      />
                      <Text style={styles.galleryButtonText}>Galería</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {state.errors.image && (
                <Text style={styles.errorText}>{state.errors.image}</Text>
              )}
            </FormSection>
          )}

          <FormSection
            title="Vista Previa"
            icon="eye"
            theme={theme}
            styles={styles}
          >
            <AnimalPreview
              animal={state.formData}
              theme={theme}
              styles={styles}
            />
          </FormSection>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomModal
        isVisible={modalState.isVisible}
        onClose={closeModal}
        title={modalState.title}
        description={modalState.description}
        type="confirmation"
        size="medium"
        showFooter={true}
        buttons={getModalButtons()}
        centered={true}
        closeOnBackdrop={modalState.type !== 'discard'}
      />
    </SafeAreaView>
  );
};

FormHeader.displayName = 'FormHeader';
FormField.displayName = 'FormField';
ClassSelector.displayName = 'ClassSelector';
FormSection.displayName = 'FormSection';
AnimalPreview.displayName = 'AnimalPreview';
AnimalFormScreen.displayName = 'AnimalFormScreen';

export default AnimalFormScreen;
