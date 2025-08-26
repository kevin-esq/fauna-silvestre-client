import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback
} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Animated,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
  BackHandler,
  Modal
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera } from 'react-native-vision-camera';
import { useCamera } from '../../hooks/use-camera.hook';
import { useRecentImages } from '../../hooks/use-recent-images.hook';
import { TopControls } from '../../components/camera/top-controls.component';
import { CaptureButton } from '../../components/camera/capture-button.component';
import { GalleryButton } from '../../components/camera/gallery-button.component';
import { ThumbnailList } from '../../components/camera/thumbnail-list.component';
import CustomImagePickerScreen from './custom-image-picker-screen';
import { useLoading } from '../../contexts/loading.context';
import { themeVariables, useTheme } from '../../contexts/theme.context';
import Location, {
  type Location as LocationType
} from 'react-native-get-location';
import { createStyles } from './camera-gallery-screen.styles';
import { useNavigationActions } from '../../navigation/navigation-provider';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface PermissionMessageProps {
  styles: ReturnType<typeof createStyles>;
  title: string;
  message: string;
  onRequestPermission: () => void;
  isLoading?: boolean;
}

interface LoadingProps {
  styles: ReturnType<typeof createStyles>;
}

const PermissionMessage = React.memo<PermissionMessageProps>(
  ({ styles, title, message, onRequestPermission, isLoading = false }) => (
    <View style={styles.loadingContainer}>
      <Ionicons
        name="camera-off"
        size={60}
        color="#fff"
        style={{ marginBottom: 20 }}
      />
      <Text style={styles.loadingText}>{title}</Text>
      <Text style={[styles.loadingText, { fontSize: 14, marginTop: 10 }]}>
        {message}
      </Text>
      <TouchableOpacity
        style={[styles.permissionButton, isLoading && { opacity: 0.7 }]}
        onPress={onRequestPermission}
        activeOpacity={0.7}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.permissionButtonText}>Habilitar Cámara</Text>
        )}
      </TouchableOpacity>
    </View>
  )
);

PermissionMessage.displayName = 'PermissionMessage';

const Loading = React.memo<LoadingProps>(({ styles }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#ffffff" />
    <Text style={styles.loadingText}>Preparando cámara...</Text>
  </View>
));

Loading.displayName = 'Loading';

export const CameraGalleryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { navigate, goBack } = useNavigationActions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { showLoading, hideLoading } = useLoading();

  const {
    cameraRef,
    device,
    isCameraReady,
    isCapturing,
    cameraPosition,
    flashMode,
    hasPermissions,
    takePhoto,
    flipCamera,
    toggleFlashMode,
    checkPermissions
  } = useCamera();

  const recentImages = useRecentImages();

  // Estados locales
  const [activeThumbnail, setActiveThumbnail] = useState<string | null>(null);
  const [isPermissionLoading, setIsPermissionLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  // Manejar botón de retroceso para Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isModalOpen) {
          setIsModalOpen(false);
          return true;
        }
        goBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [isModalOpen, goBack]);

  // Animación de cámara lista
  useEffect(() => {
    if (isCameraReady) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start();
    }
  }, [isCameraReady, fadeAnim]);

  // Animación de pulso para captura
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

  // Handlers
  const handleRequestPermissions = useCallback(async () => {
    if (isPermissionLoading) return;

    setIsPermissionLoading(true);
    try {
      await checkPermissions(['camera']);
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert(
        'Error',
        'No se pudieron solicitar los permisos. Por favor, verifica la configuración de la aplicación.'
      );
    } finally {
      setIsPermissionLoading(false);
    }
  }, [isPermissionLoading, checkPermissions]);

  const handleCapture = useCallback(async () => {
    if (isCapturing) return;

    showLoading();
    try {
      const photo = await takePhoto();
      if (!photo) {
        Alert.alert('Error', 'No se pudo capturar la foto.');
        return;
      }

      let location: LocationType | null = null;
      try {
        location = await Location.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        });
      } catch (locationError) {
        console.warn('Could not get location:', locationError);
      }

      navigate('ImagePreview', {
        imageUri: `file://${photo.path}`,
        location: location || undefined
      });
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error al capturar la foto. Por favor, inténtalo de nuevo.'
      );
    } finally {
      hideLoading();
    }
  }, [isCapturing, takePhoto, navigate, showLoading, hideLoading]);

  const handleOpenGallery = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleConfirm = useCallback(
    (uri: string, location: LocationType) => {
      setIsModalOpen(false);
      navigate('ImagePreview', { imageUri: uri, location });
    },
    [navigate]
  );

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleThumbnailPress = useCallback(
    (uri: string) => {
      try {
        setActiveThumbnail(uri);
        // Navegar directamente a ImagePreview con la imagen seleccionada
        navigate('ImagePreview', {
          imageUri: uri,
          location: undefined
        });
      } catch (error) {
        console.error('Error opening thumbnail:', error);
        Alert.alert('Error', 'No se pudo abrir la imagen.');
      } finally {
        // Limpiar selección después de un tiempo
        setTimeout(() => {
          setActiveThumbnail(null);
        }, 200);
      }
    },
    [navigate]
  );

  const handleBackPress = useCallback(() => {
    navigate('HomeTabs');
  }, [navigate]);

  // Estado de permisos denegados
  if (!hasPermissions) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar
            barStyle="light-content"
            translucent
            backgroundColor="transparent"
          />
          <PermissionMessage
            styles={styles}
            title="Permisos requeridos"
            message="Para usar todas las funciones de la cámara, necesitamos acceso a la cámara y al almacenamiento."
            onRequestPermission={handleRequestPermissions}
            isLoading={isPermissionLoading}
          />
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  // Cámara no disponible
  if (!device) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar
            barStyle="light-content"
            translucent
            backgroundColor="transparent"
          />
          <Loading styles={styles} />
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />

        <Animated.View style={[styles.full, { opacity: fadeAnim }]}>
          {isCameraReady && (
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={true}
              photo
              enableZoomGesture
            />
          )}

          <View style={styles.controlsOverlay}>
            <TopControls
              onBack={handleBackPress}
              onToggleFlash={toggleFlashMode}
              onFlip={flipCamera}
              flashMode={flashMode}
              showFlash={cameraPosition === 0}
              style={{ marginTop: insets.top }}
            />

            <View
              style={[
                styles.bottomControls,
                { paddingBottom: Math.max(insets.bottom, 20) }
              ]}
            >
              <GalleryButton
                onPress={handleOpenGallery}
                style={styles.buttonPressed}
              />

              <View style={styles.captureButtonContainer}>
                <Animated.View
                  style={[
                    styles.captureRing,
                    {
                      transform: [{ scale: pulseAnim }],
                      borderColor: isCapturing
                        ? '#ff4757'
                        : 'rgba(255,255,255,0.8)'
                    }
                  ]}
                />
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <CaptureButton
                    onPress={handleCapture}
                    isActive={isCapturing}
                    disabled={isCapturing}
                  />
                </Animated.View>
              </View>

              <View style={{ width: 40 }} />
            </View>
          </View>

          {recentImages.length > 0 && (
            <View
              style={[
                styles.thumbnailContainer,
                {
                  bottom: Math.max(insets.bottom + 120, 140)
                }
              ]}
            >
              <ThumbnailList
                uris={recentImages}
                onSelect={handleThumbnailPress}
                activeUri={activeThumbnail}
              />
            </View>
          )}
        </Animated.View>

        {/* Modal reemplazado con Modal nativo para evitar conflictos */}
        <Modal
          visible={isModalOpen}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCancel}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <CustomImagePickerScreen
              theme={theme}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};
