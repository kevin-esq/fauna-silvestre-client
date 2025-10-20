import { useTheme } from '@/presentation/contexts/theme.context';
import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ViewStyle,
  TextStyle,
  ActivityIndicator
} from 'react-native';
import { Animation, CustomAnimation } from 'react-native-animatable';
import Modal from 'react-native-modal';
import { createModalStyles } from './custom-modal.styles';

export type ModalSize = 'small' | 'medium' | 'large' | 'full';
export type ModalType =
  | 'default'
  | 'confirmation'
  | 'alert'
  | 'input'
  | 'custom';
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
export type FooterAlignment = 'start' | 'center' | 'end' | 'space-between';

export interface ModalButton {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
}

export interface CustomModalProps {
  isVisible: boolean;
  onClose: () => void;
  children?: React.ReactNode;

  title?: string;
  showHeader?: boolean;
  showCloseButton?: boolean;
  headerBorder?: boolean;
  customHeader?: React.ReactNode;

  bodyPadding?: boolean;
  scrollable?: boolean;
  centered?: boolean;
  icon?: React.ReactNode;
  description?: string;

  showFooter?: boolean;
  footerBorder?: boolean;
  footerAlignment?: FooterAlignment;
  buttons?: ModalButton[];
  customFooter?: React.ReactNode;

  inputValue?: string;
  onInputChange?: (text: string) => void;
  inputPlaceholder?: string;
  inputLabel?: string;
  inputMultiline?: boolean;
  inputMaxLength?: number;
  showCharacterCount?: boolean;

  type?: ModalType;
  size?: ModalSize;
  backdropOpacity?: number;
  closeOnBackdrop?: boolean;
  closeOnBackButton?: boolean;
  avoidKeyboard?: boolean;

  animationIn?: Animation | CustomAnimation;
  animationOut?: Animation | CustomAnimation;
  animationInTiming?: number;
  animationOutTiming?: number;
  backdropTransitionInTiming?: number;
  backdropTransitionOutTiming?: number;
  useNativeDriver?: boolean;
  useNativeDriverForBackdrop?: boolean;
  hideModalContentWhileAnimating?: boolean;

  modalStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  bodyStyle?: ViewStyle;
  footerStyle?: ViewStyle;
  titleStyle?: TextStyle;

  onBackdropPress?: () => void;
  onBackButtonPress?: () => void;

  maxWidth?: number;
}

