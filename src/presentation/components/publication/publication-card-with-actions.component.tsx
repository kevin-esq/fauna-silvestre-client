import React, { useState, useMemo } from 'react';
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
import { PublicationCardVariant } from './publication-card-variants.component';
import CustomModal from '@/presentation/components/ui/custom-modal.component';
import { PublicationsModel } from '@/domain/models/publication.models';
import {
  ViewLayout,
  ViewDensity
} from '@/services/storage/publication-view-preferences.service';

interface ReviewActions {
  onApprove: () => void;
  onReject: (reason?: string) => void;
}

interface PublicationCardWithActionsProps {
  publication: PublicationsModel;
  onPress: () => void;
  reviewActions?: ReviewActions;
  layout: ViewLayout;
  density: ViewDensity;
  showImages: boolean;
  highlightStatus: boolean;
  showCreatedDate?: boolean;
  showAcceptedDate?: boolean;
  showAnimalState?: boolean;
  showLocation?: boolean;
  showRejectReason?: boolean;
  isProcessing?: boolean;
  reducedMotion?: boolean;
}

export const PublicationCardWithActions: React.FC<
  PublicationCardWithActionsProps
> = ({
  publication,
  onPress,
  reviewActions,
  layout,
  density,
  showImages,
  highlightStatus,
  showCreatedDate = true,
  showAcceptedDate = true,
  showAnimalState = true,
  showLocation = true,
  showRejectReason = true,
  isProcessing = false,
  reducedMotion = false
}) => {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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
        approveButton: {
          backgroundColor: colors.success
        },
        rejectButton: {
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

  const handleApprove = () => {
    if (!isProcessing && reviewActions) {
      setShowApproveModal(true);
    }
  };

  const handleConfirmApprove = () => {
    if (reviewActions) {
      reviewActions.onApprove();
      setShowApproveModal(false);
    }
  };

  const handleRejectPress = () => {
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (reviewActions) {
      reviewActions.onReject(rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    }
  };

  return (
    <View style={styles.container}>
      <PublicationCardVariant
        publication={publication}
        onPress={isProcessing ? () => {} : onPress}
        layout={layout}
        density={density}
        showImages={showImages}
        highlightStatus={highlightStatus}
        showCreatedDate={showCreatedDate}
        showAcceptedDate={showAcceptedDate}
        showAnimalState={showAnimalState}
        showLocation={showLocation}
        showRejectReason={showRejectReason}
        reducedMotion={reducedMotion}
      />

      {reviewActions && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.approveButton,
              layout === 'grid' && styles.actionButtonGrid,
              isProcessing && styles.disabledButton
            ]}
            onPress={handleApprove}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={colors.textOnPrimary} />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={layout === 'grid' ? 24 : 20}
                  color={colors.textOnPrimary}
                />
                {layout !== 'grid' && (
                  <Text style={styles.buttonText}>Aprobar</Text>
                )}
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.rejectButton,
              layout === 'grid' && styles.actionButtonGrid,
              isProcessing && styles.disabledButton
            ]}
            onPress={handleRejectPress}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            <Ionicons
              name="close-circle"
              size={layout === 'grid' ? 24 : 20}
              color={colors.textOnPrimary}
            />
            {layout !== 'grid' && (
              <Text style={styles.buttonText}>Rechazar</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <CustomModal
        isVisible={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Aprobar Publicación"
        type="confirmation"
        size="medium"
        icon={
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.success + '20',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons
              name="checkmark-circle"
              size={32}
              color={colors.success}
            />
          </View>
        }
        description={`¿Está seguro que desea aprobar la publicación de ${publication.commonNoun}? Será visible para todos los usuarios.`}
        buttons={[
          {
            label: 'Cancelar',
            onPress: () => setShowApproveModal(false),
            variant: 'outline'
          },
          {
            label: 'Aprobar',
            onPress: handleConfirmApprove,
            variant: 'primary'
          }
        ]}
        footerAlignment="space-between"
      />

      <CustomModal
        isVisible={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Rechazar Publicación"
        type="input"
        size="medium"
        icon={
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.error + '20',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons name="close-circle" size={32} color={colors.error} />
          </View>
        }
        description={`¿Estás seguro de que deseas rechazar la publicación de ${publication.commonNoun}?`}
        inputPlaceholder="Motivo del rechazo..."
        inputValue={rejectReason}
        onInputChange={setRejectReason}
        inputLabel="Motivo"
        inputMultiline
        inputMaxLength={300}
        showCharacterCount
        buttons={[
          {
            label: 'Cancelar',
            onPress: () => {
              setShowRejectModal(false);
              setRejectReason('');
            },
            variant: 'outline'
          },
          {
            label: 'Rechazar',
            onPress: handleConfirmReject,
            variant: 'danger',
            disabled: !rejectReason.trim()
          }
        ]}
        footerAlignment="space-between"
      />
    </View>
  );
};
