import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  Animated,
  Dimensions
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@/presentation/contexts/theme.context';
import PublicationImage from './publication-image.component';
import { PublicationModelResponse } from '@/domain/models/publication.models';
import { PublicationStatus } from '@/services/publication/publication.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createStyles } from './publication-card.styles';
import CustomModal from '@/presentation/components/ui/custom-modal.component';

const { width } = Dimensions.get('window');

export const ITEM_HEIGHT = 380;

const STATUS_CONFIG: Record<
  PublicationStatus,
  {
    icon: string;
    colorKey: 'error' | 'warning' | 'success';
    label: string;
  }
> = {
  [PublicationStatus.REJECTED]: {
    icon: 'times-circle',
    colorKey: 'error',
    label: 'Rechazada'
  },
  [PublicationStatus.PENDING]: {
    icon: 'hourglass-half',
    colorKey: 'warning',
    label: 'Pendiente'
  },
  [PublicationStatus.ACCEPTED]: {
    icon: 'check-circle',
    colorKey: 'success',
    label: 'Aceptada'
  }
};

const ANIMAL_STATE_CONFIG = {
  ALIVE: {
    icon: 'heartbeat',
    colorKey: 'success' as const,
    label: 'Vivo'
  },
  DEAD: {
    icon: 'ambulance',
    colorKey: 'error' as const,
    label: 'Muerto'
  }
};

interface StatusRowProps {
  icon: string;
  color: string;
  label: string;
}

const StatusRow = React.memo<StatusRowProps>(({ icon, color, label }) => {
  const { theme, iconSizes } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.statusContainer}>
      <View style={styles.statusIconContainer}>
        <FontAwesome name={icon} size={iconSizes.small - 2} color={color} />
      </View>
      <Text style={[styles.statusText, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
});

interface PublicationContentProps {
  publication: PublicationModelResponse;
  status: PublicationStatus;
}

const PublicationContent = React.memo<PublicationContentProps>(
  ({ publication, status }) => {
    const { theme, colors, iconSizes } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const {
      commonNoun,
      description,
      animalState,
      location,
      createdDate,
      acceptedDate
    } = publication;

    const statusData = useMemo(() => STATUS_CONFIG[status], [status]);
    const animalData = useMemo(
      () =>
        ANIMAL_STATE_CONFIG[animalState as keyof typeof ANIMAL_STATE_CONFIG] ??
        ANIMAL_STATE_CONFIG.ALIVE,
      [animalState]
    );

    const formattedCreatedDate = useMemo(
      () =>
        createdDate
          ? format(new Date(createdDate), "dd 'de' MMMM yyyy, HH:mm", {
              locale: es
            })
          : null,
      [createdDate]
    );

    const formattedAcceptedDate = useMemo(
      () =>
        acceptedDate
          ? format(new Date(acceptedDate), "dd 'de' MMMM yyyy, HH:mm", {
              locale: es
            })
          : null,
      [acceptedDate]
    );

    const truncateDescription = useCallback(
      (text: string, maxLength: number = 120) =>
        text.length > maxLength ? `${text.substring(0, maxLength)}...` : text,
      []
    );

    return (
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.titleText} numberOfLines={2}>
            {commonNoun}
          </Text>
          <StatusBadge status={status} statusData={statusData} />
        </View>

        {formattedCreatedDate && (
          <View style={styles.metaRow}>
            <FontAwesome
              name="calendar"
              size={iconSizes.small - 4}
              color={colors.textSecondary}
            />
            <Text style={styles.dateText}>Creado: {formattedCreatedDate}</Text>
          </View>
        )}

        {formattedAcceptedDate && (
          <View style={styles.metaRow}>
            <FontAwesome
              name="check-circle"
              size={iconSizes.small - 4}
              color={colors.success}
            />
            <Text style={styles.dateText}>
              Aceptado: {formattedAcceptedDate}
            </Text>
          </View>
        )}

        <Text style={styles.descriptionText} numberOfLines={3}>
          {truncateDescription(description)}
        </Text>

        <View style={styles.statusRowsContainer}>
          <StatusRow
            icon={animalData.icon}
            color={colors[animalData.colorKey]}
            label={animalData.label}
          />
          {location && (
            <StatusRow icon="map-marker" color={colors.info} label={location} />
          )}
        </View>
      </View>
    );
  }
);

interface StatusBadgeProps {
  status: PublicationStatus;
  statusData: (typeof STATUS_CONFIG)[PublicationStatus];
}

