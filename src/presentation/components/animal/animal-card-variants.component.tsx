import React, { useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  Image
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@/presentation/contexts/theme.context';
import { AnimalModelResponse } from '@/domain/models/animal.models';
import {
  ViewLayout,
  ViewDensity
} from '@/services/storage/publication-view-preferences.service';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 48) / 2;

interface AnimalCardVariantProps {
  animal: AnimalModelResponse;
  onPress: () => void;
  layout: ViewLayout;
  density: ViewDensity;
  showImages: boolean;
  highlightStatus: boolean;
  showCategory?: boolean;
  showSpecies?: boolean;
  showHabitat?: boolean;
  showDescription?: boolean;
  reducedMotion?: boolean;
}

export const AnimalCardVariant: React.FC<AnimalCardVariantProps> = ({
  animal,
  onPress,
  layout,
  density,
  showImages,
  highlightStatus,
  showCategory = true,
  showSpecies = true,
  showHabitat = true,
  showDescription = true,
  reducedMotion = false
}) => {
  const { colors, spacing, typography, borderRadius } = useTheme();

  const densityMultiplier = useMemo(() => {
    switch (density) {
      case 'compact':
        return 0.85;
      case 'spacious':
        return 1.15;
      default:
        return 1;
    }
  }, [density]);

  const truncateDescription = (text: string, maxLength: number = 120) =>
    text?.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text || '';

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
          borderTopColor: highlightStatus ? colors.forest : colors.border,
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
          height: 180 * densityMultiplier,
          backgroundColor: colors.surfaceVariant
        },
        cardImage: {
          width: '100%',
          height: '100%'
        },
        cardContent: {
          padding: 20 * densityMultiplier
        },
        cardHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: spacing.small
        },
        cardTitle: {
          flex: 1,
          fontSize: 19 * densityMultiplier,
          fontWeight: '800',
          color: colors.text,
          marginRight: spacing.small,
          lineHeight: 26 * densityMultiplier,
          letterSpacing: -0.3
        },
        cardBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.97)',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: colors.leaf,
          gap: 4
        },
        cardBadgeText: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.leaf,
          letterSpacing: 0.5,
          textTransform: 'uppercase'
        },
        cardMetaRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing.tiny,
          gap: spacing.tiny
        },
        cardMetaText: {
          fontSize: typography.fontSize.small * densityMultiplier,
          color: colors.textSecondary
        },
        cardDescription: {
          fontSize: 15 * densityMultiplier,
          color: colors.textSecondary,
          lineHeight: 22 * densityMultiplier,
          marginTop: spacing.small,
          letterSpacing: 0.1
        },

        listContainer: {
          flexDirection: 'row',
          backgroundColor: colors.surface,
          marginHorizontal: spacing.medium,
          marginBottom: spacing.small * densityMultiplier + 4,
          padding: spacing.medium * densityMultiplier,
          borderWidth: 1,
          borderColor: colors.border,
          borderLeftWidth: 5,
          borderLeftColor: colors.forest,
          borderTopWidth: highlightStatus ? 3 : 1,
          borderTopColor: highlightStatus ? colors.forest : colors.border,
          borderRadius: 20,
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
        listImage: {
          width: '100%',
          height: '100%'
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
          fontSize: 17 * densityMultiplier,
          fontWeight: '800',
          color: colors.text,
          letterSpacing: -0.2
        },
        listBadge: {
          fontSize: typography.fontSize.small * 0.85,
          color: colors.primary,
          marginLeft: spacing.small
        },
        listMeta: {
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
          borderTopColor: highlightStatus ? colors.forest : colors.border,
          overflow: 'hidden',
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
        gridImageContainer: {
          width: '100%',
          height: 140 * densityMultiplier,
          backgroundColor: colors.surfaceVariant
        },
        gridImage: {
          width: '100%',
          height: '100%'
        },
        gridContent: {
          padding: spacing.small * densityMultiplier
        },
        gridTitle: {
          fontSize: 16 * densityMultiplier,
          fontWeight: '800',
          color: colors.text,
          marginBottom: spacing.tiny,
          lineHeight: 22 * densityMultiplier,
          letterSpacing: -0.2
        },
        gridMeta: {
          fontSize: typography.fontSize.small * 0.85 * densityMultiplier,
          color: colors.textSecondary
        },

        timelineContainer: {
          flexDirection: 'row',
          marginHorizontal: spacing.medium,
          marginBottom: spacing.large * densityMultiplier
        },
        timelineLine: {
          width: highlightStatus ? 4 : 3,
          backgroundColor: highlightStatus
            ? colors.primary + '60'
            : colors.primary + '40',
          marginHorizontal: spacing.medium,
          position: 'relative',
          borderRadius: 2
        },
        timelineDot: {
          width: 14 * densityMultiplier,
          height: 14 * densityMultiplier,
          borderRadius: 7 * densityMultiplier,
          backgroundColor: colors.primary,
          position: 'absolute',
          top: 0,
          left: -5.5 * densityMultiplier
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
          borderTopColor: highlightStatus ? colors.forest : colors.border,
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
          alignItems: 'center',
          marginBottom: spacing.small
        },
        timelineCategory: {
          fontSize: typography.fontSize.small * densityMultiplier,
          color: colors.primary,
          fontWeight: typography.fontWeight.medium
        },
        timelineTitle: {
          fontSize: 18 * densityMultiplier,
          fontWeight: '800',
          color: colors.text,
          marginBottom: spacing.tiny,
          letterSpacing: -0.3
        },
        timelineMeta: {
          fontSize: typography.fontSize.small * densityMultiplier,
          color: colors.textSecondary,
          marginBottom: spacing.small
        },
        timelineImageContainer: {
          width: '100%',
          height: 150 * densityMultiplier,
          borderRadius: borderRadius.medium,
          overflow: 'hidden',
          backgroundColor: colors.surfaceVariant,
          marginTop: spacing.small
        },
        timelineImage: {
          width: '100%',
          height: '100%'
        }
      }),
    [
      colors,
      spacing,
      typography,
      borderRadius,
      densityMultiplier,
      highlightStatus
    ]
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
          {showImages && animal.image && (
            <View style={styles.cardImageContainer}>
              <Image
                source={{ uri: animal.image }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            </View>
          )}
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {animal.commonNoun}
              </Text>
              <View style={styles.cardBadge}>
                <Ionicons name="paw" size={10} color={colors.primary} />
                <Text style={styles.cardBadgeText}>{animal.category}</Text>
              </View>
            </View>

            {showSpecies && (
              <View style={styles.cardMetaRow}>
                <FontAwesome
                  name="leaf"
                  size={12}
                  color={colors.textSecondary}
                />
                <Text style={styles.cardMetaText}>{animal.specie}</Text>
              </View>
            )}

            {showCategory && (
              <View style={styles.cardMetaRow}>
                <FontAwesome
                  name="bookmark"
                  size={12}
                  color={colors.textSecondary}
                />
                <Text style={styles.cardMetaText}>
                  Clase: {animal.category}
                </Text>
              </View>
            )}

            {showHabitat && animal.habitat && (
              <View style={styles.cardMetaRow}>
                <FontAwesome
                  name="map-marker"
                  size={12}
                  color={colors.textSecondary}
                />
                <Text style={styles.cardMetaText}>
                  Hábitat: {animal.habitat}
                </Text>
              </View>
            )}

            {showDescription && animal.description && (
              <Text style={styles.cardDescription} numberOfLines={3}>
                {truncateDescription(animal.description)}
              </Text>
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
          {showImages && animal.image && (
            <View style={styles.listImageContainer}>
              <Image
                source={{ uri: animal.image }}
                style={styles.listImage}
                resizeMode="contain"
              />
            </View>
          )}
          <View style={styles.listContent}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle} numberOfLines={1}>
                {animal.commonNoun}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16 * densityMultiplier}
                color={colors.textSecondary}
              />
            </View>
            {density !== 'compact' && showSpecies && (
              <Text style={styles.listMeta} numberOfLines={1}>
                {animal.specie}
              </Text>
            )}
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
          {showImages && animal.image && (
            <View style={styles.gridImageContainer}>
              <Image
                source={{ uri: animal.image }}
                style={styles.gridImage}
                resizeMode="cover"
              />
            </View>
          )}
          <View style={styles.gridContent}>
            <Text style={styles.gridTitle} numberOfLines={2}>
              {animal.commonNoun}
            </Text>
            {showSpecies && (
              <Text style={styles.gridMeta} numberOfLines={1}>
                {animal.specie}
              </Text>
            )}
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
            <Text style={styles.timelineCategory}>{animal.category}</Text>
          </View>
          <Text style={styles.timelineTitle}>{animal.commonNoun}</Text>
          {showSpecies && (
            <Text style={styles.timelineMeta}>{animal.specie}</Text>
          )}
          {showDescription && animal.description && (
            <Text
              style={styles.cardDescription}
              numberOfLines={density === 'compact' ? 2 : 3}
            >
              {animal.description}
            </Text>
          )}
          {showImages && animal.image && (
            <View style={styles.timelineImageContainer}>
              <Image
                source={{ uri: animal.image }}
                style={styles.timelineImage}
                resizeMode="cover"
              />
            </View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
};
