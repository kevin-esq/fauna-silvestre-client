import { ThemeVariablesType } from '@/presentation/contexts/theme.context';
import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View
} from 'react-native';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variables: ThemeVariablesType | undefined;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  leftIcon,
  rightIcon,
  variables
}) => {
  const styles = useMemo(() => createStyles(variables), [variables]);

  const isDisabled = disabled || loading;

  const getButtonStyle = (): StyleProp<ViewStyle> => {
    const baseStyles: Array<StyleProp<ViewStyle>> = [styles.button];

    switch (variant) {
      case 'primary':
        baseStyles.push(styles.primaryButton);
        break;
      case 'secondary':
        baseStyles.push(styles.secondaryButton);
        break;
      case 'outline':
        baseStyles.push(styles.outlineButton);
        break;
      case 'danger':
        baseStyles.push(styles.dangerButton);
        break;
      case 'success':
        baseStyles.push(styles.successButton);
        break;
    }

    switch (size) {
      case 'small':
        baseStyles.push(styles.smallButton);
        break;
      case 'medium':
        baseStyles.push(styles.mediumButton);
        break;
      case 'large':
        baseStyles.push(styles.largeButton);
        break;
    }

    if (fullWidth) baseStyles.push(styles.fullWidth);
    if (isDisabled) baseStyles.push(styles.disabledButton);
    if (style) baseStyles.push(style);

    return baseStyles;
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    const baseStyles: Array<StyleProp<TextStyle>> = [styles.text];

    switch (variant) {
      case 'primary':
        baseStyles.push(styles.primaryText);
        break;
      case 'secondary':
        baseStyles.push(styles.secondaryText);
        break;
      case 'outline':
        baseStyles.push(styles.outlineText);
        break;
      case 'danger':
        baseStyles.push(styles.dangerText);
        break;
      case 'success':
        baseStyles.push(styles.successText);
        break;
    }

    switch (size) {
      case 'small':
        baseStyles.push(styles.smallText);
        break;
      case 'medium':
        baseStyles.push(styles.mediumText);
        break;
      case 'large':
        baseStyles.push(styles.largeText);
        break;
    }

    if (isDisabled) baseStyles.push(styles.disabledText);
    if (textStyle) baseStyles.push(textStyle);

    return baseStyles;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={getLoadingColor(variant, variables)}
            style={styles.spinner}
          />
          <Text style={[getTextStyle(), { opacity: 0.7 }]}>Cargando...</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const getLoadingColor = (
  variant: string,
  variables: ThemeVariablesType | undefined
) => {
  switch (variant) {
    case 'primary':
      return variables?.['--text-on-primary'] || '#FFFFFF';
    case 'secondary':
      return variables?.['--text-on-secondary'] || '#212121';
    case 'outline':
      return variables?.['--primary'] || '#007A33';
    case 'danger':
      return '#FFFFFF';
    case 'success':
      return '#FFFFFF';
    default:
      return variables?.['--text-on-primary'] || '#FFFFFF';
  }
};

const createStyles = (variables: ThemeVariablesType | undefined) =>
  StyleSheet.create({
    button: {
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 6,
      shadowColor: variables?.['--shadow'] || 'rgba(0, 0, 0, 0.1)',
      shadowOffset: {
        width: 0,
        height: 3
      },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4
    },

    primaryButton: {
      backgroundColor:
        variables?.['--primary-button'] || variables?.['--primary'] || '#007A33'
    },
    secondaryButton: {
      backgroundColor:
        variables?.['--secondary-button'] ||
        variables?.['--secondary'] ||
        '#FFD600'
    },
    outlineButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: variables?.['--primary'] || '#007A33'
    },
    dangerButton: {
      backgroundColor: variables?.['--error'] || '#C62828'
    },
    successButton: {
      backgroundColor: variables?.['--success'] || '#388E3C'
    },

    smallButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      minHeight: 40
    },
    mediumButton: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      minHeight: 48
    },
    largeButton: {
      paddingVertical: 18,
      paddingHorizontal: 24,
      minHeight: 56
    },

    disabledButton: {
      backgroundColor: variables?.['--disabled'] || '#E0E0E0',
      shadowOpacity: 0,
      elevation: 0
    },

    fullWidth: {
      width: '100%'
    },

    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },

    leftIcon: {
      marginRight: 8
    },
    rightIcon: {
      marginLeft: 8
    },
    spinner: {
      marginRight: 8
    },

    text: {
      fontWeight: '600',
      textAlign: 'center',
      letterSpacing: 0.3
    },

    primaryText: {
      color:
        variables?.['--primary-button-text'] ||
        variables?.['--text-on-primary'] ||
        '#FFFFFF'
    },
    secondaryText: {
      color:
        variables?.['--secondary-button-text'] ||
        variables?.['--text-on-secondary'] ||
        '#212121'
    },
    outlineText: {
      color: variables?.['--primary'] || '#007A33'
    },
    dangerText: {
      color: '#FFFFFF'
    },
    successText: {
      color: '#FFFFFF'
    },

    smallText: {
      fontSize: 14
    },
    mediumText: {
      fontSize: 16
    },
    largeText: {
      fontSize: 18
    },

    disabledText: {
      color: variables?.['--disabled-text'] || '#9E9E9E'
    }
  });

export default React.memo(CustomButton);