const StatusBadge = React.memo<StatusBadgeProps>(({ statusData }) => {
  const { theme, colors, iconSizes } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const badgeColor = colors[statusData.colorKey];

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: `${badgeColor}15`,
          borderColor: badgeColor
        }
      ]}
    >
      <FontAwesome
        name={statusData.icon}
        size={iconSizes.small - 6}
        color={badgeColor}
        style={styles.statusBadgeIcon}
      />
      <Text style={[styles.statusBadgeText, { color: badgeColor }]}>
        {statusData.label}
      </Text>
    </View>
  );
});

interface ReviewButtonsProps {
  actions: { onApprove: () => void; onReject: () => void };
  isLoading?: boolean;
  disabled?: boolean;
}

const ReviewButtons = React.memo<ReviewButtonsProps>(
  ({ actions, isLoading = false, disabled = false }) => {
    const { theme, colors, typography, iconSizes } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const rejectScale = useRef(new Animated.Value(1)).current;
    const approveScale = useRef(new Animated.Value(1)).current;

    const animateButton = useCallback((scale: Animated.Value) => {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 0.95,
          useNativeDriver: true,
          speed: 50,
          bounciness: 0
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8
        })
      ]).start();
    }, []);

    const handleRejectPress = useCallback(() => {
      if (!disabled && !isLoading) {
        animateButton(rejectScale);
        setRejectModalVisible(true);
      }
    }, [disabled, isLoading, animateButton, rejectScale]);

    const handleApprovePress = useCallback(() => {
      if (!disabled && !isLoading) {
        animateButton(approveScale);
        setApproveModalVisible(true);
      }
    }, [disabled, isLoading, animateButton, approveScale]);

    const handleConfirmApprove = useCallback(async () => {
      setIsProcessing(true);
      try {
        await actions.onApprove();
        setApproveModalVisible(false);
      } catch (error) {
        console.error('Error al aprobar:', error);
      } finally {
        setIsProcessing(false);
      }
    }, [actions]);

    const handleConfirmReject = useCallback(async () => {
      if (!rejectionReason.trim()) return;

      setIsProcessing(true);
      try {
        await actions.onReject();
        setRejectModalVisible(false);
        setRejectionReason('');
      } catch (error) {
        console.error('Error al rechazar:', error);
      } finally {
        setIsProcessing(false);
      }
    }, [actions, rejectionReason]);

    const handleCloseApproveModal = useCallback(() => {
      if (!isProcessing) {
        setApproveModalVisible(false);
      }
    }, [isProcessing]);

    const handleCloseRejectModal = useCallback(() => {
      if (!isProcessing) {
        setRejectModalVisible(false);
        setRejectionReason('');
      }
    }, [isProcessing]);

    const buttonDisabled = disabled || isLoading;

    return (
      <>
        <View style={styles.buttonsContainer}>
          <Animated.View
            style={{ flex: 1, transform: [{ scale: rejectScale }] }}
          >
            <Pressable
              style={[
                styles.actionButton,
                styles.rejectButton,
                buttonDisabled && styles.disabledButton
              ]}
              onPress={handleRejectPress}
              disabled={buttonDisabled}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textOnPrimary} size="small" />
              ) : (
                <>
                  <FontAwesome
                    name="times"
                    size={iconSizes.small}
                    color={colors.textOnPrimary}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Rechazar</Text>
                </>
              )}
            </Pressable>
          </Animated.View>

          <Animated.View
            style={{ flex: 1, transform: [{ scale: approveScale }] }}
          >
            <Pressable
              style={[
                styles.actionButton,
                styles.approveButton,
                buttonDisabled && styles.disabledButton
              ]}
              onPress={handleApprovePress}
              disabled={buttonDisabled}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textOnPrimary} size="small" />
              ) : (
                <>
                  <FontAwesome
                    name="check"
                    size={iconSizes.small}
                    color={colors.textOnPrimary}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Aprobar</Text>
                </>
              )}
            </Pressable>
          </Animated.View>
        </View>

        <CustomModal
          isVisible={approveModalVisible}
          onClose={handleCloseApproveModal}
          title="Aprobar Publicación"
          centered
          icon={
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.success + '20',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons
                name="checkmark-circle"
                size={iconSizes.large}
                color={colors.success}
              />
            </View>
          }
          showFooter
          footerAlignment="end"
          buttons={[
            {
              label: 'Cancelar',
              onPress: handleCloseApproveModal,
              variant: 'outline',
              disabled: isProcessing
            },
            {
              label: 'Aprobar',
              onPress: handleConfirmApprove,
              variant: 'primary',
              loading: isProcessing
            }
          ]}
          animationInTiming={200}
          animationOutTiming={200}
          maxWidth={width - 40}
          size="full"
          closeOnBackdrop={!isProcessing}
          closeOnBackButton={!isProcessing}
        >
          <Text
            style={{
              fontSize: typography.fontSize.medium + 1,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: typography.lineHeight.medium + 2
            }}
          >
            ¿Está seguro que desea aprobar esta publicación? Será visible para
            todos los usuarios.
          </Text>
        </CustomModal>

        <CustomModal
          isVisible={rejectModalVisible}
          onClose={handleCloseRejectModal}
          title="Rechazar Publicación"
          centered
          icon={
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.error + '20',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons
                name="close-circle"
                size={iconSizes.large}
                color={colors.error}
              />
            </View>
          }
          type="input"
          inputValue={rejectionReason}
          onInputChange={setRejectionReason}
          inputPlaceholder="Motivo del rechazo..."
          inputLabel="Motivo"
          inputMultiline
          inputMaxLength={300}
          showCharacterCount
          description="Esta información será enviada al usuario"
          showFooter
          footerAlignment="end"
          buttons={[
            {
              label: 'Cancelar',
              onPress: handleCloseRejectModal,
              variant: 'outline',
              disabled: isProcessing
            },
            {
              label: 'Rechazar',
              onPress: handleConfirmReject,
              variant: 'danger',
              disabled: !rejectionReason.trim(),
              loading: isProcessing
            }
          ]}
          animationInTiming={200}
          animationOutTiming={200}
          maxWidth={width - 40}
          size="full"
          closeOnBackdrop={!isProcessing}
          closeOnBackButton={!isProcessing}
        />
      </>
    );
  }
);

