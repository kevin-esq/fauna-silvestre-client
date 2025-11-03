import React, { useState, useCallback } from 'react';
import {
  Image,
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@/presentation/contexts/theme.context';

export interface CardImageProps {
  /**
   * Image URI
   */
  uri: string;

  /**
   * Image height
   */
  height?: number;

  /**
   * onPress handler for image
   */
  onPress?: () => void;

  /**
   * Placeholder component while loading
   */
  placeholder?: React.ReactNode;

  /**
   * Show loading indicator
   */
  showLoading?: boolean;
}

/**
 * Reusable card image component with loading states
 *
 * Handles image loading, errors, and optional touch interaction.
 * Provides consistent image UI across all card types.
 *
 * @example
 * <CardImage
 *   uri={imageUri}
 *   height={200}
 *   onPress={handleImagePress}
 * />
 */
export const CardImage: React.FC<CardImageProps> = React.memo(
  ({ uri, height = 200, onPress, placeholder, showLoading = true }) => {
    const { colors } = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleLoad = useCallback(() => {
      setLoading(false);
      setError(false);
    }, []);

    const handleError = useCallback(() => {
      setLoading(false);
      setError(true);
    }, []);

    const styles = StyleSheet.create({
      container: {
        height,
        backgroundColor: colors.surfaceVariant,
        overflow: 'hidden'
      },
      image: {
        width: '100%',
        height: '100%'
      },
      loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surfaceVariant
      },
      errorContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surfaceVariant
      }
    });

    const content = (
      <>
        {!error && (
          <Image
            source={{ uri }}
            style={styles.image}
            onLoad={handleLoad}
            onError={handleError}
            resizeMode="cover"
          />
        )}

        {loading && showLoading && !error && (
          <View style={styles.loadingContainer}>
            {placeholder || (
              <ActivityIndicator size="large" color={colors.primary} />
            )}
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons
              name="image-outline"
              size={48}
              color={colors.textSecondary}
            />
          </View>
        )}
      </>
    );

    if (onPress) {
      return (
        <TouchableOpacity
          style={styles.container}
          onPress={onPress}
          activeOpacity={0.9}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return <View style={styles.container}>{content}</View>;
  }
);

CardImage.displayName = 'CardImage';