const CustomModal = React.memo(
  ({
    isVisible,
    onClose,
    children,
    title,
    showHeader = true,
    showCloseButton = true,
    headerBorder = true,
    customHeader,
    bodyPadding = true,
    scrollable = false,
    centered = false,
    icon,
    description,
    showFooter = false,
    footerBorder = true,
    footerAlignment = 'end',
    buttons,
    customFooter,
    inputValue,
    onInputChange,
    inputPlaceholder,
    inputLabel,
    inputMultiline = false,
    inputMaxLength,
    showCharacterCount = false,
    type = 'default',
    size = 'medium',
    backdropOpacity = 0.6,
    closeOnBackdrop = true,
    closeOnBackButton = true,
    avoidKeyboard = true,
    animationIn = 'fadeInUp',
    animationOut = 'fadeOutDown',
    animationInTiming = 300,
    animationOutTiming = 250,
    backdropTransitionInTiming,
    backdropTransitionOutTiming,
    useNativeDriver = true,
    useNativeDriverForBackdrop = true,
    hideModalContentWhileAnimating = false,
    modalStyle,
    contentStyle,
    headerStyle,
    bodyStyle,
    footerStyle,
    titleStyle,
    onBackdropPress,
    onBackButtonPress,
    maxWidth
  }: CustomModalProps): React.ReactElement => {
    const themeContext = useTheme();
    const { theme } = themeContext;
    const styles = createModalStyles(theme);
    const [inputFocused, setInputFocused] = useState(false);

    const handleBackdropPress =
      onBackdropPress || (closeOnBackdrop ? onClose : undefined);
    const handleBackButtonPress =
      onBackButtonPress || (closeOnBackButton ? onClose : undefined);

    const getSizeStyle = useCallback((): ViewStyle => {
      switch (size) {
        case 'small':
          return { width: '85%', maxWidth: maxWidth || 400 };
        case 'medium':
          return { width: '92%', maxWidth: maxWidth || 600 };
        case 'large':
          return { width: '95%', maxWidth: maxWidth || 800 };
        case 'full':
          return {
            maxWidth: maxWidth || '100%',
            width: '100%'
          };
        default:
          return { width: '92%', maxWidth: maxWidth || 600 };
      }
    }, [size, maxWidth]);

    const characterCountInfo = useMemo(() => {
      if (!showCharacterCount || !inputMaxLength) return null;
      const currentLength = inputValue?.length || 0;
      const percentage = (currentLength / inputMaxLength) * 100;
      return {
        current: currentLength,
        max: inputMaxLength,
        isWarning: percentage >= 80 && percentage < 100,
        isError: percentage >= 100
      };
    }, [inputValue, inputMaxLength, showCharacterCount]);

    const renderHeader = () => {
      if (!showHeader && !title) return null;

      if (customHeader) return customHeader;

      if (!title && !showCloseButton) return null;

      return (
        <View
          style={[
            styles.header,
            !headerBorder && styles.headerWithoutBorder,
            headerStyle
          ]}
        >
          {title && (
            <Text style={[styles.title, titleStyle]} numberOfLines={2}>
              {title}
            </Text>
          )}
          {showCloseButton && (
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressable
              ]}
              hitSlop={12}
              accessibilityLabel="Cerrar modal"
              accessibilityRole="button"
            >
              <Text style={styles.closeButtonIcon}>✕</Text>
            </Pressable>
          )}
        </View>
      );
    };

    const renderBody = () => {
      const bodyContent = (
        <View
          style={[
            styles.body,
            !bodyPadding && styles.bodyNoPadding,
            centered && styles.contentCentered,
            bodyStyle
          ]}
        >
          {icon && <View style={styles.iconContainer}>{icon}</View>}

          {type === 'input' && (
            <View>
              {inputLabel && <Text style={styles.label}>{inputLabel}</Text>}
              <TextInput
                style={[
                  styles.input,
                  {
                    width: maxWidth ? maxWidth - 64 : '100%'
                  },
                  inputMultiline && styles.textArea,
                  inputFocused && styles.inputFocused
                ]}
                value={inputValue}
                onChangeText={onInputChange}
                placeholder={inputPlaceholder}
                placeholderTextColor={theme.colors.placeholder}
                multiline={inputMultiline}
                numberOfLines={inputMultiline ? 4 : 1}
                maxLength={inputMaxLength}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                accessibilityLabel={inputLabel || inputPlaceholder}
                accessibilityHint={description}
                scrollEnabled={inputMultiline}
              />
              {characterCountInfo && (
                <Text
                  style={[
                    styles.characterCount,
                    characterCountInfo.isWarning &&
                      styles.characterCountWarning,
                    characterCountInfo.isError && styles.characterCountError
                  ]}
                >
                  {characterCountInfo.current} / {characterCountInfo.max}
                </Text>
              )}
              {description && (
                <Text style={styles.description}>{description}</Text>
              )}
            </View>
          )}

          {children}
        </View>
      );

      if (scrollable) {
        return (
          <ScrollView
            style={styles.bodyScrollable}
            showsVerticalScrollIndicator={true}
            bounces={true}
            persistentScrollbar={true}
          >
            {bodyContent}
          </ScrollView>
        );
      }

      return bodyContent;
    };

    const renderFooter = () => {
      if (!showFooter && !buttons && !customFooter) return null;

      if (customFooter) return customFooter;

      const footerAlignmentStyle =
        footerAlignment === 'center'
          ? styles.footerCenter
          : footerAlignment === 'start'
            ? styles.footerStart
            : footerAlignment === 'space-between'
              ? styles.footerSpaceBetween
              : null;

      return (
        <View
          style={[
            styles.footer,
            !footerBorder && styles.footerWithoutBorder,
            footerAlignmentStyle,
            footerStyle
          ]}
        >
          {buttons?.map((button, index) => (
            <Pressable
              key={index}
              onPress={button.onPress}
              disabled={button.disabled || button.loading}
              style={({ pressed }) => [
                styles.button,
                button.variant === 'primary' && styles.buttonPrimary,
                button.variant === 'secondary' && styles.buttonSecondary,
                button.variant === 'danger' && styles.buttonDanger,
                button.variant === 'outline' && styles.buttonOutline,
                pressed && styles.buttonPressed,
                (button.disabled || button.loading) && styles.buttonDisabled
              ]}
              accessibilityLabel={button.label}
              accessibilityRole="button"
              accessibilityState={{
                disabled: button.disabled || button.loading
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={[
                    styles.buttonText,
                    button.variant === 'primary' && styles.buttonTextPrimary,
                    button.variant === 'secondary' &&
                      styles.buttonTextSecondary,
                    button.variant === 'danger' && styles.buttonTextDanger,
                    button.variant === 'outline' && styles.buttonTextOutline
                  ]}
                >
                  {button.label}
                </Text>
                {button.loading && (
                  <ActivityIndicator
                    size="small"
                    color={
                      button.variant === 'primary'
                        ? theme.textOnPrimaryButton
                        : button.variant === 'danger'
                          ? '#FFFFFF'
                          : theme.colors.primary
                    }
                    style={styles.loadingIndicator}
                  />
                )}
              </View>
            </Pressable>
          ))}
        </View>
      );
    };

    return (
      <Modal
        isVisible={isVisible}
        onBackdropPress={handleBackdropPress}
        onBackButtonPress={handleBackButtonPress}
        animationIn={animationIn}
        animationOut={animationOut}
        animationInTiming={animationInTiming}
        animationOutTiming={animationOutTiming}
        backdropTransitionInTiming={
          backdropTransitionInTiming || animationInTiming
        }
        backdropTransitionOutTiming={
          backdropTransitionOutTiming || animationOutTiming
        }
        backdropOpacity={backdropOpacity}
        useNativeDriverForBackdrop={useNativeDriverForBackdrop}
        useNativeDriver={useNativeDriver}
        hideModalContentWhileAnimating={hideModalContentWhileAnimating}
        avoidKeyboard={avoidKeyboard}
        style={[
          size === 'full' ? { margin: 0 } : { margin: 16 },
          { alignItems: 'center', justifyContent: 'center' },
          modalStyle
        ]}
      >
        <View style={[styles.modalContent, getSizeStyle(), contentStyle]}>
          {renderHeader()}
          {renderBody()}
          {renderFooter()}
        </View>
      </Modal>
    );
  }
);

CustomModal.displayName = 'CustomModal';

export default CustomModal;
