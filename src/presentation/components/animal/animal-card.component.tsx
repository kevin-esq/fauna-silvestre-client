import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Pressable,
  Dimensions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AnimalModelResponse } from '../../../domain/models/animal.models';
import {
  ThemeColors,
  ThemeIconSizes,
  useTheme
} from '../../contexts/theme.context';
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

    const imageUri = useMemo(
      () =>
        animal.image
          ? `${animal.image}?reload=${imageReloadCount}&t=${Date.now()}`
          : null,
      [animal.image, imageReloadCount]
    );

    const handleDeletePress = useCallback(() => {
      setDeleteModalVisible(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
      setIsDeleting(true);
      try {
        await onDelete(animal.catalogId.toString());
        setDeleteModalVisible(false);
      } catch (error) {
        console.error('Error al eliminar:', error);
      } finally {
        setIsDeleting(false);
      }
    }, [animal.catalogId, onDelete]);

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

    const handleCardPress = useCallback(() => {
      if (onPress) {
        onPress(animal);
      }
    }, [animal, onPress]);

    const renderImage = () => {
      if (!animal.image || imageError) {
        return (
          <View
            style={[styles.animalImagePlaceholder, styles.emptyImageContainer]}
          >
            <Ionicons
              name="camera-outline"
              size={iconSizes.xlarge + 8}
              color={colors.placeholder}
            />
            <Text style={styles.emptyImageText}>
              {showImageEditButton
                ? '📸 Toca para agregar imagen'
                : 'Sin imagen disponible'}
            </Text>
            {imageError && (
              <Pressable
                style={styles.retryButton}
                onPress={handleImageReload}
                android_ripple={{ color: colors.primary + '20', radius: 20 }}
              >
                <Ionicons
                  name="refresh"
                  size={iconSizes.small}
                  color={colors.primary}
                />
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </Pressable>
            )}
          </View>
        );
      }

      return (
        <>
          <Image
            source={{ uri: imageUri! }}
            style={styles.animalImage}
            onLoad={handleImageLoad}
            onError={handleImageError}
            resizeMode="cover"
          />
          {imageLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Cargando imagen...</Text>
            </View>
          )}
        </>
      );
    };

    const renderImageContainer = () => {
      const isEmptyImage = !animal.image || imageError;

      if (showImageEditButton && isEmptyImage) {
        return (
          <Pressable
            style={styles.animalImageContainer}
            onPress={() =>
              onViewDetails ? onViewDetails(animal) : onImageEdit(animal)
            }
            accessibilityRole="button"
            accessibilityLabel={
              onViewDetails
                ? 'Ver detalles del animal'
                : 'Agregar imagen del animal'
            }
            android_ripple={{ color: colors.primary + '10' }}
          >
            {renderImage()}
            <CategoryBadge category={animal.category} styles={styles} />
          </Pressable>
        );
      }

      return (
        <View style={styles.animalImageContainer}>
          {renderImage()}
          <CategoryBadge category={animal.category} styles={styles} />
          {!imageError && animal.image && (
            <View style={styles.animalImageOverlay}>
              <View style={styles.imageOverlayContent}>
                <Text style={[styles.animalName, styles.overlayAnimalName]}>
                  🦎 {animal.commonNoun}
                </Text>
                <View style={styles.imageActions}>
                  {showImageEditButton && (
                    <Pressable
                      style={styles.overlayActionButton}
                      onPress={() =>
                        onViewDetails
                          ? onViewDetails(animal)
                          : onImageEdit(animal)
                      }
                      accessibilityRole="button"
                      accessibilityLabel={
                        onViewDetails
                          ? 'Ver detalles del animal'
                          : 'Editar imagen'
                      }
                      android_ripple={{
                        color: 'rgba(255, 255, 255, 0.3)',
                        radius: 20
                      }}
                    >
                      <Ionicons
                        name={onViewDetails ? 'eye' : 'camera'}
                        size={iconSizes.medium - 6}
                        color={colors.textOnPrimary}
                      />
                    </Pressable>
                  )}
                  <Pressable
                    style={styles.overlayActionButton}
                    onPress={handleImageReload}
                    accessibilityRole="button"
                    accessibilityLabel="Recargar imagen"
                    android_ripple={{
                      color: 'rgba(255, 255, 255, 0.3)',
                      radius: 20
                    }}
                  >
                    <Ionicons
                      name="refresh"
                      size={iconSizes.medium - 6}
                      color={colors.textOnPrimary}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      );
    };

    const CardWrapper = onViewDetails || onPress ? Pressable : View;
    const cardProps =
      onViewDetails || onPress
        ? {
            onPress: onViewDetails
              ? () => onViewDetails(animal)
              : handleCardPress,
            accessibilityRole: 'button' as const,
            accessibilityLabel: `Ver detalles de ${animal.commonNoun}`,
            android_ripple: { color: colors.primary + '05' }
          }
        : {};

    return (
      <>
        <CardWrapper style={styles.animalCard} {...cardProps}>
          {renderImageContainer()}

          <View style={styles.animalCardContent}>
            <AnimalHeader
              animal={animal}
              onEdit={onEdit}
              onDelete={handleDeletePress}
              onImageEdit={onImageEdit}
              onViewDetails={onViewDetails}
              showImageEditButton={showImageEditButton}
              showNameInHeader={!animal.image || imageError}
              styles={styles}
              colors={colors}
              iconSizes={iconSizes}
            />

            <AnimalDescription
              description={animal.description}
              styles={styles}
            />

            <AnimalMetadata
              animal={animal}
              iconSize={iconSizes.small}
              styles={styles}
              colors={colors}
            />

            <AnimalInfoChips animal={animal} styles={styles} colors={colors} />
          </View>
        </CardWrapper>

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
                borderRadius: 28,
                backgroundColor: colors.error + '20',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons
                name="trash"
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
            Esta acción no se puede deshacer.
          </Text>
        </CustomModal>
      </>
    );
  }
);

