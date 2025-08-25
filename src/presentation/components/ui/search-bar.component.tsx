import React, { useMemo } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';
import { themeVariables } from '@/presentation/contexts/theme.context';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  theme: Theme;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder,
  theme,
  onClear
}) => {
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={variables['--placeholder']}
        value={value}
        onChangeText={onChangeText}
        autoComplete="off"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={onClear}
          accessibilityLabel="Clear search"
        >
          <Icon name="close" size={20} color={variables['--text']} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (vars: Record<string, string>) =>
  StyleSheet.create({
    container: {
      position: 'relative',
      marginHorizontal: 16,
      marginVertical: 12
    },
    searchInput: {
      padding: 12,
      paddingRight: 40,
      borderRadius: 8,
      fontSize: 16,
      borderWidth: 1,
      backgroundColor: vars['--surface'],
      color: vars['--text'],
      borderColor: vars['--border']
    },
    clearButton: {
      position: 'absolute',
      right: 12,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      padding: 8
    }
  });

export default SearchBar;
