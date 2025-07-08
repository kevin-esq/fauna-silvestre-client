import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    theme: any;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, placeholder, theme }) => {
    return (
        <TextInput
            style={[
                styles.searchInput,
                {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    //placeholderTextColor: theme.colors.placeholder,
                }
            ]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.placeholder}
            value={value}
            onChangeText={onChangeText}
            clearButtonMode="while-editing"
        />
    );
};

const styles = StyleSheet.create({
    searchInput: {
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 16,
        marginVertical: 12,
        fontSize: 16,
        borderWidth: 1,
    },
});

export default SearchBar;