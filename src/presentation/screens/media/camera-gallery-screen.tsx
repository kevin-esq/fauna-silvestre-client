import React, {
  useMemo,
  useCallback,
  useEffect,
  useState,
  useRef
} from 'react';
import { SafeAreaView, StatusBar, Modal } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCamera } from '../../hooks/camera/use-camera.hook';
import { useRecentImagesWithLocation } from '../../hooks/media/use-recent-images.hook';
import { useRequestPermissions } from '../../hooks/permissions/use-request-permissions.hook';
import { useCameraAnimations } from '../../hooks/camera/use-camera-animations.hook';
import { useCameraActions } from '../../hooks/camera/use-camera-actions.hook';
import { useCameraFreeze } from '../../hooks/camera/use-camera-freeze.hook';
import { useModalState } from '../../hooks/common/use-modal-state.hook';
import {
  useBackHandler,
  useModalBackHandler
} from '../../hooks/common/use-back-handler.hook';
import { themeVariables, useTheme } from '../../contexts/theme.context';
import { createStyles } from './camera-gallery-screen.styles';
import { PermissionMessage } from '../../components/camera/permission-message.component';
import { Loading } from '../../components/camera/loading.component';
import { CameraView } from '../../components/camera/camera-view.component';
import CustomImagePickerScreen from './custom-image-picker-screen';
import CustomModal from '../../components/ui/custom-modal.component';

interface ScreenWrapperProps {
  children: React.ReactNode;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      {children}
    </SafeAreaView>
  </GestureHandlerRootView>
);

