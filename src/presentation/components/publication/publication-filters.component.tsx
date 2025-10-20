import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform
} from 'react-native';
import { PublicationModelResponse } from '../../../domain/models/publication.models';
import { ThemeContextType } from '@/presentation/contexts/theme.context';

export type SortOption =
  | 'date-desc'
  | 'date-asc'
  | 'location-asc'
  | 'location-desc'
  | 'species-asc'
  | 'species-desc';

export type FilterByState = 'all' | string;

export interface FilterOptions {
  sortBy: SortOption;
  filterByState: FilterByState;
}

interface PublicationFiltersProps {
  publications: PublicationModelResponse[];
  onFilterChange: (
    filtered: PublicationModelResponse[],
    options: FilterOptions
  ) => void;
  theme: ThemeContextType;
  hideToggle?: boolean;
  defaultExpanded?: boolean;
  isVisible?: boolean;
  onExpandChange?: (isExpanded: boolean) => void;
}

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20
};

const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12
};

const FONT_SIZE = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16
};

const PublicationFilters: React.FC<PublicationFiltersProps> = ({
  publications,
  onFilterChange,
  theme,
  hideToggle = false,
  defaultExpanded = false,
  isVisible = true,
  onExpandChange
}) => {
  const [isExpanded, setIsExpanded] = useState(
    hideToggle ? true : defaultExpanded
  );
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterByState, setFilterByState] = useState<FilterByState>('all');

  const animatedHeight = React.useRef(
    new Animated.Value(hideToggle ? 1 : 0)
  ).current;
  const animatedRotation = React.useRef(new Animated.Value(0)).current;

  const styles = useMemo(() => createFilterStyles(theme), [theme]);

  const availableStates = useMemo(() => {
    const states = new Set(
      publications.map(p => p.animalState).filter(Boolean)
    );
    return ['all', ...Array.from(states)];
  }, [publications]);

  const applyFilters = useCallback(() => {
    let filtered = [...publications];

    if (filterByState !== 'all') {
      filtered = filtered.filter(p => p.animalState === filterByState);
    }

    switch (sortBy) {
      case 'date-desc':
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdDate || 0).getTime();
          const dateB = new Date(b.createdDate || 0).getTime();
          return dateB - dateA;
        });
        break;
      case 'date-asc':
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdDate || 0).getTime();
          const dateB = new Date(b.createdDate || 0).getTime();
          return dateA - dateB;
        });
        break;
      case 'location-asc':
        filtered.sort((a, b) =>
          (a.location || '').localeCompare(b.location || '')
        );
        break;
      case 'location-desc':
        filtered.sort((a, b) =>
          (b.location || '').localeCompare(a.location || '')
        );
        break;
      case 'species-asc':
        filtered.sort((a, b) =>
          (a.commonNoun || '').localeCompare(b.commonNoun || '')
        );
        break;
      case 'species-desc':
        filtered.sort((a, b) =>
          (b.commonNoun || '').localeCompare(a.commonNoun || '')
        );
        break;
    }

    onFilterChange(filtered, { sortBy, filterByState });
  }, [publications, sortBy, filterByState, onFilterChange]);

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

  const handleSortChange = useCallback((option: SortOption) => {
    setSortBy(option);
  }, []);

  const handleStateFilterChange = useCallback((state: FilterByState) => {
    setFilterByState(state);
  }, []);

  const clearFilters = useCallback(() => {
    setSortBy('date-desc');
    setFilterByState('all');
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (sortBy !== 'date-desc') count++;
    if (filterByState !== 'all') count++;
    return count;
  }, [sortBy, filterByState]);

  const rotation = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  const sortOptions = [
    { value: 'date-desc', label: 'Más recientes', icon: '📅' },
    { value: 'date-asc', label: 'Más antiguos', icon: '📆' },
    { value: 'location-asc', label: 'Ubicación A-Z', icon: '📍' },
    { value: 'location-desc', label: 'Ubicación Z-A', icon: '📌' },
    { value: 'species-asc', label: 'Especie A-Z', icon: '🦎' },
    { value: 'species-desc', label: 'Especie Z-A', icon: '🐍' }
  ] as const;

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
              <Text style={styles.filterOptionIcon}>{option.icon}</Text>
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

      <View style={[styles.filterSection, styles.filterSectionLast]}>
        <Text style={styles.filterSectionTitle}>Estado del animal</Text>
        <View style={styles.filterOptions}>
          {availableStates.map(state => (
            <TouchableOpacity
              key={state}
              style={[
                styles.filterOption,
                filterByState === state && styles.filterOptionSelected
              ]}
              onPress={() => handleStateFilterChange(state)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.filterCheckbox,
                  filterByState === state && styles.filterCheckboxSelected
                ]}
              >
                {filterByState === state && (
                  <Text style={styles.filterCheckmark}>✓</Text>
                )}
              </View>
              <Text
                style={[
                  styles.filterOptionText,
                  filterByState === state && styles.filterOptionTextSelected
                ]}
              >
                {state === 'all' ? 'Todos los estados' : state}
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
              <Text style={styles.filterToggleText}>Filtros</Text>
              <Animated.Text
                style={[
                  styles.filterIcon,
                  { transform: [{ rotate: rotation }] }
                ]}
              >
                ▼
              </Animated.Text>
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

const createFilterStyles = (theme: ThemeContextType) =>
  StyleSheet.create({
    filterContainer: {
      marginBottom: SPACING.md,
      overflow: 'hidden'
    },

    filterContainerHidden: {
      display: 'none'
    },

    filterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.xs
    },

    filterHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm
    },

    filterToggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      borderRadius: BORDER_RADIUS.sm,
      backgroundColor: theme.colors.surfaceVariant
    },

    filterToggleText: {
      fontSize: FONT_SIZE.sm,
      color: theme.colors.text,
      fontWeight: '500'
    },

    filterIcon: {
      fontSize: FONT_SIZE.md,
      color: theme.colors.text
    },

    activeFiltersCount: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      paddingHorizontal: SPACING.xs,
      paddingVertical: 2,
      minWidth: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },

    activeFiltersCountText: {
      fontSize: FONT_SIZE.xs,
      color: '#FFFFFF',
      fontWeight: '700'
    },

    clearFiltersButton: {
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      borderRadius: BORDER_RADIUS.sm
    },

    clearFiltersText: {
      fontSize: FONT_SIZE.sm,
      color: theme.colors.error,
      fontWeight: '500'
    },

    filterContent: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      marginTop: SPACING.sm
    },

    filterContentNoAnimation: {
      opacity: 1,
      transform: []
    },

    filterSection: {
      marginBottom: SPACING.md
    },

    filterSectionLast: {
      marginBottom: 0
    },

    filterSectionTitle: {
      fontSize: FONT_SIZE.sm,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: SPACING.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },

    filterOptions: {
      gap: SPACING.sm
    },

    filterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border
    },

    filterOptionSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3
        },
        android: {
          elevation: 2
        }
      })
    },

    filterOptionText: {
      flex: 1,
      fontSize: FONT_SIZE.md,
      color: theme.colors.text,
      fontWeight: '500'
    },

    filterOptionTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600'
    },

    filterOptionIcon: {
      fontSize: FONT_SIZE.lg,
      marginRight: SPACING.sm
    },

    filterCheckbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.sm
    },

    filterCheckboxSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },

    filterCheckmark: {
      color: '#FFFFFF',
      fontSize: FONT_SIZE.sm,
      fontWeight: '700'
    },

    sortOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm
    },

    sortOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border
    },

    sortOptionSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },

    sortOptionText: {
      fontSize: FONT_SIZE.sm,
      color: theme.colors.text,
      fontWeight: '500'
    },

    sortOptionTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600'
    }
  });

export default PublicationFilters;
