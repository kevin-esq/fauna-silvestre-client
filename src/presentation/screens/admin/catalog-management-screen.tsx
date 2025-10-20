import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  ListRenderItem,
  ScrollView,
  Animated
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCatalogManagement } from '../../hooks/use-catalog-management.hook';
import { useTheme, Theme } from '../../contexts/theme.context';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { AnimalModelResponse } from '@/domain/models/animal.models';
import { SkeletonLoader } from '../../components/ui/skeleton-loader.component';
import AnimalCard from '../../components/animal/animal-card.component';
import { createStyles } from './catalog-management-screen.styles';

const VERTEBRATE_CLASSES = [
  'Mamíferos',
  'Aves',
  'Reptiles',
  'Anfibios',
  'Peces'
];

const SORT_OPTIONS = [
  { id: 'name', label: 'Nombre', icon: 'text' },
  { id: 'specie', label: 'Especie', icon: 'leaf' },
  { id: 'class', label: 'Clase', icon: 'layers' },
  { id: 'date', label: 'Fecha', icon: 'calendar' }
] as const;

const HABITAT_OPTIONS = [
  { id: 'all', label: 'Todos', icon: 'globe' },
  { id: 'terrestrial', label: 'Terrestre', icon: 'walk' },
  { id: 'aquatic', label: 'Acuático', icon: 'water' },
  { id: 'aerial', label: 'Aéreo', icon: 'airplane' }
] as const;

interface CatalogHeaderProps {
  onAddPress: () => void;
  onToggleFilters: () => void;
  filtersVisible: boolean;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFiltersCount: number;
}

interface FiltersSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  visible: boolean;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
  onSortChange: (sort: string) => void;
  selectedSort: string;
  onHabitatChange: (habitat: string) => void;
  selectedHabitat: string;
}

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}

interface FilterChipProps {
  label: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
  color?: string;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
}

interface AnimalInfoChipsProps {
  animal: AnimalModelResponse;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}

interface EmptyStateProps {
  searchQuery: string;
  selectedCategory: string;
  selectedSort: string;
  selectedHabitat: string;
  onAddPress: () => void;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}

interface LoadingFooterProps {
  isLoadingMore: boolean;
  hasNextPage: boolean;
  error: string | null;
  onRetry: () => void;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}

interface QuickFiltersBarProps {
  searchQuery: string;
  selectedCategory: string;
  selectedSort: string;
  selectedHabitat: string;
  onClearSearch: () => void;
  onClearCategory: () => void;
  onClearSort: () => void;
  onClearHabitat: () => void;
  onClearAll: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}

const FILTER_CONSTANTS = {
  DEFAULT_CATEGORY: 'Todas',
  DEFAULT_SORT: 'name',
  DEFAULT_HABITAT: 'all',
  MAX_SEARCH_DISPLAY: 15,
  MAX_INFO_CHIP_LENGTH: 20,
  PAGINATION_THRESHOLD: 0.1
} as const;

const hasActiveFilters = (
  searchQuery: string,
  selectedCategory: string,
  selectedSort: string,
  selectedHabitat: string
): boolean => {
  return (
    searchQuery.length > 0 ||
    selectedCategory !== FILTER_CONSTANTS.DEFAULT_CATEGORY ||
    selectedSort !== FILTER_CONSTANTS.DEFAULT_SORT ||
    selectedHabitat !== FILTER_CONSTANTS.DEFAULT_HABITAT
  );
};

