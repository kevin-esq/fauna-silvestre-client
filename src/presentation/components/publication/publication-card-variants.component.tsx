import React, { useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Dimensions,
  Animated
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@/presentation/contexts/theme.context';
import PublicationImage from './publication-image.component';
import { PublicationsModel } from '@/domain/models/publication.models';
import { PublicationStatus } from '@/services/publication/publication.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ViewLayout,
  ViewDensity
} from '@/services/storage/publication-view-preferences.service';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 48) / 2;

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

const REASON_TAG = '[MOTIVO MODIFICADO]:';
const STATUS_CHANGE_TAG = '[ESTADO MODIFICADO]:';

interface PublicationCardVariantProps {
  publication: PublicationsModel;
  onPress: () => void;
  layout: ViewLayout;
  density: ViewDensity;
  showImages: boolean;
  highlightStatus: boolean;
  showCreatedDate?: boolean;
  showAcceptedDate?: boolean;
  showAnimalState?: boolean;
  showLocation?: boolean;
  showRejectReason?: boolean;
  reducedMotion?: boolean;
}

const STATUS_CONFIG: Record<
  PublicationStatus,
  { icon: string; colorKey: 'error' | 'warning' | 'success'; label: string }
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

const ReasonWithTag: React.FC<{
  reason: string;
  colors: { text: string; error: string };
}> = ({ reason, colors }) => {
  const hasReasonTag = reason.startsWith(REASON_TAG);
  const hasStatusTag = reason.startsWith(STATUS_CHANGE_TAG);

  if (!hasReasonTag && !hasStatusTag) {
    return (
      <Text
        style={{
          fontSize: 13,
          lineHeight: 18,
          color: colors.error,
          fontWeight: '400'
        }}
        numberOfLines={2}
      >
        {reason}
      </Text>
    );
  }

  const tag = hasReasonTag ? REASON_TAG : STATUS_CHANGE_TAG;
  const cleanReason = reason.substring(tag.length).trim();
  const tagLabel = hasReasonTag ? 'Modificado' : 'Estado cambiado';
  const tagIcon = hasReasonTag ? 'create-outline' : 'swap-horizontal-outline';

  return (
    <View style={{ gap: 6 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 12,
          backgroundColor: '#FF9800',
          gap: 4
        }}
      >
        <Ionicons name={tagIcon} size={10} color="#FFFFFF" />
        <Text
          style={{
            fontSize: 9,
            fontWeight: '600',
            color: '#FFFFFF',
            letterSpacing: 0.2
          }}
        >
          {tagLabel}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 13,
          lineHeight: 18,
          color: colors.text,
          fontWeight: '400'
        }}
        numberOfLines={2}
      >
        {cleanReason}
      </Text>
    </View>
  );
};

