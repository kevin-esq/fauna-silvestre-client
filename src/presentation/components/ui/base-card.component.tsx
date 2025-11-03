import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform
} from 'react-native';
import { useTheme } from '@/presentation/contexts/theme.context';

export interface BaseCardProps {
  /**
   * Card header content (e.g., image, avatar, title row)
   */
  header?: React.ReactNode;

  /**
   * Main card content
   */
  children: React.ReactNode;

  /**
   * Card footer content (e.g., actions, metadata)
   */
  footer?: React.ReactNode;

  /**
   * onPress handler - makes card touchable if provided
   */
  onPress?: () => void;

  /**
   * Custom card styles
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Custom header container styles
   */
  headerStyle?: StyleProp<ViewStyle>;

  /**
   * Custom content container styles
   */
  contentStyle?: StyleProp<ViewStyle>;

  /**
   * Custom footer container styles
   */
  footerStyle?: StyleProp<ViewStyle>;

  /**
   * Disable shadow elevation
   */
  noShadow?: boolean;

  /**
   * Enable left border indicator
   */
  leftBorderColor?: string;

  /**
   * Card test ID for testing
   */
  testID?: string;
}

/**
 * Generic Base Card component following clean architecture principles
 * 
 * Provides consistent card layout with header, content, and footer slots.
 * Handles shadows, borders, and touch interactions in a reusable way.
 * 
 * @example
 * <BaseCard
 *   header={<Image source={...} />}
 *   onPress={handlePress}
 *   leftBorderColor={colors.primary}
 * >
 *   <Text>Card Content</Text>
 * </BaseCard>
 */
export const BaseCard: React.FC<BaseCardProps> = React.memo(
  ({
    header,
    children,
    footer,
    onPress,
    style,
    headerStyle,
    contentStyle,
    footerStyle,
    noShadow = false,
    leftBorderColor,
    testID
  }) => {
    const { colors, spacing, borderRadius } = useTheme();

    const cardStyles = StyleSheet.create({
      container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.large,
        borderWidth: 1,
        borderColor: colors.border,
        borderLeftWidth: leftBorderColor ? 4 : 1,
        borderLeftColor: leftBorderColor || colors.border,
        overflow: 'hidden',
        ...(!noShadow && Platform.select({
          ios: {
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8
          },
          android: {
            elevation: 4
          }
        }))
      },
      headerContainer: {
        overflow: 'hidden'
      },
      contentContainer: {
        padding: spacing.medium
      },
      footerContainer: {
        padding: spacing.medium,
        paddingTop: 0
      }
    });

    const CardContainer = onPress ? TouchableOpacity : View;
    const containerProps = onPress
      ? {
          onPress,
          activeOpacity: 0.7,
          testID
        }
      : { testID };

    return (
      <CardContainer
        {...containerProps}
        style={[cardStyles.container, style]}
      >
        {header && (
          <View style={[cardStyles.headerContainer, headerStyle]}>
            {header}
          </View>
        )}

        <View style={[cardStyles.contentContainer, contentStyle]}>
          {children}
        </View>

        {footer && (
          <View style={[cardStyles.footerContainer, footerStyle]}>
            {footer}
          </View>
        )}
      </CardContainer>
    );
  }
);

BaseCard.displayName = 'BaseCard';
