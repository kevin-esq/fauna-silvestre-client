import React, { useCallback, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Pressable,
  Dimensions,
  Animated
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AnimalModelResponse } from '../../../domain/models/animal.models';
import {
  ThemeColors,
  ThemeIconSizes,
  useTheme
} from '@/presentation/contexts/theme.context';
import { createStyles } from './animal-card.styles';
import CustomModal from '@/presentation/components/ui/custom-modal.component';

const { width } = Dimensions.get('window');

interface AnimalCardProps {
  animal: AnimalModelResponse;
  onEdit: (animal: AnimalModelResponse) => void;
  onDelete: (catalogId: string) => void;
  onImageEdit: (animal: AnimalModelResponse) => void;
  onViewDetails?: (animal: AnimalModelResponse) => void;
  showImageEditButton?: boolean;
  onPress?: (animal: AnimalModelResponse) => void;
}

const AnimalCard = React.memo<AnimalCardProps>(
  ({
    animal,
    onEdit,
    onDelete,
    onImageEdit,
    onViewDetails,
    showImageEditButton = true,
    onPress
  }) => {
    const { theme, colors, iconSizes, typography } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageReloadCount, setImageReloadCount] = useState(0);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const imageUri = useMemo(
      () =>
        animal.image
          ? `${animal.image}?reload=${imageReloadCount}&t=${Date.now()}`
          : null,
      [animal.image, imageReloadCount]
    );

    const handlePressIn = useCallback(() => {
      if (onPress || onViewDetails) {
        Animated.spring(scaleAnim, {
          toValue: 0.98,
          useNativeDriver: true,
          tension: 100,
          friction: 8
        }).start();
      }
    }, [onPress, onViewDetails, scaleAnim]);

    const handlePressOut = useCallback(() => {
      if (onPress || onViewDetails) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 7
        }).start();
      }
    }, [onPress, onViewDetails, scaleAnim]);

    const handleCardPress = useCallback(() => {
      if (onPress) {
        onPress(animal);
      } else if (onViewDetails) {
        onViewDetails(animal);
      }
    }, [animal, onPress, onViewDetails]);

    const handleDeletePress = useCallback(() => {
      setDeleteModalVisible(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
      setIsDeleting(true);
      Animated.timing(opacityAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true
      }).start();

      try {
        await onDelete(animal.catalogId.toString());
        setDeleteModalVisible(false);
      } catch (error) {
        console.error('Error al eliminar:', error);
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }).start();
      } finally {
        setIsDeleting(false);
      }
    }, [animal.catalogId, onDelete, opacityAnim]);

    const handleCloseDeleteModal = useCallback(() => {
      if (!isDeleting) {
        setDeleteModalVisible(false);
      }
    }, [isDeleting]);

    const handleImageLoad = useCallback(() => {
      setImageLoading(false);
      setImageError(false);
    }, []);

    const handleImageError = useCallback(() => {
      setImageLoading(false);
      setImageError(true);
    }, []);

    const handleImageReload = useCallback(() => {
      setImageReloadCount(prev => prev + 1);
      setImageLoading(true);
      setImageError(false);
    }, []);

    const animatedStyle = {
      transform: [{ scale: scaleAnim }],
      opacity: opacityAnim
    };

    const CardWrapper = onPress || onViewDetails ? Pressable : View;
    const cardProps =
      onPress || onViewDetails
        ? {
            onPress: handleCardPress,
            onPressIn: handlePressIn,
            onPressOut: handlePressOut,
            disabled: isDeleting,
            android_ripple: { color: colors.primary + '05' },
            accessibilityRole: 'button' as const,
            accessibilityLabel: `Ver detalles de ${animal.commonNoun}`
          }
        : {};

    return (
      <>
        <Animated.View style={animatedStyle}>
          <CardWrapper style={styles.card} {...cardProps}>
            <View style={styles.imageContainer}>
              {!animal.image || imageError ? (
                <Pressable
                  style={styles.emptyImageContainer}
                  onPress={() => showImageEditButton && onImageEdit(animal)}
                  disabled={!showImageEditButton}
                >
                  <Ionicons
                    name="camera-outline"
                    size={48}
                    color={colors.placeholder}
                  />
                  <Text style={styles.emptyImageText}>
                    {showImageEditButton ? 'Agregar foto' : 'Sin imagen'}
                  </Text>
                  {imageError && (
                    <Pressable
                      style={styles.retryButton}
                      onPress={handleImageReload}
                    >
                      <Ionicons
                        name="refresh"
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={styles.retryButtonText}>Reintentar</Text>
                    </Pressable>
                  )}
                </Pressable>
              ) : (
                <>
                  <Image
                    source={{ uri: imageUri! }}
                    style={styles.image}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    resizeMode="cover"
                  />
                  {imageLoading && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                  )}
                </>
              )}

              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{animal.category}</Text>
              </View>
            </View>

            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title} numberOfLines={1}>
                    {animal.commonNoun}
                  </Text>
                  <View style={styles.specieContainer}>
                    <Ionicons
                      name="leaf-outline"
                      size={14}
                      color={colors.forest}
                    />
                    <Text style={styles.specie} numberOfLines={1}>
                      {animal.specie}
                    </Text>
                  </View>
                </View>

                <QuickActions
                  animal={animal}
                  onEdit={onEdit}
                  onImageEdit={onImageEdit}
                  onDelete={handleDeletePress}
                  showImageEdit={showImageEditButton}
                  styles={styles}
                  colors={colors}
                  iconSizes={iconSizes}
                />
              </View>

              {animal.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {animal.description}
                </Text>
              )}

              <View style={styles.metadataRow}>
                <View style={styles.metadataItem}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={colors.water}
                  />
                  <Text style={styles.metadataText} numberOfLines={1}>
                    {animal.habitat || 'Sin hábitat'}
                  </Text>
                </View>

                <View style={styles.idBadge}>
                  <Text style={styles.idText}>ID: {animal.catalogId}</Text>
                </View>
              </View>

              <InfoChips animal={animal} styles={styles} colors={colors} />
            </View>
          </CardWrapper>
        </Animated.View>

        <CustomModal
          isVisible={deleteModalVisible}
          onClose={handleCloseDeleteModal}
          title="Eliminar Animal"
          centered
          icon={
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: theme.borderRadius.xlarge,
                backgroundColor: colors.error + '20',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons
                name="trash-outline"
                size={iconSizes.large}
                color={colors.error}
              />
            </View>
          }
          showFooter
          footerAlignment="end"
          buttons={[
            {
              label: 'Cancelar',
              onPress: handleCloseDeleteModal,
              variant: 'outline',
              disabled: isDeleting
            },
            {
              label: 'Eliminar',
              onPress: handleConfirmDelete,
              variant: 'danger',
              loading: isDeleting
            }
          ]}
          animationInTiming={200}
          animationOutTiming={200}
          maxWidth={width - 40}
          size="full"
          closeOnBackdrop={!isDeleting}
          closeOnBackButton={!isDeleting}
        >
          <Text
            style={{
              fontSize: typography.fontSize.medium + 1,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: typography.lineHeight.medium + 2,
              marginBottom: typography.fontSize.small
            }}
          >
            ¿Estás seguro de que deseas eliminar{' '}
            <Text style={{ fontWeight: 'bold', color: colors.text }}>
              "{animal.commonNoun}"
            </Text>
            ?
          </Text>
          <Text
            style={{
              fontSize: typography.fontSize.small,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: typography.lineHeight.small + 2
            }}
          >
            Esta acción no se puede deshacer. PROXIMAMENTE SE IMPLEMENTARÁ LA
            FUNCIONALIDAD en el backend.
          </Text>
        </CustomModal>
      </>
    );
  }
);

