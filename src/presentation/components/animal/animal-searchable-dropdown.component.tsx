import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Theme, themeVariables } from '../../contexts/theme-context';

interface AnimalSearchableDropdownProps<T extends string> {
  options: readonly T[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  placeholder?: string;
  theme: Theme;
}

const AnimalSearchableDropdown = <T extends string>({
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Selecciona...',
  theme,
}: AnimalSearchableDropdownProps<T>) => {
  const vars = themeVariables(theme);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const styles = useMemo(() => createStyles(vars), [vars]);

  const selectedOptionTextStyle = useMemo(() => ({
    color: vars['--text-on-primary'],
    fontWeight: '600' as const,
  }), [vars]);

  const optionTextStyle = useMemo(() => ({
    color: vars['--text'],
    fontWeight: '400' as const,
  }), [vars]);

  const filteredOptions = useMemo(
    () =>
      options.filter((opt) =>
        opt.toLowerCase().includes(searchText.toLowerCase())
      ),
    [searchText, options]
  );

  const handleSelect = (value: T) => {
    setIsOpen(false);
    setSearchText('');
    onValueChange(value);
  };

  return (
    <View style={styles.container}>
      {/* Input */}
      <TouchableOpacity
        style={styles.inputContainer}
        activeOpacity={0.85}
        onPress={() => setIsOpen((prev) => !prev)}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={searchText || selectedValue}
          onChangeText={setSearchText}
          placeholderTextColor={vars['--text-secondary']}
          editable={true}
        />
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={vars['--text-secondary']}
        />
      </TouchableOpacity>

      {/* Dropdown */}
      {isOpen && (
        <View style={styles.dropdown}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {filteredOptions.map((option) => {
              const isSelected = option === selectedValue;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                    isSelected && { backgroundColor: vars['--primary'] },
                  ]}
                  onPress={() => handleSelect(option)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected ? selectedOptionTextStyle : optionTextStyle,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const createStyles = (vars: Record<string, string>) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: 16,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: vars['--outline'],
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === 'ios' ? 12 : 8,
      backgroundColor: vars['--surface'],
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: vars['--text'],
    },
    dropdown: {
      position: 'absolute',
      top: 60,
      width: '100%',
      backgroundColor: vars['--surface'],
      borderWidth: 1,
      borderColor: vars['--outline'],
      borderRadius: 12,
      maxHeight: 250,
      overflow: 'hidden',
      zIndex: 1000,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    option: {
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    optionSelected: {
      borderRadius: 8,
    },
    optionText: {
      fontSize: 16,
    },
  });

export default AnimalSearchableDropdown;
