import { ThemeVariablesType } from '@/presentation/contexts/theme.context';
import React, { useMemo, useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Animated,
  Text,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AuthTextInputProps extends Omit<TextInputProps, 'style'> {
  iconName: React.ComponentProps<typeof Icon>['name'];
  error?: boolean | string;
  label?: string;
  helperText?: string;
  variables: ThemeVariablesType;
  variant?: 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
}

const AuthTextInput = forwardRef<TextInput, AuthTextInputProps>(
  (
    {
      iconName,
      error = false,
      label,
      helperText,
      variables,
      variant = 'filled',
      size = 'medium',
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      inputStyle,
      onFocus,
      onBlur,
      value = '',
      ...props
    },
    ref
  ) => {
    const styles = useMemo(
      () => createStyles(variables, variant, size),
      [variables, variant, size]
    );

    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const focusedAnim = useMemo(
      () => new Animated.Value(value || isFocused ? 1 : 0),
      [isFocused, value]
    );

    const isPasswordInput = props.secureTextEntry;
    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : undefined;

    const sizeConfig = {
      small: { height: 48, fontSize: 14, iconSize: 20, padding: 16 },
      medium: { height: 56, fontSize: 16, iconSize: 24, padding: 18 },
      large: { height: 64, fontSize: 18, iconSize: 26, padding: 20 }
    };

    const config = sizeConfig[size];

    React.useEffect(() => {
      Animated.timing(focusedAnim, {
        toValue: (value && value.length > 0) || isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: false
      }).start();
    }, [value, isFocused, focusedAnim]);

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(prev => !prev);
    };

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const getContainerStyle = () => {
      return [
        styles.inputContainer,
        isFocused && styles.focused,
        hasError && styles.errorBorder,
        variant === 'filled' && styles.filledVariant
      ].filter(Boolean);
    };

    const renderIcon = (
      iconName: string,
      position: 'left' | 'right',
      onPress?: () => void
    ) => {
      const iconSize = config.iconSize;
      const IconComponent = (
        <Icon
          name={iconName}
          size={iconSize}
          color={
            hasError
              ? variables['--error']
              : isFocused
                ? variables['--primary']
                : variables['--text-secondary']
          }
          style={[position === 'left' ? styles.leftIcon : styles.rightIcon]}
        />
      );

      return onPress ? (
        <TouchableOpacity onPress={onPress} style={styles.iconTouchable}>
          {IconComponent}
        </TouchableOpacity>
      ) : (
        IconComponent
      );
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Animated.View
            style={[
              styles.labelContainer,
              {
                transform: [
                  {
                    translateY: focusedAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  },
                  {
                    scale: focusedAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.85]
                    })
                  }
                ]
              }
            ]}
          >
            <Text
              style={[
                styles.label,
                isFocused && styles.labelFocused,
                hasError && styles.labelError
              ]}
            >
              {label}
            </Text>
          </Animated.View>
        )}

        <View style={getContainerStyle()}>
          {(leftIcon || iconName) && renderIcon(leftIcon || iconName, 'left')}

          <TextInput
            ref={ref}
            style={[styles.input, inputStyle]}
            placeholderTextColor={variables['--placeholder']}
            selectionColor={variables['--primary']}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value}
            {...props}
            secureTextEntry={isPasswordInput && !isPasswordVisible}
          />

          {isPasswordInput &&
            renderIcon(
              isPasswordVisible ? 'visibility-off' : 'visibility',
              'right',
              togglePasswordVisibility
            )}

          {rightIcon &&
            !isPasswordInput &&
            renderIcon(rightIcon, 'right', onRightIconPress)}
        </View>

        {(helperText || errorMessage) && (
          <Text style={[styles.helperText, hasError && styles.errorText]}>
            {errorMessage || helperText}
          </Text>
        )}
      </View>
    );
  }
);

const createStyles = (
  variables: ThemeVariablesType,
  variant: 'outlined' | 'filled',
  size: 'small' | 'medium' | 'large'
) => {
  const sizeConfig = {
    small: { height: 40, fontSize: 14, iconSize: 20, padding: 12 },
    medium: { height: 50, fontSize: 16, iconSize: 24, padding: 15 },
    large: { height: 60, fontSize: 18, iconSize: 28, padding: 18 }
  };

  const config = sizeConfig[size];

  return StyleSheet.create({
    container: {
      marginBottom: variables['--spacing-medium']
    },
    labelContainer: {
      position: 'absolute',
      left: config.padding + (config.iconSize + 10),
      zIndex: 1,
      backgroundColor:
        variant === 'outlined' ? variables['--background'] : 'transparent',
      paddingHorizontal: 4
    },
    label: {
      fontSize: config.fontSize,
      color: variables['--text-secondary'],
      fontFamily: variables['--font-family-primary'],
      fontWeight: '400'
    },
    labelFocused: {
      color: variables['--primary']
    },
    labelError: {
      color: variables['--error']
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        variant === 'filled'
          ? variables['--surface-variant']
          : variables['--surface'],
      borderRadius: variables['--border-radius-medium'],
      borderWidth: variables['--border-width-hairline'],
      borderColor: variables['--border'],
      paddingHorizontal: config.padding,
      minHeight: config.height,
      shadowColor: variables['--shadow'],
      shadowOffset: {
        width: 0,
        height: 1
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    },
    filledVariant: {
      backgroundColor: variables['--surface-variant'],
      borderBottomWidth: 2,
      borderTopWidth: 0,
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0
    },
    focused: {
      borderColor: variables['--primary'],
      borderWidth: 2,
      shadowColor: variables['--primary'],
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    errorBorder: {
      borderColor: variables['--error'],
      borderWidth: 2
    },
    leftIcon: {
      marginRight: 10
    },
    rightIcon: {
      marginLeft: 10
    },
    iconTouchable: {
      padding: 4,
      borderRadius: variables['--border-radius-medium']
    },
    input: {
      flex: 1,
      fontSize: config.fontSize,
      color: variables['--text'],
      fontFamily: variables['--font-family-primary'],
      paddingVertical: 0
    },
    helperText: {
      fontSize: variables['--font-size-small'],
      color: variables['--text-secondary'],
      fontFamily: variables['--font-family-primary'],
      marginTop: variables['--spacing-tiny'],
      marginLeft: config.padding
    },
    errorText: {
      color: variables['--error']
    }
  });
};

AuthTextInput.displayName = 'AuthTextInput';

export default React.memo(AuthTextInput);
