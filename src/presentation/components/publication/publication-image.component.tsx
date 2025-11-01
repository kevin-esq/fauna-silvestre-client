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
  themeVariables,
  ThemeVariablesType
} from '@/presentation/contexts/theme.context';

interface PublicationImageProps {
  uri?: string;
  commonNoun: string;
  viewMode: 'card' | 'presentation' | 'list';
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
          style={[
            StyleSheet.absoluteFill,
            viewMode === 'list' && { resizeMode: 'contain' }
          ]}
          onLoad={handleImageLoad}
          onError={handleImageError}
          resizeMode={viewMode === 'list' ? 'contain' : 'cover'}
        />
      </View>
    );
  }
);
PublicationImage.displayName = 'PublicationImage';

const getImageStyles = (
  vars: ThemeVariablesType,
  viewMode: 'card' | 'presentation' | 'list'
) =>
  StyleSheet.create({
    image: {
      width: '100%',
      minHeight: viewMode === 'card' ? 180 : 300,
      flex: 1,
      backgroundColor: vars['--surface-variant']
    },
    placeholder: {
      width: '100%',
      minHeight: viewMode === 'card' ? 180 : 300,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: vars['--surface-variant']
    },
    placeholderText: {
      marginTop: vars['--spacing-small'],
      fontSize: vars['--font-size-medium'],
      color: vars['--text-secondary'],
      textAlign: 'center',
      opacity: 0.7
    },
    loadingOverlay: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: vars['--overlay'],
      zIndex: 1
    }
  });

export default PublicationImage;
