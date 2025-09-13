import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/presentation/contexts/theme.context';
import ImageSkeleton from './image-skeleton.component';

interface PublicationSkeletonProps {
  viewMode?: 'card' | 'list';
  style?: object;
}

const PublicationSkeleton: React.FC<PublicationSkeletonProps> = ({
  viewMode = 'card',
  style
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false
        })
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E1E9EE', '#F5F7FA']
  });

  const SkeletonLine: React.FC<{
    width: string | number;
    height?: number;
    marginBottom?: number;
  }> = ({ width, height = 12, marginBottom = 8 }) => (
    <Animated.View
      style={[
        styles.skeletonLine,
        {
          width,
          height,
          marginBottom,
          backgroundColor,
          borderRadius: height / 2
        } as unknown as ViewStyle
      ]}
    />
  );

  if (viewMode === 'list') {
    return (
      <View
        style={[
          styles.listContainer,
          { backgroundColor: theme.colors.surface },
          style
        ]}
      >
        <ImageSkeleton width={80} height={80} borderRadius={8} />
        <View style={styles.listContent}>
          <SkeletonLine width="70%" height={16} marginBottom={6} />
          <SkeletonLine width="50%" height={12} marginBottom={4} />
          <SkeletonLine width="90%" height={10} marginBottom={4} />
          <SkeletonLine width="60%" height={10} marginBottom={0} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.cardContainer,
        { backgroundColor: theme.colors.surface },
        style
      ]}
    >
      <ImageSkeleton width={100} height={160} borderRadius={12} />

      <View style={styles.cardContent}>
        {/* Título */}
        <SkeletonLine width="80%" height={18} marginBottom={8} />

        {/* Estado */}
        <SkeletonLine width="40%" height={14} marginBottom={6} />

        {/* Descripción */}
        <SkeletonLine width="100%" height={12} marginBottom={4} />
        <SkeletonLine width="85%" height={12} marginBottom={4} />
        <SkeletonLine width="60%" height={12} marginBottom={8} />

        {/* Ubicación */}
        <SkeletonLine width="70%" height={12} marginBottom={0} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  listContainer: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center'
  },
  cardContent: {
    marginTop: 12
  },
  skeletonLine: {
    backgroundColor: '#E1E9EE'
  }
});

export default React.memo(PublicationSkeleton);
