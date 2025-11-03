import { useCallback, useRef, useEffect } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler, Platform, ToastAndroid } from 'react-native';
import { useNavigationActions } from '@/presentation/navigation/navigation-provider';

interface BackHandlerOptions {
  isModalOpen?: boolean;
  closeModal?: () => void;
  customBackAction?: () => boolean | void;
  enableSafeMode?: boolean;
  enableDoubleBackExit?: boolean;
  exitMessage?: string;
  exitTimeout?: number;
  onExit?: () => void;
}

interface ModalBackHandlerConfig {
  enableHardwareBack?: boolean;
  closeOnBack?: boolean;
}

type BackPressHandler = () => boolean;

const safeExecute = <T>(
  operation: () => T,
  fallback: T,
  errorMessage: string
): T => {
  try {
    return operation();
  } catch (error) {
    console.warn(errorMessage, error);
    return fallback;
  }
};

const createBackHandlerSubscription = (handler: BackPressHandler) => {
  const subscription = BackHandler.addEventListener(
    'hardwareBackPress',
    handler
  );

  return () => {
    safeExecute(
      () => subscription.remove(),
      undefined,
      'Error removing back handler subscription:'
    );
  };
};

export const useBackHandler = (options: BackHandlerOptions = {}) => {
  const navigation = useNavigation();
  const { navigate, goBack } = useNavigationActions();
  const optionsRef = useRef(options);

  const backPressedOnce = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  optionsRef.current = options;

  useEffect(() => {
    const timeoutId = timeoutRef.current;
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleDoubleBackExit = useCallback((): boolean => {
    const {
      exitMessage = 'Presiona nuevamente para salir',
      exitTimeout = 2000,
      onExit
    } = optionsRef.current;

    if (Platform.OS !== 'android') {
      return false;
    }

    if (backPressedOnce.current) {
      if (onExit) {
        onExit();
      }
      BackHandler.exitApp();
      return true;
    }

    backPressedOnce.current = true;
    ToastAndroid.show(exitMessage, ToastAndroid.SHORT);

    // Reset back pressed flag after timeout
    setTimeout(() => {
      backPressedOnce.current = false;
    }, exitTimeout);

    return true;
  }, []);

  const handleBackPress = useCallback((): boolean => {
    return safeExecute(
      () => {
        const {
          isModalOpen,
          closeModal,
          customBackAction,
          enableSafeMode = true,
          enableDoubleBackExit = false
        } = optionsRef.current;

        if (customBackAction) {
          const result = customBackAction();
          if (result !== false) return true;
        }

        if (isModalOpen && closeModal) {
          closeModal();
          return true;
        }

        if (navigation.canGoBack()) {
          goBack();
          return true;
        }

        if (enableDoubleBackExit) {
          return handleDoubleBackExit();
        }

        navigate('HomeTabs');
        return enableSafeMode && Platform.OS === 'android';
      },
      true,
      'Error in back handler:'
    );
  }, [navigation, goBack, navigate, handleDoubleBackExit]);

  useFocusEffect(
    useCallback(() => {
      const cleanup = createBackHandlerSubscription(handleBackPress);

      return () => {
        cleanup();

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        backPressedOnce.current = false;
      };
    }, [handleBackPress])
  );

  return { handleBackPress };
};

export const useSimpleBackHandler = (onBackPress?: () => void) => {
  const { goBack } = useNavigationActions();

  const handleBack = useCallback((): boolean => {
    return safeExecute(
      () => {
        if (onBackPress) {
          onBackPress();
        } else {
          goBack();
        }
        return true;
      },
      true,
      'Error in simple back handler:'
    );
  }, [goBack, onBackPress]);

  useFocusEffect(
    useCallback(() => createBackHandlerSubscription(handleBack), [handleBack])
  );

  return { handleBack };
};

export const useModalBackHandler = (
  isVisible: boolean,
  onClose: () => void,
  config: ModalBackHandlerConfig = {}
) => {
  const { enableHardwareBack = true, closeOnBack = true } = config;

  const handleModalBack = useCallback((): boolean => {
    return safeExecute(
      () => {
        if (isVisible && closeOnBack) {
          onClose();
        }
        return true;
      },
      true,
      'Error in modal back handler:'
    );
  }, [isVisible, closeOnBack, onClose]);

  useFocusEffect(
    useCallback(() => {
      if (!enableHardwareBack || !isVisible) return;
      return createBackHandlerSubscription(handleModalBack);
    }, [enableHardwareBack, isVisible, handleModalBack])
  );

  return { handleModalBackPress: handleModalBack };
};

export const useDoubleBackExit = (
  options: {
    exitMessage?: string;
    timeout?: number;
    onExit?: () => void;
  } = {}
) => {
  const {
    exitMessage = 'Presiona nuevamente para salir',
    timeout = 2000,
    onExit
  } = options;

  const backPressedOnce = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleBackPress = useCallback((): boolean => {
    if (Platform.OS !== 'android') {
      return false;
    }

    if (backPressedOnce.current) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (onExit) {
        onExit();
      }

      BackHandler.exitApp();
      return true;
    }

    backPressedOnce.current = true;
    ToastAndroid.show(exitMessage, ToastAndroid.SHORT);

    timeoutRef.current = setTimeout(() => {
      backPressedOnce.current = false;
    }, timeout);

    return true;
  }, [exitMessage, timeout, onExit]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress
      );

      return () => {
        subscription.remove();
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        backPressedOnce.current = false;
      };
    }, [handleBackPress])
  );

  return { handleBackPress };
};
