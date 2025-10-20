import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef
} from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ImageViewer from 'react-native-image-zoom-viewer';
import AnimalSearchableDropdown from '../../components/animal/animal-searchable-dropdown.component';
import { useLoading } from '../../contexts/loading.context';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { publicationService } from '../../../services/publication/publication.service';
import {
  useTheme,
  themeVariables,
  Theme,
  ThemeVariablesType
} from '../../contexts/theme.context';
import { createStyles } from './publication-form-screen.styles';
import {
  SafeAreaProvider,
  useSafeAreaInsets
} from 'react-native-safe-area-context';
import { PublicationData } from '../../../domain/models/publication.models';
import { useCommonNouns } from '../../hooks/use-common-nouns';
import { CommonNounResponse } from '../../../domain/models/animal.models';

const { width, height } = Dimensions.get('window');

enum AnimalState {
  Alive = 1,
  Dead = 2
}

interface Location {
  latitude: number;
  longitude: number;
}

interface PublicationFormScreenProps {
  imageUri: string;
  location?: Location;
}

interface FormState {
  description: string;
  selectedAnimal: CommonNounResponse | null;
  customAnimalName: string;
  animalState: AnimalState;
  isImageExpanded: boolean;
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}

type RouteParams = {
  PublicationForm: PublicationFormScreenProps;
};

type PublicationFormRouteProp = RouteProp<RouteParams, 'PublicationForm'>;

const UNKNOWN_ANIMAL: CommonNounResponse = {
  catalogId: -1,
  commonNoun: 'Desconocido'
};

