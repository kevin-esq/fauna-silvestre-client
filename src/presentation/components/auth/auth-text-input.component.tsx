import React, { useMemo, useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface AuthTextInputProps extends TextInputProps {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  error?: boolean;
  theme: any;
}

const AuthTextInput: React.FC<AuthTextInputProps> = ({ iconName, error, style, theme, ...props }) => {
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isPasswordInput = props.secureTextEntry;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <View style={[styles.inputContainer, error ? styles.errorBorder : null, style]}>
      <MaterialIcons name={iconName} size={24} color={theme.colors.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholderTextColor={theme.colors.placeholder}
        {...props}
        secureTextEntry={isPasswordInput && !isPasswordVisible}
      />
      {isPasswordInput && (
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <MaterialIcons
            name={isPasswordVisible ? 'visibility-off' : 'visibility'}
            size={24}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 15,
    marginBottom: 16,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
        height: 50,
    fontSize: 16,
    color: theme.colors.text,
  },
  errorBorder: {
    borderColor: '#ef4444',
  },
});

export default React.memo(AuthTextInput);