const getActiveFiltersCount = (
  searchQuery: string,
  selectedCategory: string,
  selectedSort: string,
  selectedHabitat: string
): number => {
  let count = 0;
  if (searchQuery.length > 0) count++;
  if (selectedCategory !== FILTER_CONSTANTS.DEFAULT_CATEGORY) count++;
  if (selectedSort !== FILTER_CONSTANTS.DEFAULT_SORT) count++;
  if (selectedHabitat !== FILTER_CONSTANTS.DEFAULT_HABITAT) count++;
  return count;
};

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const FilterChip = React.memo<FilterChipProps>(
  ({ label, icon, isSelected, onPress, theme, styles, color }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        isSelected && styles.filterChipSelected,
        isSelected && color && { backgroundColor: color }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={16}
        color={
          isSelected ? theme.colors.textOnPrimary : theme.colors.textSecondary
        }
      />
      <Text
        style={[
          styles.filterChipText,
          isSelected && styles.filterChipTextSelected
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
);

const FilterSection = React.memo<FilterSectionProps>(
  ({ title, children, styles }) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      <View style={styles.filterSectionContent}>{children}</View>
    </View>
  )
);

const CatalogHeader = React.memo<CatalogHeaderProps>(
  ({
    onAddPress,
    onToggleFilters,
    filtersVisible,
    theme,
    styles,
    activeFiltersCount
  }) => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={[
            styles.toggleFiltersButton,
            filtersVisible && styles.toggleFiltersButtonActive,
            activeFiltersCount > 0 && styles.toggleFiltersButtonWithBadge
          ]}
          onPress={onToggleFilters}
        >
          <Ionicons
            name={filtersVisible ? 'filter' : 'filter-outline'}
            size={20}
            color={
              filtersVisible ? theme.colors.textOnPrimary : theme.colors.text
            }
          />
          <Text
            style={[
              styles.filterButtonText,
              {
                color: filtersVisible
                  ? theme.colors.textOnPrimary
                  : theme.colors.text
              }
            ]}
          >
            Filtros
          </Text>
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Ionicons name="add" size={24} color={theme.colors.textOnPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  )
);

const SearchBar = React.memo<SearchBarProps>(
  ({ searchQuery, onSearchChange, theme, styles }) => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
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
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            style={styles.clearButton}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
);

const FiltersSection = React.memo<FiltersSectionProps>(
  ({
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    visible,
    theme,
    styles,
    onSortChange,
    selectedSort,
    onHabitatChange,
    selectedHabitat
  }) => {
    if (!visible) {
      return null;
    }

    return (
      <Animated.View style={styles.filtersSection}>
        <ScrollView
          style={styles.filtersScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.filtersContent}>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              theme={theme}
              styles={styles}
            />

            <FilterSection title="Clase de Animal" styles={styles}>
              <View style={styles.filterChipsContainer}>
                {VERTEBRATE_CLASSES.map(category => (
                  <FilterChip
                    key={category}
                    label={category}
                    icon="paw"
                    isSelected={selectedCategory === category}
                    onPress={() => onCategoryChange(category)}
                    theme={theme}
                    styles={styles}
                    color={theme.colors.primary}
                  />
                ))}
              </View>
            </FilterSection>

            <FilterSection title="Ordenar por" styles={styles}>
              <View style={styles.filterChipsContainer}>
                {SORT_OPTIONS.map(option => (
                  <FilterChip
                    key={option.id}
                    label={option.label}
                    icon={option.icon}
                    isSelected={selectedSort === option.id}
                    onPress={() => onSortChange(option.id)}
                    theme={theme}
                    styles={styles}
                    color={theme.colors.secondary}
                  />
                ))}
              </View>
            </FilterSection>

            <FilterSection title="Tipo de Hábitat" styles={styles}>
              <View style={styles.filterChipsContainer}>
                {HABITAT_OPTIONS.map(habitat => (
                  <FilterChip
                    key={habitat.id}
                    label={habitat.label}
                    icon={habitat.icon}
                    isSelected={selectedHabitat === habitat.id}
                    onPress={() => onHabitatChange(habitat.id)}
                    theme={theme}
                    styles={styles}
                    color={theme.colors.forest}
                  />
                ))}
              </View>
            </FilterSection>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }
);

const AnimalInfoChips = React.memo<AnimalInfoChipsProps>(
  ({ animal, theme, styles }) => {
    const infoItems = useMemo(
      () =>
        [
          {
            icon: 'restaurant' as const,
            label: 'Alimentación',
            value: animal.feeding,
            color: theme.colors.secondary
          },
          {
            icon: 'heart' as const,
            label: 'Reproducción',
            value: animal.reproduction,
            color: theme.colors.error
          },
          {
            icon: 'map' as const,
            label: 'Distribución',
            value: animal.distribution,
            color: theme.colors.water
          }
        ].filter(item => item.value && item.value.length > 0),
      [animal, theme]
    );

    if (infoItems.length === 0) return null;

    return (
      <View style={styles.animalInfoChips}>
        {infoItems.slice(0, 2).map((item, index) => (
          <View
            key={`${item.label}-${index}`}
            style={[styles.infoChip, { borderColor: item.color }]}
          >
            <Ionicons name={item.icon} size={12} color={item.color} />
            <Text
              style={[styles.infoChipText, { color: item.color }]}
              numberOfLines={1}
            >
              {truncateText(item.value, FILTER_CONSTANTS.MAX_INFO_CHIP_LENGTH)}
            </Text>
          </View>
        ))}
      </View>
    );
  }
);

const EmptyState = React.memo<EmptyStateProps>(
  ({
    searchQuery,
    selectedCategory,
    selectedSort,
    selectedHabitat,
    onAddPress,
    theme,
    styles
  }) => {
    const hasFilters = hasActiveFilters(
      searchQuery,
      selectedCategory,
      selectedSort,
      selectedHabitat
    );

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name={hasFilters ? 'search' : 'leaf'}
            size={60}
            color={theme.colors.forest}
          />
        </View>
        <Text style={styles.emptyTitle}>
          {hasFilters ? 'No se encontraron animales' : 'Catálogo vacío'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {hasFilters
            ? 'Intenta con otros términos de búsqueda o revisa los filtros aplicados'
            : 'Comienza agregando tu primer animal al catálogo de fauna silvestre'}
        </Text>
        {!hasFilters && (
          <TouchableOpacity style={styles.emptyButton} onPress={onAddPress}>
            <Text style={styles.emptyButtonText}>Agregar Animal</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

const LoadingFooter = React.memo<LoadingFooterProps>(
  ({ isLoadingMore, hasNextPage, error, onRetry, theme, styles }) => {
    if (error) {
      return (
        <View style={styles.errorDisplayContainer}>
          <Text style={styles.errorDisplayText}>
            Error al cargar más animales
          </Text>
          <TouchableOpacity onPress={onRetry}>
            <Text style={styles.errorDisplayRetryButton}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isLoadingMore) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.forest} />
          <Text style={styles.loadingText}>Cargando más animales...</Text>
        </View>
      );
    }

    if (!hasNextPage) {
      return (
        <View style={styles.endContainer}>
          <Text style={styles.endText}>
            ✨ Has visto todos los animales del catálogo ✨
          </Text>
        </View>
      );
    }

    return null;
  }
);

const QuickFiltersBar = React.memo<QuickFiltersBarProps>(
  ({
    searchQuery,
    selectedCategory,
    selectedSort,
    selectedHabitat,
    onClearSearch,
    onClearCategory,
    onClearSort,
    onClearHabitat,
    onClearAll,
    styles,
    theme
  }) => {
    const filtersActive = hasActiveFilters(
      searchQuery,
      selectedCategory,
      selectedSort,
      selectedHabitat
    );

    if (!filtersActive) return null;

    const getSortLabel = (sortId: string) => {
      return SORT_OPTIONS.find(opt => opt.id === sortId)?.label || sortId;
    };

    const getHabitatLabel = (habitatId: string) => {
      return (
        HABITAT_OPTIONS.find(opt => opt.id === habitatId)?.label || habitatId
      );
    };

    return (
      <View style={styles.quickFiltersBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickFiltersScroll}
        >
          <View style={styles.quickFiltersContent}>
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.quickFilterChip}
                onPress={onClearSearch}
              >
                <Ionicons
                  name="search"
                  size={14}
                  color={theme.colors.primary}
                />
                <Text style={styles.quickFilterChipText}>
                  {truncateText(
                    searchQuery,
                    FILTER_CONSTANTS.MAX_SEARCH_DISPLAY
                  )}
                </Text>
                <Ionicons name="close" size={14} color={theme.colors.primary} />
              </TouchableOpacity>
            )}

            {selectedCategory !== FILTER_CONSTANTS.DEFAULT_CATEGORY && (
              <TouchableOpacity
                style={styles.quickFilterChip}
                onPress={onClearCategory}
              >
                <Ionicons name="paw" size={14} color={theme.colors.primary} />
                <Text style={styles.quickFilterChipText}>
                  {selectedCategory}
                </Text>
                <Ionicons name="close" size={14} color={theme.colors.primary} />
              </TouchableOpacity>
            )}

            {selectedSort !== FILTER_CONSTANTS.DEFAULT_SORT && (
              <TouchableOpacity
                style={styles.quickFilterChip}
                onPress={onClearSort}
              >
                <Ionicons
                  name="swap-vertical"
                  size={14}
                  color={theme.colors.secondary}
                />
                <Text style={styles.quickFilterChipText}>
                  {getSortLabel(selectedSort)}
                </Text>
                <Ionicons
                  name="close"
                  size={14}
                  color={theme.colors.secondary}
                />
              </TouchableOpacity>
            )}

            {selectedHabitat !== FILTER_CONSTANTS.DEFAULT_HABITAT && (
              <TouchableOpacity
                style={styles.quickFilterChip}
                onPress={onClearHabitat}
              >
                <Ionicons
                  name="location"
                  size={14}
                  color={theme.colors.forest}
                />
                <Text style={styles.quickFilterChipText}>
                  {getHabitatLabel(selectedHabitat)}
                </Text>
                <Ionicons name="close" size={14} color={theme.colors.forest} />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.clearAllButton} onPress={onClearAll}>
          <Ionicons name="close-circle" size={16} color={theme.colors.error} />
          <Text style={styles.clearAllText}>Limpiar</Text>
        </TouchableOpacity>
      </View>
    );
  }
);

const useCatalogScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigationActions();
  const { state, actions, filteredAnimals, categories, isLoading } =
    useCatalogManagement();
  const [filtersVisible, setFiltersVisible] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const activeFiltersCount = useMemo(
    () =>
      getActiveFiltersCount(
        state.searchQuery,
        state.selectedCategory,
        state.selectedSort,
        state.selectedHabitat
      ),
    [
      state.searchQuery,
      state.selectedCategory,
      state.selectedSort,
      state.selectedHabitat
    ]
  );

  const handleAddAnimal = useCallback(() => {
    navigation.navigateToAnimalForm();
  }, [navigation]);

  const handleEditAnimal = useCallback(
    (animal: AnimalModelResponse) => {
      navigation.navigateToAnimalForm(animal);
    },
    [navigation]
  );

  const handleEditImage = useCallback(
    (animal: AnimalModelResponse) => {
      navigation.navigateToImageEditor(animal, true);
    },
    [navigation]
  );

  const handleViewDetails = useCallback(
    (animal: AnimalModelResponse) => {
      navigation.navigate('AnimalDetails', { animal });
    },
    [navigation]
  );

  const handleToggleFilters = useCallback(() => {
    setFiltersVisible(prev => !prev);
  }, []);

  const handleEndReached = useCallback(() => {
    if (!state.isLoadingMore && state.hasNextPage) {
      actions.loadMoreAnimals();
    }
  }, [state.isLoadingMore, state.hasNextPage, actions]);

  const clearActions = useMemo(
    () => ({
      clearSearch: () => actions.searchAnimals(''),
      clearCategory: () =>
        actions.filterByCategory(FILTER_CONSTANTS.DEFAULT_CATEGORY),
      clearSort: () => actions.sortAnimals(FILTER_CONSTANTS.DEFAULT_SORT),
      clearHabitat: () =>
        actions.filterByHabitat(FILTER_CONSTANTS.DEFAULT_HABITAT),
      clearAll: () => {
        actions.searchAnimals('');
        actions.filterByCategory(FILTER_CONSTANTS.DEFAULT_CATEGORY);
        actions.sortAnimals(FILTER_CONSTANTS.DEFAULT_SORT);
        actions.filterByHabitat(FILTER_CONSTANTS.DEFAULT_HABITAT);
      }
    }),
    [actions]
  );

  return {
    theme,
    styles,
    state,
    actions,
    filteredAnimals,
    categories,
    isLoading,
    filtersVisible,
    activeFiltersCount,
    handleAddAnimal,
    handleEditAnimal,
    handleEditImage,
    handleViewDetails,
    handleToggleFilters,
    handleEndReached,
    clearActions
  };
};

const CatalogManagementScreen: React.FC = () => {
  const {
    theme,
    styles,
    state,
    actions,
    filteredAnimals,
    isLoading,
    filtersVisible,
    activeFiltersCount,
    handleAddAnimal,
    handleEditAnimal,
    handleEditImage,
    handleViewDetails,
    handleToggleFilters,
    handleEndReached,
    clearActions
  } = useCatalogScreen();

  const keyExtractor = useCallback(
    (item: AnimalModelResponse) => `animal-${item.catalogId}`,
    []
  );

  const renderAnimalCard: ListRenderItem<AnimalModelResponse> = useCallback(
    ({ item }) => (
      <AnimalCard
        animal={item}
        onEdit={handleEditAnimal}
        onDelete={actions.deleteAnimal}
        onImageEdit={handleEditImage}
        onViewDetails={handleViewDetails}
        showImageEditButton={true}
      />
    ),
    [handleEditAnimal, actions.deleteAnimal, handleEditImage, handleViewDetails]
  );

  const renderFooter = useCallback(
    () => (
      <LoadingFooter
        isLoadingMore={state.isLoadingMore}
        hasNextPage={state.hasNextPage}
        error={state.error}
        onRetry={actions.loadMoreAnimals}
        theme={theme}
        styles={styles}
      />
    ),
    [
      state.isLoadingMore,
      state.hasNextPage,
      state.error,
      actions.loadMoreAnimals,
      theme,
      styles
    ]
  );

  const renderEmptyComponent = useCallback(
    () => (
      <EmptyState
        searchQuery={state.searchQuery}
        selectedCategory={state.selectedCategory}
        selectedSort={state.selectedSort}
        selectedHabitat={state.selectedHabitat}
        onAddPress={handleAddAnimal}
        theme={theme}
        styles={styles}
      />
    ),
    [state, handleAddAnimal, theme, styles]
  );

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={state.isRefreshing}
        onRefresh={actions.refreshAnimals}
        colors={[theme.colors.primary]}
        tintColor={theme.colors.primary}
      />
    ),
    [state.isRefreshing, actions.refreshAnimals, theme.colors.primary]
  );

  if (isLoading && filteredAnimals.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <CatalogHeader
          onAddPress={handleAddAnimal}
          onToggleFilters={handleToggleFilters}
          filtersVisible={filtersVisible}
          theme={theme}
          styles={styles}
          searchQuery={state.searchQuery}
          onSearchChange={actions.searchAnimals}
          activeFiltersCount={activeFiltersCount}
        />
        <View style={styles.content}>
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonLoader
              key={`skeleton-${index}`}
              width="100%"
              height={120}
              style={styles.skeletonCard}
            />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CatalogHeader
        onAddPress={handleAddAnimal}
        onToggleFilters={handleToggleFilters}
        filtersVisible={filtersVisible}
        theme={theme}
        styles={styles}
        searchQuery={state.searchQuery}
        onSearchChange={actions.searchAnimals}
        activeFiltersCount={activeFiltersCount}
      />

      <View style={styles.content}>
        <QuickFiltersBar
          searchQuery={state.searchQuery}
          selectedCategory={state.selectedCategory}
          selectedSort={state.selectedSort}
          selectedHabitat={state.selectedHabitat}
          onClearSearch={clearActions.clearSearch}
          onClearCategory={clearActions.clearCategory}
          onClearSort={clearActions.clearSort}
          onClearHabitat={clearActions.clearHabitat}
          onClearAll={clearActions.clearAll}
          styles={styles}
          theme={theme}
        />

        <FiltersSection
          searchQuery={state.searchQuery}
          onSearchChange={actions.searchAnimals}
          selectedCategory={state.selectedCategory}
          onCategoryChange={actions.filterByCategory}
          visible={filtersVisible}
          theme={theme}
          styles={styles}
          onSortChange={actions.sortAnimals}
          selectedSort={state.selectedSort}
          onHabitatChange={actions.filterByHabitat}
          selectedHabitat={state.selectedHabitat}
        />

        <FlatList
          data={filteredAnimals}
          keyExtractor={keyExtractor}
          renderItem={renderAnimalCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={FILTER_CONSTANTS.PAGINATION_THRESHOLD}
          refreshControl={refreshControl}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyComponent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
        />
      </View>
    </SafeAreaView>
  );
};

CatalogHeader.displayName = 'CatalogHeader';
SearchBar.displayName = 'SearchBar';
FilterChip.displayName = 'FilterChip';
FilterSection.displayName = 'FilterSection';
FiltersSection.displayName = 'FiltersSection';
AnimalInfoChips.displayName = 'AnimalInfoChips';
EmptyState.displayName = 'EmptyState';
LoadingFooter.displayName = 'LoadingFooter';
QuickFiltersBar.displayName = 'QuickFiltersBar';
CatalogManagementScreen.displayName = 'CatalogManagementScreen';

export default CatalogManagementScreen;
