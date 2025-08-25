import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Theme, themeVariables } from '../../contexts/theme.context';

interface AnimalSearchableDropdownProps<T extends string> {
  options: readonly T[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  placeholder?: string;
  theme: Theme;
  label?: string;
}

const AnimalSearchableDropdown = <T extends string>({
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Selecciona...',
  theme,
  label
}: AnimalSearchableDropdownProps<T>) => {
  const vars = themeVariables(theme);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dropdownAnimation] = useState(new Animated.Value(0));

  const styles = useMemo(() => createStyles(vars), [vars]);

  const selectedOptionTextStyle = useMemo(
    () => ({
      color: vars['--text-on-primary'],
      fontWeight: '600' as const
    }),
    [vars]
  );

  const optionTextStyle = useMemo(
    () => ({
      color: vars['--text'],
      fontWeight: '400' as const
    }),
    [vars]
  );

  const filteredOptions = useMemo(
    () =>
      options.filter(opt =>
        opt.toLowerCase().includes(searchText.toLowerCase())
      ),
    [searchText, options]
  );

  const toggleDropdown = () => {
    if (isOpen) {
      Animated.timing(dropdownAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false
      }).start(() => setIsOpen(false));
    } else {
      setIsOpen(true);
      Animated.timing(dropdownAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false
      }).start();
    }
  };

  const handleSelect = (value: T) => {
    setSearchText('');
    onValueChange(value);
    toggleDropdown();
  };

  const clearSelection = () => {
    setSearchText('');
    onValueChange('' as T);
  };

  const displayValue = searchText || selectedValue || '';
  const showClearButton = selectedValue && !isOpen;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Input Container */}
      <TouchableOpacity
        style={[styles.inputContainer, isOpen && styles.inputContainerOpen]}
        activeOpacity={0.8}
        onPress={toggleDropdown}
      >
        <View style={styles.inputContent}>
          <Icon
            name="search"
            size={18}
            color={vars['--text-secondary']}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={displayValue}
            onChangeText={setSearchText}
            placeholderTextColor={vars['--text-secondary']}
            editable={isOpen}
            pointerEvents={isOpen ? 'auto' : 'none'}
          />

          {showClearButton && (
            <TouchableOpacity
              onPress={clearSelection}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon
                name="close-circle"
                size={18}
                color={vars['--text-secondary']}
              />
            </TouchableOpacity>
          )}

          <Icon
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={vars['--text-secondary']}
            style={styles.chevronIcon}
          />
        </View>
      </TouchableOpacity>

      {/* Animated Dropdown */}
      {isOpen && (
        <Animated.View
          style={[
            styles.dropdown,
            {
              opacity: dropdownAnimation,
              transform: [
                {
                  scaleY: dropdownAnimation
                }
              ]
            }
          ]}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filteredOptions.length === 0 ? (
              <View style={styles.noResults}>
                <Icon
                  name="search"
                  size={24}
                  color={vars['--text-secondary']}
                />
                <Text style={styles.noResultsText}>
                  {searchText
                    ? 'No se encontraron resultados'
                    : 'No hay opciones disponibles'}
                </Text>
              </View>
            ) : (
              filteredOptions.map(option => {
                const isSelected = option === selectedValue;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.option,
                      isSelected && styles.optionSelected,
                      isSelected && { backgroundColor: vars['--primary'] }
                    ]}
                    onPress={() => handleSelect(option)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected ? selectedOptionTextStyle : optionTextStyle
                      ]}
                    >
                      {option}
                    </Text>
                    {isSelected && (
                      <Icon
                        name="checkmark"
                        size={18}
                        color={vars['--text-on-primary']}
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

const createStyles = (vars: Record<string, string>) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: 16,
      zIndex: 1000
    },

    label: {
      fontSize: 14,
      fontWeight: '600',
      color: vars['--text'],
      marginBottom: 6
    },

    inputContainer: {
      borderWidth: 1.5,
      borderColor: vars['--border'],
      borderRadius: 12,
      backgroundColor: vars['--surface'],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2
    },

    inputContainerOpen: {
      borderColor: vars['--primary'],
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 4
    },

    inputContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === 'ios' ? 14 : 12
    },

    searchIcon: {
      marginRight: 10
    },

    input: {
      flex: 1,
      fontSize: 16,
      color: vars['--text'],
      fontWeight: '400'
    },

    clearButton: {
      marginRight: 8
    },

    chevronIcon: {
      marginLeft: 4
    },

    dropdown: {
      position: 'absolute',
      top: '100%',
      width: '100%',
      backgroundColor: vars['--surface'],
      borderWidth: 1.5,
      borderColor: vars['--primary'],
      borderTopWidth: 0,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      maxHeight: 200,
      overflow: 'hidden',
      zIndex: 1001,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8
    },

    option: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 0.5,
      borderBottomColor: vars['--border']
    },

    optionSelected: {
      backgroundColor: vars['--primary']
    },

    optionText: {
      fontSize: 15,
      flex: 1
    },

    noResults: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },

    noResultsText: {
      fontSize: 14,
      color: vars['--text-secondary'],
      textAlign: 'center',
      marginTop: 8,
      fontStyle: 'italic'
    }
  });

export default AnimalSearchableDropdown;
