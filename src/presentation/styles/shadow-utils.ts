import { Platform, ViewStyle } from 'react-native';

/**
 * Shadow utility functions for consistent shadows across the app
 * Handles both iOS (shadowColor, shadowOffset, etc.) and Android (elevation)
 */

export interface ShadowConfig {
  shadowColor?: string;
  elevation?: number;
}

/**
 * Small shadow - for subtle depth (cards, buttons)
 */
export const shadowSmall = (
  shadowColor: string = '#000'
): Partial<ViewStyle> => ({
  ...Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4
    },
    android: {
      elevation: 2
    }
  })
});

/**
 * Medium shadow - for moderate depth (modals, dropdowns)
 */
export const shadowMedium = (
  shadowColor: string = '#000'
): Partial<ViewStyle> => ({
  ...Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8
    },
    android: {
      elevation: 4
    }
  })
});

/**
 * Large shadow - for significant depth (FABs, prominent elements)
 */
export const shadowLarge = (
  shadowColor: string = '#000'
): Partial<ViewStyle> => ({
  ...Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 12
    },
    android: {
      elevation: 8
    }
  })
});

/**
 * Custom shadow with specific configuration
 */
export const shadowCustom = (
  config: {
    offset?: { width: number; height: number };
    opacity?: number;
    radius?: number;
    elevation?: number;
    color?: string;
  }
): Partial<ViewStyle> => ({
  ...Platform.select({
    ios: {
      shadowColor: config.color || '#000',
      shadowOffset: config.offset || { width: 0, height: 2 },
      shadowOpacity: config.opacity ?? 0.1,
      shadowRadius: config.radius || 4
    },
    android: {
      elevation: config.elevation || 2
    }
  })
});

/**
 * No shadow - removes all shadow properties
 */
export const shadowNone = (): Partial<ViewStyle> => ({
  ...Platform.select({
    ios: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0
    },
    android: {
      elevation: 0
    }
  })
});
