import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Theme } from '../../contexts/theme.context';

interface CatalogFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  isVisible: boolean;
  theme: Theme;
  onVisibilityChange?: (visible: boolean) => void;
}

interface FilterChipProps {
  label: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
  theme: Theme;
  color?: string;
}

const VERTEBRATE_CLASSES = [
  { id: 'Todas', label: 'Todas', icon: 'paw-outline' },
  { id: 'Mamíferos', label: 'Mamíferos', icon: 'paw' },
  { id: 'Aves', label: 'Aves', icon: 'airplane' },
  { id: 'Reptiles', label: 'Reptiles', icon: 'git-branch' },
  { id: 'Anfibios', label: 'Anfibios', icon: 'water' },
  { id: 'Peces', label: 'Peces', icon: 'fish' }
];

const SORT_OPTIONS = [
  { id: 'name', label: 'Nombre', icon: 'text' },
  { id: 'specie', label: 'Especie', icon: 'leaf' },
  { id: 'class', label: 'Clase', icon: 'layers' },
  { id: 'date', label: 'Fecha', icon: 'calendar' }
];

const FilterChip: React.FC<FilterChipProps> = React.memo(
  ({ label, icon, isSelected, onPress, theme, color }) => {
    const chipColor = color || theme.colors.primary;

    return (
      <TouchableOpacity
        style={[
          createChipStyles(theme).chip,
          isSelected && [
            createChipStyles(theme).chipSelected,
            { backgroundColor: chipColor, borderColor: chipColor }
          ]
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon}
          size={14}
          color={
            isSelected ? theme.colors.textOnPrimary : theme.colors.textSecondary
          }
        />
        <Text
          style={[
            createChipStyles(theme).chipText,
            isSelected && createChipStyles(theme).chipTextSelected
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }
);

const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSort,
  onSortChange,
  isVisible,
  theme
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const searchTimeoutRef = useRef<number | null>(null);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setLocalSearchQuery(text);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        onSearchChange(text);
      }, 300);
    },
    [onSearchChange]
  );

  const clearSearch = useCallback(() => {
    setLocalSearchQuery('');
    onSearchChange('');
  }, [onSearchChange]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (searchQuery !== localSearchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery, localSearchQuery]);

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        style={styles.scrollView}
      >
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar animales..."
            placeholderTextColor={theme.colors.placeholder}
            value={localSearchQuery}
            onChangeText={handleSearchChange}
            returnKeyType="search"
          />
          {localSearchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={clearSearch}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="paw" size={18} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Clase de Animal</Text>
          </View>
          <View style={styles.chipsContainer}>
            {VERTEBRATE_CLASSES.map(category => (
              <FilterChip
                key={category.id}
                label={category.label}
                icon={category.icon}
                isSelected={selectedCategory === category.id}
                onPress={() => onCategoryChange(category.id)}
                theme={theme}
                color={theme.colors.primary}
              />
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.sectionLast]}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="swap-vertical"
              size={18}
              color={theme.colors.secondary}
            />
            <Text style={styles.sectionTitle}>Ordenar por</Text>
          </View>
          <View style={styles.chipsContainer}>
            {SORT_OPTIONS.map(option => (
              <FilterChip
                key={option.id}
                label={option.label}
                icon={option.icon}
                isSelected={selectedSort === option.id}
                onPress={() => onSortChange(option.id)}
                theme={theme}
                color={theme.colors.secondary}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.xlarge,
      padding: theme.spacing.xlarge,
      marginHorizontal: theme.spacing.xlarge,
      marginBottom: theme.spacing.large,
      maxHeight: 500,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4
        },
        android: {
          elevation: 3
        }
      })
    },
    scrollView: {
      flexGrow: 1
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xlarge,
      paddingHorizontal: theme.spacing.large,
      paddingVertical: theme.spacing.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.xlarge,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2
        },
        android: {
          elevation: 1
        }
      })
    },
    searchIcon: {
      marginRight: theme.spacing.medium
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      padding: 0
    },
    clearSearchButton: {
      padding: theme.spacing.medium,
      marginLeft: theme.spacing.medium
    },
    section: {
      marginBottom: theme.spacing.xlarge
    },
    sectionLast: {
      marginBottom: 0
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.small,
      marginBottom: theme.spacing.large
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.medium
    }
  });

const createChipStyles = (theme: Theme) =>
  StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.large,
      borderRadius: theme.borderRadius.xlarge,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: theme.spacing.small,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2
        },
        android: {
          elevation: 2
        }
      })
    },
    chipSelected: {
      borderWidth: 2,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 3
        },
        android: {
          elevation: 4
        }
      })
    },
    chipText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500'
    },
    chipTextSelected: {
      color: theme.colors.textOnPrimary,
      fontWeight: '600'
    }
  });

FilterChip.displayName = 'FilterChip';
CatalogFilters.displayName = 'CatalogFilters';

export default CatalogFilters;
