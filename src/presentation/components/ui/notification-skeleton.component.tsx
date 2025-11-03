import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/presentation/contexts/theme.context';

interface NotificationSkeletonProps {
  count?: number;
}

const NotificationSkeleton: React.FC<NotificationSkeletonProps> = ({
  count = 3
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
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
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7]
  });

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.medium,
      marginBottom: theme.spacing.small,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.surfaceVariant
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.small
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.xlarge * 2,
      backgroundColor: theme.colors.surfaceVariant,
      marginRight: theme.spacing.small
    },
    headerContent: {
      flex: 1
    },
    title: {
      height: 16,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.small,
      marginBottom: theme.spacing.tiny,
      width: '60%'
    },
    time: {
      height: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.small,
      width: '30%'
    },
    message: {
      height: 14,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.small,
      marginBottom: theme.spacing.tiny
    },
    messageLast: {
      width: '70%'
    }
  });

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View key={index} style={[styles.container, { opacity }]}>
          <View style={styles.header}>
            <View style={styles.icon} />
            <View style={styles.headerContent}>
              <View style={styles.title} />
              <View style={styles.time} />
            </View>
          </View>
          <View style={styles.message} />
          <View style={[styles.message, styles.messageLast]} />
        </Animated.View>
      ))}
    </>
  );
};

export default React.memo(NotificationSkeleton);
