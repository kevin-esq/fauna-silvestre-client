import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  Pressable
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AnimalModelResponse } from '../../../domain/models/animal.models';
import { useTheme, Theme } from '../../contexts/theme.context';
import { createStyles } from './animal-card.styles';

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
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageReloadCount, setImageReloadCount] = useState(0);

    // Memoizar la URI de la imagen para evitar recreaciones innecesarias
    const imageUri = useMemo(
      () =>
        animal.image
          ? `${animal.image}?reload=${imageReloadCount}&t=${Date.now()}`
          : null,
      [animal.image, imageReloadCount]
    );

    const handleDelete = useCallback(() => {
      Alert.alert(
        '🗑️ Confirmar eliminación',
        `¿Estás seguro de que deseas eliminar "${animal.commonNoun}"?\n\nEsta acción no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => onDelete(animal.catalogId.toString())
          }
        ]
      );
    }, [animal.catalogId, animal.commonNoun, onDelete]);

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
              size={56}
              color={theme.colors.placeholder}
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
                android_ripple={{ color: theme.colors.forest, radius: 20 }}
              >
                <Ionicons
                  name="refresh"
                  size={16}
                  color={theme.colors.forest}
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
              <ActivityIndicator size="large" color={theme.colors.forest} />
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
            android_ripple={{ color: 'rgba(0, 122, 51, 0.1)' }}
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
                        size={18}
                        color={theme.colors.textOnPrimary}
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
                      size={18}
                      color={theme.colors.textOnPrimary}
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
            android_ripple: { color: 'rgba(0, 122, 51, 0.05)' }
          }
        : {};

    return (
      <CardWrapper style={styles.animalCard} {...cardProps}>
        {renderImageContainer()}

        <View style={styles.animalCardContent}>
          <AnimalHeader
            animal={animal}
            theme={theme}
            styles={styles}
            onEdit={onEdit}
            onDelete={handleDelete}
            onImageEdit={onImageEdit}
            onViewDetails={onViewDetails}
            showImageEditButton={showImageEditButton}
            showNameInHeader={!animal.image || imageError}
          />

          <AnimalDescription description={animal.description} styles={styles} />

          <AnimalMetadata animal={animal} theme={theme} styles={styles} />

          <AnimalInfoChips animal={animal} theme={theme} styles={styles} />
        </View>
      </CardWrapper>
    );
  }
);

// Componente separado para la insignia de categoría
const CategoryBadge = React.memo<{
  category: string;
  styles: ReturnType<typeof createStyles>;
}>(({ category, styles }) => (
  <View style={styles.animalImageBadge}>
    <Text style={styles.animalImageBadgeText}>{category}</Text>
  </View>
));

// Componente separado para el encabezado del animal
const AnimalHeader = React.memo<{
  animal: AnimalModelResponse;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
  onEdit: (animal: AnimalModelResponse) => void;
  onDelete: () => void;
  onImageEdit: (animal: AnimalModelResponse) => void;
  onViewDetails?: (animal: AnimalModelResponse) => void;
  showImageEditButton: boolean;
  showNameInHeader: boolean;
}>(
  ({
    animal,
    theme,
    styles,
    onEdit,
    onDelete,
    onImageEdit,
    onViewDetails,
    showImageEditButton,
    showNameInHeader
  }) => (
    <View style={styles.animalHeader}>
      <View style={styles.animalInfo}>
        {showNameInHeader && (
          <Text style={styles.animalName}>🦎 {animal.commonNoun}</Text>
        )}

        <View style={styles.animalSpecies}>
          <Ionicons name="leaf" size={16} color={theme.colors.earth} />
          <Text
            style={[styles.animalSpeciesText, { color: theme.colors.earth }]}
          >
            {animal.specie}
          </Text>
        </View>

        {showNameInHeader && (
          <View style={styles.animalCategoryContainer}>
            <Text style={styles.animalCategory}>📂 {animal.category}</Text>
          </View>
        )}
      </View>

      <AnimalActions
        animal={animal}
        theme={theme}
        styles={styles}
        onEdit={onEdit}
        onDelete={onDelete}
        onImageEdit={onImageEdit}
        onViewDetails={onViewDetails}
        showImageEditButton={showImageEditButton}
      />
    </View>
  )
);

// Componente separado para las acciones
const AnimalActions = React.memo<{
  animal: AnimalModelResponse;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
  onEdit: (animal: AnimalModelResponse) => void;
  onDelete: () => void;
  onImageEdit: (animal: AnimalModelResponse) => void;
  onViewDetails?: (animal: AnimalModelResponse) => void;
  showImageEditButton: boolean;
}>(({ animal, theme, styles, onEdit, onDelete, onImageEdit }) => (
  <View style={styles.animalActions}>
    <Pressable
      style={[styles.actionButton, styles.editButton]}
      onPress={() => onEdit(animal)}
      accessibilityRole="button"
      accessibilityLabel={`Editar ${animal.commonNoun}`}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', radius: 24 }}
    >
      <Ionicons name="pencil" size={20} color={theme.colors.textOnPrimary} />
    </Pressable>

    <Pressable
      style={[styles.actionButton, styles.imageButton]}
      onPress={() => onImageEdit(animal)}
      accessibilityRole="button"
      accessibilityLabel={`Editar imagen de ${animal.commonNoun}`}
      android_ripple={{ color: 'rgba(0, 122, 51, 0.2)', radius: 24 }}
    >
      <Ionicons name="camera" size={20} color={theme.colors.forest} />
    </Pressable>

    <Pressable
      style={[styles.actionButton, styles.deleteButton]}
      onPress={onDelete}
      accessibilityRole="button"
      accessibilityLabel={`Eliminar ${animal.commonNoun}`}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', radius: 24 }}
    >
      <Ionicons name="trash" size={20} color={theme.colors.textOnPrimary} />
    </Pressable>
  </View>
));

// Componente separado para la descripción
const AnimalDescription = React.memo<{
  description?: string;
  styles: ReturnType<typeof createStyles>;
}>(({ description, styles }) => (
  <Text style={styles.animalDescription} numberOfLines={3}>
    {description || '📝 Sin descripción disponible para este animal.'}
  </Text>
));

// Componente separado para los metadatos
const AnimalMetadata = React.memo<{
  animal: AnimalModelResponse;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}>(({ animal, theme, styles }) => (
  <View style={styles.animalMetadata}>
    <View style={styles.animalStats}>
      <View style={styles.animalStatItem}>
        <Ionicons name="location" size={16} color={theme.colors.water} />
        <Text style={styles.animalStatText}>
          {animal.habitat || 'Hábitat no especificado'}
        </Text>
      </View>
    </View>

    <View style={styles.animalIdBadge}>
      <Text style={styles.animalIdText}>ID: {animal.catalogId}</Text>
    </View>
  </View>
));

// Componente mejorado para los chips de información
const AnimalInfoChips = React.memo<{
  animal: AnimalModelResponse;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}>(({ animal, theme, styles }) => {
  const infoItems = useMemo(
    () =>
      [
        {
          icon: 'restaurant',
          emoji: '🍃',
          label: 'Alimentación',
          value: animal.feeding,
          color: theme.colors.leaf
        },
        {
          icon: 'heart',
          emoji: '💝',
          label: 'Reproducción',
          value: animal.reproduction,
          color: theme.colors.error
        },
        {
          icon: 'map',
          emoji: '🗺️',
          label: 'Distribución',
          value: animal.distribution,
          color: theme.colors.water
        }
      ].filter(item => item.value && item.value.trim().length > 0),
    [animal.feeding, animal.reproduction, animal.distribution, theme.colors]
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

// Asignar nombres para debugging
AnimalCard.displayName = 'AnimalCard';
CategoryBadge.displayName = 'CategoryBadge';
AnimalHeader.displayName = 'AnimalHeader';
AnimalActions.displayName = 'AnimalActions';
AnimalDescription.displayName = 'AnimalDescription';
AnimalMetadata.displayName = 'AnimalMetadata';
AnimalInfoChips.displayName = 'AnimalInfoChips';

export default AnimalCard;
