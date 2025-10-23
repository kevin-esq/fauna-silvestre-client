import { useTheme } from '@/presentation/contexts/theme.context';
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  useWindowDimensions,
  DimensionValue
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

const CustomModal = React.memo<CustomModalProps>(
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
  }) => {
    const { theme, spacing } = useTheme();
    const { width: screenWidth } = useWindowDimensions();
    const styles = useMemo(() => createModalStyles(theme), [theme]);
    const [inputFocused, setInputFocused] = useState(false);

    const handleBackdropPress = useCallback(() => {
      if (onBackdropPress) {
        onBackdropPress();
      } else if (closeOnBackdrop) {
        onClose();
      }
    }, [onBackdropPress, closeOnBackdrop, onClose]);

    const handleBackButtonPress = useCallback(() => {
      if (onBackButtonPress) {
        onBackButtonPress();
      } else if (closeOnBackButton) {
        onClose();
      }
    }, [onBackButtonPress, closeOnBackButton, onClose]);

    const handleInputFocus = useCallback(() => setInputFocused(true), []);
    const handleInputBlur = useCallback(() => setInputFocused(false), []);

    const getSizeStyle = useMemo((): ViewStyle => {
      const modalHorizontalSpacing = spacing.medium * 2;
      const safeMaxWidth = screenWidth - modalHorizontalSpacing;

      const sizeConfig = {
        small: { width: '85%', defaultMax: 400 },
        medium: { width: '92%', defaultMax: 600 },
        large: { width: '95%', defaultMax: 800 },
        full: { width: '100%', defaultMax: safeMaxWidth }
      };

      const config = sizeConfig[size] || sizeConfig.medium;

      return {
        width: config.width as DimensionValue,
        maxWidth: Math.min(maxWidth || config.defaultMax, safeMaxWidth)
      };
    }, [size, maxWidth, screenWidth, spacing.medium]);

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

    const renderHeader = useCallback(() => {
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
                pressed && styles.closeButtonPressed
              ]}
              hitSlop={spacing.medium}
              accessibilityLabel="Cerrar modal"
              accessibilityRole="button"
            >
              <Text style={styles.closeButtonIcon}>✕</Text>
            </Pressable>
          )}
        </View>
      );
    }, [
      showHeader,
      title,
      customHeader,
      showCloseButton,
      styles,
      headerBorder,
      headerStyle,
      titleStyle,
      onClose,
      spacing.medium
    ]);

    const renderBodyContent = useCallback(() => {
      return (
        <View
          style={[
            styles.body,
            !bodyPadding && styles.bodyNoPadding,
            centered && styles.contentCentered,
            bodyStyle
          ]}
        >
          {icon && <View style={styles.iconContainer}>{icon}</View>}

          {description && !children && type !== 'input' && (
            <Text style={styles.description}>{description}</Text>
          )}

          {type === 'input' && (
            <View style={styles.inputContainer}>
              {inputLabel && <Text style={styles.label}>{inputLabel}</Text>}
              <TextInput
                style={[
                  styles.input,
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
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
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
                <Text style={styles.inputDescription}>{description}</Text>
              )}
            </View>
          )}

          {children}
        </View>
      );
    }, [
      styles,
      bodyPadding,
      centered,
      bodyStyle,
      icon,
      description,
      children,
      type,
      inputLabel,
      inputValue,
      onInputChange,
      inputPlaceholder,
      theme.colors.placeholder,
      inputMultiline,
      inputMaxLength,
      handleInputFocus,
      handleInputBlur,
      inputFocused,
      characterCountInfo
    ]);

    const renderBody = useCallback(() => {
      if (scrollable) {
        return (
          <ScrollView
            style={styles.bodyScrollable}
            showsVerticalScrollIndicator={true}
            bounces={true}
            persistentScrollbar={true}
            removeClippedSubviews={true}
            scrollEventThrottle={16}
          >
            {renderBodyContent()}
          </ScrollView>
        );
      }
      return renderBodyContent();
    }, [scrollable, styles.bodyScrollable, renderBodyContent]);

    const renderFooter = useCallback(() => {
      if (!showFooter && !buttons && !customFooter) return null;
      if (customFooter) return customFooter;

      const footerAlignmentStyle =
        footerAlignment === 'center'
          ? styles.footerCenter
          : footerAlignment === 'start'
            ? styles.footerStart
            : footerAlignment === 'space-between'
              ? styles.footerSpaceBetween
              : styles.footerEnd;

      return (
        <View
          style={[
            styles.footer,
            !footerBorder && styles.footerWithoutBorder,
            footerAlignmentStyle,
            footerStyle
          ]}
        >
          {buttons?.map((button, index) => {
            const isDisabled = button.disabled || button.loading;
            const buttonVariantStyle =
              button.variant === 'primary'
                ? styles.buttonPrimary
                : button.variant === 'secondary'
                  ? styles.buttonSecondary
                  : button.variant === 'danger'
                    ? styles.buttonDanger
                    : styles.buttonOutline;

            const textVariantStyle =
              button.variant === 'primary'
                ? styles.buttonTextPrimary
                : button.variant === 'secondary'
                  ? styles.buttonTextSecondary
                  : button.variant === 'danger'
                    ? styles.buttonTextDanger
                    : styles.buttonTextOutline;

            const loaderColor =
              button.variant === 'primary'
                ? theme.colors.textOnPrimary
                : button.variant === 'danger'
                  ? '#FFFFFF'
                  : theme.colors.primary;

            return (
              <Pressable
                key={`button-${index}`}
                onPress={button.onPress}
                disabled={isDisabled}
                style={({ pressed }) => [
                  styles.button,
                  buttonVariantStyle,
                  pressed && !isDisabled && styles.buttonPressed,
                  isDisabled && styles.buttonDisabled
                ]}
                accessibilityLabel={button.label}
                accessibilityRole="button"
                accessibilityState={{ disabled: isDisabled }}
              >
                <View style={styles.buttonContent}>
                  <Text style={[styles.buttonText, textVariantStyle]}>
                    {button.label}
                  </Text>
                  {button.loading && (
                    <ActivityIndicator
                      size="small"
                      color={loaderColor}
                      style={styles.loadingIndicator}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      );
    }, [
      showFooter,
      buttons,
      customFooter,
      footerAlignment,
      styles,
      footerBorder,
      footerStyle,
      theme.colors
    ]);

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
        style={[styles.modal, size === 'full' && styles.modalFull, modalStyle]}
      >
        <View style={[styles.modalContent, getSizeStyle, contentStyle]}>
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
