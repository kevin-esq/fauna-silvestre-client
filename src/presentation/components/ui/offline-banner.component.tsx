import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@/presentation/contexts/theme.context';
import { useNetworkStatus } from '@/presentation/hooks/common/use-network-status.hook';

export const OfflineBanner: React.FC = () => {
  const theme = useTheme();
  const { isConnected } = useNetworkStatus();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (!isConnected) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [isConnected, slideAnim]);

  if (isConnected) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.warning,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Ionicons
        name="cloud-offline"
        size={20}
        color={theme.colors.background}
      />
      <Text style={[styles.text, { color: theme.colors.background }]}>
        Sin conexión - Los cambios se guardarán localmente
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3
  }
});
