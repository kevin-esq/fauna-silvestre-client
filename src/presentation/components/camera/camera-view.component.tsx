import React, { useCallback } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Camera, CameraDevice } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopControls } from './top-controls.component';
import { GalleryButton } from './gallery-button.component';
import { CaptureButton } from './capture-button.component';
import { ThumbnailList } from './thumbnail-list.component';
import { createStyles } from '@/presentation/screens/media/camera-gallery-screen.styles';
import { FreezeOverlay } from './freeze-overlay.component';
import { RecentImage } from '@/presentation/hooks/use-recent-images.hook';

interface CameraViewProps {
  cameraRef: React.RefObject<Camera | null>;
  device: CameraDevice;
  isCameraReady: boolean;
  isCapturing: boolean;
  cameraPosition: number;
  flashMode: 'off' | 'on' | 'auto';
  fadeAnim: Animated.Value;
  freezeFadeAnim: Animated.Value;
  freezeUri: string | null;
  isShowingFreeze: boolean;
  pulseAnim: Animated.Value;
  styles: ReturnType<typeof createStyles>;
  recentImages: RecentImage[];
  activeThumbnail: string | null;
  onBack: () => void;
  onToggleFlash: () => void;
  onFlip: () => void;
  onOpenGallery: () => void;
  onCapture: () => void;
  onThumbnailPress: (uri: string) => void;
}

export const CameraView = React.memo<CameraViewProps>(
  ({
    cameraRef,
    device,
    isCameraReady,
    isCapturing,
    cameraPosition,
    flashMode,
    fadeAnim,
    pulseAnim,
    freezeFadeAnim,
    freezeUri,
    isShowingFreeze,
    styles,
    recentImages,
    activeThumbnail,
    onBack,
    onToggleFlash,
    onFlip,
    onOpenGallery,
    onCapture,
    onThumbnailPress
  }) => {
    const insets = useSafeAreaInsets();

    const handleThumbnailPress = useCallback(
      (uri: string) => {
        console.log(
          '📸 CameraView -> handleThumbnailPress fired with uri:',
          uri
        );
        onThumbnailPress(uri);
      },
      [onThumbnailPress]
    );

    console.log('📸 CameraView render, recentImages:', recentImages.length);

    return (
      <Animated.View style={[styles.full, { opacity: fadeAnim }]}>
        {isCameraReady && (
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={!isShowingFreeze}
            photo
            enableZoomGesture
          />
        )}

        <FreezeOverlay
          freezeUri={freezeUri}
          isVisible={isShowingFreeze}
          fadeAnim={freezeFadeAnim}
        />

        <View style={styles.controlsOverlay}>
          <TopControls
            onBack={() => {
              console.log('🔙 TopControls -> onBack pressed');
              onBack();
            }}
            onToggleFlash={() => {
              console.log('⚡ TopControls -> onToggleFlash pressed');
              onToggleFlash();
            }}
            onFlip={() => {
              console.log('🔄 TopControls -> onFlip pressed');
              onFlip();
            }}
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
              onPress={() => {
                console.log('🖼️ GalleryButton pressed');
                onOpenGallery();
              }}
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
                  onPress={() => {
                    console.log('📸 CaptureButton pressed');
                    onCapture();
                  }}
                  isActive={isCapturing}
                  disabled={isCapturing || isShowingFreeze}
                />
              </Animated.View>
            </View>

            <View style={{ width: 40 }} />
          </View>
        </View>

        {recentImages.length > 0 && !isShowingFreeze && (
          <View
            style={[
              styles.thumbnailContainer,
              {
                bottom: Math.max(insets.bottom + 120, 140)
              }
            ]}
          >
            <ThumbnailList
              uris={recentImages.map(img => img.uri)}
              onSelect={handleThumbnailPress}
              activeUri={activeThumbnail}
            />
          </View>
        )}
      </Animated.View>
    );
  }
);
