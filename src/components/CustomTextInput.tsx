import React, { useState, useCallback, FC } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInputProps,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import { MaterialIcons } from "@expo/vector-icons";

export type InputType =
  | "username"
  | "name"
  | "lastName"
  | "location"
  | "text"
  | "password"
  | "email"
  | "date"
  | "file"
  | "select"
  | "textarea"
  | "number";

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
  icon?: React.ReactNode;
}

const getAutoCompleteType = (
  type: InputType
): TextInputProps["autoComplete"] => {
  switch (type) {
    case "username":
      return "username";
    case "password":
      return "password";
    case "email":
      return "email";
    case "name":
      return "name";
    case "lastName":
      return "name-family";
    case "location":
      return "address-line1";
    default:
      return "off";
  }
};

const CustomInput: FC<CustomInputProps> = ({
  label,
  type,
  value = "",
  placeholder,
  onChange,
  options,
  style,
  error = false,
  errorMessage,
  autoFocus = false,
  disabled = false,
  icon,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [selectedFile, setSelectedFile] = useState<string | null>(
    value || null
  );
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error ? "#ef4444" : isFocused ? "#3b82f6" : "#ccc";
  const borderWidth = isFocused || error ? 2 : 1;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleDateChange = useCallback(
    (_: any, selectedDate?: Date) => {
      setShowDatePicker(false);
      if (selectedDate) {
        setDate(selectedDate);
        onChange?.(selectedDate.toISOString());
      }
    },
    [onChange]
  );

  const handleFilePick = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if ("name" in result && typeof result.name === "string") {
        setSelectedFile(result.name);
        onChange?.(result.name);
      }
    } catch (err) {
      console.error("Error al seleccionar archivo:", err);
    }
  }, [onChange]);

  const renderTextInput = (
    keyboardType: "default" | "email-address" | "numeric" = "default",
    secureTextEntry = false
  ) => (
    <View
      style={[
        styles.inputWrapper,
        {
          borderColor,
          borderWidth,
          backgroundColor: disabled ? "#f5f5f5" : "#fff",
        },
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <TextInput
        placeholder={placeholder}
        value={value}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChangeText={onChange}
        editable={!disabled}
        autoFocus={autoFocus}
        autoCapitalize="none"
        multiline={type === "textarea"}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoComplete={getAutoCompleteType(type)}
        style={[styles.input, type === "textarea" && styles.textarea]}
      />
    </View>
  );

  const renderInputByType = () => {
    switch (type) {
      case "date":
        return (
          <>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.inputContainer,
                {
                  borderColor,
                  borderWidth,
                  backgroundColor: disabled ? "#f5f5f5" : "#fff",
                },
              ]}
              disabled={disabled}
            >
              <View style={styles.row}>
                <Text
                  style={[styles.inputText, { color: value ? "#000" : "#888" }]}
                >
                  {value
                    ? new Date(value).toLocaleDateString()
                    : placeholder || "Selecciona fecha"}
                </Text>
                {value && (
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color="#4caf50"
                  />
                )}
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
              />
            )}
          </>
        );

      case "select":
        return (
          <View
            style={[
              styles.pickerContainer,
              {
                borderColor,
                borderWidth,
                backgroundColor: disabled ? "#f5f5f5" : "#fff",
              },
            ]}
          >
            <Picker
              selectedValue={value}
              onValueChange={(val) => onChange?.(val)}
              style={styles.picker}
              enabled={!disabled}
            >
              {options?.map((opt) => (
                <Picker.Item
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                />
              ))}
            </Picker>
          </View>
        );

      case "file":
        return (
          <TouchableOpacity
            onPress={handleFilePick}
            style={[
              styles.inputContainer,
              {
                borderColor,
                borderWidth,
                backgroundColor: disabled ? "#f5f5f5" : "#fff",
              },
            ]}
            disabled={disabled}
          >
            <View style={styles.row}>
              <Text
                style={[
                  styles.inputText,
                  { color: selectedFile ? "#000" : "#888" },
                ]}
              >
                {selectedFile || placeholder || "Selecciona archivo"}
              </Text>
              {selectedFile && (
                <MaterialIcons name="check-circle" size={20} color="#4caf50" />
              )}
            </View>
          </TouchableOpacity>
        );

      case "password":
        return (
          <View
            style={[
              styles.inputWrapper,
              {
                borderColor,
                borderWidth,
                backgroundColor: disabled ? "#f5f5f5" : "#fff",
              },
            ]}
          >
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <TextInput
              placeholder={placeholder}
              value={value}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChangeText={onChange}
              secureTextEntry={!showPassword}
              editable={!disabled}
              autoFocus={autoFocus}
              autoComplete={getAutoCompleteType(type)}
              style={[styles.passwordInput, { flex: 1 }]}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.showPasswordButton}
              disabled={disabled}
            >
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={24}
                color="#888"
              />
            </TouchableOpacity>
          </View>
        );

      case "email":
        return renderTextInput("email-address");

      case "number":
        return renderTextInput("numeric");

      default:
        return renderTextInput();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      {renderInputByType()}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const commonShadow = {
  shadowColor: "#000",
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
    marginBottom: 6,
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    ...commonShadow,
  },
  inputContainer: {
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: "#fff",
    ...commonShadow,
  },
  pickerContainer: {
    borderRadius: 14,
    overflow: "hidden",
    height: 52,
    justifyContent: "center",
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    ...commonShadow,
  },
  picker: {
    height: 52,
    fontSize: 16,
  },
  input: {
    fontSize: 16,
    color: "#222",
    flex: 1,
    height: "100%",
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  passwordInput: {
    fontSize: 16,
    color: "#222",
    paddingVertical: 0,
  },
  inputText: {
    fontSize: 16,
    color: "#222",
  },
  textarea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  iconContainer: {
    marginRight: 10,
  },
  showPasswordButton: {
    paddingLeft: 10,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default React.memo(CustomInput);
