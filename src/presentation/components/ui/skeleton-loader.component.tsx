// skeleton-loader.component.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  DimensionValue
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  Easing
} from 'react-native-reanimated';

interface SkeletonLoaderProps {
  count?: number;
  height?: number;
  width?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  duration?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 1,
  height = 20,
  width = '100%',
  borderRadius = 4,
  style,
  duration = 1000
}) => {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [duration, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1], [0.3, 0.7]);
    return {
      opacity
    };
  });

  const renderSkeletons = () => {
    return Array.from({ length: count }).map((_, index) => {
      const styles = createStyles(height, width, borderRadius, count, index);
      return (
        <Animated.View
          key={index}
          style={[styles.skeleton, animatedStyle, style]}
        />
      );
    });
  };

  return <View style={{ width: '100%' }}>{renderSkeletons()}</View>;
};

const createStyles = (
  height: number,
  width: DimensionValue | undefined,
  borderRadius: number,
  count: number,
  index: number
) =>
  StyleSheet.create({
    skeleton: {
      backgroundColor: '#E1E9EE',
      overflow: 'hidden',
      height,
      width,
      borderRadius,
      marginBottom: index < count - 1 ? 8 : undefined
    }
  });

export default SkeletonLoader;
