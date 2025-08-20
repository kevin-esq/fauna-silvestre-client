import React, { useState, useEffect, useMemo } from 'react';
import { View, ActivityIndicator, Text, Image, Animated } from 'react-native';
import { useTheme, themeVariables } from '../../contexts/theme.context';
import { createStyles } from './splash-screen.styles';
import SplashIcon from '../../../assets/splash-icon.png';

// Componente para animación de puntos (...)
const AnimatedDots = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <Text>{dots}</Text>;
};

const SplashScreen = () => {
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  // Animación para el logo
  const scaleValue = useMemo(() => new Animated.Value(0.95), []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleValue]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleValue }] }]}>
        <Image 
          source={SplashIcon}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={[styles.glowEffect, { backgroundColor: variables['--primary'] }]} />
      </Animated.View>

      <Text style={styles.appName}>
        FAUNA SILVESTRE
      </Text>
      
      <ActivityIndicator 
        size="large" 
        color={variables['--primary']} 
        style={styles.spinner}
      />
      
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Cargando
          <AnimatedDots />
        </Text>
      </View>
    </View>
  );
};

export default SplashScreen;