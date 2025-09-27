import React from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';

interface FreezeOverlayProps {
  freezeUri: string | null;
  isVisible: boolean;
  fadeAnim: Animated.Value;
}

export const FreezeOverlay = React.memo<FreezeOverlayProps>(
  ({ freezeUri, isVisible, fadeAnim }) => {
    if (!freezeUri || !isVisible) return null;

    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: fadeAnim,
            zIndex: 10
          }
        ]}
      >
        <Image
          source={{ uri: freezeUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View style={styles.freezeIndicator} />
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  freezeIndicator: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }
});

FreezeOverlay.displayName = 'FreezeOverlay';
