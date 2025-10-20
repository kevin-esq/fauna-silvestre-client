import { Theme } from '@/presentation/contexts/theme.context';
import React, { useEffect, useRef } from 'react';
import {
  Animated as RNAnimated,
  Text,
  TouchableOpacity,
  Platform
} from 'react-native';

const FloatingActionButton = ({
  onPress,
  theme
}: {
  onPress: () => void;
  theme: Theme;
}) => {
  const scaleAnim = useRef(new RNAnimated.Value(0)).current;
  const rotateAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true
      }),
      RNAnimated.timing(rotateAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      })
    ]).start();
  }, [scaleAnim, rotateAnim]);

  const handlePressIn = () => {
    RNAnimated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    RNAnimated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <RNAnimated.View
      style={[
        {
          position: 'absolute',
          right: -8,
          top: -8,
          transform: [{ scale: scaleAnim }, { rotate }]
        }
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          borderColor: theme.colors.surface,
          ...Platform.select({
            ios: {
              shadowColor: theme.colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8
            },
            android: {
              elevation: 8
            }
          })
        }}
        activeOpacity={1}
        accessibilityLabel="Crear nueva publicación"
        accessibilityRole="button"
      >
        <Text
          style={{
            color: theme.colors.textOnPrimary,
            fontSize: 28,
            fontWeight: '700',
            marginTop: -2
          }}
        >
          +
        </Text>
      </TouchableOpacity>
    </RNAnimated.View>
  );
};

export default React.memo(FloatingActionButton);
