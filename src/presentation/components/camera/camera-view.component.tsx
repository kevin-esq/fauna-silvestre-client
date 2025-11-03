import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Camera, CameraDevice } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopControls } from './top-controls.component';
import { GalleryButton } from './gallery-button.component';
import { CaptureButton } from './capture-button.component';
import { ThumbnailList } from './thumbnail-list.component';
import { ZoomControls } from './zoom-controls.component';
import { CameraRestrictedOverlay } from './camera-restricted-overlay.component';
import { createStyles } from '@/presentation/screens/media/camera-gallery-screen.styles';
import { FreezeOverlay } from './freeze-overlay.component';
import { RecentImage } from '@/presentation/hooks/media/use-recent-images.hook';

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
  cameraError: string | null;
  isRetrying: boolean;
  onBack: () => void;
  onToggleFlash: () => void;
  onFlip: () => void;
  onOpenGallery: () => void;
  onCapture: () => void;
  onThumbnailPress: (uri: string) => void;
  onRetryCamera: () => void;
  resetZoomRef?: React.MutableRefObject<(() => void) | null>;
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
    cameraError,
    isRetrying,
    onBack,
    onToggleFlash,
    onFlip,
    onOpenGallery,
    onCapture,
    onThumbnailPress,
    onRetryCamera,
    resetZoomRef
  }) => {
    const insets = useSafeAreaInsets();
    const neutralZoom = device.neutralZoom || 1;
    const [zoom, setZoom] = useState(neutralZoom);
    const [baseZoom, setBaseZoom] = useState(neutralZoom);

    const resetZoom = useCallback(() => {
      console.log('🔄 Reseteando zoom a neutral:', neutralZoom);
      setZoom(neutralZoom);
      setBaseZoom(neutralZoom);
    }, [neutralZoom]);

    useEffect(() => {
      if (resetZoomRef) {
        resetZoomRef.current = resetZoom;
      }
    }, [resetZoom, resetZoomRef]);

    const handleZoomChange = useCallback(
      (newZoom: number) => {
        console.log(
          '📸 [CAMERA] handleZoomChange recibido:',
          newZoom,
          'Actual:',
          zoom
        );
        setZoom(newZoom);
        setBaseZoom(newZoom);
        console.log('📸 [CAMERA] Zoom actualizado a:', newZoom);
      },
      [zoom]
    );

    const pinchGesture = Gesture.Pinch()
      .onUpdate(event => {
        const newZoom = Math.min(
          Math.max(baseZoom * event.scale, device.minZoom),
          device.maxZoom
        );
        runOnJS(setZoom)(newZoom);
      })
      .onEnd(() => {
        runOnJS(setBaseZoom)(zoom);
      });

    const handleThumbnailPress = useCallback(
      (uri: string) => {
        onThumbnailPress(uri);
      },
      [onThumbnailPress]
    );

    return (
      <GestureDetector gesture={pinchGesture}>
        <Animated.View style={[styles.full, { opacity: fadeAnim }]}>
          {isCameraReady && (
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={!isShowingFreeze}
              photo
              zoom={zoom}
              enableZoomGesture={false}
            />
          )}

          {isCameraReady && !isShowingFreeze && cameraPosition === 0 && (
            <ZoomControls
              currentZoom={zoom}
              minZoom={device.minZoom}
              maxZoom={device.maxZoom}
              neutralZoom={neutralZoom}
              onZoomChange={handleZoomChange}
            />
          )}

          <FreezeOverlay
            freezeUri={freezeUri}
            isVisible={isShowingFreeze}
            fadeAnim={freezeFadeAnim}
          />

          {cameraError && (
            <CameraRestrictedOverlay
              message={cameraError}
              isRetrying={isRetrying}
              onRetry={onRetryCamera}
            />
          )}

          <View style={styles.controlsOverlay} pointerEvents="box-none">
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
              pointerEvents="box-none"
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
                    disabled={isCapturing || isShowingFreeze || !!cameraError}
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
      </GestureDetector>
    );
  }
);
