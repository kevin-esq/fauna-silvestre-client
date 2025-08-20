import React, { useRef, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera } from 'react-native-vision-camera';
import { useCamera } from '../../hooks/use-camera.hook';
import { useRecentImages } from '../../hooks/use-recent-images.hook';
import { TopControls } from '../../components/camera/top-controls.component';
import { CaptureButton } from '../../components/camera/capture-button.component';
import { GalleryButton } from '../../components/camera/gallery-button.component';
import { ThumbnailList } from '../../components/camera/thumbnail-list.component';
import { Modalize } from 'react-native-modalize';
import CustomImagePickerScreen from './custom-image-picker-screen';
import { useLoading } from '../../contexts/loading.context';
import { themeVariables, useTheme } from '../../contexts/theme.context';
import { useGallery } from '../../hooks/use-gallery.hook';
import Location, {
  type Location as LocationType,
} from 'react-native-get-location';
import { createStyles } from './camera-gallery-screen.styles';
import { useNavigationActions } from '../../navigation/navigation-provider';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface PermissionMessageProps {
  styles: ReturnType<typeof createStyles>;
  title: string;
  message: string;
  onRequestPermission: () => void;
}

interface LoadingProps {
  styles: ReturnType<typeof createStyles>;
}

const PermissionMessage = ({
  styles,
  title,
  message,
  onRequestPermission,
}: PermissionMessageProps) => (
  <View style={styles.loadingContainer}>
    <Ionicons
      name="camera-off"
      size={60}
      color="#fff"
      style={{ marginBottom: 20 }}
    />
    <Text style={styles.loadingText}>{title}</Text>
    <Text style={styles.loadingText}>{message}</Text>
    <TouchableOpacity
      style={styles.permissionButton}
      onPress={onRequestPermission}
      activeOpacity={0.7}
    >
      <Text style={styles.permissionButtonText}>Habilitar Cámara</Text>
    </TouchableOpacity>
  </View>
);

const Loading = ({ styles }: LoadingProps) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#ffffff" />
    <Text style={styles.loadingText}>Preparando cámara...</Text>
  </View>
);

export const CameraGalleryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const width = Dimensions.get('window').width;
  const { navigate } = useNavigationActions();
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
    checkPermissions,
  } = useCamera();

  const { openUri } = useGallery();
  const recentImages = useRecentImages();
  const [activeThumbnail, setActiveThumbnail] = useState<string | null>(null);

  const galleryModalRef = useRef<Modalize>(null);

  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables, width), [variables, width]);

  useEffect(() => {
    if (isCameraReady) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isCameraReady, fadeAnim]);

  useEffect(() => {
    if (isCapturing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 },
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCapturing, pulseAnim]);

  const handleCapture = async () => {
    showLoading();
    try {
      const photo = await takePhoto();
      if (!photo) {
        Alert.alert('Error', 'No se pudo capturar la foto.');
        return;
      }
      const location = await Location.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });
      navigate('ImagePreview', { imageUri: `file://${photo.path}`, location });
    } catch (error) {
      console.error('Error al capturar:', error);
      Alert.alert('Error', 'Ocurrió un error al capturar la foto.');
    } finally {
      hideLoading();
    }
  };

  const handleOpenGallery = () => galleryModalRef.current?.open();
  const handleConfirm = (uri: string, location: LocationType) => {
    galleryModalRef.current?.close();
    navigate('ImagePreview', { imageUri: uri, location });
  };
  const handleCancel = () => galleryModalRef.current?.close();

  const handleThumbnailPress = (uri: string) => {
    setActiveThumbnail(uri);
    openUri(uri);
  };

  if (!hasPermissions) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PermissionMessage
          styles={styles}
          title="Permisos requeridos"
          message="Para usar todas las funciones de la cámara, necesitamos acceso a la cámara y al almacenamiento."
          onRequestPermission={() => checkPermissions(['camera'])}
        />
      </SafeAreaView>
    );
  }

  if (!device) return <Loading styles={styles} />;

  if (activeThumbnail) {
    console.log(activeThumbnail);
  }

  return (
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
            enableZoomGesture={true}
          />
        )}

        <View style={styles.controlsOverlay}>
          <TopControls
            onBack={() => navigate('HomeTabs')}
            onToggleFlash={toggleFlashMode}
            onFlip={flipCamera}
            flashMode={flashMode}
            showFlash={cameraPosition === 0}
            style={{ marginTop: insets.top }}
          />

          <View
            style={[
              styles.bottomControls,
              { paddingBottom: insets.bottom + 20 },
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
                  { transform: [{ scale: pulseAnim }] },
                  isCapturing && { borderColor: '#ff4757' },
                ]}
              />
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <CaptureButton onPress={handleCapture} isActive={isCapturing} />
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
                bottom: insets.bottom + 100,
              },
            ]}
          >
            <ThumbnailList
              uris={recentImages}
              onSelect={handleThumbnailPress}
              //activeUri={activeThumbnail}
              //itemStyle={styles.thumbnailItem}
              //activeItemStyle={styles.thumbnailItemActive}
            />
          </View>
        )}
      </Animated.View>

      <Modalize
        ref={galleryModalRef}
        adjustToContentHeight={false}
        modalHeight={Dimensions.get('window').height * 0.85}
        scrollViewProps={{
          scrollEnabled: true,
          nestedScrollEnabled: true,
        }}
        panGestureEnabled={true}
        withOverlay={true}
        overlayStyle={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
        handlePosition="inside"
        handleStyle={{ backgroundColor: variables['--text-secondary'] }}
        childrenStyle={styles.modalContent}
      >
        <CustomImagePickerScreen
          theme={theme}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </Modalize>
    </SafeAreaView>
  );
};
