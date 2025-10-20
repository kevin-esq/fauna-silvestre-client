import { useCallback, useRef } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler, Platform } from 'react-native';
import { useNavigationActions } from '../navigation/navigation-provider';

interface BackHandlerOptions {
  isModalOpen?: boolean;
  closeModal?: () => void;
  customBackAction?: () => boolean | void;
  enableSafeMode?: boolean;
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

  optionsRef.current = options;

  const handleBackPress = useCallback((): boolean => {
    return safeExecute(
      () => {
        const {
          isModalOpen,
          closeModal,
          customBackAction,
          enableSafeMode = true
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

        navigate('HomeTabs');
        return enableSafeMode && Platform.OS === 'android';
      },
      true,
      'Error in back handler:'
    );
  }, [navigation, goBack, navigate]);

  useFocusEffect(
    useCallback(
      () => createBackHandlerSubscription(handleBackPress),
      [handleBackPress]
    )
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
