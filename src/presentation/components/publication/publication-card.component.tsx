import React, { useCallback, useMemo } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  useTheme,
  themeVariables
} from '@/presentation/contexts/theme.context';
import PublicationImage from './publication-image.component';
import { PublicationModelResponse } from '@/domain/models/publication.models';
import { PublicationStatus } from '@/services/publication/publication.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createStyles } from './publication-card.styles';

export const ITEM_HEIGHT = 380;

const STATUS_CONFIG: Record<
  PublicationStatus,
  {
    icon: string;
    colorKey: keyof ReturnType<typeof themeVariables>;
    label: string;
    emoji: string;
  }
> = {
  [PublicationStatus.REJECTED]: {
    icon: 'times-circle',
    colorKey: '--error',
    label: 'Rechazada',
    emoji: '❌'
  },
  [PublicationStatus.PENDING]: {
    icon: 'hourglass-half',
    colorKey: '--warning',
    label: 'Pendiente',
    emoji: '⏳'
  },
  [PublicationStatus.ACCEPTED]: {
    icon: 'check-circle',
    colorKey: '--success',
    label: 'Aceptada',
    emoji: '✅'
  }
};

const ANIMAL_STATE_CONFIG = {
  ALIVE: {
    icon: 'heartbeat',
    colorKey: '--success',
    label: 'Vivo',
    emoji: '💚'
  },
  DEAD: {
    icon: 'ambulance',
    colorKey: '--error',
    label: 'Muerto',
    emoji: '🚨'
  }
} as const;

interface StatusRowProps {
  icon: string;
  color: string;
  label: string;
  emoji?: string;
}

const StatusRow = React.memo<StatusRowProps>(
  ({ icon, color, label, emoji }) => {
    const styles = createStyles(useTheme().theme);

    return (
      <View style={styles.statusContainer}>
        <View style={styles.statusIconContainer}>
          {emoji && <Text style={styles.statusEmoji}>{emoji}</Text>}
          <FontAwesome name={icon} size={16} color={color} />
        </View>
        <Text style={[styles.statusText, { color }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    );
  }
);

interface PublicationContentProps {
  publication: PublicationModelResponse;
  status: PublicationStatus;
}

const PublicationContent = React.memo<PublicationContentProps>(
  ({ publication, status }) => {
    const { theme } = useTheme();
    const vars = themeVariables(theme);
    const styles = createStyles(theme);

    const { commonNoun, description, animalState, location, createdDate } =
      publication;

    const statusData = useMemo(() => STATUS_CONFIG[status], [status]);
    const animalData = useMemo(
      () =>
        ANIMAL_STATE_CONFIG[animalState as keyof typeof ANIMAL_STATE_CONFIG] ??
        ANIMAL_STATE_CONFIG.ALIVE,
      [animalState]
    );

    const formattedDate = useMemo(
      () =>
        createdDate
          ? format(new Date(createdDate), "dd 'de' MMMM yyyy, HH:mm", {
              locale: es
            })
          : null,
      [createdDate]
    );

    const truncateDescription = useCallback(
      (text: string, maxLength: number = 120) =>
        text.length > maxLength ? `${text.substring(0, maxLength)}...` : text,
      []
    );

    return (
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.titleText, { color: vars['--text'] }]}>
            🦎 {commonNoun}
          </Text>
          <StatusBadge
            status={status}
            statusData={statusData}
            vars={vars}
            styles={styles}
          />
        </View>

        {formattedDate && (
          <Text style={[styles.dateText, { color: vars['--text-secondary'] }]}>
            📅 Creado el {formattedDate}
          </Text>
        )}

        <Text
          style={[styles.descriptionText, { color: vars['--text-secondary'] }]}
        >
          {truncateDescription(description)}
        </Text>

        <View style={styles.statusRowsContainer}>
          <StatusRow
            icon={animalData.icon}
            color={vars[animalData.colorKey]}
            label={animalData.label}
            emoji={animalData.emoji}
          />
          {location && (
            <StatusRow
              icon="map-marker"
              color={vars['--info']}
              label={location}
              emoji="📍"
            />
          )}
        </View>
      </View>
    );
  }
);

