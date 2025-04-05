import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialIcons } from '@expo/vector-icons';

export type InputType = 'text' | 'password' | 'email' | 'date' | 'file' | 'select' | 'textarea';

interface Option {
  label: string;
  value: string;
}

interface CustomInputProps {
  label?: string;
  type: InputType;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  options?: Option[];
  style?: object;
  error?: boolean;
  errorMessage?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  type,
  value = '',
  placeholder,
  onChange,
  options,
  style,
  error = false,
  errorMessage,
  autoFocus = false,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [selectedFile, setSelectedFile] = useState<string | null>(value || null);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleDateChange = useCallback(
    (event: any, selectedDate?: Date) => {
      setShowDatePicker(false);
      if (selectedDate) {
        setDate(selectedDate);
        onChange && onChange(selectedDate.toISOString());
      }
    },
    [onChange]
  );

  const handleFilePick = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if ('name' in result && result.name && typeof result.name === 'string') {
        setSelectedFile(result.name);
        onChange && onChange(result.name);
      }
    } catch (error) {
      console.error('Error al seleccionar el archivo:', error);
    }
  }, [onChange]);

  const borderColor = error ? '#ef4444' : isFocused ? '#3b82f6' : '#ccc';
  const borderWidth = isFocused || error ? 2 : 1;

  const renderInput = () => {
    const commonInputProps = {
      placeholder,
      value,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onChangeText: onChange,
      editable: !disabled,
      autoFocus,
      style: [
        styles.input,
        type === 'textarea' && styles.textarea,
        {
          borderColor,
          borderWidth,
          backgroundColor: disabled ? '#f5f5f5' : '#fff',
        },
      ],
    };

    switch (type) {
      case 'date':
        return (
          <>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.inputContainer,
                { borderColor, borderWidth, backgroundColor: disabled ? '#f5f5f5' : '#fff' },
              ]}
              disabled={disabled}
            >
              <View style={styles.row}>
                <Text style={[styles.inputText, { color: value ? '#000' : '#888' }]}>
                  {value ? new Date(value).toLocaleDateString() : placeholder || 'Selecciona fecha'}
                </Text>
                {value && <MaterialIcons name="check-circle" size={20} color="#4caf50" />}
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}
          </>
        );
      case 'select':
        return (
          <View
            style={[
              styles.pickerContainer,
              { borderColor, borderWidth, backgroundColor: disabled ? '#f5f5f5' : '#fff' },
            ]}
          >
            <Picker
              selectedValue={value}
              onValueChange={(itemValue) => onChange && onChange(itemValue)}
              style={styles.picker}
              enabled={!disabled}
            >
              {options?.map((opt) => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
          </View>
        );
      case 'file':
        return (
          <TouchableOpacity
            onPress={handleFilePick}
            style={[
              styles.inputContainer,
              { borderColor, borderWidth, backgroundColor: disabled ? '#f5f5f5' : '#fff' },
            ]}
            disabled={disabled}
          >
            <View style={styles.row}>
              <Text style={[styles.inputText, { color: selectedFile ? '#000' : '#888' }]}>
                {selectedFile || placeholder || 'Selecciona archivo'}
              </Text>
              {selectedFile && <MaterialIcons name="check-circle" size={20} color="#4caf50" />}
            </View>
          </TouchableOpacity>
        );
      case 'password':
        return (
          <View
            style={[
              styles.passwordContainer,
              { borderColor, borderWidth, backgroundColor: disabled ? '#f5f5f5' : '#fff' },
            ]}
          >
            <TextInput
              placeholder={placeholder}
              value={value}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChangeText={onChange}
              secureTextEntry={!showPassword}
              editable={!disabled}
              autoFocus={autoFocus}
              style={[styles.passwordInput, { flex: 1 }]}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.showPasswordButton}
              disabled={disabled}
            >
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="#888"
              />
            </TouchableOpacity>
          </View>
        );
      default:
        return <TextInput {...commonInputProps} multiline={type === 'textarea'} />;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      {renderInput()}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const commonShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  inputContainer: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 15,
    ...commonShadow,
  },
  inputText: {
    fontSize: 16,
  },
  input: {
    fontSize: 16,
    color: '#000',
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 12,
    ...commonShadow,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  pickerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 10,
    ...commonShadow,
  },
  picker: {
    height: 50,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 12,
    borderRadius: 12,
    ...commonShadow,
  },
  passwordInput: {
    fontSize: 16,
    color: '#000',
    paddingVertical: 0,
  },
  showPasswordButton: {
    paddingLeft: 10,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default React.memo(CustomInput);
