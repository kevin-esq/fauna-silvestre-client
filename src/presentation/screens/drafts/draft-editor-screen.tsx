import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomModal from '../../components/ui/custom-modal.component';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBackHandler } from '../../hooks/use-back-handler.hook';
import { useDraftContext } from '../../contexts/draft.context';
import { useTheme } from '../../contexts/theme.context';
import { createStyles } from './draft-editor-screen.styles';
import {
  DraftPublication,
  AnimalState
} from '../../../domain/models/draft.models';

const DraftEditorScreen: React.FC = () => {
  const themeContext = useTheme();
  const theme = themeContext.theme;
  const styles = createStyles(theme);
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { getDraftById, updateDraft, submitDraft } = useDraftContext();

  const draftId = (route.params as { draftId: string })?.draftId;

  const [draft, setDraft] = useState<DraftPublication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [description, setDescription] = useState('');
  const [customAnimalName, setCustomAnimalName] = useState('');
  const [animalState, setAnimalState] = useState<AnimalState>(
    AnimalState.Alive
  );

  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useBackHandler({
    customBackAction: () => {
      if (isSaving) return true;
      navigation.goBack();
      return true;
    }
  });

  const loadDraft = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedDraft = await getDraftById(draftId);
      if (loadedDraft) {
        setDraft(loadedDraft);
        setDescription(loadedDraft.description);
        setCustomAnimalName(loadedDraft.customAnimalName);
        setAnimalState(loadedDraft.animalState);
      } else {
        setModalMessage('Borrador no encontrado');
        setShowErrorModal(true);
        setTimeout(() => navigation.goBack(), 2000);
      }
    } catch {
      setModalMessage('No se pudo cargar el borrador');
      setShowErrorModal(true);
      setTimeout(() => navigation.goBack(), 2000);
    } finally {
      setIsLoading(false);
    }
  }, [draftId, getDraftById, navigation]);

  useEffect(() => {
    loadDraft();
  }, [draftId, loadDraft]);

  const handleSave = async () => {
    if (!draft) return;

    if (!description.trim()) {
      setModalMessage('La descripción es requerida');
      setShowValidationModal(true);
      return;
    }

    setIsSaving(true);
    try {
      const updatedDraft: DraftPublication = {
        ...draft,
        description: description.trim(),
        customAnimalName: customAnimalName.trim(),
        animalState,
        updatedAt: new Date()
      };

      await updateDraft(updatedDraft);
      setShowSuccessModal(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch {
      setModalMessage('No se pudo guardar el borrador');
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!draft) return;

    if (!description.trim()) {
      setModalMessage('La descripción es requerida');
      setShowValidationModal(true);
      return;
    }

    setShowSubmitModal(true);
  };

  const confirmSubmit = async () => {
    if (!draft) return;
    setShowSubmitModal(false);
    setIsSaving(true);
    try {
      const updatedDraft: DraftPublication = {
        ...draft,
        description: description.trim(),
        customAnimalName: customAnimalName.trim(),
        animalState,
        updatedAt: new Date()
      };
      await updateDraft(updatedDraft);

      await submitDraft(draft.id);
      setModalMessage('Borrador enviado correctamente');
      setShowSuccessModal(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch {
      setModalMessage('No se pudo enviar el borrador');
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando borrador...</Text>
      </View>
    );
  }

  if (!draft) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Borrador</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: draft.imageUri }} style={styles.image} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe lo que observaste..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Nombre del Animal</Text>
          <TextInput
            style={styles.input}
            value={customAnimalName}
            onChangeText={setCustomAnimalName}
            placeholder="Ej: Jaguar, Oso de anteojos..."
            placeholderTextColor={theme.colors.textSecondary}
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Estado del Animal</Text>
          <View style={styles.stateButtons}>
            <TouchableOpacity
              style={[
                styles.stateButton,
                animalState === AnimalState.Alive && styles.stateButtonActive
              ]}
              onPress={() => setAnimalState(AnimalState.Alive)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="heart"
                size={20}
                color={
                  animalState === AnimalState.Alive
                    ? theme.colors.background
                    : theme.colors.forest
                }
              />
              <Text
                style={[
                  styles.stateButtonText,
                  animalState === AnimalState.Alive &&
                    styles.stateButtonTextActive
                ]}
              >
                Vivo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.stateButton,
                animalState === AnimalState.Dead && styles.stateButtonActive
              ]}
              onPress={() => setAnimalState(AnimalState.Dead)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={
                  animalState === AnimalState.Dead
                    ? theme.colors.background
                    : theme.colors.error
                }
              />
              <Text
                style={[
                  styles.stateButtonText,
                  animalState === AnimalState.Dead &&
                    styles.stateButtonTextActive
                ]}
              >
                Muerto
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {draft.location && (
          <View style={styles.section}>
            <Text style={styles.label}>Ubicación</Text>
            <View style={styles.locationInfo}>
              <Ionicons
                name="location"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.locationText}>
                {draft.location.latitude.toFixed(6)},{' '}
                {draft.location.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.colors.background} />
          ) : (
            <>
              <Ionicons name="save" size={20} color={theme.colors.background} />
              <Text style={styles.buttonText}>Guardar</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.colors.background} />
          ) : (
            <>
              <Ionicons
                name="cloud-upload"
                size={20}
                color={theme.colors.background}
              />
              <Text style={styles.buttonText}>Enviar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <CustomModal
        isVisible={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title="Campo requerido"
        type="alert"
        size="small"
        icon={
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#FF9800' + '15',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons name="alert-circle" size={32} color="#FF9800" />
          </View>
        }
        description={modalMessage}
        centered
        showFooter
        buttons={[
          {
            label: 'Entendido',
            onPress: () => setShowValidationModal(false),
            variant: 'primary'
          }
        ]}
      />

      <CustomModal
        isVisible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
        title="Éxito"
        type="alert"
        size="small"
        icon={
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#4CAF50' + '15',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
          </View>
        }
        description={modalMessage || 'Borrador guardado correctamente'}
        centered
        showFooter
        buttons={[
          {
            label: 'Aceptar',
            onPress: () => {
              setShowSuccessModal(false);
              navigation.goBack();
            },
            variant: 'primary'
          }
        ]}
      />

      <CustomModal
        isVisible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        type="alert"
        size="small"
        icon={
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: theme.colors.error + '15',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons
              name="close-circle"
              size={32}
              color={theme.colors.error}
            />
          </View>
        }
        description={modalMessage}
        centered
        showFooter
        buttons={[
          {
            label: 'Entendido',
            onPress: () => setShowErrorModal(false),
            variant: 'primary'
          }
        ]}
      />

      <CustomModal
        isVisible={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Enviar borrador"
        type="confirmation"
        size="small"
        icon={
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: theme.colors.primary + '15',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons
              name="cloud-upload"
              size={32}
              color={theme.colors.primary}
            />
          </View>
        }
        description="¿Deseas enviar este borrador?"
        centered
        showFooter
        footerAlignment="space-between"
        buttons={[
          {
            label: 'Cancelar',
            onPress: () => setShowSubmitModal(false),
            variant: 'outline'
          },
          {
            label: 'Enviar',
            onPress: confirmSubmit,
            variant: 'primary'
          }
        ]}
      />
    </View>
  );
};

export default DraftEditorScreen;