const PublicationFormScreen: React.FC = () => {
  const route = useRoute<PublicationFormRouteProp>();
  const { showLoading, hideLoading } = useLoading();
  const { navigate, goBack } = useNavigationActions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  const customAnimalInputRef = useRef<TextInput>(null);
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(variables, width, height, insets),
    [variables, insets]
  );
  const {
    commonNouns,
    isLoading: isLoadingAnimals,
    error: animalsError,
    refetch
  } = useCommonNouns();

  const [formState, setFormState] = useState<FormState>({
    description: '',
    selectedAnimal: UNKNOWN_ANIMAL,
    customAnimalName: '',
    animalState: AnimalState.Alive,
    isImageExpanded: false,
    isKeyboardVisible: false,
    keyboardHeight: 0
  });

  const { imageUri, location } = route.params;

  const animalOptions = useMemo(() => {
    const options = [UNKNOWN_ANIMAL, ...commonNouns];
    return options;
  }, [commonNouns]);

  useEffect(() => {
    if (
      commonNouns.length > 0 &&
      formState.selectedAnimal?.catalogId.toString() === '-1'
    ) {
      setFormState(prev => ({
        ...prev,
        selectedAnimal: UNKNOWN_ANIMAL
      }));
    }
  }, [commonNouns, formState.selectedAnimal]);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        const keyboardHeight = e.endCoordinates.height;
        setFormState(prev => ({
          ...prev,
          isKeyboardVisible: true,
          keyboardHeight
        }));
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setFormState(prev => ({
          ...prev,
          isKeyboardVisible: false,
          keyboardHeight: 0
        }));
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  const validateForm = useCallback((): string | null => {
    if (!imageUri) {
      return 'Por favor, selecciona una imagen.';
    }
    return null;
  }, [imageUri]);

  const getAnimalNameForSubmission = useCallback(() => {
    const { selectedAnimal, customAnimalName } = formState;

    if (selectedAnimal?.catalogId === -1 && customAnimalName.trim()) {
      return customAnimalName.trim();
    }

    if (selectedAnimal?.catalogId.toString() === '-1') {
      return 'Desconocido';
    }

    return selectedAnimal?.commonNoun || 'Desconocido';
  }, [formState]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Formulario incompleto', validationError);
      return;
    }

    const { description, selectedAnimal, animalState } = formState;
    const animalName = getAnimalNameForSubmission();

    showLoading();
    try {
      const base64Image = await imageUrlToBase64(imageUri);
      const data: PublicationData = {
        description: description.trim(),
        commonNoun: animalName,
        catalogId:
          selectedAnimal?.catalogId === -1 || !selectedAnimal
            ? 0
            : selectedAnimal.catalogId,
        animalState: animalState,
        location: location ? `${location.latitude},${location.longitude}` : '',
        img: base64Image
      };

      await publicationService.createPublication(data);

      Alert.alert(
        '✅ Publicación creada exitosamente',
        'Gracias por tu contribución a la comunidad.',
        [
          {
            text: 'Continuar',
            onPress: () => navigate('HomeTabs')
          }
        ]
      );
    } catch (error) {
      console.error('Error al publicar:', error);
      Alert.alert(
        '❌ Error',
        'Ocurrió un problema al crear la publicación. Verifica tu conexión e intenta de nuevo.',
        [
          {
            text: 'Reintentar',
            onPress: handleSubmit
          },
          {
            text: 'Cancelar',
            style: 'cancel'
          }
        ]
      );
    } finally {
      hideLoading();
    }
  }, [
    formState,
    imageUri,
    location,
    showLoading,
    hideLoading,
    navigate,
    validateForm,
    getAnimalNameForSubmission
  ]);

  const imageUrlToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const base64 = reader.result.replace(
              /^data:image\/[a-zA-Z0-9+\/]+;base64,/,
              ''
            );
            resolve(base64);
          } else {
            reject(new Error('FileReader no devolvió una cadena.'));
          }
        };
        reader.onerror = () =>
          reject(new Error('Error leyendo blob como data URL'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error(`Error procesando imagen: ${error}`);
    }
  };

  const scrollToInput = useCallback(
    (inputRef: React.RefObject<TextInput | null>) => {
      if (inputRef.current && scrollViewRef.current) {
        setTimeout(() => {
          inputRef.current?.measureLayout(
            scrollViewRef.current as never,
            (x, y, width, height) => {
              const screenHeight = Dimensions.get('window').height;
              const keyboardHeight = formState.keyboardHeight;
              const availableHeight = screenHeight - keyboardHeight - 100;
              const inputBottomPosition = y + height;

              if (
                y > availableHeight * 0.4 ||
                inputBottomPosition > availableHeight
              ) {
                const scrollToY = Math.max(0, y - 50);
                scrollViewRef.current?.scrollTo({
                  y: scrollToY,
                  animated: true
                });
              } else {
                if (y < 100) {
                  scrollViewRef.current?.scrollTo({
                    y: Math.max(0, y - 20),
                    animated: true
                  });
                }
              }
            },
            () => {}
          );
        }, 150);
      }
    },
    [formState.keyboardHeight]
  );

  const toggleImageExpand = useCallback(() => {
    setFormState(prev => ({ ...prev, isImageExpanded: !prev.isImageExpanded }));
  }, []);

  const handleAnimalSelect = useCallback(
    (animal: CommonNounResponse | null) => {
      setFormState(prev => ({
        ...prev,
        selectedAnimal: animal || UNKNOWN_ANIMAL,
        customAnimalName: animal?.catalogId === -1 ? prev.customAnimalName : ''
      }));
    },
    []
  );

  const handleCustomAnimalNameChange = useCallback((text: string) => {
    setFormState(prev => ({ ...prev, customAnimalName: text }));
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setFormState(prev => ({ ...prev, description: text }));
  }, []);

  const handleAnimalStateSelect = useCallback((state: AnimalState) => {
    setFormState(prev => ({ ...prev, animalState: state }));
  }, []);

  const handleGoBack = useCallback(() => {
    if (formState.description.trim() || formState.customAnimalName.trim()) {
      Alert.alert(
        'Descartar cambios',
        '¿Estás seguro de que quieres salir? Se perderán los cambios no guardados.',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Salir',
            style: 'destructive',
            onPress: goBack
          }
        ]
      );
    } else {
      goBack();
    }
  }, [formState, goBack]);

  const handleInputFocus = useCallback(
    (inputRef: React.RefObject<TextInput | null>) => {
      scrollToInput(inputRef);
    },
    [scrollToInput]
  );

  const contentContainerStyle = useMemo(() => {
    return [
      styles.scrollContainer,
      formState.isKeyboardVisible && {
        paddingBottom: Math.max(formState.keyboardHeight - 100, 50)
      }
    ];
  }, [
    styles.scrollContainer,
    formState.isKeyboardVisible,
    formState.keyboardHeight
  ]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          enabled={Platform.OS === 'ios'}
        >
          <Animated.View
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={contentContainerStyle}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              bounces={true}
              alwaysBounceVertical={false}
              overScrollMode="auto"
              scrollEventThrottle={16}
              keyboardDismissMode="on-drag"
              automaticallyAdjustContentInsets={false}
              contentInsetAdjustmentBehavior="never"
            >
              <ScreenHeader
                title="Nueva Publicación"
                onBack={handleGoBack}
                styles={styles}
                varsiables={variables}
              />

              <ImagePreview
                uri={imageUri}
                isExpanded={formState.isImageExpanded}
                onToggleExpand={toggleImageExpand}
                styles={styles}
              />

              <FormSection
                description={formState.description}
                selectedAnimal={formState.selectedAnimal}
                customAnimalName={formState.customAnimalName}
                animalState={formState.animalState}
                onDescriptionChange={handleDescriptionChange}
                onAnimalSelect={handleAnimalSelect}
                onCustomAnimalNameChange={handleCustomAnimalNameChange}
                onAnimalStateSelect={handleAnimalStateSelect}
                location={location}
                theme={theme}
                styles={styles}
                commonNouns={animalOptions}
                isLoadingAnimals={isLoadingAnimals}
                animalsError={animalsError}
                refetch={refetch}
                validateForm={validateForm}
                descriptionInputRef={descriptionInputRef}
                customAnimalInputRef={customAnimalInputRef}
                onInputFocus={handleInputFocus}
              />
            </ScrollView>

            {!formState.isKeyboardVisible && (
              <FooterButtons
                onCancel={handleGoBack}
                onSubmit={handleSubmit}
                styles={styles}
                isValid={validateForm() === null}
              />
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
  styles: ReturnType<typeof createStyles>;
  varsiables: ThemeVariablesType;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  styles,
  varsiables
}) => (
  <View style={styles.header}>
    <TouchableOpacity
      onPress={onBack}
      style={styles.backButton}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="arrow-back" size={24} color={varsiables['--primary']} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={{ width: 24 }} />
  </View>
);

interface ImagePreviewProps {
  uri: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  styles: ReturnType<typeof createStyles>;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  uri,
  isExpanded,
  onToggleExpand,
  styles
}) => (
  <>
    <TouchableOpacity
      onPress={onToggleExpand}
      activeOpacity={0.9}
      style={styles.imageContainer}
    >
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      <View style={styles.expandIconContainer}>
        <MaterialIcons name="zoom-in" size={20} color="white" />
      </View>
      <View style={styles.imageOverlay}>
        <Text style={styles.imageOverlayText}>Toca para ampliar</Text>
      </View>
    </TouchableOpacity>

    <Modal visible={isExpanded} transparent animationType="fade">
      <ImageViewer
        imageUrls={[{ url: uri }]}
        enableImageZoom={true}
        enableSwipeDown={true}
        onSwipeDown={onToggleExpand}
        onCancel={onToggleExpand}
        backgroundColor="rgba(0,0,0,0.95)"
        renderHeader={() => (
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onToggleExpand}
            activeOpacity={0.8}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        )}
      />
    </Modal>
  </>
);