export const PublicationCardVariant: React.FC<PublicationCardVariantProps> = ({
  publication,
  onPress,
  layout,
  density,
  showImages,
  highlightStatus,
  showCreatedDate = true,
  showAcceptedDate = true,
  showAnimalState = true,
  showLocation = true,
  showRejectReason = true,
  reducedMotion = false
}) => {
  const { colors, spacing, typography, borderRadius } = useTheme();

  const statusConfig = STATUS_CONFIG[publication.status];
  const statusColor = colors[statusConfig.colorKey];

  const densityMultiplier = useMemo(() => {
    switch (density) {
      case 'compact':
        return 0.9;
      case 'spacious':
        return 1.15;
      default:
        return 1;
    }
  }, [density]);

  const formattedDate = useMemo(() => {
    if (!publication.createdDate) return null;
    return format(
      new Date(publication.createdDate),
      "dd 'de' MMMM yyyy, HH:mm",
      { locale: es }
    );
  }, [publication.createdDate]);

  const formattedAcceptedDate = useMemo(() => {
    if (!publication.acceptedDate) return null;
    return format(
      new Date(publication.acceptedDate),
      "dd 'de' MMMM yyyy, HH:mm",
      { locale: es }
    );
  }, [publication.acceptedDate]);

  const animalData = useMemo(
    () =>
      ANIMAL_STATE_CONFIG[
        publication.animalState as keyof typeof ANIMAL_STATE_CONFIG
      ] ?? ANIMAL_STATE_CONFIG.ALIVE,
    [publication.animalState]
  );

  const truncateDescription = (text: string, maxLength: number = 120) =>
    text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (reducedMotion) return;
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0
    }).start();
  }, [scaleAnim, reducedMotion]);

  const handlePressOut = useCallback(() => {
    if (reducedMotion) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4
    }).start();
  }, [scaleAnim, reducedMotion]);

  const animatedStyle = reducedMotion
    ? {}
    : {
        transform: [{ scale: scaleAnim }]
      };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        cardContainer: {
          backgroundColor: colors.surface,
          borderRadius: 20,
          marginHorizontal: spacing.medium,
          marginBottom: spacing.medium * densityMultiplier + 4,
          borderWidth: 1,
          borderColor: colors.border,
          borderLeftWidth: 5,
          borderLeftColor: colors.forest,
          borderTopWidth: highlightStatus ? 3 : 1,
          borderTopColor: highlightStatus ? statusColor : colors.border,
          overflow: 'hidden',
          ...Platform.select({
            ios: {
              shadowColor: colors.forest,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.15,
              shadowRadius: 6
            },
            android: { elevation: 3 }
          })
        },
        cardImageContainer: {
          width: '100%',
          height: 200,
          backgroundColor: colors.surfaceVariant,
          overflow: 'hidden'
        },
        cardContent: {
          padding: 20 * densityMultiplier,
          gap: 12
        },
        cardHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: spacing.small,
          marginBottom: spacing.tiny
        },
        cardTitle: {
          flex: 1,
          fontSize: 19,
          fontWeight: '800',
          color: colors.text,
          marginRight: spacing.small,
          lineHeight: 26,
          letterSpacing: -0.3
        },
        cardStatusBadge: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          borderWidth: 1.5,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          alignSelf: 'flex-start',
          minHeight: 28,
          backgroundColor: colors.surface,
          borderColor: statusColor
        },
        cardStatusIcon: {
          marginRight: spacing.tiny
        },
        cardStatusText: {
          fontSize: 12,
          fontWeight: '700',
          color: statusColor,
          textTransform: 'uppercase',
          letterSpacing: 0.4
        },
        cardMetaRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.tiny,
          marginBottom: spacing.tiny
        },
        cardDateText: {
          fontSize: typography.fontSize.small,
          fontWeight: typography.fontWeight.medium,
          color: colors.textSecondary,
          opacity: 0.7,
          letterSpacing: 0.1
        },
        cardDescription: {
          fontSize: 15,
          color: colors.textSecondary,
          marginBottom: spacing.small,
          lineHeight: 22,
          letterSpacing: 0.1
        },
        cardStatusRowsContainer: {
          flexDirection: 'row',
          gap: spacing.small,
          flexWrap: 'wrap'
        },
        cardStatusRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 7,
          backgroundColor: colors.surfaceVariant,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 6
        },
        cardStatusRowIcon: {
          width: 16,
          alignItems: 'center',
          justifyContent: 'center'
        },
        cardStatusRowText: {
          fontWeight: typography.fontWeight.bold,
          fontSize: typography.fontSize.small,
          letterSpacing: 0.2
        },

        listContainer: {
          flexDirection: 'row',
          backgroundColor: colors.surface,
          borderRadius: 20,
          marginHorizontal: spacing.medium,
          marginBottom: spacing.small * densityMultiplier + 4,
          padding: spacing.medium * densityMultiplier,
          borderWidth: 1,
          borderColor: colors.border,
          borderLeftWidth: 5,
          borderLeftColor: colors.forest,
          borderTopWidth: highlightStatus ? 3 : 1,
          borderTopColor: highlightStatus ? statusColor : colors.border,
          ...Platform.select({
            ios: {
              shadowColor: colors.forest,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4
            },
            android: { elevation: 2 }
          })
        },
        listImageContainer: {
          width: 72 * densityMultiplier,
          height: 72 * densityMultiplier,
          borderRadius: borderRadius.large,
          backgroundColor: colors.surfaceVariant,
          overflow: 'hidden',
          marginRight: spacing.medium,
          flexShrink: 0,
          justifyContent: 'center',
          alignItems: 'center'
        },
        listContent: {
          flex: 1
        },
        listHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.tiny
        },
        listTitle: {
          flex: 1,
          fontSize: 17,
          fontWeight: '800',
          color: colors.text,
          marginRight: spacing.small,
          letterSpacing: -0.2
        },
        listStatusIcon: {
          marginLeft: spacing.small
        },
        listDescription: {
          fontSize: typography.fontSize.small * densityMultiplier,
          color: colors.textSecondary,
          marginBottom: spacing.tiny
        },
        listFooter: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        },
        listDate: {
          fontSize: typography.fontSize.small * densityMultiplier,
          color: colors.textSecondary
        },

        gridContainer: {
          width: GRID_ITEM_WIDTH,
          backgroundColor: colors.surface,
          borderRadius: 20,
          marginBottom: spacing.medium,
          borderWidth: 1,
          borderColor: colors.border,
          borderLeftWidth: 4,
          borderLeftColor: colors.forest,
          borderTopWidth: highlightStatus ? 3 : 1,
          borderTopColor: highlightStatus ? statusColor : colors.border,
          overflow: 'hidden',
          ...Platform.select({
            ios: {
              shadowColor: colors.forest,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4
            },
            android: { elevation: 3 }
          })
        },
        gridImageContainer: {
          width: '100%',
          height: GRID_ITEM_WIDTH * 0.8,
          backgroundColor: colors.surfaceVariant,
          overflow: 'hidden'
        },
        gridContent: {
          padding: spacing.medium - 2
        },
        gridTitle: {
          fontSize: 16,
          fontWeight: '800',
          color: colors.text,
          marginBottom: spacing.tiny,
          lineHeight: 22,
          letterSpacing: -0.2
        },
        gridStatusBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          paddingHorizontal: spacing.small - 2,
          paddingVertical: 2,
          borderRadius: borderRadius.small,
          backgroundColor: statusColor + '20',
          marginTop: spacing.tiny
        },
        gridStatusText: {
          fontSize: typography.fontSize.small - 1,
          fontWeight: typography.fontWeight.medium,
          color: statusColor,
          marginLeft: 4
        },

        timelineContainer: {
          flexDirection: 'row',
          marginHorizontal: spacing.medium,
          marginBottom: spacing.large * densityMultiplier
        },
        timelineLine: {
          width: highlightStatus ? 4 : 3,
          backgroundColor: highlightStatus
            ? statusColor + '60'
            : statusColor + '40',
          marginHorizontal: spacing.medium,
          position: 'relative',
          borderRadius: 2
        },
        timelineDot: {
          width: 14 * densityMultiplier,
          height: 14 * densityMultiplier,
          borderRadius: 7 * densityMultiplier,
          backgroundColor: statusColor,
          position: 'absolute',
          left: -5.5 * densityMultiplier,
          top: 4,
          borderWidth: 3,
          borderColor: colors.surface,
          ...Platform.select({
            ios: {
              shadowColor: statusColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4
            },
            android: { elevation: 4 }
          })
        },
        timelineContent: {
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: spacing.medium * densityMultiplier + 4,
          borderWidth: 1,
          borderColor: colors.border,
          borderLeftWidth: 5,
          borderLeftColor: colors.forest,
          borderTopWidth: highlightStatus ? 3 : 1,
          borderTopColor: highlightStatus ? statusColor : colors.border,
          ...Platform.select({
            ios: {
              shadowColor: colors.forest,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4
            },
            android: { elevation: 2 }
          })
        },
        timelineHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: spacing.small
        },
        timelineDate: {
          fontSize: typography.fontSize.small * densityMultiplier,
          fontWeight: typography.fontWeight.bold,
          color: statusColor
        },
        timelineStatusBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.small,
          paddingVertical: 2,
          borderRadius: borderRadius.small,
          backgroundColor: statusColor + '15'
        },
        timelineTitle: {
          fontSize: 18 * densityMultiplier,
          fontWeight: '800',
          color: colors.text,
          marginBottom: spacing.small,
          letterSpacing: -0.3
        },
        timelineDescription: {
          fontSize: typography.fontSize.medium * densityMultiplier,
          color: colors.textSecondary,
          lineHeight: typography.lineHeight.medium * densityMultiplier
        },
        timelineImageContainer: {
          width: '100%',
          height: 180,
          borderRadius: borderRadius.small,
          overflow: 'hidden',
          backgroundColor: colors.surfaceVariant,
          marginTop: spacing.small
        }
      }),
    [
      colors,
      spacing,
      typography,
      borderRadius,
      statusColor,
      densityMultiplier,
      highlightStatus
    ]
  );

  const rejectedReasonContainer = useMemo(
    () => ({
      backgroundColor: colors.error + '10',
      borderLeftWidth: 3,
      borderLeftColor: colors.error,
      borderRadius: borderRadius.small,
      padding: spacing.small,
      marginBottom: spacing.small
    }),
    [colors, borderRadius, spacing]
  );

  const rejectedReasonHeader = useMemo(
    () => ({
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing.tiny,
      marginBottom: spacing.tiny
    }),
    [spacing]
  );

  const rejectedReasonTitle = useMemo(
    () => ({
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.bold,
      color: colors.error,
      letterSpacing: 0.2
    }),
    [typography, colors]
  );

  if (layout === 'card') {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          style={styles.cardContainer}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{ color: colors.primary + '03' }}
        >
          {showImages && (
            <View style={styles.cardImageContainer}>
              <PublicationImage
                uri={publication.img}
                commonNoun={publication.commonNoun}
                viewMode="card"
              />
            </View>
          )}
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {publication.commonNoun}
              </Text>
              <View style={styles.cardStatusBadge}>
                <FontAwesome
                  name={statusConfig.icon}
                  size={11}
                  color={statusColor}
                />
                <Text style={styles.cardStatusText}>{statusConfig.label}</Text>
              </View>
            </View>

            {showCreatedDate && formattedDate && (
              <View style={styles.cardMetaRow}>
                <FontAwesome
                  name="calendar"
                  size={12}
                  color={colors.textSecondary}
                />
                <Text style={styles.cardDateText}>Creado: {formattedDate}</Text>
              </View>
            )}

            {showAcceptedDate && formattedAcceptedDate && (
              <View style={styles.cardMetaRow}>
                <FontAwesome
                  name="check-circle"
                  size={12}
                  color={colors.success}
                />
                <Text style={styles.cardDateText}>
                  Aceptado: {formattedAcceptedDate}
                </Text>
              </View>
            )}

            <Text style={styles.cardDescription} numberOfLines={3}>
              {truncateDescription(publication.description)}
            </Text>

            {(showAnimalState || showLocation) && (
              <View style={styles.cardStatusRowsContainer}>
                {showAnimalState && (
                  <View style={styles.cardStatusRow}>
                    <View style={styles.cardStatusRowIcon}>
                      <FontAwesome
                        name={animalData.icon}
                        size={14}
                        color={colors[animalData.colorKey]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.cardStatusRowText,
                        { color: colors[animalData.colorKey] }
                      ]}
                    >
                      {animalData.label}
                    </Text>
                  </View>
                )}
                {showLocation && publication.location && (
                  <View style={styles.cardStatusRow}>
                    <View style={styles.cardStatusRowIcon}>
                      <FontAwesome
                        name="map-marker"
                        size={14}
                        color={colors.info}
                      />
                    </View>
                    <Text
                      style={[styles.cardStatusRowText, { color: colors.info }]}
                    >
                      {publication.location}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {showRejectReason &&
              publication.status === PublicationStatus.REJECTED &&
              publication.rejectedReason && (
                <View style={rejectedReasonContainer}>
                  <View style={rejectedReasonHeader}>
                    <FontAwesome
                      name="info-circle"
                      size={14}
                      color={colors.error}
                    />
                    <Text style={rejectedReasonTitle}>Motivo de Rechazo:</Text>
                  </View>
                  <ReasonWithTag
                    reason={publication.rejectedReason}
                    colors={colors}
                  />
                </View>
              )}
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  if (layout === 'list') {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          style={styles.listContainer}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{ color: colors.primary + '03' }}
        >
          {showImages && (
            <View style={styles.listImageContainer}>
              <PublicationImage
                uri={publication.img}
                commonNoun={publication.commonNoun}
                viewMode="list"
              />
            </View>
          )}
          <View style={styles.listContent}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle} numberOfLines={1}>
                {publication.commonNoun}
              </Text>
              <FontAwesome
                name={statusConfig.icon}
                size={16 * densityMultiplier}
                color={statusColor}
                style={styles.listStatusIcon}
              />
            </View>
            {density !== 'compact' && (
              <Text style={styles.listDescription} numberOfLines={1}>
                {publication.description}
              </Text>
            )}
            <View style={styles.listFooter}>
              <Text style={styles.listDate}>{formattedDate}</Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  if (layout === 'grid') {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          style={styles.gridContainer}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{ color: colors.primary + '03' }}
        >
          {showImages && (
            <View style={styles.gridImageContainer}>
              <PublicationImage
                uri={publication.img}
                commonNoun={publication.commonNoun}
                viewMode="card"
              />
            </View>
          )}
          <View style={styles.gridContent}>
            <Text style={styles.gridTitle} numberOfLines={2}>
              {publication.commonNoun}
            </Text>
            <View style={styles.gridStatusBadge}>
              <FontAwesome
                name={statusConfig.icon}
                size={10 * densityMultiplier}
                color={statusColor}
              />
              <Text style={styles.gridStatusText}>{statusConfig.label}</Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={styles.timelineContainer}>
      <View style={styles.timelineLine}>
        <View style={styles.timelineDot} />
      </View>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <Pressable
          style={styles.timelineContent}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{ color: colors.primary + '03' }}
        >
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineDate}>{formattedDate}</Text>
            <View style={styles.timelineStatusBadge}>
              <FontAwesome
                name={statusConfig.icon}
                size={10}
                color={statusColor}
              />
              <Text
                style={[styles.gridStatusText, { marginLeft: spacing.tiny }]}
              >
                {statusConfig.label}
              </Text>
            </View>
          </View>
          <Text style={styles.timelineTitle}>{publication.commonNoun}</Text>
          <Text
            style={styles.timelineDescription}
            numberOfLines={density === 'compact' ? 2 : 3}
          >
            {publication.description}
          </Text>
          {showImages && (
            <View style={styles.timelineImageContainer}>
              <PublicationImage
                uri={publication.img}
                commonNoun={publication.commonNoun}
                viewMode="card"
              />
            </View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
};
