import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback
} from 'react';
import { View, ActivityIndicator, Text, Image, Animated } from 'react-native';
import { useTheme } from '@/presentation/contexts/theme.context';
import { createStyles } from '@/presentation/screens/home/splash-screen.styles';
import SplashIcon from '../../../assets/splash-icon.png';

interface AnimatedDotsProps {
  color: string;
}

const AnimatedDots = React.memo<AnimatedDotsProps>(({ color }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <Text style={{ color }}>{dots}</Text>;
});

AnimatedDots.displayName = 'AnimatedDots';

const SplashScreen = React.memo(() => {
  const { theme, colors } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const scaleValue = useRef(new Animated.Value(0.95)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  const startAnimations = useCallback(() => {
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true
        }),
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 1500,
          useNativeDriver: true
        })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 2000,
          useNativeDriver: true
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, [scaleValue, pulseValue, fadeValue]);

  useEffect(() => {
    startAnimations();
  }, [startAnimations]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeValue,
            transform: [{ scale: scaleValue }]
          }
        ]}
      >
        <Animated.View
          style={[
            styles.glowEffect,
            {
              transform: [{ scale: pulseValue }]
            }
          ]}
        />

        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseValue }]
            }
          ]}
        />

        <Image source={SplashIcon} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      <Animated.View style={{ opacity: fadeValue }}>
        <Text style={styles.appName}>k'aaxil ba'alilche'</Text>
        <Text style={styles.subtitle}>Fauna Silvestre</Text>
      </Animated.View>

      <ActivityIndicator
        size="large"
        color={colors.forest}
        style={styles.spinner}
      />

      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Cargando
          <AnimatedDots color={colors.text} />
        </Text>
      </View>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Versión 1.0.0</Text>
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>MAYASUR</Text>
        </View>
      </View>
    </View>
  );
});

SplashScreen.displayName = 'SplashScreen';

export default SplashScreen;