interface AnimalStateSelectorProps {
  selected: AnimalState;
  onSelect: (state: AnimalState) => void;
  styles: ReturnType<typeof createStyles>;
}

const AnimalStateSelector: React.FC<AnimalStateSelectorProps> = ({
  selected,
  onSelect,
  styles
}) => {
  const options = [
    {
      label: 'Vivo',
      value: AnimalState.Alive,
      icon: '🟢',
      color: '#4CAF50'
    },
    {
      label: 'Muerto',
      value: AnimalState.Dead,
      icon: '🔴',
      color: '#F44336'
    }
  ];

  return (
    <View style={styles.stateSelectorContainer}>
      {options.map(({ label, value, icon, color }, index) => {
        const isSelected = selected === value;
        return (
          <TouchableOpacity
            key={value}
            onPress={() => onSelect(value)}
            activeOpacity={0.8}
            style={[
              styles.stateOption,
              {
                backgroundColor: isSelected ? color : 'transparent',
                borderColor: color,
                borderRightWidth: index === 0 ? 1 : 0,
                borderRightColor: '#E0E0E0'
              }
            ]}
          >
            <Text style={styles.stateIcon}>{icon}</Text>
            <Text
              style={[
                styles.stateLabel,
                {
                  color: isSelected ? 'white' : color,
                  fontWeight: isSelected ? '600' : '500'
                }
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

interface FormSectionProps {
  description: string;
  selectedAnimal: CommonNounResponse | null;
  customAnimalName: string;
  animalState: AnimalState;
  onDescriptionChange: (text: string) => void;
  onAnimalSelect: (animal: CommonNounResponse | null) => void;
  onCustomAnimalNameChange: (text: string) => void;
  onAnimalStateSelect: (state: AnimalState) => void;
  location?: Location;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
  commonNouns: CommonNounResponse[];
  isLoadingAnimals: boolean;
  animalsError: string | null;
  refetch: () => void;
  validateForm: () => string | null;
  descriptionInputRef: React.RefObject<TextInput | null>;
  customAnimalInputRef: React.RefObject<TextInput | null>;
  onInputFocus: (inputRef: React.RefObject<TextInput | null>) => void;
}

const FormSection: React.FC<FormSectionProps> = React.memo(
  ({
    description,
    selectedAnimal,
    customAnimalName,
    animalState,
    onDescriptionChange,
    onAnimalSelect,
    onCustomAnimalNameChange,
    onAnimalStateSelect,
    location,
    styles,
    theme,
    commonNouns,
    isLoadingAnimals,
    animalsError,
    refetch,
    validateForm,
    descriptionInputRef,
    customAnimalInputRef,
    onInputFocus
  }) => {
    const variables = useMemo(() => themeVariables(theme), [theme]);
    const characterCount = description.length;
    const maxCharacters = 500;

    return (
      <View style={[styles.formContainer]}>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>📝 Descripción</Text>
          <TextInput
            ref={descriptionInputRef}
            style={[styles.textArea]}
            placeholder="Describe detalladamente el avistamiento: comportamiento, ubicación específica, condiciones del entorno... (opcional)"
            placeholderTextColor={variables['--placeholder']}
            value={description}
            onChangeText={onDescriptionChange}
            onFocus={() => onInputFocus(descriptionInputRef)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={maxCharacters}
            blurOnSubmit={true}
            returnKeyType="done"
          />
          <View style={styles.characterCounter}>
            <Text style={[styles.characterCountText]}>
              {characterCount}/{maxCharacters} caracteres
            </Text>
          </View>
        </View>

        <View style={[styles.fieldContainer]}>
          <Text style={styles.label}>🐾 Animal</Text>
          {isLoadingAnimals ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={variables['--primary']} />
              <Text style={styles.loadingText}>
                Cargando lista de animales...
              </Text>
            </View>
          ) : animalsError ? (
            <TouchableOpacity
              style={styles.errorContainer}
              onPress={refetch}
              activeOpacity={0.7}
            >
              <MaterialIcons name="error-outline" size={20} color="#F44336" />
              <Text style={styles.errorText}>
                Error al cargar animales. Toca para reintentar.
              </Text>
            </TouchableOpacity>
          ) : (
            <AnimalSearchableDropdown
              selectedValue={selectedAnimal}
              options={commonNouns}
              onValueChange={onAnimalSelect}
              placeholder="Buscar y seleccionar animal..."
              theme={theme}
            />
          )}

          {selectedAnimal?.catalogId === -1 && (
            <View style={styles.customAnimalContainer}>
              <Text style={styles.customAnimalLabel}>
                💭 Especifica el animal (opcional)
              </Text>
              <TextInput
                ref={customAnimalInputRef}
                style={styles.customAnimalInput}
                placeholder="Ej: Ave pequeña, Mamífero mediano, Reptil desconocido..."
                placeholderTextColor={variables['--placeholder']}
                value={customAnimalName}
                onChangeText={onCustomAnimalNameChange}
                onFocus={() => onInputFocus(customAnimalInputRef)}
                maxLength={100}
                returnKeyType="done"
                blurOnSubmit={true}
              />
              <Text style={styles.customAnimalHint}>
                Si conoces más detalles sobre el animal, puedes especificarlos
                aquí
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.fieldContainer]}>
          <Text style={styles.label}>📍 Estado del animal*</Text>
          <AnimalStateSelector
            selected={animalState}
            onSelect={onAnimalStateSelect}
            styles={styles}
          />
        </View>

        {location && (
          <View style={[styles.locationContainer]}>
            <View style={styles.locationHeader}>
              <Ionicons name="location-sharp" size={18} color="#4CAF50" />
              <Text style={styles.locationTitle}>Ubicación registrada</Text>
            </View>
            <Text style={styles.locationText}>
              Lat: {location.latitude.toFixed(6)}, Lon:{' '}
              {location.longitude.toFixed(6)}
            </Text>
            <Text style={styles.locationSubtext}>
              Esta ubicación se incluirá con tu publicación
            </Text>
          </View>
        )}

        {validateForm() && (
          <View style={[styles.validationContainer]}>
            <MaterialIcons name="info-outline" size={18} color="#FF9800" />
            <Text style={styles.validationText}>{validateForm()}</Text>
          </View>
        )}
      </View>
    );
  }
);

interface FooterButtonsProps {
  onCancel: () => void;
  onSubmit: () => void;
  styles: ReturnType<typeof createStyles>;
  isValid: boolean;
}

const FooterButtons: React.FC<FooterButtonsProps> = ({
  onCancel,
  onSubmit,
  styles,
  isValid
}) => (
  <View style={styles.footer}>
    <TouchableOpacity
      style={styles.cancelButton}
      onPress={onCancel}
      activeOpacity={0.8}
    >
      <Ionicons name="close-circle-outline" size={20} color="#666" />
      <Text style={styles.cancelButtonText}>Cancelar</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
      onPress={onSubmit}
      activeOpacity={isValid ? 0.8 : 0.5}
      disabled={!isValid}
    >
      <Text
        style={[
          styles.submitButtonText,
          !isValid && styles.submitButtonTextDisabled
        ]}
      >
        Publicar
      </Text>
      <Ionicons name="send" size={18} color={isValid ? 'white' : '#999'} />
    </TouchableOpacity>
  </View>
);

export default PublicationFormScreen;
