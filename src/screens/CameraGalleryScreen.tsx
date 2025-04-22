import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera } from 'react-native-vision-camera';
import { useCameraDevices } from 'react-native-vision-camera';
import { useCamera } from '../hooks/useCamera';
import { useGallery } from '../hooks/useGallery';
import { useRecentImages } from '../hooks/useRecentImages';
import { TopControls } from '../components/TopControls';
import { CaptureButton } from '../components/CaptureButton';
import { GalleryButton } from '../components/GalleryButton';
import { ThumbnailList } from '../components/ThumbnailList';
import { LocationService } from '../services/LocationService';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomButton from '../components/CustomButton';

type StackParamList = {
  ImagePreview: { imageUri: string; location?: any };
};

export const CameraGalleryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<StackParamList>>();
  const devices = useCameraDevices();

  const {
    cameraRef,
    isCapturing,
    position,
    flashMode,
    takePhoto,
    toggleFlashMode,
    flipCamera,
    cancelCapture,
  } = useCamera();

  const { pickAndNavigate, openUri } = useGallery();
  const recentImages = useRecentImages();

  const device = devices[position];
  if (!device) return <Loading />;

  const handleCapture = async () => {
    try {
      const uri = await takePhoto();
      const location = await LocationService.getCurrentCoords();
      navigation.navigate('ImagePreview', { imageUri: uri, location });
    } catch {
      cancelCapture();
    }
  };

  return (
    <View style={styles.full}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo
      />

      <TopControls
        onBack={() => navigation.goBack()}
        onToggleFlash={toggleFlashMode}
        onFlip={flipCamera}
        flashMode={flashMode}
        showFlash={position === 0}
      />

      <View
        style={[styles.captureContainer, { bottom: insets.bottom + 100 }]}
      >
        <CaptureButton onPress={handleCapture} disabled={isCapturing} />
      </View>

      <GalleryButton onPress={pickAndNavigate} />
      <ThumbnailList uris={recentImages} onSelect={openUri} />

      {isCapturing && (
        <LoadingOverlay onCancel={cancelCapture} />
      )}
    </View>
  );
};

const Loading: React.FC = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Cargando cámara...</Text>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);

const LoadingOverlay: React.FC<{ onCancel(): void }> = ({ onCancel }) => (
  <View style={styles.overlay}>
    <ActivityIndicator size="large" color="#fff" />
    <Text style={styles.overlayText}>Procesando foto...</Text>
    <CustomButton title="Cancelar" onPress={onCancel} />
  </View>
);

const styles = StyleSheet.create({
  full: { flex: 1, backgroundColor: '#000' },
  captureContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: { color: '#fff', fontSize: 18, marginBottom: 10 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  overlayText: { color: '#fff', fontSize: 18, marginVertical: 10 },
});
