import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  Animated
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DraftPublication } from '../../../domain/models/draft.models';
import { useTheme } from '@/presentation/contexts/theme.context';
import { createStyles } from './draft-card.styles';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DraftCardProps {
  draft: DraftPublication;
  onPress: () => void;
  onDelete: () => void;
  onSubmit: () => void;
}

export const DraftCard = React.memo<DraftCardProps>(
  ({ draft, onPress, onDelete, onSubmit }) => {
    const { theme, colors, iconSizes } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 7
      }).start();
    }, [scaleAnim]);

    const handlePress = useCallback(() => {
      onPress();
    }, [onPress]);

    const handleDelete = useCallback(() => {
      onDelete();
    }, [onDelete]);

    const handleSubmit = useCallback(() => {
      onSubmit();
    }, [onSubmit]);

    const handleImageLoad = useCallback(() => {
      setImageLoading(false);
      setImageError(false);
    }, []);

    const handleImageError = useCallback(() => {
      setImageLoading(false);
      setImageError(true);
    }, []);

    const renderStatusBadge = useCallback(() => {
      let icon: string;
      let color: string;
      let label: string;

      switch (draft.status) {
        case 'draft':
          icon = 'create-outline';
          color = theme.colors.water;
          label = 'Borrador';
          break;
        case 'pending_upload':
          icon = 'time-outline';
          color = theme.colors.warning;
          label = 'Pendiente';
          break;
        case 'uploading':
          icon = 'cloud-upload-outline';
          color = theme.colors.primary;
          label = 'Subiendo';
          break;
        case 'failed':
          icon = 'alert-circle-outline';
          color = theme.colors.error;
          label = 'Fallido';
          break;
        default:
          icon = 'help-circle-outline';
          color = theme.colors.text;
          label = 'Desconocido';
      }

      return (
        <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={iconSizes.small} color={color} />
          <Text style={[styles.statusText, { color }]}>{label}</Text>
        </View>
      );
    }, [draft.status, theme.colors, styles, iconSizes]);

    const animatedStyle = {
      transform: [{ scale: scaleAnim }]
    };

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          style={styles.card}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{ color: colors.primary + '10' }}
          accessibilityRole="button"
          accessibilityLabel={`Borrador: ${draft.description || 'Sin descripción'}`}
          accessibilityHint="Toca para editar el borrador"
        >
          <View style={styles.imageContainer}>
            {draft.imageUri && !imageError ? (
              <>
                <Image
                  source={{ uri: draft.imageUri }}
                  style={styles.image}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  resizeMode="cover"
                />
                {imageLoading && (
                  <View
                    style={[styles.imagePlaceholder, { position: 'absolute' }]}
                  >
                    <ActivityIndicator size="large" color={colors.forest} />
                  </View>
                )}
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="image-outline"
                  size={iconSizes.xxlarge}
                  color={colors.placeholder}
                />
              </View>
            )}
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {renderStatusBadge()}
                <Text style={styles.date} numberOfLines={1}>
                  {format(new Date(draft.updatedAt), 'dd MMM yyyy, HH:mm', {
                    locale: es
                  })}
                </Text>
              </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {draft.description || 'Sin descripción'}
            </Text>

            {(draft.selectedAnimal || draft.customAnimalName) && (
              <View style={styles.animalInfo}>
                <Ionicons
                  name="paw"
                  size={iconSizes.small}
                  color={colors.forest}
                />
                <Text style={styles.animalName} numberOfLines={1}>
                  {draft.selectedAnimal?.commonNoun || draft.customAnimalName}
                </Text>
              </View>
            )}

            {draft.status === 'failed' && draft.lastError && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={iconSizes.small}
                  color={colors.error}
                />
                <Text style={styles.errorText} numberOfLines={2}>
                  {draft.lastError}
                </Text>
              </View>
            )}

            <View style={styles.actions}>
              {draft.status === 'draft' && (
                <Pressable
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                  android_ripple={{ color: 'rgba(255, 255, 255, 0.3)' }}
                  accessibilityRole="button"
                  accessibilityLabel="Enviar borrador"
                >
                  <Ionicons
                    name="cloud-upload"
                    size={iconSizes.small}
                    color={colors.textOnPrimary}
                  />
                  <Text style={styles.submitButtonText}>Enviar</Text>
                </Pressable>
              )}

              {draft.status === 'failed' && (
                <Pressable
                  style={[
                    styles.button,
                    styles.submitButton,
                    styles.retryButton
                  ]}
                  onPress={handleSubmit}
                  android_ripple={{ color: colors.warning + '30' }}
                  accessibilityRole="button"
                  accessibilityLabel="Reintentar envío"
                >
                  <Ionicons
                    name="refresh"
                    size={iconSizes.small}
                    color={colors.warning}
                  />
                  <Text
                    style={[styles.submitButtonText, { color: colors.warning }]}
                  >
                    Reintentar
                  </Text>
                </Pressable>
              )}

              {draft.status === 'uploading' && (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="small" color={colors.forest} />
                  <Text style={styles.uploadingText}>Subiendo...</Text>
                </View>
              )}

              <Pressable
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}
                android_ripple={{ color: colors.error + '30' }}
                accessibilityRole="button"
                accessibilityLabel="Eliminar borrador"
              >
                <Ionicons
                  name="trash"
                  size={iconSizes.small}
                  color={colors.error}
                />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }
);

DraftCard.displayName = 'DraftCard';
