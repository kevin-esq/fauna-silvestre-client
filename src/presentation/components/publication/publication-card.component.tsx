import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  useTheme,
  themeVariables
} from '@/presentation/contexts/theme.context';
import {
  PublicationModelResponse,
  PublicationStatus
} from '@/domain/models/publication.models';

const STATUS_CONFIG = {
  rejected: { icon: 'times-circle', colorKey: '--error', label: 'Rechazada' },
  pending: {
    icon: 'hourglass-half',
    colorKey: '--warning',
    label: 'Pendiente'
  },
  accepted: { icon: 'check-circle', colorKey: '--success', label: 'Aceptada' }
} as const;

const ANIMAL_STATE_CONFIG = {
  ALIVE: { icon: 'heartbeat', colorKey: '--success', label: 'Vivo' },
  DEAD: { icon: 'ambulance', colorKey: '--error', label: 'Muerto' }
} as const;

interface StatusRowProps {
  icon: string;
  color: string;
  label: string;
}

const StatusRow = React.memo(({ icon, color, label }: StatusRowProps) => {
  const styles = getStatusRowStyles(color);

  return (
    <View style={styles.container}>
      <FontAwesome name={icon} size={16} color={color} />
      <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </Text>
    </View>
  );
});
StatusRow.displayName = 'StatusRow';

const getStatusRowStyles = (color: string) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8
    },
    text: {
      color,
      marginLeft: 8,
      fontWeight: '600',
      fontSize: 14
    }
  });

interface PublicationImageProps {
  uri?: string;
  commonNoun: string;
  viewMode: 'card' | 'presentation';
  thumbnailPath?: string;
  imgPath?: string;
}

const PublicationImage = React.memo(
  ({
    uri,
    commonNoun,
    viewMode,
    thumbnailPath,
    imgPath
  }: PublicationImageProps) => {
    const { theme } = useTheme();
    const vars = themeVariables(theme);
    const styles = getImageStyles(vars, viewMode);
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showFullImage, setShowFullImage] = useState(false);

    const getImageSource = (useThumbnail = false) => {
      if (useThumbnail && thumbnailPath && thumbnailPath.trim()) {
        console.log(`[PublicationImage] Using thumbnail: ${thumbnailPath}`);
        return { uri: thumbnailPath };
      }

      const imageUri = imgPath && imgPath.trim() ? imgPath : uri;
      if (!imageUri || !imageUri.trim()) {
        return null;
      }

      console.log(`[PublicationImage] Using image source: ${imageUri.substring(0, 50)}...`);

      if (imageUri.startsWith('file://')) {
        return { uri: imageUri };
      }

      if (imageUri.startsWith('data:')) {
        return { uri: imageUri };
      }

      if (imageUri.length > 100 && !imageUri.startsWith('http')) {
        return { uri: `data:image/jpeg;base64,${imageUri}` };
      }

      return { uri: imageUri };
    };

    const thumbnailSource = getImageSource(true);
    const fullImageSource = getImageSource(false);

    const handleThumbnailLoad = () => {
      setIsLoading(false);
      // Cargar imagen completa después de mostrar thumbnail
      if (
        fullImageSource &&
        thumbnailSource &&
        fullImageSource.uri !== thumbnailSource.uri
      ) {
        setTimeout(() => setShowFullImage(true), 100);
      } else {
        setShowFullImage(true);
      }
    };

    const handleImageLoad = () => {
      setIsLoading(false);
      setShowFullImage(true);
    };

    const handleImageError = () => {
      setImageError(true);
      setIsLoading(false);
    };

    if (imageError || (!thumbnailSource && !fullImageSource)) {
      return (
        <View style={styles.placeholder}>
          <Ionicons
            name="image-outline"
            size={viewMode === 'card' ? 40 : 24}
            color="#999"
          />
          <Text style={styles.placeholderText}>
            {commonNoun || 'Imagen no disponible'}
          </Text>
        </View>
      );
    }

    const containerStyle = styles.image;

    return (
      <View style={containerStyle}>
        {isLoading && (
          <View style={[styles.loadingOverlay, containerStyle]}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}

        {/* Mostrar thumbnail primero para carga rápida */}
        {thumbnailSource && !showFullImage && (
          <Image
            source={thumbnailSource}
            style={containerStyle}
            onLoad={handleThumbnailLoad}
            onError={handleImageError}
            resizeMode="cover"
          />
        )}

        {/* Mostrar imagen completa cuando esté lista */}
        {(showFullImage || !thumbnailSource) && fullImageSource && (
          <Image
            source={fullImageSource}
            style={containerStyle}
            onLoad={handleImageLoad}
            onError={handleImageError}
            resizeMode="cover"
          />
        )}
      </View>
    );
  }
);
PublicationImage.displayName = 'PublicationImage';

