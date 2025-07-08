import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Alert, Animated, Dimensions, Image, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AnimalSearchableDropdown from '../../components/animal/animal-searchable-dropdown.component';
import { useLoading } from '../../contexts/loading-context';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { publicationService } from '../../../services/publication/publication.service';
import { useTheme, themeVariables } from '../../contexts/theme-context';
import { createStyles } from './publication-form-screen.styles';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface PublicationFormScreenProps {
  imageUri: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

const animalOptions = ['Jaguar', 'Mono aullador', 'Guacamaya', 'Puma', 'Tucán'] as const;

const PublicationFormScreen: React.FC = () => {
  const route = useRoute();
  const { showLoading, hideLoading } = useLoading();
  const { navigate, goBack } = useNavigationActions();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables, width, height-40), [variables]);

  const [formState, setFormState] = useState<{
    description: string;
    animal: typeof animalOptions[number];
    isImageExpanded: boolean;
  }>({ description: '', animal: animalOptions[0], isImageExpanded: false });

  const { imageUri, location } = route.params as PublicationFormScreenProps;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!imageUri) {
      Alert.alert('Campo requerido', 'Por favor, seleccione una imagen.');
      return;
    }
    if (!formState.animal) {
      Alert.alert('Campo requerido', 'Por favor, seleccione un tipo de animal.');
      return;
    }
    if (!formState.description.trim()) {
      Alert.alert('Campo requerido', 'Por favor, ingrese una descripción.');
      return;
    }

    showLoading();
    try {
      const formData = new FormData();
      formData.append('description', formState.description.trim());
      formData.append('animal', formState.animal);

      if (location) {
        formData.append('latitude', location.latitude.toString());
        formData.append('longitude', location.longitude.toString());
      }

      const imagePath = Platform.OS === 'android' ? imageUri : imageUri.replace('file://', '');
      const imageName = imageUri.split('/').pop() || 'photo.jpg';
      const imageType = `image/${imageName.split('.').pop() || 'jpg'}`;

      formData.append('photo', {
        uri: imagePath,
        name: imageName,
        type: imageType,
      } as any);

      await publicationService.addPublication(formData as any);

      Alert.alert('Éxito', 'La publicación ha sido creada exitosamente.');
      navigate('Home');
    } catch (error) {
      console.error('Error al publicar:', error);
      Alert.alert('Error', 'No se pudo crear la publicación. Por favor, intente de nuevo.');
    } finally {
      hideLoading();
    }
  }, [formState, imageUri, location, showLoading, hideLoading, navigate]);

  const toggleImageExpand = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormState(prev => ({ ...prev, isImageExpanded: !prev.isImageExpanded }));
  }, []);

  const handleAnimalSelect = useCallback((animal: typeof animalOptions[number]) => {
    Haptics.selectionAsync();
    setFormState(prev => ({ ...prev, animal }));
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setFormState(prev => ({ ...prev, description: text }));
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled">
            <ScreenHeader title="Nueva Publicación" onBack={goBack} styles={styles}/>
            <ImagePreview
              uri={imageUri}
              isExpanded={formState.isImageExpanded}
              onToggleExpand={toggleImageExpand}
              styles={styles}
            />
            <FormSection
              description={formState.description}
              animal={formState.animal}
              onDescriptionChange={handleDescriptionChange}
              onAnimalSelect={handleAnimalSelect}
              location={location}
              theme={theme}
              styles={styles}
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

const ScreenHeader: React.FC<{ title: string; onBack: () => void, styles: any }> = ({ title, onBack, styles }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
      <Ionicons name="arrow-back" size={24} color="#007AFF" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={{ width: 24 }} />
  </View>
);

interface ImagePreviewProps {
  uri: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  styles: any;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ uri, isExpanded, onToggleExpand, styles }) => (
  <>
    <TouchableOpacity onPress={onToggleExpand} activeOpacity={0.8}>
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      <View style={styles.expandIconContainer}>
        <MaterialIcons name="zoom-in" size={24} color="white" />
      </View>
    </TouchableOpacity>
    <Modal visible={isExpanded} transparent>
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.modalCloseButton}
          onPress={onToggleExpand}
          activeOpacity={0.7}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        <Image source={{ uri }} style={styles.expandedImage} resizeMode="contain" />
      </View>
    </Modal>
  </>
);

interface FormSectionProps {
  description: string;
  animal: typeof animalOptions[number];
  onDescriptionChange: (text: string) => void;
  onAnimalSelect: (animal: typeof animalOptions[number]) => void;
  location?: { latitude: number; longitude: number; };
  styles: any;
  theme: any;
}

const FormSection: React.FC<FormSectionProps> = React.memo(({ description, animal, onDescriptionChange, onAnimalSelect, location, styles, theme }) => (
  <View style={styles.formContainer}>
    <Text style={styles.label}>Descripción*</Text>
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

    <Text style={styles.label}>Animal*</Text>
    <AnimalSearchableDropdown
      selectedValue={animal}
      options={animalOptions}
      onValueChange={onAnimalSelect}
      placeholder="Selecciona un animal"
      theme={theme}
    />

    <View style={styles.locationContainer}>
      <Ionicons name="location-sharp" size={16} color="#555" />
      {location && <Text style={styles.locationText}>{`Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}`}</Text>}
    </View>
  </View>
));

interface FooterButtonsProps {
  onCancel: () => void;
  onSubmit: () => void;
  styles: any;
}

const FooterButtons: React.FC<FooterButtonsProps> = ({ onCancel, onSubmit, styles }) => (
  <View style={styles.footer}>
    <TouchableOpacity
      style={styles.cancelButton}
      onPress={onCancel}
      activeOpacity={0.7}>
      <Text style={styles.cancelButtonText}>Cancelar</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.submitButton}
      onPress={onSubmit}
      activeOpacity={0.7}>
      <Text style={styles.submitButtonText}>Publicar</Text>
      <Ionicons name="send" size={18} color="white" style={styles.sendIcon} />
    </TouchableOpacity>
  </View>
);

export default PublicationFormScreen;