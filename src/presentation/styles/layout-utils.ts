import { ViewStyle, FlexStyle } from 'react-native';

/**
 * Layout utility functions for consistent layouts
 */

/**
 * Flexbox utilities
 */
export const flex = {
  row: { flexDirection: 'row' } as ViewStyle,
  column: { flexDirection: 'column' } as ViewStyle,
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  } as ViewStyle,
  centerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  } as ViewStyle,
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  } as ViewStyle,
  spaceAround: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  } as ViewStyle,
  wrap: { flexWrap: 'wrap' } as FlexStyle,
  flex1: { flex: 1 } as ViewStyle
};

/**
 * Position utilities
 */
export const position = {
  absolute: { position: 'absolute' } as ViewStyle,
  relative: { position: 'relative' } as ViewStyle,
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  } as ViewStyle,
  absoluteCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }]
  } as ViewStyle
};

/**
 * Container utilities
 */
export const container = {
  fill: { flex: 1 } as ViewStyle,
  screen: { flex: 1, backgroundColor: '#fff' } as ViewStyle,
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  } as ViewStyle
};
