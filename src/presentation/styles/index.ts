/**
 * Style utilities for consistent styling across the app
 *
 * Usage:
 * import { shadowMedium, flex, spacing } from '@/presentation/styles';
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     ...flex.centerRow,
 *     ...shadowMedium(colors.shadow),
 *     padding: spacing(16)
 *   }
 * });
 */

export * from './shadow-utils';
export * from './layout-utils';

/**
 * Spacing utility function
 * Provides consistent spacing based on 4px grid
 */
export const spacing = (multiplier: number): number => multiplier * 1;

/**
 * Common spacing values
 */
export const spacingValues = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48
} as const;