const ProcessingOverlay = React.memo(() => {
  const { theme, colors } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7
      })
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <Animated.View style={[styles.processingOverlay, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.processingContent,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.processingText}>Procesando...</Text>
      </Animated.View>
    </Animated.View>
  );
});

interface PublicationCardProps {
  publication: PublicationModelResponse;
  status: PublicationStatus;
  onPress?: () => void;
  reviewActions?: { onApprove: () => void; onReject: () => void };
  viewMode?: 'card' | 'presentation';
  isProcessing?: boolean;
}

const PublicationCard = React.memo<PublicationCardProps>(
  ({
    publication,
    status,
    onPress,
    reviewActions,
    viewMode = 'card',
    isProcessing = false
  }) => {
    const { theme, colors } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      if (!isProcessing && onPress) {
        Animated.spring(scaleAnim, {
          toValue: 0.98,
          useNativeDriver: true,
          speed: 50,
          bounciness: 0
        }).start();
      }
    }, [isProcessing, onPress, scaleAnim]);

    const handlePressOut = useCallback(() => {
      if (!isProcessing && onPress) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8
        }).start();
      }
    }, [isProcessing, onPress, scaleAnim]);

    const handlePress = useCallback(() => {
      if (!isProcessing && onPress) {
        onPress();
      }
    }, [isProcessing, onPress]);

    React.useEffect(() => {
      Animated.timing(opacityAnim, {
        toValue: isProcessing ? 0.6 : 1,
        duration: 200,
        useNativeDriver: true
      }).start();
    }, [isProcessing, opacityAnim]);

    const cardStyle = useMemo(
      () => [
        styles.card,
        !reviewActions && { minHeight: ITEM_HEIGHT },
        viewMode === 'presentation' && styles.presentationCard
      ],
      [reviewActions, viewMode, styles]
    );

    const animatedStyle = {
      transform: [{ scale: scaleAnim }],
      opacity: opacityAnim
    };

    const CardWrapper = onPress ? Pressable : View;
    const cardProps = onPress
      ? {
          onPress: handlePress,
          onPressIn: handlePressIn,
          onPressOut: handlePressOut,
          disabled: isProcessing,
          android_ripple: { color: colors.primary + '03' },
          accessibilityRole: 'button' as const,
          accessibilityLabel: `Ver detalles de ${publication.commonNoun}`,
          accessibilityState: { disabled: isProcessing }
        }
      : {};

    return (
      <Animated.View style={animatedStyle}>
        <CardWrapper style={cardStyle} {...cardProps}>
          <PublicationImage
            uri={publication.img}
            commonNoun={publication.commonNoun}
            viewMode={viewMode}
            style={styles.imageContainer}
          />

          <View style={styles.cardContent}>
            <PublicationContent publication={publication} status={status} />

            {reviewActions && (
              <ReviewButtons
                actions={reviewActions}
                isLoading={isProcessing}
                disabled={isProcessing}
              />
            )}
          </View>

          {isProcessing && <ProcessingOverlay />}
        </CardWrapper>
      </Animated.View>
    );
  }
);

StatusRow.displayName = 'StatusRow';
PublicationContent.displayName = 'PublicationContent';
StatusBadge.displayName = 'StatusBadge';
ReviewButtons.displayName = 'ReviewButtons';
ProcessingOverlay.displayName = 'ProcessingOverlay';
PublicationCard.displayName = 'PublicationCard';

export default PublicationCard;
