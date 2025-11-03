import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  Modal,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import {
  NavigationProp,
  useNavigation,
  useRoute
} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createStyles } from '@/presentation/screens/media/image-preview-screen.styles';
import {
  useTheme,
  themeVariables
} from '@/presentation/contexts/theme.context';
import { RootStackParamList } from '@/presentation/navigation/navigation.types';
import type { Location } from 'react-native-get-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageViewer from 'react-native-image-zoom-viewer';

const { height: screenHeight } = Dimensions.get('window');

const ImagePreviewScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { imageUri, location } = route.params as {
    imageUri: string;
    location: Location;
  };

  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  const { theme, isDark } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(
    () => createStyles(variables, insets),
    [variables, insets]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const formatLocation = React.useCallback(
    (loc: Location | null | undefined): string => {
      try {
        if (
          !loc ||
          typeof loc.latitude !== 'number' ||
          typeof loc.longitude !== 'number'
        ) {
          return 'Ubicación no disponible';
        }
        return `${loc.latitude.toFixed(6)}°, ${loc.longitude.toFixed(6)}°`;
      } catch (error) {
        console.warn('Error formateando ubicación:', error);
        return 'Ubicación no disponible';
      }
    },
    []
  );

  const getLocationAccuracy = React.useCallback(
    (loc: Location | null | undefined): string => {
      try {
        if (!loc || typeof loc.accuracy !== 'number') {
          return '';
        }
        return `Precisión: ±${Math.round(loc.accuracy)}m`;
      } catch (error) {
        console.warn('Error obteniendo precisión:', error);
        return '';
      }
    },
    []
  );

  useEffect(() => {
    const animateEntry = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true
        })
      ]).start();
    };

    animateEntry();
  }, [fadeAnim, slideAnim]);

  const toggleControls = React.useCallback(() => {
    const newShowControls = !showControls;
    setShowControls(newShowControls);
    Animated.timing(fadeAnim, {
      toValue: newShowControls ? 1 : 0.3,
      duration: 200,
      useNativeDriver: true
    }).start();
  }, [showControls, fadeAnim]);

  const animateButtonPress = React.useCallback(
    (callback: () => void) => {
      Animated.sequence([
        Animated.timing(buttonScaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(buttonScaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start(callback);
    },
    [buttonScaleAnim]
  );

  const handleContinue = React.useCallback(() => {
    if (isLoading) return;

    animateButtonPress(() => {
      setIsLoading(true);
      setTimeout(() => {
        try {
          navigation.navigate('PublicationForm', { imageUri, location });
        } catch (error) {
          console.error('Error navegando:', error);
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    });
  }, [isLoading, animateButtonPress, navigation, imageUri, location]);

  const handleGoBack = React.useCallback(() => {
    if (isLoading) return;

    animateButtonPress(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true
        })
      ]).start(() => {
        try {
          navigation.goBack();
        } catch (error) {
          console.error('Error navegando hacia atrás:', error);
        }
      });
    });
  }, [isLoading, animateButtonPress, fadeAnim, slideAnim, navigation]);

  const renderHeader = React.useCallback(
    () => (
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0.3, 1],
              outputRange: [0.3, 1],
              extrapolate: 'clamp'
            })
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.closeButton, styles.touchableArea]}
          onPress={handleGoBack}
          activeOpacity={0.7}
          disabled={isLoading}
          accessibilityLabel="Cerrar vista previa"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.statusIndicator}>
          <Ionicons name="camera" size={14} color="#FFFFFF" />
          <Text style={styles.statusText}>Vista previa</Text>
        </View>
      </Animated.View>
    ),
    [styles, fadeAnim, handleGoBack, isLoading]
  );

  const renderLocationInfo = React.useCallback(() => {
    const formattedLocation = formatLocation(location);
    const accuracy = getLocationAccuracy(location);

    return (
      <View style={styles.locationContainer}>
        <Ionicons
          name="location"
          size={18}
          color={variables['--primary']}
          style={styles.locationIcon}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.locationLabel}>Ubicación capturada</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {formattedLocation}
          </Text>
          {accuracy ? (
            <Text style={styles.imageInfoText} numberOfLines={1}>
              {accuracy}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }, [location, formatLocation, getLocationAccuracy, styles, variables]);

  const imageUrls = useMemo(() => {
    if (!imageUri || typeof imageUri !== 'string') {
      return [{ url: '' }];
    }
    return [{ url: imageUri }];
  }, [imageUri]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <Animated.View style={[styles.fadeContainer, { opacity: fadeAnim }]}>
        <Modal visible transparent statusBarTranslucent animationType="none">
          <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}>
            <ImageViewer
              imageUrls={imageUrls}
              backgroundColor={isDark ? '#000000' : '#FFFFFF'}
              enableSwipeDown
              onSwipeDown={handleGoBack}
              onClick={toggleControls}
              renderHeader={renderHeader}
            />

            {showControls && (
              <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                {renderLocationInfo()}
                <View style={styles.imageInfo}>
                  <Text style={styles.imageInfoText}>
                    {
                      'Desliza hacia abajo para cerrar • Pellizca para hacer zoom'
                    }
                  </Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={handleGoBack}
                  >
                    <Ionicons
                      name="camera-reverse"
                      size={18}
                      color={variables['--text']}
                    />
                    <Text
                      style={[styles.buttonText, styles.buttonTextSecondary]}
                    >
                      Retomar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary]}
                    onPress={handleContinue}
                  >
                    <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                      Continuar
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={variables['--text-on-primary']}
                      style={styles.buttonIcon}
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </View>
        </Modal>
      </Animated.View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={variables['--primary']} />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default React.memo(ImagePreviewScreen);