const CategoryBadge = React.memo<{
  category: string;
  styles: ReturnType<typeof createStyles>;
}>(({ category, styles }) => {
  return (
    <View style={styles.animalImageBadge}>
      <Text style={styles.animalImageBadgeText}>{category}</Text>
    </View>
  );
});

const AnimalHeader = React.memo<{
  animal: AnimalModelResponse;
  onEdit: (animal: AnimalModelResponse) => void;
  onDelete: () => void;
  onImageEdit: (animal: AnimalModelResponse) => void;
  onViewDetails?: (animal: AnimalModelResponse) => void;
  showImageEditButton: boolean;
  showNameInHeader: boolean;
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
  iconSizes: ThemeIconSizes;
}>(
  ({
    animal,
    onEdit,
    onDelete,
    onImageEdit,
    onViewDetails,
    showImageEditButton,
    showNameInHeader,
    styles,
    colors,
    iconSizes
  }) => {
    return (
      <View style={styles.animalHeader}>
        <View style={styles.animalInfo}>
          {showNameInHeader && (
            <Text style={styles.animalName}>🦎 {animal.commonNoun}</Text>
          )}

          <View style={styles.animalSpecies}>
            <Ionicons name="leaf" size={iconSizes.small} color={colors.earth} />
            <Text style={styles.animalSpeciesText}>{animal.specie}</Text>
          </View>

          {showNameInHeader && (
            <View style={styles.animalCategoryContainer}>
              <Text style={styles.animalCategory}>📂 {animal.category}</Text>
            </View>
          )}
        </View>

        <AnimalActions
          animal={animal}
          onEdit={onEdit}
          onDelete={onDelete}
          onImageEdit={onImageEdit}
          onViewDetails={onViewDetails}
          showImageEditButton={showImageEditButton}
          styles={styles}
          colors={colors}
          iconSizes={iconSizes}
        />
      </View>
    );
  }
);

