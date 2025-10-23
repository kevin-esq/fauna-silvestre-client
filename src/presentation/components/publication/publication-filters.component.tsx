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
import { PublicationModelResponse } from '../../../domain/models/publication.models';
import { ThemeContextType } from '@/presentation/contexts/theme.context';

export type SortOption =
  | 'date-desc'
  | 'date-asc'
  | 'accepted-desc'
  | 'accepted-asc'
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

interface SortOptionConfig {
  value: SortOption;
  label: string;
  iconName: string;
  iconLibrary: 'ionicons' | 'material';
}

const PublicationFilters: React.FC<PublicationFiltersProps> = ({
  publications,
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

  const getStateLabel = useCallback((state: string) => {
    if (state === 'all') return 'Todos los estados';
    if (state === 'ALIVE') return 'Vivo';
    if (state === 'DEAD') return 'Muerto';
    return state;
  }, []);

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
      case 'accepted-desc':
        filtered.sort((a, b) => {
          const dateA = new Date(a.acceptedDate || 0).getTime();
          const dateB = new Date(b.acceptedDate || 0).getTime();
          return dateB - dateA;
        });
        break;
      case 'accepted-asc':
        filtered.sort((a, b) => {
          const dateA = new Date(a.acceptedDate || 0).getTime();
          const dateB = new Date(b.acceptedDate || 0).getTime();
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

  const sortOptions: SortOptionConfig[] = useMemo(
    () => [
      {
        value: 'date-desc' as const,
        label: 'Creación reciente',
        iconName: 'calendar',
        iconLibrary: 'ionicons' as const
      },
      {
        value: 'date-asc' as const,
        label: 'Creación antigua',
        iconName: 'calendar-outline',
        iconLibrary: 'ionicons' as const
      },
      {
        value: 'accepted-desc' as const,
        label: 'Aceptación reciente',
        iconName: 'checkmark-circle',
        iconLibrary: 'ionicons' as const
      },
      {
        value: 'accepted-asc' as const,
        label: 'Aceptación antigua',
        iconName: 'checkmark-circle-outline',
        iconLibrary: 'ionicons' as const
      },
      {
        value: 'location-asc' as const,
        label: 'Ubicación A-Z',
        iconName: 'location',
        iconLibrary: 'ionicons' as const
      },
      {
        value: 'location-desc' as const,
        label: 'Ubicación Z-A',
        iconName: 'location-outline',
        iconLibrary: 'ionicons' as const
      },
      {
        value: 'species-asc' as const,
        label: 'Especie A-Z',
        iconName: 'paw',
        iconLibrary: 'ionicons' as const
      },
      {
        value: 'species-desc' as const,
        label: 'Especie Z-A',
        iconName: 'paw-outline',
        iconLibrary: 'ionicons' as const
      }
    ],
    []
  );

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
              {option.iconLibrary === 'ionicons' ? (
                <Ionicons
                  name={option.iconName}
                  size={iconSizes.small}
                  color={
                    sortBy === option.value ? colors.textOnPrimary : colors.text
                  }
                  style={styles.sortOptionIcon}
                />
              ) : (
                <MaterialCommunityIcons
                  name={option.iconName}
                  size={iconSizes.small}
                  color={
                    sortBy === option.value ? colors.textOnPrimary : colors.text
                  }
                  style={styles.sortOptionIcon}
                />
              )}
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
                  <Ionicons
                    name="checkmark"
                    size={iconSizes.small - 2}
                    color={colors.textOnPrimary}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.filterOptionText,
                  filterByState === state && styles.filterOptionTextSelected
                ]}
              >
                {getStateLabel(state)}
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

const createFilterStyles = (theme: ThemeContextType) => {
  const { colors, spacing, typography, borderRadius, borderWidths } = theme;

  return StyleSheet.create({
    filterContainer: {
      marginBottom: spacing.medium,
      overflow: 'hidden'
    },

    filterContainerHidden: {
      display: 'none'
    },

    filterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.small,
      paddingHorizontal: spacing.tiny
    },

    filterHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.small
    },

    filterToggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.tiny,
      paddingVertical: spacing.small,
      paddingHorizontal: spacing.medium,
      borderRadius: borderRadius.medium,
      backgroundColor: colors.surfaceVariant,
      borderWidth: borderWidths.hairline,
      borderColor: colors.border
    },

    filterToggleText: {
      fontSize: typography.fontSize.small,
      color: colors.text,
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.small
    },

    activeFiltersCount: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.xlarge,
      paddingHorizontal: spacing.small,
      paddingVertical: spacing.tiny,
      minWidth: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center'
    },

    activeFiltersCountText: {
      fontSize: typography.fontSize.small,
      color: colors.textOnPrimary,
      fontWeight: typography.fontWeight.black,
      lineHeight: typography.lineHeight.small
    },

    clearFiltersButton: {
      paddingVertical: spacing.small,
      paddingHorizontal: spacing.medium,
      borderRadius: borderRadius.medium
    },

    clearFiltersText: {
      fontSize: typography.fontSize.small,
      color: colors.error,
      fontWeight: typography.fontWeight.bold
    },

    filterContent: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: borderRadius.large,
      padding: spacing.medium,
      marginTop: spacing.small,
      borderWidth: borderWidths.hairline,
      borderColor: colors.border
    },

    filterContentNoAnimation: {
      opacity: 1,
      transform: []
    },

    filterSection: {
      marginBottom: spacing.medium
    },

    filterSectionLast: {
      marginBottom: 0
    },

    filterSectionTitle: {
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
      marginBottom: spacing.small,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      lineHeight: typography.lineHeight.small
    },

    filterOptions: {
      gap: spacing.small
    },

    filterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.medium,
      paddingHorizontal: spacing.medium,
      borderRadius: borderRadius.medium,
      backgroundColor: colors.surface,
      borderWidth: borderWidths.hairline,
      borderColor: colors.border
    },

    filterOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
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
      fontSize: typography.fontSize.medium,
      color: colors.text,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.medium
    },

    filterOptionTextSelected: {
      color: colors.textOnPrimary,
      fontWeight: typography.fontWeight.bold
    },

    filterCheckbox: {
      width: 22,
      height: 22,
      borderRadius: borderRadius.small,
      borderWidth: borderWidths.medium,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.small
    },

    filterCheckboxSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary
    },

    sortOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.small
    },

    sortOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.small + 2,
      paddingHorizontal: spacing.medium,
      borderRadius: borderRadius.large,
      backgroundColor: colors.surface,
      borderWidth: borderWidths.hairline,
      borderColor: colors.border,
      gap: spacing.tiny
    },

    sortOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4
        },
        android: {
          elevation: 3
        }
      })
    },

    sortOptionText: {
      fontSize: typography.fontSize.small,
      color: colors.text,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.small
    },

    sortOptionTextSelected: {
      color: colors.textOnPrimary,
      fontWeight: typography.fontWeight.bold
    },

    sortOptionIcon: {
      marginRight: 0
    }
  });
};

export default PublicationFilters;
