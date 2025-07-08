import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
interface CustomButtonProps {
  title: string;
  onPress: () => void;
  style?: object;
  textStyle?: object;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  variables: Record<string, string> | undefined;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled,
  variant = 'primary',
  variables,
}) => {
  const styles = createStyles(variables);

  const buttonStyle = [
    styles.button,
    variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
    style,
    disabled && styles.disabledButton,
  ];

  const textStyleFinal = [
    styles.text,
    variant === 'primary' ? styles.primaryText : styles.secondaryText,
    textStyle,
  ];

  return (
    <TouchableOpacity 
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={textStyleFinal}>{title}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (variables: Record<string, string> | undefined) => StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  primaryButton: {
    backgroundColor: variables?.['--primary'],
  },
  secondaryButton: {
    backgroundColor: variables?.['--secondary'],
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryText: {
    color: variables?.['--text-on-primary'],
  },
  secondaryText: {
    color: variables?.['--text-on-secondary'],
  },
});

export default CustomButton;