import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@/presentation/contexts/theme.context';
import { AnimalCardVariant } from './animal-card-variants.component';
import CustomModal from '@/presentation/components/ui/custom-modal.component';
import { AnimalModelResponse } from '@/domain/models/animal.models';
import {
  ViewLayout,
  ViewDensity
} from '@/services/storage/catalog-view-preferences.service';

interface AnimalActions {
  onEdit: (animal: AnimalModelResponse) => void;
  onDelete: (catalogId: string) => void;
  onImageEdit: (animal: AnimalModelResponse) => void;
}

interface AnimalCardWithActionsProps {
  animal: AnimalModelResponse;
  onPress?: () => void;
  actions: AnimalActions;
  layout: ViewLayout;
  density: ViewDensity;
  showImages: boolean;
  highlightStatus: boolean;
  showCategory: boolean;
  showSpecies: boolean;
  showHabitat: boolean;
  showDescription: boolean;
  isProcessing?: boolean;
  reducedMotion: boolean;
}

export const AnimalCardWithActions: React.FC<AnimalCardWithActionsProps> = ({
  animal,
  onPress,
  actions,
  layout,
  density,
  showImages,
  highlightStatus,
  showCategory,
  showSpecies,
  showHabitat,
  showDescription,
  isProcessing = false,
  reducedMotion
}) => {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          opacity: isProcessing ? 0.6 : 1
        },
        actionsContainer: {
          flexDirection: 'row',
          gap: spacing.small,
          paddingHorizontal: spacing.medium,
          paddingBottom: spacing.medium,
          paddingTop: spacing.small,
          backgroundColor: colors.surface,
          borderBottomLeftRadius: borderRadius.large,
          borderBottomRightRadius: borderRadius.large,
          marginTop: -borderRadius.large,
          marginHorizontal: spacing.medium
        },
        actionButton: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: spacing.small + 2,
          borderRadius: borderRadius.medium,
          gap: spacing.tiny,
          ...Platform.select({
            ios: {
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2
            },
            android: { elevation: 2 }
          })
        },
        actionButtonGrid: {
          paddingVertical: spacing.small,
          paddingHorizontal: spacing.small,
          borderRadius: borderRadius.large,
          minWidth: 44
        },
        editButton: {
          backgroundColor: colors.primary
        },
        imageButton: {
          backgroundColor: colors.info
        },
        deleteButton: {
          backgroundColor: colors.error
        },
        buttonText: {
          fontSize: typography.fontSize.medium,
          fontWeight: typography.fontWeight.bold,
          color: colors.textOnPrimary
        },
        disabledButton: {
          opacity: 0.5
        }
      }),
    [colors, spacing, typography, borderRadius, isProcessing]
  );

  const handleEdit = useCallback(() => {
    if (!isProcessing) {
      actions.onEdit(animal);
    }
  }, [isProcessing, actions, animal]);

  const handleImageEdit = useCallback(() => {
    if (!isProcessing) {
      actions.onImageEdit(animal);
    }
  }, [isProcessing, actions, animal]);

  const handleDeletePress = useCallback(() => {
    if (!isProcessing) {
      setShowDeleteModal(true);
    }
  }, [isProcessing]);

  const handleConfirmDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await actions.onDelete(animal.catalogId.toString());
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting animal:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [actions, animal.catalogId]);

  const handlePress = useCallback(() => {
    if (!isProcessing && onPress) {
      onPress();
    }
  }, [isProcessing, onPress]);

  return (
    <View style={styles.container}>
      <AnimalCardVariant
        animal={animal}
        onPress={isProcessing ? () => {} : handlePress}
        layout={layout}
        density={density}
        showImages={showImages}
        highlightStatus={highlightStatus}
        showCategory={showCategory}
        showSpecies={showSpecies}
        showHabitat={showHabitat}
        showDescription={showDescription}
        reducedMotion={reducedMotion}
      />

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.editButton,
            layout === 'grid' && styles.actionButtonGrid,
            isProcessing && styles.disabledButton
          ]}
          onPress={handleEdit}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          <Ionicons
            name="pencil"
            size={layout === 'grid' ? 24 : 20}
            color={colors.textOnPrimary}
          />
          {layout !== 'grid' && <Text style={styles.buttonText}>Editar</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.imageButton,
            layout === 'grid' && styles.actionButtonGrid,
            isProcessing && styles.disabledButton
          ]}
          onPress={handleImageEdit}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          <Ionicons
            name="image"
            size={layout === 'grid' ? 24 : 20}
            color={colors.textOnPrimary}
          />
          {layout !== 'grid' && <Text style={styles.buttonText}>Imagen</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.deleteButton,
            layout === 'grid' && styles.actionButtonGrid,
            (isProcessing || isDeleting) && styles.disabledButton
          ]}
          onPress={handleDeletePress}
          disabled={isProcessing || isDeleting}
          activeOpacity={0.8}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.textOnPrimary} />
          ) : (
            <>
              <Ionicons
                name="trash"
                size={layout === 'grid' ? 24 : 20}
                color={colors.textOnPrimary}
              />
              {layout !== 'grid' && (
                <Text style={styles.buttonText}>Eliminar</Text>
              )}
            </>
          )}
        </TouchableOpacity>
      </View>

      <CustomModal
        isVisible={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
      >
        <View style={{ padding: spacing.large, alignItems: 'center' }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: colors.error + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: spacing.medium
            }}
          >
            <Ionicons name="trash" size={32} color={colors.error} />
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: colors.text,
              marginBottom: spacing.small
            }}
          >
            Confirmar eliminación
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: spacing.large
            }}
          >
            ¿Está seguro que desea eliminar a {animal.commonNoun}? Esta acción
            no se puede deshacer.
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.medium }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: spacing.medium,
                paddingHorizontal: spacing.large,
                backgroundColor: colors.surfaceVariant,
                borderRadius: 8,
                alignItems: 'center'
              }}
              onPress={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              <Text style={{ color: colors.text, fontWeight: '600' }}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: spacing.medium,
                paddingHorizontal: spacing.large,
                backgroundColor: colors.error,
                borderRadius: 8,
                alignItems: 'center'
              }}
              onPress={handleConfirmDelete}
              disabled={isDeleting}
            >
              <Text style={{ color: colors.textOnPrimary, fontWeight: '600' }}>
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomModal>
    </View>
  );
};