const AnimalActions = React.memo<{
  animal: AnimalModelResponse;
  onEdit: (animal: AnimalModelResponse) => void;
  onDelete: () => void;
  onImageEdit: (animal: AnimalModelResponse) => void;
  onViewDetails?: (animal: AnimalModelResponse) => void;
  showImageEditButton: boolean;
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
  iconSizes: ThemeIconSizes;
}>(({ animal, onEdit, onDelete, onImageEdit, styles, colors, iconSizes }) => {
  return (
    <View style={styles.animalActions}>
      <Pressable
        style={[styles.actionButton, styles.editButton]}
        onPress={() => onEdit(animal)}
        accessibilityRole="button"
        accessibilityLabel={`Editar ${animal.commonNoun}`}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', radius: 24 }}
      >
        <Ionicons
          name="pencil"
          size={iconSizes.medium - 4}
          color={colors.textOnPrimary}
        />
      </Pressable>

      <Pressable
        style={[styles.actionButton, styles.imageButton]}
        onPress={() => onImageEdit(animal)}
        accessibilityRole="button"
        accessibilityLabel={`Editar imagen de ${animal.commonNoun}`}
        android_ripple={{ color: colors.primary + '20', radius: 24 }}
      >
        <Ionicons
          name="camera"
          size={iconSizes.medium - 4}
          color={colors.primary}
        />
      </Pressable>

      <Pressable
        style={[styles.actionButton, styles.deleteButton]}
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={`Eliminar ${animal.commonNoun}`}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', radius: 24 }}
      >
        <Ionicons
          name="trash"
          size={iconSizes.medium - 4}
          color={colors.textOnPrimary}
        />
      </Pressable>
    </View>
  );
});

const AnimalDescription = React.memo<{
  description?: string;
  styles: ReturnType<typeof createStyles>;
}>(({ description, styles }) => {
  return (
    <Text style={styles.animalDescription} numberOfLines={3}>
      {description || '📝 Sin descripción disponible para este animal.'}
    </Text>
  );
});

const AnimalMetadata = React.memo<{
  animal: AnimalModelResponse;
  iconSize: number;
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
}>(({ animal, iconSize, styles, colors }) => {
  return (
    <View style={styles.animalMetadata}>
      <View style={styles.animalStats}>
        <View style={styles.animalStatItem}>
          <Ionicons name="location" size={iconSize} color={colors.water} />
          <Text style={styles.animalStatText}>
            {animal.habitat || 'Hábitat no especificado'}
          </Text>
        </View>
      </View>

      <View style={styles.animalIdBadge}>
        <Text style={styles.animalIdText}>ID: {animal.catalogId}</Text>
      </View>
    </View>
  );
});

const AnimalInfoChips = React.memo<{
  animal: AnimalModelResponse;
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
}>(({ animal, styles, colors }) => {
  const infoItems = useMemo(
    () =>
      [
        {
          icon: 'restaurant',
          emoji: '🍃',
          label: 'Alimentación',
          value: animal.feeding,
          color: colors.leaf
        },
        {
          icon: 'heart',
          emoji: '💝',
          label: 'Reproducción',
          value: animal.reproduction,
          color: colors.error
        },
        {
          icon: 'map',
          emoji: '🗺️',
          label: 'Distribución',
          value: animal.distribution,
          color: colors.water
        }
      ].filter(item => item.value && item.value.trim().length > 0),
    [animal.feeding, animal.reproduction, animal.distribution, colors]
  );

  if (infoItems.length === 0) return null;

  const truncateText = (text: string, maxLength: number = 18) =>
    text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

  return (
    <View style={styles.animalInfoChips}>
      {infoItems.slice(0, 2).map((item, index) => (
        <View
          key={`${item.label}-${index}`}
          style={[styles.infoChip, { borderColor: item.color }]}
        >
          <Text style={styles.infoChipEmoji}>{item.emoji}</Text>
          <View style={styles.infoChipContent}>
            <Text style={[styles.infoChipLabel, { color: item.color }]}>
              {item.label}
            </Text>
            <Text
              style={[styles.infoChipText, { color: item.color }]}
              numberOfLines={1}
            >
              {truncateText(item.value)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
});

AnimalCard.displayName = 'AnimalCard';
CategoryBadge.displayName = 'CategoryBadge';
AnimalHeader.displayName = 'AnimalHeader';
AnimalActions.displayName = 'AnimalActions';
AnimalDescription.displayName = 'AnimalDescription';
AnimalMetadata.displayName = 'AnimalMetadata';
AnimalInfoChips.displayName = 'AnimalInfoChips';

export default AnimalCard;