export const CameraGalleryScreen: React.FC = () => {
  const {
    hasPermissions,
    isRequesting,
    missingPermissions,
    blockedPermissions,
    requestAlertPermissions,
    requestAllFilesPermission,
    openAppSettings,
    checkPermissions
  } = useRequestPermissions();

  const [isInitialCheckComplete, setIsInitialCheckComplete] = useState(false);
  const initialCheckDoneRef = useRef(false);
  const [currentPermissionStep, setCurrentPermissionStep] = useState<
    'checking' | 'alert' | 'settings' | 'blocked'
  >('checking');

  const hasBlockedPermissionsRef = useRef(false);

  useEffect(() => {
    if (blockedPermissions.length > 0) {
      hasBlockedPermissionsRef.current = true;
      setCurrentPermissionStep('blocked');
    }
  }, [blockedPermissions]);

  useEffect(() => {
    if (hasPermissions && isInitialCheckComplete) {
      hasBlockedPermissionsRef.current = false;
      setCurrentPermissionStep('checking');
    }
  }, [hasPermissions, isInitialCheckComplete]);

  useEffect(() => {
    if (initialCheckDoneRef.current) {
      return;
    }

    let isMounted = true;

    const performInitialCheck = async () => {
      try {
        const {
          missingPermissions: initialMissing,
          blockedPermissions: initialBlocked
        } = await checkPermissions([
          'camera',
          'gallery',
          'location',
          'allFiles'
        ]);

        if (isMounted) {
          initialCheckDoneRef.current = true;
          setIsInitialCheckComplete(true);

          if (initialBlocked.length > 0) {
            setCurrentPermissionStep('blocked');
          } else if (initialMissing.length > 0) {
            setCurrentPermissionStep('alert');
          }
        }
      } catch (error) {
        console.error('❌ Error en verificación inicial:', error);
        if (isMounted) {
          initialCheckDoneRef.current = true;
          setIsInitialCheckComplete(true);
        }
      }
    };

    performInitialCheck();

    return () => {
      isMounted = false;
    };
  }, [checkPermissions]);

  const cameraHook = useCamera();
  const {
    cameraRef,
    device,
    isCameraReady,
    isCapturing,
    cameraPosition,
    flashMode,
    cameraError,
    isRetrying,
    flipCamera,
    toggleFlashMode,
    retryCamera
  } = cameraHook;

  const resetZoomRef = useRef<(() => void) | null>(null);

  const freezeHook = useCameraFreeze();
  const { freezeUri, isShowingFreeze } = freezeHook;

  const shouldLoadImages = hasPermissions && isInitialCheckComplete;

  const { images: recentImages, refresh: refreshImages } =
    useRecentImagesWithLocation({
      limit: 50,
      autoRefresh: false,
      enabled: shouldLoadImages,
      onError: error => {
        console.error('Error cargando imágenes:', error);
      }
    });

  const { fadeAnim, pulseAnim, freezeFadeAnim } = useCameraAnimations(
    isCameraReady,
    isCapturing,
    isShowingFreeze
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    activeThumbnail,
    handleCapture,
    handleThumbnailPress,
    handleConfirm
  } = useCameraActions({
    cameraHook,
    freezeHook,
    onError: message => setErrorMessage(message)
  });

  const handleCaptureWithZoomReset = useCallback(async () => {
    await handleCapture();

    setTimeout(() => {
      if (resetZoomRef.current) {
        resetZoomRef.current();
      }
    }, 1000);
  }, [handleCapture]);

  const { isModalOpen, openModal, closeModal } = useModalState();

  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  const { handleBackPress } = useBackHandler();

  useModalBackHandler(isModalOpen, closeModal, {
    enableHardwareBack: true,
    closeOnBack: true
  });

  const handleModalClose = useCallback(() => {
    closeModal();

    if (hasPermissions) {
      refreshImages();
    }
  }, [closeModal, refreshImages, hasPermissions]);

  const handleRequestAllPermissions = useCallback(async () => {
    if (missingPermissions.length === 0) {
      refreshImages();
      return;
    }

    if (blockedPermissions.length > 0) {
      setCurrentPermissionStep('blocked');
      openAppSettings();
      return;
    }

    const alertPermissions = missingPermissions.filter(
      perm => perm === 'camera' || perm === 'gallery' || perm === 'location'
    );
    const settingsPermissions = missingPermissions.filter(
      perm => perm === 'allFiles'
    );

    if (alertPermissions.length > 0) {
      setCurrentPermissionStep('alert');

      const alertGranted = await requestAlertPermissions(alertPermissions);

      if (alertGranted) {
        const {
          missingPermissions: updatedMissing,
          blockedPermissions: updatedBlocked
        } = await checkPermissions([
          'camera',
          'gallery',
          'location',
          'allFiles'
        ]);

        if (updatedBlocked.length > 0) {
          setCurrentPermissionStep('blocked');
          return;
        }

        const remainingSettingsPermissions = updatedMissing.filter(
          perm => perm === 'allFiles'
        );

        if (remainingSettingsPermissions.length > 0) {
          setCurrentPermissionStep('settings');
          requestAllFilesPermission();
        } else if (updatedMissing.length === 0) {
          setCurrentPermissionStep('checking');
          refreshImages();
        } else {
          setCurrentPermissionStep('alert');
        }
      } else {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

        const { blockedPermissions: updatedBlocked } = await checkPermissions([
          'camera',
          'gallery',
          'location',
          'allFiles'
        ]);

        if (blockedPermissions.length > 0 || updatedBlocked.length > 0) {
          setCurrentPermissionStep('blocked');
        } else {
          setCurrentPermissionStep('alert');
        }
      }
    } else if (settingsPermissions.length > 0) {
      setCurrentPermissionStep('settings');
      requestAllFilesPermission();
    }
  }, [
    missingPermissions,
    blockedPermissions,
    requestAlertPermissions,
    requestAllFilesPermission,
    openAppSettings,
    checkPermissions,
    refreshImages
  ]);

  const handleBackButtonPress = useCallback(() => {
    handleBackPress();
  }, [handleBackPress]);

  const getPermissionMessageType = () => {
    if (blockedPermissions.length > 0 || hasBlockedPermissionsRef.current) {
      return 'all';
    }

    if (!isInitialCheckComplete || currentPermissionStep === 'checking') {
      return 'all';
    }

    const hasAlertPermissions = missingPermissions.some(
      perm => perm === 'camera' || perm === 'gallery' || perm === 'location'
    );
    const hasSettingsPermissions = missingPermissions.some(
      perm => perm === 'allFiles'
    );

    if (currentPermissionStep === 'blocked') {
      return 'all';
    } else if (currentPermissionStep === 'alert' && hasAlertPermissions) {
      if (
        missingPermissions.length > 1 ||
        missingPermissions.includes('location')
      ) {
        return 'all';
      }

      if (missingPermissions.includes('camera')) {
        return 'camera';
      }

      if (missingPermissions.includes('gallery')) {
        return 'photos';
      }
    } else if (currentPermissionStep === 'settings' && hasSettingsPermissions) {
      return 'all';
    }

    return 'all';
  };

  const getCustomButtonText = () => {
    if (
      blockedPermissions.length > 0 ||
      hasBlockedPermissionsRef.current ||
      currentPermissionStep === 'blocked'
    ) {
      return 'Abrir Configuración';
    }

    const messageType = getPermissionMessageType();

    if (messageType === 'camera') {
      return 'Habilitar Cámara';
    } else if (messageType === 'photos') {
      return 'Permitir Acceso a Fotos';
    } else {
      if (currentPermissionStep === 'settings') {
        return 'Abrir Configuración de Android';
      }
      return 'Habilitar Todos los Permisos';
    }
  };

  const renderPermissionMessage = () => (
    <ScreenWrapper>
      <PermissionMessage
        styles={styles}
        onRequestPermission={handleRequestAllPermissions}
        isLoading={
          isRequesting &&
          currentPermissionStep !== 'settings' &&
          currentPermissionStep !== 'blocked'
        }
        permissionType={getPermissionMessageType()}
        customButtonText={getCustomButtonText()}
        missingPermissions={missingPermissions}
        blockedPermissions={blockedPermissions}
        currentStep={currentPermissionStep}
      />
    </ScreenWrapper>
  );

  const renderLoadingState = () => (
    <ScreenWrapper>
      <Loading styles={styles} />
    </ScreenWrapper>
  );

  const renderCameraView = () => (
    <ScreenWrapper>
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
        cameraError={cameraError}
        isRetrying={isRetrying}
        onBack={handleBackButtonPress}
        onToggleFlash={toggleFlashMode}
        onFlip={flipCamera}
        onOpenGallery={openModal}
        onCapture={handleCaptureWithZoomReset}
        onThumbnailPress={handleThumbnailPress}
        onRetryCamera={retryCamera}
        resetZoomRef={resetZoomRef}
      />

      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleModalClose}
      >
        <ScreenWrapper>
          <CustomImagePickerScreen
            theme={theme}
            onConfirm={(uri, location) => {
              handleConfirm(uri, location);
              handleModalClose();
            }}
            onCancel={handleModalClose}
          />
        </ScreenWrapper>
      </Modal>

      <CustomModal
        isVisible={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        title="Error"
        description={errorMessage || ''}
        buttons={[
          {
            label: 'OK',
            onPress: () => setErrorMessage(null)
          }
        ]}
      />
    </ScreenWrapper>
  );

  if (!isInitialCheckComplete) {
    return renderLoadingState();
  }

  if (!hasPermissions) {
    return renderPermissionMessage();
  }

  if (!device) {
    return renderLoadingState();
  }

  return renderCameraView();
};
