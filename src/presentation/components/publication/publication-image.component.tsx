import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ViewStyle
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  useTheme,
  themeVariables
} from '@/presentation/contexts/theme.context';

interface PublicationImageProps {
  uri?: string;
  commonNoun: string;
  viewMode: 'card' | 'presentation';
  style?: ViewStyle;
}

const PublicationImage = React.memo(
  ({ uri, commonNoun, viewMode, style }: PublicationImageProps) => {
    const { theme } = useTheme();
    const vars = themeVariables(theme);
    const styles = getImageStyles(vars, viewMode);
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleImageLoad = () => {
      setIsLoading(false);
    };

    const handleImageError = () => {
      setImageError(true);
      setIsLoading(false);
    };

    if (imageError || !uri || !uri.trim()) {
      return (
        <View style={[styles.placeholder, style]}>
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

    return (
      <View style={[styles.image, style]}>
        {isLoading && (
          <View style={[styles.loadingOverlay, StyleSheet.absoluteFill]}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}

        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          onLoad={handleImageLoad}
          onError={handleImageError}
          resizeMode="cover"
        />
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
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      zIndex: 1
    }
  });

export default PublicationImage;
