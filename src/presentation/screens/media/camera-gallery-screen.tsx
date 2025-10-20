import React, {
  useMemo,
  useCallback,
  useEffect,
  useState,
  useRef
} from 'react';
import { SafeAreaView, StatusBar, Modal } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCamera } from '../../hooks/use-camera.hook';
import { useRecentImagesWithLocation } from '../../hooks/use-recent-images.hook';
import { useRequestPermissions } from '../../hooks/use-request-permissions.hook';
import { useCameraAnimations } from '../../hooks/use-camera-animations.hook';
import { useCameraActions } from '../../hooks/use-camera-actions.hook';
import { useCameraFreeze } from '../../hooks/use-camera-freeze.hook';
import { useModalState } from '../../hooks/use-modal-state.hook';
import {
  useBackHandler,
  useModalBackHandler
} from '../../hooks/use-back-handler.hook';
import { themeVariables, useTheme } from '../../contexts/theme.context';
import { createStyles } from './camera-gallery-screen.styles';
import { PermissionMessage } from '../../components/camera/permission-message.component';
import { Loading } from '../../components/camera/loading.component';
import { CameraView } from '../../components/camera/camera-view.component';
import CustomImagePickerScreen from './custom-image-picker-screen';

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
    console.log('🔄 Estado de hasPermissions cambió:', hasPermissions);
  }, [hasPermissions]);

  useEffect(() => {
    if (blockedPermissions.length > 0) {
      console.log(
        '🚫 Permisos bloqueados detectados, marcando flag:',
        blockedPermissions
      );
      hasBlockedPermissionsRef.current = true;
      setCurrentPermissionStep('blocked');
    }
  }, [blockedPermissions]);

  useEffect(() => {
    if (hasPermissions && isInitialCheckComplete) {
      console.log('✅ Todos los permisos concedidos, reseteando flags');
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
      console.log('🔍 Realizando verificación inicial de permisos...');

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

        console.log('📋 Permisos faltantes:', initialMissing);
        console.log('🚫 Permisos bloqueados:', initialBlocked);

        if (isMounted) {
          initialCheckDoneRef.current = true;
          setIsInitialCheckComplete(true);

          if (initialBlocked.length > 0) {
            setCurrentPermissionStep('blocked');
          } else if (initialMissing.length > 0) {
            setCurrentPermissionStep('alert');
          }

          console.log('✅ Verificación inicial completada');
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
    flipCamera,
    toggleFlashMode
  } = cameraHook;

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

  const {
    activeThumbnail,
    handleCapture,
    handleThumbnailPress,
    handleConfirm
  } = useCameraActions(cameraHook, freezeHook);

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
    console.log('🔄 Iniciando flujo completo de permisos...');
    console.log('❌ Permisos faltantes actuales:', missingPermissions);
    console.log('🚫 Permisos bloqueados actuales:', blockedPermissions);

    if (missingPermissions.length === 0) {
      console.log('✅ Todos los permisos ya están concedidos');
      refreshImages();
      return;
    }

    if (blockedPermissions.length > 0) {
      console.log('🚫 Hay permisos bloqueados, abriendo configuración...');
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

    console.log('📱 Permisos con alerta:', alertPermissions);
    console.log(
      '⚙️ Permisos que requieren configuración:',
      settingsPermissions
    );

    if (alertPermissions.length > 0) {
      console.log('🔄 Solicitando permisos con alerta nativa...');
      setCurrentPermissionStep('alert');

      const alertGranted = await requestAlertPermissions(alertPermissions);

      console.log(
        '🔍 Estado de blockedPermissions después de solicitud:',
        blockedPermissions
      );

      if (alertGranted) {
        console.log('✅ Permisos con alerta concedidos');

        const {
          missingPermissions: updatedMissing,
          blockedPermissions: updatedBlocked
        } = await checkPermissions([
          'camera',
          'gallery',
          'location',
          'allFiles'
        ]);

        console.log(
          '🔍 Permisos faltantes después de alertas:',
          updatedMissing
        );
        console.log(
          '🚫 Permisos bloqueados después de alertas:',
          updatedBlocked
        );

        if (updatedBlocked.length > 0) {
          console.log(
            '🚫 Algunos permisos fueron bloqueados, ir a configuración'
          );
          setCurrentPermissionStep('blocked');
          return;
        }

        const remainingSettingsPermissions = updatedMissing.filter(
          perm => perm === 'allFiles'
        );

        if (remainingSettingsPermissions.length > 0) {
          console.log(
            '🔄 Aún faltan permisos de configuración, procediendo...'
          );
          setCurrentPermissionStep('settings');
          requestAllFilesPermission();
        } else if (updatedMissing.length === 0) {
          console.log(
            '✅ Todos los permisos concedidos, refrescando imágenes...'
          );
          setCurrentPermissionStep('checking');
          refreshImages();
        } else {
          console.log('⚠️ Algunos permisos aún faltan:', updatedMissing);
          setCurrentPermissionStep('alert');
        }
      } else {
        console.log(
          '❌ Algunos permisos con alerta fueron denegados o bloqueados'
        );

        await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

        const { blockedPermissions: updatedBlocked } = await checkPermissions([
          'camera',
          'gallery',
          'location',
          'allFiles'
        ]);

        console.log(
          '🔍 Verificando permisos bloqueados después de rechazo:',
          updatedBlocked
        );
        console.log(
          '🔍 Estado actual de blockedPermissions del hook:',
          blockedPermissions
        );

        if (blockedPermissions.length > 0 || updatedBlocked.length > 0) {
          console.log(
            '🚫 Permisos bloqueados detectados, cambiando a modo blocked'
          );
          setCurrentPermissionStep('blocked');
        } else {
          console.log(
            '⚠️ Permisos denegados pero no bloqueados, mantener en alert'
          );
          setCurrentPermissionStep('alert');
        }
      }
    } else if (settingsPermissions.length > 0) {
      console.log('🔄 Abriendo configuración para permisos restantes...');
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
      console.log('🚫 Hay permisos bloqueados, mostrando tipo "all"');
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
      console.log(
        '🚫 Mostrando botón de configuración por permisos bloqueados'
      );
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
        onBack={handleBackButtonPress}
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
    </ScreenWrapper>
  );

  if (!isInitialCheckComplete) {
    console.log('⏳ Esperando verificación inicial...');
    return renderLoadingState();
  }

  console.log('🎯 Estado final para render - hasPermissions:', hasPermissions);
  console.log('❌ Permisos faltantes:', missingPermissions);
  console.log('🚫 Permisos bloqueados:', blockedPermissions);
  console.log('📝 Paso actual:', currentPermissionStep);

  if (!hasPermissions) {
    console.log('🚫 Permisos insuficientes, mostrando mensaje...');
    return renderPermissionMessage();
  }

  if (!device) {
    console.log('📷 Dispositivo de cámara no disponible...');
    return renderLoadingState();
  }

  console.log('🎉 Todo listo, mostrando cámara...');
  return renderCameraView();
};