interface StatusBadgeProps {
  status: PublicationStatus;
  statusData: (typeof STATUS_CONFIG)[PublicationStatus];
  vars: ReturnType<typeof themeVariables>;
  styles: ReturnType<typeof createStyles>;
}

const StatusBadge = React.memo<StatusBadgeProps>(
  ({ statusData, vars, styles }) => (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: `${vars[statusData.colorKey]}20`,
          borderColor: vars[statusData.colorKey]
        }
      ]}
    >
      <Text style={styles.statusBadgeEmoji}>{statusData.emoji}</Text>
      <Text
        style={[styles.statusBadgeText, { color: vars[statusData.colorKey] }]}
      >
        {statusData.label}
      </Text>
    </View>
  )
);

interface ReviewButtonsProps {
  actions: { onApprove: () => void; onReject: () => void };
  isLoading?: boolean;
  disabled?: boolean;
}

const ReviewButtons = React.memo<ReviewButtonsProps>(
  ({ actions, isLoading = false, disabled = false }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const handleReject = useCallback(() => {
      if (!disabled && !isLoading) {
        actions.onReject();
      }
    }, [actions, disabled, isLoading]);

    const handleApprove = useCallback(() => {
      if (!disabled && !isLoading) {
        actions.onApprove();
      }
    }, [actions, disabled, isLoading]);

    const buttonDisabled = disabled || isLoading;

    return (
      <View
        style={[
          styles.buttonsContainer,
          { borderTopColor: theme.colors.surfaceVariant }
        ]}
      >
        <Pressable
          style={[
            styles.actionButton,
            styles.rejectButton,
            buttonDisabled && styles.disabledButton
          ]}
          onPress={handleReject}
          disabled={buttonDisabled}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)' }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={styles.buttonEmoji}>❌</Text>
              <FontAwesome
                name="times"
                size={16}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Rechazar</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={[
            styles.actionButton,
            styles.approveButton,
            buttonDisabled && styles.disabledButton
          ]}
          onPress={handleApprove}
          disabled={buttonDisabled}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)' }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={styles.buttonEmoji}>✅</Text>
              <FontAwesome
                name="check"
                size={16}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Aprobar</Text>
            </>
          )}
        </Pressable>
      </View>
    );
  }
);

interface ProcessingOverlayProps {
  vars: ReturnType<typeof themeVariables>;
  styles: ReturnType<typeof createStyles>;
}

const ProcessingOverlay = React.memo<ProcessingOverlayProps>(
  ({ vars, styles }) => (
    <View style={styles.processingOverlay}>
      <View style={styles.processingContent}>
        <ActivityIndicator size="large" color={vars['--primary']} />
        <Text style={[styles.processingText, { color: vars['--text'] }]}>
          ⚡ Procesando...
        </Text>
      </View>
    </View>
  )
);

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
    const { theme } = useTheme();
    const vars = themeVariables(theme);
    const styles = createStyles(theme);

    const handlePress = useCallback(() => {
      if (!isProcessing && onPress) {
        onPress();
      }
    }, [isProcessing, onPress]);

    const cardStyle = useMemo(
      () => [
        styles.card,
        isProcessing && styles.processingCard,
        !reviewActions && { minHeight: ITEM_HEIGHT },
        viewMode === 'presentation' && styles.presentationCard
      ],
      [isProcessing, reviewActions, viewMode, styles]
    );

    const CardWrapper = onPress ? Pressable : View;
    const cardProps = onPress
      ? {
          onPress: handlePress,
          disabled: isProcessing,
          android_ripple: { color: 'rgba(0, 0, 0, 0.05)' },
          accessibilityRole: 'button' as const,
          accessibilityLabel: `Ver detalles de ${publication.commonNoun}`
        }
      : {};

    return (
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

        {isProcessing && <ProcessingOverlay vars={vars} styles={styles} />}
      </CardWrapper>
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
