import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { themeVariables } from '../../contexts/theme-context';

interface AnimalSearchableDropdownProps<T extends string> {
  options: readonly T[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  placeholder?: string;
  theme: any;
}

const AnimalSearchableDropdown = <T extends string>({
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Selecciona un animal',
  theme,
}: AnimalSearchableDropdownProps<T>) => {
  const vars = useMemo(() => themeVariables(theme), [theme]);

  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
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

  const styles = useMemo(() => createStyles(vars), [vars]);

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
        <Ionicons
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
                      {
                        color: isSelected
                          ? vars['--text-on-primary']
                          : vars['--text'],
                        fontWeight: isSelected ? '600' : '400',
                      },
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
