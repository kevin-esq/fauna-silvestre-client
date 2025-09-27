import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export const useCameraAnimations = (
  isCameraReady: boolean,
  isCapturing: boolean,
  isShowingFreeze: boolean
) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const freezeFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCameraReady) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start();
    }
  }, [isCameraReady, fadeAnim]);

  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation | undefined;

    if (isCapturing) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true
          })
        ]),
        { iterations: 3 }
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation?.stop();
        pulseAnim.setValue(1);
      };
    }

    return undefined;
  }, [isCapturing, pulseAnim]);

  useEffect(() => {
    if (isShowingFreeze) {
      Animated.timing(freezeFadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(freezeFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [isShowingFreeze, freezeFadeAnim]);

  return {
    fadeAnim,
    pulseAnim,
    freezeFadeAnim
  };
};