const QuickActions = React.memo<{
  animal: AnimalModelResponse;
  onEdit: (animal: AnimalModelResponse) => void;
  onImageEdit: (animal: AnimalModelResponse) => void;
  onDelete: () => void;
  showImageEdit: boolean;
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
  iconSizes: ThemeIconSizes;
}>(
  ({
    animal,
    onEdit,
    onImageEdit,
    onDelete,
    showImageEdit,
    styles,
    colors,
    iconSizes
  }) => {
    const editScale = useRef(new Animated.Value(1)).current;
    const imageScale = useRef(new Animated.Value(1)).current;
    const deleteScale = useRef(new Animated.Value(1)).current;

    const animateButton = (scale: Animated.Value) => {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 0.85,
          useNativeDriver: true,
          tension: 100,
          friction: 8
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 7
        })
      ]).start();
    };

    return (
      <View style={styles.actionsContainer}>
        <Animated.View style={{ transform: [{ scale: editScale }] }}>
          <Pressable
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {
              animateButton(editScale);
              onEdit(animal);
            }}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', radius: 20 }}
          >
            <Ionicons
              name="create-outline"
              size={iconSizes.medium - 4}
              color={colors.textOnPrimary}
            />
          </Pressable>
        </Animated.View>

        {showImageEdit && (
          <Animated.View style={{ transform: [{ scale: imageScale }] }}>
            <Pressable
              style={[styles.actionButton, styles.imageButton]}
              onPress={() => {
                animateButton(imageScale);
                onImageEdit(animal);
              }}
              android_ripple={{ color: colors.primary + '20', radius: 20 }}
            >
              <Ionicons
                name="camera-outline"
                size={iconSizes.medium - 4}
                color={colors.primary}
              />
            </Pressable>
          </Animated.View>
        )}

        <Animated.View style={{ transform: [{ scale: deleteScale }] }}>
          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => {
              animateButton(deleteScale);
              onDelete();
            }}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', radius: 20 }}
          >
            <Ionicons
              name="trash-outline"
              size={iconSizes.medium - 4}
              color={colors.textOnPrimary}
            />
          </Pressable>
        </Animated.View>
      </View>
    );
  }
);

const InfoChips = React.memo<{
  animal: AnimalModelResponse;
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
}>(({ animal, styles, colors }) => {
  const infoItems = useMemo(
    () =>
      [
        {
          icon: 'restaurant-outline',
          label: 'Alimentación',
          value: animal.feeding,
          color: colors.leaf
        },
        {
          icon: 'heart-outline',
          label: 'Reproducción',
          value: animal.reproduction,
          color: colors.error
        },
        {
          icon: 'map-outline',
          label: 'Distribución',
          value: animal.distribution,
          color: colors.water
        }
      ].filter(item => item.value && item.value.trim().length > 0),
    [animal, colors]
  );

  if (infoItems.length === 0) return null;

  const truncateText = (text: string, maxLength: number = 15) =>
    text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

  return (
    <View style={styles.infoChipsContainer}>
      {infoItems.slice(0, 3).map((item, index) => (
        <View
          key={`${item.label}-${index}`}
          style={[styles.infoChip, { borderColor: item.color }]}
        >
          <Ionicons name={item.icon} size={16} color={item.color} />
          <Text
            style={[styles.infoChipText, { color: item.color }]}
            numberOfLines={1}
          >
            {truncateText(item.value)}
          </Text>
        </View>
      ))}
    </View>
  );
});

AnimalCard.displayName = 'AnimalCard';
QuickActions.displayName = 'QuickActions';
InfoChips.displayName = 'InfoChips';

export default AnimalCard;