const getImageStyles = (
  vars: Record<string, string>,
  viewMode: 'card' | 'presentation'
) =>
  StyleSheet.create({
    image: {
      width: '100%',
      height: viewMode === 'card' ? 180 : 300,
      backgroundColor: vars['--surface-variant']
    },
    placeholder: {
      width: '100%',
      height: viewMode === 'card' ? 180 : 300,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: vars['--surface-variant']
    },
    placeholderText: {
      marginTop: 8,
      fontSize: 14,
      color: '#999',
      textAlign: 'center'
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      zIndex: 1
    }
  });

interface PublicationContentProps {
  publication: PublicationModelResponse;
  status: PublicationStatus;
}

const PublicationContent = React.memo(
  ({ publication, status }: PublicationContentProps) => {
    const { theme } = useTheme();
    const vars = themeVariables(theme);
    const styles = getContentStyles();

    const { commonNoun, description, animalState, location } = publication;

    const statusData = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    const animalData =
      ANIMAL_STATE_CONFIG[animalState as keyof typeof ANIMAL_STATE_CONFIG] ??
      ANIMAL_STATE_CONFIG.ALIVE;

    return (
      <View style={styles.container}>
        <Text
          style={[styles.title, { color: vars['--text'] }]}
          numberOfLines={2}
        >
          {commonNoun}
        </Text>
        <Text
          style={[styles.description, { color: vars['--text-secondary'] }]}
          numberOfLines={3}
        >
          {description}
        </Text>

        <StatusRow
          icon={statusData.icon}
          color={vars[statusData.colorKey]}
          label={statusData.label}
        />
        <StatusRow
          icon={animalData.icon}
          color={vars[animalData.colorKey]}
          label={animalData.label}
        />
        {location && (
          <StatusRow
            icon="map-marker"
            color={vars['--info']}
            label={location}
          />
        )}
      </View>
    );
  }
);
PublicationContent.displayName = 'PublicationContent';

const getContentStyles = () =>
  StyleSheet.create({
    container: {
      marginTop: 4
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 8
    },
    description: {
      fontSize: 14,
      marginBottom: 12
    }
  });

interface ReviewButtonsProps {
  actions: {
    onApprove: () => void;
    onReject: () => void;
  };
}

const ReviewButtons = React.memo(({ actions }: ReviewButtonsProps) => {
  const { theme } = useTheme();
  const vars = themeVariables(theme);
  const styles = getReviewButtonStyles();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: vars['--error'] }]}
        onPress={actions.onReject}
      >
        <Text style={styles.buttonText}>Rechazar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: vars['--success'] }]}
        onPress={actions.onApprove}
      >
        <Text style={styles.buttonText}>Aprobar</Text>
      </TouchableOpacity>
    </View>
  );
});
ReviewButtons.displayName = 'ReviewButtons';

const getReviewButtonStyles = () =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#eee',
      paddingTop: 12
    },
    button: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      minWidth: 80,
      alignItems: 'center'
    },
    buttonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 14
    }
  });

interface PublicationCardProps {
  publication: PublicationModelResponse;
  status: PublicationStatus;
  onPress?: () => void;
  reviewActions?: {
    onApprove: () => void;
    onReject: () => void;
  };
  viewMode?: 'card' | 'presentation';
}

const PublicationCard = React.memo(
  ({
    publication,
    onPress,
    reviewActions,
    viewMode = 'card',
    status
  }: PublicationCardProps) => {
    const { theme } = useTheme();
    const vars = themeVariables(theme);
    const styles = getMainCardStyles(vars);

    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <PublicationImage
          uri={publication.img}
          commonNoun={publication.commonNoun}
          viewMode={viewMode}
          thumbnailPath={publication.thumbnailPath}
          imgPath={publication.imgPath}
        />
        <View style={styles.contentWrapper}>
          <PublicationContent publication={publication} status={status} />
          {reviewActions && <ReviewButtons actions={reviewActions} />}
        </View>
      </TouchableOpacity>
    );
  }
);
PublicationCard.displayName = 'PublicationCard';

const getMainCardStyles = (vars: Record<string, string>) =>
  StyleSheet.create({
    card: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      elevation: 4,
      shadowColor: vars['--surface-variant'],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      backgroundColor: vars['--surface']
    },
    contentWrapper: {
      padding: 16
    }
  });

export default React.memo(PublicationCard);
