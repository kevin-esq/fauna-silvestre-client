import React, { useMemo } from 'react';
import { SafeAreaView, StatusBar, Modal } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCamera } from '../../hooks/use-camera.hook';
import { useRecentImagesWithLocation } from '../../hooks/use-recent-images.hook';
import { useCameraAnimations } from '../../hooks/use-camera-animations.hook';
import { useCameraActions } from '../../hooks/use-camera-actions.hook';
import { useCameraFreeze } from '../../hooks/use-camera-freeze.hook';
import { useModalState } from '../../hooks/use-modal-state.hook';
import { useBackHandler } from '../../hooks/use-back-handler.hook';
import { themeVariables, useTheme } from '../../contexts/theme.context';
import { createStyles } from './camera-gallery-screen.styles';
import { PermissionMessage } from '../../components/camera/permission-message.component';
import { Loading } from '../../components/camera/loading.component';
import { CameraView } from '../../components/camera/camera-view.component';
import CustomImagePickerScreen from './custom-image-picker-screen';

export const CameraGalleryScreen: React.FC = () => {
  const cameraHook = useCamera();
  const {
    cameraRef,
    device,
    isCameraReady,
    isCapturing,
    cameraPosition,
    flashMode,
    hasPermissions,
    flipCamera,
    toggleFlashMode
  } = cameraHook;

  const freezeHook = useCameraFreeze();
  const { freezeUri, isShowingFreeze } = freezeHook;

  const recentImages = useRecentImagesWithLocation();
  const { fadeAnim, pulseAnim, freezeFadeAnim } = useCameraAnimations(
    isCameraReady,
    isCapturing,
    isShowingFreeze
  );

  const {
    isPermissionLoading,
    activeThumbnail,
    handleRequestPermissions,
    handleCapture,
    handleThumbnailPress,
    handleConfirm
  } = useCameraActions(cameraHook, freezeHook);

  const { isModalOpen, openModal, closeModal } = useModalState();
  const { handleBackPress } = useBackHandler(isModalOpen, closeModal);

  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  const renderPermissionMessage = () => (
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

  const renderLoadingState = () => (
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

  if (!hasPermissions) {
    return renderPermissionMessage();
  }

  if (!device) {
    return renderLoadingState();
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />

        <CameraView
          cameraRef={cameraRef}
          device={device}
          isCameraReady={isCameraReady}
          isCapturing={isCapturing}
          cameraPosition={cameraPosition}
          flashMode={flashMode}
          fadeAnim={fadeAnim}
          pulseAnim={pulseAnim}
          freezeFadeAnim={freezeFadeAnim}
          freezeUri={freezeUri}
          isShowingFreeze={isShowingFreeze}
          styles={styles}
          recentImages={recentImages}
          activeThumbnail={activeThumbnail}
          onBack={handleBackPress}
          onToggleFlash={toggleFlashMode}
          onFlip={flipCamera}
          onOpenGallery={openModal}
          onCapture={handleCapture}
          onThumbnailPress={handleThumbnailPress}
        />

        <Modal
          visible={isModalOpen}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={closeModal}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <CustomImagePickerScreen
              theme={theme}
              onConfirm={handleConfirm}
              onCancel={closeModal}
            />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};
