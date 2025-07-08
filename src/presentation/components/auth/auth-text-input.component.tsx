import React, { useMemo, useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AuthTextInputProps extends TextInputProps {
  iconName: React.ComponentProps<typeof Icon>['name'];
  error?: boolean;
  variables: any;
}

const AuthTextInput: React.FC<AuthTextInputProps> = ({ iconName, error, style, variables, ...props }) => {
  const styles = useMemo(() => createStyles(variables), [variables]);

  const isPasswordInput = props.secureTextEntry;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <View style={[styles.inputContainer, error ? styles.errorBorder : null, style]}>
      <Icon name={iconName} size={24} color={variables['--text-secondary']} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholderTextColor={variables['--placeholder']}
        {...props}
        secureTextEntry={isPasswordInput && !isPasswordVisible}
      />
      {isPasswordInput && (
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Icon
            name={isPasswordVisible ? 'visibility-off' : 'visibility'}
            size={24}
            color={variables['--text-secondary']}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (variables: any) => StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: variables['--surface-variant'],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: variables['--border'],
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
    color: variables['--text'],
  },
  errorBorder: {
    borderColor: '#ef4444',
  },
});

export default React.memo(AuthTextInput);