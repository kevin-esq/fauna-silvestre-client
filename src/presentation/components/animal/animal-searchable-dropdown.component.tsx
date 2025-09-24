import React, { useState, useMemo, useCallback } from 'react';
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
import { CommonNounResponse } from '../../../domain/models/animal.models';

interface AnimalSearchableDropdownProps {
  options: CommonNounResponse[];
  selectedValue: CommonNounResponse | null;
  onValueChange: (value: CommonNounResponse | null) => void;
  placeholder?: string;
  theme: Theme;
  label?: string;
  onDropdownToggle?: (isOpen: boolean) => void;
}

const AnimalSearchableDropdown = React.memo(
  ({
    options,
    selectedValue,
    onValueChange,
    placeholder = 'Selecciona...',
    theme,
    label,
    onDropdownToggle
  }: AnimalSearchableDropdownProps) => {
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

    const filteredOptions = useMemo(() => {
      const filtered = options.filter(opt =>
        opt.commonNoun.toLowerCase().includes(searchText.toLowerCase())
      );
      return filtered.slice(0, 50);
    }, [searchText, options]);

    const toggleDropdown = useCallback(() => {
      if (isOpen) {
        Animated.timing(dropdownAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false
        }).start(() => {
          setIsOpen(false);
          onDropdownToggle?.(false);
        });
      } else {
        setIsOpen(true);
        onDropdownToggle?.(true);
        Animated.timing(dropdownAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false
        }).start();
      }
      // eslint-disable-next-line
    }, [isOpen, onDropdownToggle]);

    const handleSelect = useCallback(
      (value: CommonNounResponse) => {
        setSearchText('');
        onValueChange(value);
        toggleDropdown();
      },
      [onValueChange, toggleDropdown]
    );

    const clearSelection = useCallback(() => {
      setSearchText('');
      onValueChange(null);
    }, [onValueChange]);

    const displayValue = searchText || selectedValue?.commonNoun || '';
    const showClearButton = selectedValue && !isOpen;

    const renderOption = useCallback(
      (option: CommonNounResponse) => {
        const isSelected = selectedValue?.catalogId === option.catalogId;
        return (
          <TouchableOpacity
            key={option.catalogId}
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
              {option.commonNoun}
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
      },
      [
        selectedValue,
        styles,
        vars,
        handleSelect,
        selectedOptionTextStyle,
        optionTextStyle
      ]
    );

    return (
      <View style={[styles.container, isOpen && styles.containerOpen]}>
        {label && <Text style={styles.label}>{label}</Text>}

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
                filteredOptions.map(renderOption)
              )}
            </ScrollView>
          </Animated.View>
        )}
      </View>
    );
  }
);

const createStyles = (vars: Record<string, string>) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: 16
    },
    containerOpen: {
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
      elevation: 2,
      zIndex: 1
    },

    inputContainerOpen: {
      borderColor: vars['--primary'],
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 4,
      zIndex: 1000,
      elevation: 1000
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
      left: 0,
      right: 0,
      backgroundColor: vars['--surface'],
      borderWidth: 1.5,
      borderColor: vars['--primary'],
      borderTopWidth: 0,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      maxHeight: 200,
      overflow: 'hidden',
      zIndex: 1001,
      elevation: 1001,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 12
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
