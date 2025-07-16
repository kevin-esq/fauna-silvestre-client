import React, { useRef, useEffect, useMemo } from 'react';
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
  StyleProp,
  ViewStyle,
  TextStyle,
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomImagePickerScreen from './custom-image-picker-screen';
import { useLoading } from '../../contexts/loading-context';
import { themeVariables, useTheme } from '../../contexts/theme-context';
import { useGallery } from '../../hooks/use-gallery.hook';
import Location from 'react-native-get-location';
import type { Location as LocationType } from 'react-native-get-location';
import { createStyles } from './camera-gallery-screen.styles';

const { width } = Dimensions.get('window');

type StackParamList = {
  ImagePreview: { imageUri: string; location?: LocationType };
  CustomImagePickerScreen: undefined;
};

interface PermissionMessageProps {
  styles: {
    loadingContainer: StyleProp<ViewStyle>;
    loadingText: StyleProp<TextStyle>;
  };
  title: string;
  message: string;
}

interface LoadingProps {
  styles: {
    loadingContainer: StyleProp<ViewStyle>;
    loadingText: StyleProp<TextStyle>;
  };
}


const PermissionMessage = ({ styles, title, message }: PermissionMessageProps) => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>{title}</Text>
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

const Loading = ({ styles }: LoadingProps) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#ffffff" />
    <Text style={styles.loadingText}>Cargando cámara...</Text>
  </View>
);

export const CameraGalleryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { showLoading, hideLoading } = useLoading();

  const {
    cameraRef,
    device,
    isCameraReady,
    isCapturing,
    permissionStatus,
    cameraPosition,
    flashMode,
    takePhoto,
    flipCamera,
    toggleFlashMode,
  } = useCamera();

  const { openUri } = useGallery();
  const recentImages = useRecentImages();

  const galleryModalRef = useRef<Modalize>(null);

  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

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
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
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
      navigation.navigate('ImagePreview', { imageUri: `file://${photo.path}`, location });
    } catch (error) {
      console.error('An unexpected error occurred during capture:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado al capturar la foto.');
    } finally {
      hideLoading();
    }
  };

  const handleOpenGallery = () => galleryModalRef.current?.open();
  const handleConfirm = (uri: string) => {
    galleryModalRef.current?.close();
    navigation.navigate('ImagePreview', { imageUri: uri });
  };
  const handleCancel = () => galleryModalRef.current?.close();

  if (permissionStatus !== 'granted') {
    if (permissionStatus === 'denied') {
      return <PermissionMessage styles={styles} title="Permiso denegado" message="Para usar la cámara, por favor habilita el permiso en los ajustes." />;
    }
    if (permissionStatus === 'restricted') {
      return <PermissionMessage styles={styles} title="Cámara restringida" message="El acceso a la cámara está restringido por una política del dispositivo." />;
    }
    return <Loading styles={styles} />;
  }

  if (!device) return <Loading styles={styles} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
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

        <TopControls
          onBack={() => navigation.goBack()}
          onToggleFlash={toggleFlashMode}
          onFlip={flipCamera}
          flashMode={flashMode}
          showFlash={cameraPosition === 0}
          style={{ marginTop: insets.top }}
        />

        <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 10 }]}>
          <GalleryButton onPress={handleOpenGallery} />
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <CaptureButton onPress={handleCapture} isActive={isCapturing} />
          </Animated.View>
        </View>

        {recentImages.length > 0 && (
          <View
            style={[
              styles.thumbnailContainer,
              {
                bottom: insets.bottom + 120,
                height: width * 0.2 + 30,
              },
            ]}>
            <ThumbnailList uris={recentImages} onSelect={openUri} />
          </View>
        )}
      </Animated.View>
      <Modalize
        ref={galleryModalRef}
        adjustToContentHeight={false}
        modalHeight={Dimensions.get('window').height * 0.8}
        scrollViewProps={{ scrollEnabled: true, nestedScrollEnabled: true }}
        panGestureEnabled={true}
        withOverlay={true}
        handlePosition="inside"
        childrenStyle={styles.modalContent}>
        <CustomImagePickerScreen theme={theme} onConfirm={handleConfirm} onCancel={handleCancel} />
      </Modalize>
    </SafeAreaView>
  );
};
