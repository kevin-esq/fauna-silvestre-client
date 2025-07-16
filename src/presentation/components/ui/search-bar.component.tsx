import React, { useMemo } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { Theme } from '../../contexts/theme-context';
import { themeVariables } from '../../contexts/theme-context';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    theme: Theme;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, placeholder, theme }) => {
    const variables = useMemo(() => themeVariables(theme), [theme]);
    const styles = useMemo(() => createStyles(variables), [variables]);
    return (
        <TextInput
            style={[
                styles.searchInput,
            ]}
            placeholder={placeholder}
            placeholderTextColor={variables['--placeholder']}
            value={value}
            onChangeText={onChangeText}
            clearButtonMode="while-editing"
        />
    );
};

const createStyles = (vars: Record<string, string>) =>
StyleSheet.create({
    searchInput: {
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 16,
        marginVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        backgroundColor: vars['--surface'],
        color: vars['--text'],
        borderColor: vars['--border'],
    },
});

export default SearchBar;