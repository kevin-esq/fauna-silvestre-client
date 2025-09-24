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
  ActivityIndicator
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AnimalSearchableDropdown from '../../components/animal/animal-searchable-dropdown.component';
import { useLoading } from '../../contexts/loading.context';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { publicationService } from '../../../services/publication/publication.service';
import { useTheme, themeVariables } from '../../contexts/theme.context';
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

interface PublicationFormScreenProps {
  imageUri: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

const PublicationFormScreen: React.FC = () => {
  const route = useRoute();
  const { showLoading, hideLoading } = useLoading();
  const { navigate, goBack } = useNavigationActions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(variables, width, height, insets),
    [variables, insets]
  );

  // Hook para cargar nombres comunes desde el API
  const {
    commonNouns,
    isLoading: isLoadingAnimals,
    error: animalsError,
    refetch
  } = useCommonNouns();

  const [formState, setFormState] = useState<{
    description: string;
    selectedAnimal: CommonNounResponse | null;
    animalState: AnimalState;
    isImageExpanded: boolean;
  }>({
    description: '',
    selectedAnimal: null,
    animalState: AnimalState.Alive,
    isImageExpanded: false
  });

  const { imageUri, location } = route.params as PublicationFormScreenProps;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [fadeAnim]);

  const handleSubmit = useCallback(async () => {
    const { description, selectedAnimal, animalState } = formState;

    if (!imageUri) {
      Alert.alert('Imagen requerida', 'Por favor, selecciona una imagen.');
      return;
    }

    if (!selectedAnimal) {
      Alert.alert('Animal requerido', 'Por favor, selecciona un animal.');
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        'Descripción requerida',
        'Por favor, ingresa una descripción.'
      );
      return;
    }

    showLoading();
    try {
      const base64Image = await imageUrlToBase64(imageUri);
      const data: PublicationData = {
        description: description.trim(),
        commonNoun: selectedAnimal.commonNoun,
        catalogId: selectedAnimal.catalogId,
        animalState: animalState,
        location: `${location?.latitude},${location?.longitude}`,
        img: base64Image
      };

      await publicationService.createPublication(data);
      Alert.alert('✅ Publicación creada', 'Gracias por tu contribución.');
      navigate('HomeTabs');
    } catch (error) {
      console.error('Error al publicar:', error);
      Alert.alert(
        '❌ Error',
        'Ocurrió un problema al crear la publicación. Intenta de nuevo.'
      );
    } finally {
      hideLoading();
    }
  }, [formState, imageUri, location, showLoading, hideLoading, navigate]);

  async function imageUrlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
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
  }

  const toggleImageExpand = useCallback(() => {
    setFormState(prev => ({ ...prev, isImageExpanded: !prev.isImageExpanded }));
  }, []);

  const handleAnimalSelect = useCallback(
    (animal: CommonNounResponse | null) => {
      setFormState(prev => ({ ...prev, selectedAnimal: animal }));
    },
    []
  );

  const handleDescriptionChange = useCallback((text: string) => {
    setFormState(prev => ({ ...prev, description: text }));
  }, []);

  const handleAnimalStateSelect = useCallback((state: AnimalState) => {
    setFormState(prev => ({ ...prev, animalState: state }));
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <ScreenHeader
              title="Nueva Publicación"
              onBack={goBack}
              styles={styles}
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
              animalState={formState.animalState}
              onDescriptionChange={handleDescriptionChange}
              onAnimalSelect={handleAnimalSelect}
              onAnimalStateSelect={handleAnimalStateSelect}
              location={location}
              theme={theme}
              styles={styles}
              commonNouns={commonNouns}
              isLoadingAnimals={isLoadingAnimals}
              animalsError={animalsError}
              refetch={refetch}
            />
          </ScrollView>
          <FooterButtons
            onCancel={goBack}
            onSubmit={handleSubmit}
            styles={styles}
          />
        </Animated.View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const ScreenHeader: React.FC<{
  title: string;
  onBack: () => void;
  styles: ReturnType<typeof createStyles>;
}> = ({ title, onBack, styles }) => (
  <View style={styles.header}>
    <TouchableOpacity
      onPress={onBack}
      style={styles.backButton}
      activeOpacity={0.8}
    >
      <Ionicons name="arrow-back" size={24} color="#007AFF" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={{ width: 24 }} />
  </View>
);

const ImagePreview: React.FC<{
  uri: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  styles: ReturnType<typeof createStyles>;
}> = ({ uri, isExpanded, onToggleExpand, styles }) => (
  <>
    <TouchableOpacity onPress={onToggleExpand} activeOpacity={0.9}>
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      <View style={styles.expandIconContainer}>
        <MaterialIcons name="zoom-in" size={24} color="white" />
      </View>
    </TouchableOpacity>
    <Modal visible={isExpanded} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.modalCloseButton}
          onPress={onToggleExpand}
          activeOpacity={0.9}
        >
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        <Image
          source={{ uri }}
          style={styles.expandedImage}
          resizeMode="contain"
        />
      </View>
    </Modal>
  </>
);

const AnimalStateSelector: React.FC<{
  selected: AnimalState;
  onSelect: (state: AnimalState) => void;
  styles: ReturnType<typeof createStyles>;
}> = ({ selected, onSelect, styles }) => {
  const options = [
    { label: '🟢 Vivo', value: AnimalState.Alive },
    { label: '🔴 Muerto', value: AnimalState.Dead }
  ];

  return (
    <View
      style={[
        styles.stateSelectorContainer,
        {
          flexDirection: 'row',
          borderRadius: 8,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#ccc'
        }
      ]}
    >
      {options.map(({ label, value }, index) => {
        const isSelected = selected === value;
        return (
          <TouchableOpacity
            key={value}
            onPress={() => onSelect(value)}
            activeOpacity={0.9}
            style={{
              flex: 1,
              backgroundColor: isSelected ? '#4CAF50' : '#fff',
              paddingVertical: 12,
              alignItems: 'center',
              borderRightWidth: index === 0 ? 1 : 0,
              borderRightColor: '#ccc'
            }}
          >
            <Text
              style={{
                color: isSelected ? 'white' : '#333',
                fontWeight: isSelected ? 'bold' : 'normal',
                fontSize: 14
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const FormSection: React.FC<{
  description: string;
  selectedAnimal: CommonNounResponse | null;
  animalState: AnimalState;
  onDescriptionChange: (text: string) => void;
  onAnimalSelect: (animal: CommonNounResponse | null) => void;
  onAnimalStateSelect: (state: AnimalState) => void;
  location?: { latitude: number; longitude: number };
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useTheme>['theme'];
  commonNouns: CommonNounResponse[];
  isLoadingAnimals: boolean;
  animalsError: string | null;
  refetch: () => void;
}> = React.memo(
  ({
    description,
    selectedAnimal,
    animalState,
    onDescriptionChange,
    onAnimalSelect,
    onAnimalStateSelect,
    location,
    styles,
    theme,
    commonNouns,
    isLoadingAnimals,
    animalsError,
    refetch
  }) => {
    const variables = useMemo(() => themeVariables(theme), [theme]);

    return (
      <View style={styles.formContainer}>
        <Text style={styles.label}>📝 Descripción*</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe el avistamiento..."
          placeholderTextColor="#888"
          value={description}
          onChangeText={onDescriptionChange}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>🐾 Animal*</Text>
        {isLoadingAnimals ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={variables['--primary']} />
            <Text style={styles.loadingText}>Cargando animales...</Text>
          </View>
        ) : animalsError ? (
          <TouchableOpacity
            style={styles.errorContainer}
            onPress={() => {
              refetch();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.errorText}>
              Error al cargar animales. Toca para reintentar.
            </Text>
          </TouchableOpacity>
        ) : (
          <AnimalSearchableDropdown
            selectedValue={selectedAnimal}
            options={commonNouns}
            onValueChange={onAnimalSelect}
            placeholder="Selecciona un animal"
            theme={theme}
          />
        )}

        <Text style={styles.label}>📍 Estado del animal*</Text>
        <AnimalStateSelector
          selected={animalState}
          onSelect={onAnimalStateSelect}
          styles={styles}
        />

        {location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={16} color="#555" />
            <Text
              style={styles.locationText}
            >{`Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}`}</Text>
          </View>
        )}
      </View>
    );
  }
);

const FooterButtons: React.FC<{
  onCancel: () => void;
  onSubmit: () => void;
  styles: ReturnType<typeof createStyles>;
}> = ({ onCancel, onSubmit, styles }) => (
  <View style={styles.footer}>
    <TouchableOpacity
      style={styles.cancelButton}
      onPress={onCancel}
      activeOpacity={0.8}
    >
      <Ionicons name="close-circle" size={18} color="#D32F2F" />
      <Text style={styles.cancelButtonText}>Cancelar</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.submitButton}
      onPress={onSubmit}
      activeOpacity={0.8}
    >
      <Text style={styles.submitButtonText}>Publicar</Text>
      <Ionicons name="send" size={18} color="white" />
    </TouchableOpacity>
  </View>
);

export default PublicationFormScreen;
