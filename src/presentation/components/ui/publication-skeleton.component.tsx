import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/presentation/contexts/theme.context';
import ImageSkeleton from './image-skeleton.component';
import { ITEM_HEIGHT } from '@/presentation/components/publication/publication-card.component';

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
      <ImageSkeleton width="100%" height={180} borderRadius={0} />

      <View style={styles.cardContent}>
        <SkeletonLine width="80%" height={18} marginBottom={8} />

        <SkeletonLine width="100%" height={14} marginBottom={4} />
        <SkeletonLine width="85%" height={14} marginBottom={12} />

        <View style={styles.statusRow}>
          <View style={styles.statusIcon} />
          <SkeletonLine width="30%" height={14} marginBottom={8} />
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusIcon} />
          <SkeletonLine width="25%" height={14} marginBottom={8} />
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusIcon} />
          <SkeletonLine width="60%" height={14} marginBottom={0} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: ITEM_HEIGHT
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
    padding: 16,
    flex: 1
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  statusIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E1E9EE',
    marginRight: 8
  },
  skeletonLine: {
    backgroundColor: '#E1E9EE'
  }
});

export default React.memo(PublicationSkeleton);
