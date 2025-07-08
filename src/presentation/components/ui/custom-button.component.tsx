import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme, themeVariables } from "../../contexts/theme-context";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  style?: object;
  textStyle?: object;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled,
  variant = 'primary',
  ...props
}) => {
  const { theme } = useTheme();
  const variables = themeVariables(theme);
  const styles = createStyles(variables);

  return (
    <TouchableOpacity 
      style={[styles.button, variant === 'primary' ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.secondary }, style, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, variant === 'primary' ? { color: theme.colors.textOnPrimary } : { color: theme.colors.textOnSecondary }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (variables: any) => StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomButton;