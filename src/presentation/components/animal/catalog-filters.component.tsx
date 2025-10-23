import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { AnimalModelResponse } from '@/domain/models/animal.models';
import { ThemeContextType } from '@/presentation/contexts/theme.context';

export type CategoryOption =
  | 'Todas'
  | 'Mamíferos'
  | 'Aves'
  | 'Reptiles'
  | 'Anfibios'
  | 'Peces';

export type SortOption = 'name' | 'specie' | 'class' | 'date';

export interface FilterOptions {
  category: CategoryOption;
  sortBy: SortOption;
}

interface CatalogFiltersProps {
  animals: AnimalModelResponse[];
  onFilterChange: (
    filtered: AnimalModelResponse[],
    options: FilterOptions
  ) => void;
  theme: ThemeContextType;
  hideToggle?: boolean;
  defaultExpanded?: boolean;
  isVisible?: boolean;
  onExpandChange?: (isExpanded: boolean) => void;
}

interface CategoryConfig {
  value: CategoryOption;
  label: string;
  icon: string;
  iconType: 'ionicons' | 'material' | 'fa5';
}

interface SortConfig {
  value: SortOption;
  label: string;
  icon: string;
}
const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  animals,
  onFilterChange,
  theme,
  hideToggle = false,
  defaultExpanded = false,
  isVisible = true,
  onExpandChange
}) => {
  const { colors, spacing, iconSizes } = theme;
  const [isExpanded, setIsExpanded] = useState(
    hideToggle ? true : defaultExpanded
  );
  const [category, setCategory] = useState<CategoryOption>('Todas');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  const animatedHeight = React.useRef(
    new Animated.Value(hideToggle ? 1 : 0)
  ).current;
  const animatedRotation = React.useRef(new Animated.Value(0)).current;

  const styles = useMemo(() => createFilterStyles(theme), [theme]);

  const categoryOptions: CategoryConfig[] = useMemo(
    () => [
      {
        value: 'Todas' as const,
        label: 'Todas',
        icon: 'paw-outline',
        iconType: 'ionicons'
      },
      {
        value: 'Mamíferos' as const,
        label: 'Mamíferos',
        icon: 'paw',
        iconType: 'fa5'
      },
      {
        value: 'Aves' as const,
        label: 'Aves',
        icon: 'bird',
        iconType: 'material'
      },
      {
        value: 'Reptiles' as const,
        label: 'Reptiles',
        icon: 'snake',
        iconType: 'material'
      },
      {
        value: 'Anfibios' as const,
        label: 'Anfibios',
        icon: 'frog',
        iconType: 'fa5'
      },
      {
        value: 'Peces' as const,
        label: 'Peces',
        icon: 'fish',
        iconType: 'ionicons'
      }
    ],
    []
  );

  const sortOptions: SortConfig[] = useMemo(
    () => [
      { value: 'name' as const, label: 'Nombre', icon: 'text' },
      { value: 'specie' as const, label: 'Especie', icon: 'leaf' },
      { value: 'class' as const, label: 'Clase', icon: 'layers' },
      { value: 'date' as const, label: 'Fecha', icon: 'calendar' }
    ],
    []
  );

  const applyFilters = useCallback(() => {
    let filtered = [...animals];

    if (category !== 'Todas') {
      filtered = filtered.filter(a => a.category === category);
    }

    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) =>
          (a.commonNoun || '').localeCompare(b.commonNoun || '')
        );
        break;
      case 'specie':
        filtered.sort((a, b) => (a.specie || '').localeCompare(b.specie || ''));
        break;
      case 'class':
        filtered.sort((a, b) =>
          (a.category || '').localeCompare(b.category || '')
        );
        break;
      case 'date':
        filtered.sort((a, b) => b.catalogId - a.catalogId);
        break;
    }

    onFilterChange(filtered, { category, sortBy });
  }, [animals, category, sortBy, onFilterChange]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const toggleExpanded = useCallback(() => {
    const toValue = isExpanded ? 0 : 1;

    Animated.parallel([
      Animated.spring(animatedHeight, {
        toValue,
        useNativeDriver: false,
        tension: 40,
        friction: 8
      }),
      Animated.timing(animatedRotation, {
        toValue,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();

    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    if (onExpandChange) {
      onExpandChange(newExpandedState);
    }
  }, [isExpanded, animatedHeight, animatedRotation, onExpandChange]);

  const handleCategoryChange = useCallback((cat: CategoryOption) => {
    setCategory(cat);
  }, []);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
  }, []);

  const clearFilters = useCallback(() => {
    setCategory('Todas');
    setSortBy('name');
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (category !== 'Todas') count++;
    if (sortBy !== 'name') count++;
    return count;
  }, [category, sortBy]);

  const rotation = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  const renderFilterContent = () => (
    <Animated.View
      style={[
        styles.filterContent,
        hideToggle
          ? styles.filterContentNoAnimation
          : {
              opacity: animatedHeight,
              transform: [
                {
                  scaleY: animatedHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1]
                  })
                }
              ]
            }
      ]}
    >
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Clase de Animal</Text>
        <View style={styles.categoryOptions}>
          {categoryOptions.map(option => {
            const iconColor =
              category === option.value ? colors.textOnPrimary : colors.text;
            const IconComponent =
              option.iconType === 'material'
                ? MaterialCommunityIcons
                : option.iconType === 'fa5'
                  ? FontAwesome5
                  : Ionicons;

            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.categoryOption,
                  category === option.value && styles.categoryOptionSelected
                ]}
                onPress={() => handleCategoryChange(option.value)}
                activeOpacity={0.7}
              >
                <IconComponent
                  name={option.icon}
                  size={iconSizes.medium}
                  color={iconColor}
                  style={styles.categoryOptionIcon}
                />
                <Text
                  style={[
                    styles.categoryOptionText,
                    category === option.value &&
                      styles.categoryOptionTextSelected
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.filterSection, styles.filterSectionLast]}>
        <Text style={styles.filterSectionTitle}>Ordenar por</Text>
        <View style={styles.sortOptions}>
          {sortOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortOption,
                sortBy === option.value && styles.sortOptionSelected
              ]}
              onPress={() => handleSortChange(option.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={option.icon}
                size={iconSizes.small}
                color={
                  sortBy === option.value ? colors.textOnPrimary : colors.text
                }
                style={styles.sortOptionIcon}
              />
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option.value && styles.sortOptionTextSelected
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View
      style={[
        styles.filterContainer,
        !isVisible && styles.filterContainerHidden
      ]}
    >
      {!hideToggle && isVisible && (
        <View style={styles.filterHeader}>
          <View style={styles.filterHeaderLeft}>
            <TouchableOpacity
              style={styles.filterToggleButton}
              onPress={toggleExpanded}
              activeOpacity={0.7}
            >
              <Ionicons
                name="filter"
                size={iconSizes.small}
                color={colors.text}
                style={{ marginRight: spacing.tiny }}
              />
              <Text style={styles.filterToggleText}>Filtros</Text>
              <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <Ionicons
                  name="chevron-down"
                  size={iconSizes.small}
                  color={colors.text}
                />
              </Animated.View>
            </TouchableOpacity>

            {activeFiltersCount > 0 && (
              <View style={styles.activeFiltersCount}>
                <Text style={styles.activeFiltersCountText}>
                  {activeFiltersCount}
                </Text>
              </View>
            )}
          </View>

          {activeFiltersCount > 0 && (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.clearFiltersText}>Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {isVisible && (hideToggle || isExpanded) && renderFilterContent()}
    </View>
  );
};

const createNatureShadow = (elevation: number, color: string) => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: color,
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.2,
      shadowRadius: elevation * 0.8
    };
  }
  return { elevation };
};

