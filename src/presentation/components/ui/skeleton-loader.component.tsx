import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/theme.context';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = React.memo(
  ({ width = '100%', height = 20, borderRadius = 4, style, children }) => {
    const { theme } = useTheme();
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      );

      animation.start();

      return () => animation.stop();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7]
    });

    const skeletonStyle = [
      styles.skeleton,
      {
        width,
        height,
        borderRadius,
        backgroundColor: theme.colors.surfaceVariant,
        opacity
      },
      style
    ];

    if (children) {
      return <View style={style}>{children}</View>;
    }

    return <Animated.View style={skeletonStyle} />;
  }
);

export const StatCardSkeleton: React.FC = React.memo(() => {
  const { theme } = useTheme();

  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <SkeletonLoader
        width={60}
        height={32}
        borderRadius={6}
        style={styles.statNumber}
      />
      <SkeletonLoader
        width={80}
        height={16}
        borderRadius={4}
        style={styles.statLabel}
      />
    </View>
  );
});

export const AnimalCardSkeleton: React.FC = React.memo(() => {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.animalCard, { backgroundColor: theme.colors.surface }]}
    >
      <SkeletonLoader width={80} height={80} borderRadius={12} />
      <View style={styles.animalInfo}>
        <SkeletonLoader
          width="70%"
          height={18}
          borderRadius={4}
          style={styles.animalName}
        />
        <SkeletonLoader
          width="50%"
          height={14}
          borderRadius={4}
          style={styles.animalCategory}
        />
      </View>
    </View>
  );
});

export const UserListSkeleton: React.FC = React.memo(() => {
  const { theme } = useTheme();

  return (
    <View style={[styles.userItem, { backgroundColor: theme.colors.surface }]}>
      <SkeletonLoader width={48} height={48} borderRadius={24} />
      <View style={styles.userInfo}>
        <SkeletonLoader
          width="60%"
          height={16}
          borderRadius={4}
          style={styles.userName}
        />
        <SkeletonLoader
          width="80%"
          height={14}
          borderRadius={4}
          style={styles.userEmail}
        />
      </View>
    </View>
  );
});

export const QuickActionSkeleton: React.FC = React.memo(() => {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.quickActionLeft}>
        <SkeletonLoader width={40} height={40} borderRadius={10} />
        <SkeletonLoader
          width={120}
          height={16}
          borderRadius={4}
          style={styles.quickActionText}
        />
      </View>
      <SkeletonLoader width={20} height={20} borderRadius={4} />
    </View>
  );
});

const styles = StyleSheet.create({
  skeleton: {},

  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 14,
    alignItems: 'center',
    elevation: 2
  },
  statNumber: {
    marginBottom: 8
  },
  statLabel: {},

  animalCard: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2
  },
  animalInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center'
  },
  animalName: {
    marginBottom: 8
  },
  animalCategory: {},

  userItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center'
  },
  userName: {
    marginBottom: 6
  },
  userEmail: {},

  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2
  },
  quickActionLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quickActionText: {
    marginLeft: 16
  }
});

SkeletonLoader.displayName = 'SkeletonLoader';
StatCardSkeleton.displayName = 'StatCardSkeleton';
AnimalCardSkeleton.displayName = 'AnimalCardSkeleton';
UserListSkeleton.displayName = 'UserListSkeleton';
QuickActionSkeleton.displayName = 'QuickActionSkeleton';
