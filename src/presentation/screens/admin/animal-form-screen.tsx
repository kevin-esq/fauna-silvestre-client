import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAnimalForm } from '../../hooks/use-animal-form.hook';
import { useAnimalImagePicker } from '../../hooks/use-animal-image-picker.hook';
import { useTheme, Theme } from '../../contexts/theme.context';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { AnimalModelResponse } from '@/domain/models/animal.models';
import { createStyles } from './animal-form-screen.styles';
import { useRoute } from '@react-navigation/native';
import { CatalogAnimalCard } from '../catalog/catalog-animals-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VERTEBRATE_CLASSES = [
  'Mamíferos',
  'Aves',
  'Reptiles',
  'Anfibios',
  'Peces'
];

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
      <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
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
          size={24}
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
  styles: ReturnType<typeof createStyles>;
}>(({ selectedClass, onClassSelect, styles }) => {
  const getClassIcon = (animalClass: string) => {
    switch (animalClass) {
      case 'Mamíferos':
        return '🐾';
      case 'Aves':
        return '🦅';
      case 'Reptiles':
        return '🦎';
      case 'Anfibios':
        return '🐸';
      case 'Peces':
        return '🐠';
      default:
        return '❓';
    }
  };

  return (
    <View style={styles.classSelectorContainer}>
      <Text style={styles.classSelectorLabel}>🧬 Clase de Vertebrado *</Text>
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
                index % 2 === 0 && { marginRight: 8 }
              ]}
            >
              <Text style={styles.classIcon}>{getClassIcon(animalClass)}</Text>
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
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
}>(({ title, children, styles }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
));

const AnimalPreview = React.memo<{
  animal: Partial<AnimalModelResponse>;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}>(({ animal, theme, styles }) => {
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
          size={48}
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
      <Text style={styles.previewTitle}>Vista Previa</Text>
      <CatalogAnimalCard
        animal={previewAnimal}
        onPress={() => {}}
        theme={theme}
        index={0}
        viewMode="grid"
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

  const { openCamera, openGallery } = useAnimalImagePicker({
    onImageSelected: (imageUri: string, base64?: string) => {
      if (base64) {
        actions.updateField('image', base64);
        Alert.alert('Éxito', 'Imagen seleccionada correctamente');
      }
    },
    onImageError: (error: string) => {
      Alert.alert('Error', `Error al seleccionar imagen: ${error}`);
    }
  });

  const handleBack = useCallback(() => {
    if (Object.values(state.formData).some(value => value.trim() !== '')) {
      Alert.alert(
        'Descartar cambios',
        '¿Estás seguro de que quieres salir? Se perderán los cambios no guardados.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Salir',
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [state.formData, navigation]);

  const handleSave = useCallback(async () => {
    const result = await actions.saveAnimal();
    if (!result?.error) {
      navigation.goBack();
    }
  }, [actions, navigation]);

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
          <FormSection title="Información Básica" styles={styles}>
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
              styles={styles}
            />
            {state.errors.category && (
              <Text style={styles.errorText}>{state.errors.category}</Text>
            )}
          </FormSection>

          <FormSection title="Descripción" styles={styles}>
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

          <FormSection title="Características" styles={styles}>
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
            <FormSection title="Imagen del Animal" styles={styles}>
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
                      size={24}
                      color={theme.colors.error}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageSelectionContainer}>
                  <Text style={styles.imageSelectionText}>
                    📸 Selecciona una imagen para el animal
                  </Text>
                  <View style={styles.imageButtonsContainer}>
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
                      <Ionicons
                        name="images"
                        size={24}
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

          <FormSection title="Vista Previa" styles={styles}>
            <AnimalPreview
              animal={state.formData}
              theme={theme}
              styles={styles}
            />
          </FormSection>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
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