const createFilterStyles = (theme: ThemeContextType) => {
  const { colors, spacing, typography, borderRadius, borderWidths } = theme;

  return StyleSheet.create({
    filterContainer: {
      marginBottom: spacing.small,
      overflow: 'hidden'
    },

    filterContainerHidden: {
      display: 'none'
    },

    filterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.small + 2,
      paddingHorizontal: spacing.medium,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.large,
      marginHorizontal: spacing.medium,
      marginBottom: spacing.small,
      ...createNatureShadow(2, colors.forest)
    },

    filterHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.small
    },

    filterToggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.small,
      paddingVertical: spacing.small + 2,
      paddingHorizontal: spacing.large,
      borderRadius: borderRadius.xlarge,
      backgroundColor: colors.forest,
      borderWidth: 0
    },

    filterToggleText: {
      fontSize: typography.fontSize.medium,
      color: colors.textOnPrimary,
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.medium,
      letterSpacing: 0.5
    },

    activeFiltersCount: {
      backgroundColor: colors.error,
      borderRadius: 999,
      paddingHorizontal: spacing.small,
      paddingVertical: spacing.tiny,
      minWidth: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.forest,
      ...createNatureShadow(2, colors.error)
    },

    activeFiltersCountText: {
      fontSize: typography.fontSize.small,
      color: colors.textOnPrimary,
      fontWeight: typography.fontWeight.black,
      lineHeight: typography.lineHeight.small
    },

    clearFiltersButton: {
      paddingVertical: spacing.small + 2,
      paddingHorizontal: spacing.large,
      borderRadius: borderRadius.xlarge,
      backgroundColor: colors.error,
      ...createNatureShadow(3, colors.error)
    },

    clearFiltersText: {
      fontSize: typography.fontSize.small,
      color: colors.textOnPrimary,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: 0.5
    },

    filterContent: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.large,
      padding: spacing.large,
      marginHorizontal: spacing.medium,
      marginTop: spacing.tiny,
      borderWidth: borderWidths.small,
      borderColor: colors.divider,
      ...createNatureShadow(3, colors.forest)
    },

    filterContentNoAnimation: {
      opacity: 1,
      transform: []
    },

    filterSection: {
      marginBottom: spacing.large
    },

    filterSectionLast: {
      marginBottom: 0
    },

    filterSectionTitle: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.bold,
      color: colors.forest,
      marginBottom: spacing.medium,
      textTransform: 'uppercase',
      letterSpacing: 1,
      lineHeight: typography.lineHeight.medium
    },

    categoryOptions: {
      gap: spacing.small
    },

    categoryOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.medium + 2,
      paddingHorizontal: spacing.large,
      borderRadius: borderRadius.large,
      backgroundColor: colors.chipBackground,
      borderWidth: borderWidths.small,
      borderColor: colors.border,
      ...createNatureShadow(1, colors.shadow)
    },

    categoryOptionSelected: {
      backgroundColor: colors.forest,
      borderColor: colors.forest,
      borderWidth: 0,
      ...createNatureShadow(4, colors.forest)
    },

    categoryOptionText: {
      flex: 1,
      fontSize: typography.fontSize.large,
      color: colors.text,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.large,
      letterSpacing: 0.3
    },

    categoryOptionTextSelected: {
      color: colors.textOnPrimary,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: 0.5
    },

    categoryOptionIcon: {
      marginRight: spacing.small
    },

    sortOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.small
    },

    sortOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.small + 4,
      paddingHorizontal: spacing.large,
      borderRadius: borderRadius.xlarge,
      backgroundColor: colors.chipBackground,
      borderWidth: borderWidths.small,
      borderColor: colors.border,
      gap: spacing.small,
      ...createNatureShadow(1, colors.shadow)
    },

    sortOptionSelected: {
      backgroundColor: colors.water,
      borderColor: colors.water,
      borderWidth: 0,
      ...createNatureShadow(4, colors.water)
    },

    sortOptionText: {
      fontSize: typography.fontSize.medium,
      color: colors.text,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.medium,
      letterSpacing: 0.3
    },

    sortOptionTextSelected: {
      color: colors.textOnPrimary,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: 0.5
    },

    sortOptionIcon: {
      marginRight: 0
    }
  });
};

export default CatalogFilters;
