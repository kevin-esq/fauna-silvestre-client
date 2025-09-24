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
  ListRenderItem
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCatalogManagement } from '../../hooks/use-catalog-management.hook';
import { useTheme, Theme } from '../../contexts/theme.context';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { AnimalModelResponse } from '@/domain/models/animal.models';
import { SkeletonLoader } from '../../components/ui/skeleton-loader.component';
import AnimalSearchableDropdown from '../../components/animal/animal-searchable-dropdown.component';
import AnimalCard from '../../components/animal/animal-card.component';
import { createStyles } from './catalog-management-screen.styles';

interface CatalogHeaderProps {
  onAddPress: () => void;
  onToggleFilters: () => void;
  filtersVisible: boolean;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface FiltersSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
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

interface FilterProps {
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}

interface CategoryFilterProps extends FilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

interface SortFilterProps extends FilterProps {
  selectedSort: string;
  onSortChange: (sort: string) => void;
}

interface HabitatFilterProps extends FilterProps {
  selectedHabitat: string;
  onHabitatChange: (habitat: string) => void;
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
}

interface DropdownOption {
  catalogId: number;
  commonNoun: string;
}

const FILTER_CONSTANTS = {
  DEFAULT_CATEGORY: 'Todas',
  DEFAULT_SORT: 'Nombre',
  DEFAULT_HABITAT: 'Todos',
  MAX_SEARCH_DISPLAY: 15,
  MAX_INFO_CHIP_LENGTH: 20,
  PAGINATION_THRESHOLD: 0.1
} as const;

const SORT_OPTIONS: DropdownOption[] = [
  { catalogId: 0, commonNoun: 'Nombre' },
  { catalogId: 1, commonNoun: 'Especie' },
  { catalogId: 2, commonNoun: 'Categoría' }
] as const;

const HABITAT_OPTIONS: DropdownOption[] = [
  { catalogId: 0, commonNoun: 'Todos' },
  { catalogId: 1, commonNoun: 'Terrestre' },
  { catalogId: 2, commonNoun: 'Acuático' }
] as const;

// Utility functions
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

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const CatalogHeader = React.memo<CatalogHeaderProps>(
  ({ onAddPress, onToggleFilters, filtersVisible, theme, styles }) => (
    <View style={styles.header}>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={[
            styles.toggleFiltersButton,
            filtersVisible && styles.toggleFiltersButtonActive
          ]}
          onPress={onToggleFilters}
          accessibilityRole="button"
          accessibilityLabel={
            filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'
          }
          accessibilityHint={
            filtersVisible
              ? 'Toca para ocultar las opciones de filtrado'
              : 'Toca para mostrar las opciones de filtrado'
          }
        >
          <Ionicons
            name={filtersVisible ? 'filter' : 'filter-outline'}
            size={20}
            color={
              filtersVisible
                ? theme.colors.textOnPrimary
                : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.filterButtonText,
              {
                color: filtersVisible
                  ? theme.colors.textOnPrimary
                  : theme.colors.textSecondary
              }
            ]}
          >
            Filtros
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddPress}
          accessibilityRole="button"
          accessibilityLabel="Agregar nuevo animal"
          accessibilityHint="Toca para crear un nuevo registro de animal"
        >
          <Ionicons name="add" size={24} color={theme.colors.textOnPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  )
);

const SearchBar = React.memo<SearchBarProps>(
  ({ searchQuery, onSearchChange, theme, styles }) => (
    <View
      style={[
        styles.searchContainer,
        searchQuery.length > 0 && styles.searchActiveContainer
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color={theme.colors.forest}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre, especie o categoría..."
        placeholderTextColor={theme.colors.placeholder}
        value={searchQuery}
        onChangeText={onSearchChange}
        accessibilityLabel="Campo de búsqueda avanzada"
        accessibilityHint="Busca por nombre, especie o categoría del animal"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity
          onPress={() => onSearchChange('')}
          style={styles.clearButton}
          accessibilityRole="button"
          accessibilityLabel="Limpiar búsqueda"
          accessibilityHint="Toca para borrar el texto de búsqueda"
        >
          <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  )
);

const CategoryFilter = React.memo<CategoryFilterProps>(
  ({ categories, selectedCategory, onCategoryChange, theme, styles }) => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Filtrar por categoría:</Text>
      <AnimalSearchableDropdown
        options={categories.map((cat, index) => ({
          catalogId: index,
          commonNoun: cat
        }))}
        selectedValue={{
          catalogId: 0,
          commonNoun: selectedCategory
        }}
        onValueChange={value =>
          onCategoryChange(
            value?.commonNoun || FILTER_CONSTANTS.DEFAULT_CATEGORY
          )
        }
        placeholder="Seleccionar categoría..."
        theme={theme}
      />
    </View>
  )
);

const SortFilter = React.memo<SortFilterProps>(
  ({ selectedSort, onSortChange, theme, styles }) => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Ordenar por:</Text>
      <AnimalSearchableDropdown
        options={SORT_OPTIONS}
        selectedValue={{
          catalogId: 0,
          commonNoun: selectedSort
        }}
        onValueChange={value =>
          onSortChange(value?.commonNoun || FILTER_CONSTANTS.DEFAULT_SORT)
        }
        placeholder="Seleccionar orden..."
        theme={theme}
      />
    </View>
  )
);

const HabitatFilter = React.memo<HabitatFilterProps>(
  ({ selectedHabitat, onHabitatChange, theme, styles }) => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Hábitat:</Text>
      <AnimalSearchableDropdown
        options={HABITAT_OPTIONS}
        selectedValue={{
          catalogId: 0,
          commonNoun: selectedHabitat
        }}
        onValueChange={value =>
          onHabitatChange(value?.commonNoun || FILTER_CONSTANTS.DEFAULT_HABITAT)
        }
        placeholder="Seleccionar hábitat..."
        theme={theme}
      />
    </View>
  )
);

const FiltersSection = React.memo<FiltersSectionProps>(
  ({
    searchQuery,
    onSearchChange,
    categories,
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
      return <View style={styles.filtersSectionCollapsed} />;
    }

    const filtersActive = hasActiveFilters(
      searchQuery,
      selectedCategory,
      selectedSort,
      selectedHabitat
    );

    return (
      <View style={styles.filtersSection}>
        <View style={styles.filtersContent}>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>
              Filtros Avanzados {filtersActive && '🔍'}
            </Text>
            <Text style={styles.filtersSubtitle}>
              Refina tu búsqueda para encontrar exactamente lo que buscas
            </Text>
          </View>

          <View style={styles.advancedSearchContainer}>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              theme={theme}
              styles={styles}
            />
          </View>

          <View style={styles.filtersGrid}>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={onCategoryChange}
              theme={theme}
              styles={styles}
            />

            <SortFilter
              selectedSort={selectedSort}
              onSortChange={onSortChange}
              theme={theme}
              styles={styles}
            />

            <HabitatFilter
              selectedHabitat={selectedHabitat}
              onHabitatChange={onHabitatChange}
              theme={theme}
              styles={styles}
            />
          </View>
        </View>
      </View>
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
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={onAddPress}
            accessibilityRole="button"
            accessibilityLabel="Agregar primer animal"
            accessibilityHint="Toca para crear el primer registro de animal en el catálogo"
          >
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
          <TouchableOpacity
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Reintentar carga"
            accessibilityHint="Toca para intentar cargar más animales nuevamente"
          >
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
    styles
  }) => {
    const filtersActive = hasActiveFilters(
      searchQuery,
      selectedCategory,
      selectedSort,
      selectedHabitat
    );

    if (!filtersActive) return null;

    return (
      <View style={styles.quickFiltersBar}>
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.quickFilterChip}
            onPress={onClearSearch}
            accessibilityRole="button"
            accessibilityLabel={`Quitar búsqueda: ${searchQuery}`}
            accessibilityHint="Toca para eliminar el filtro de búsqueda"
          >
            <Text style={styles.quickFilterChipText}>
              🔍 "
              {truncateText(searchQuery, FILTER_CONSTANTS.MAX_SEARCH_DISPLAY)}"
            </Text>
          </TouchableOpacity>
        )}

        {selectedCategory !== FILTER_CONSTANTS.DEFAULT_CATEGORY && (
          <TouchableOpacity
            style={styles.quickFilterChip}
            onPress={onClearCategory}
            accessibilityRole="button"
            accessibilityLabel={`Quitar categoría: ${selectedCategory}`}
            accessibilityHint="Toca para eliminar el filtro de categoría"
          >
            <Text style={styles.quickFilterChipText}>
              📂 {selectedCategory}
            </Text>
          </TouchableOpacity>
        )}

        {selectedSort !== FILTER_CONSTANTS.DEFAULT_SORT && (
          <TouchableOpacity
            style={styles.quickFilterChip}
            onPress={onClearSort}
            accessibilityRole="button"
            accessibilityLabel={`Quitar orden: ${selectedSort}`}
            accessibilityHint="Toca para eliminar el filtro de ordenamiento"
          >
            <Text style={styles.quickFilterChipText}>🔤 {selectedSort}</Text>
          </TouchableOpacity>
        )}

        {selectedHabitat !== FILTER_CONSTANTS.DEFAULT_HABITAT && (
          <TouchableOpacity
            style={styles.quickFilterChip}
            onPress={onClearHabitat}
            accessibilityRole="button"
            accessibilityLabel={`Quitar hábitat: ${selectedHabitat}`}
            accessibilityHint="Toca para eliminar el filtro de hábitat"
          >
            <Text style={styles.quickFilterChipText}>🌿 {selectedHabitat}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={onClearAll}
          accessibilityRole="button"
          accessibilityLabel="Limpiar todos los filtros"
          accessibilityHint="Toca para eliminar todos los filtros aplicados"
        >
          <Text style={styles.clearFiltersText}>Limpiar todo</Text>
        </TouchableOpacity>
      </View>
    );
  }
);

// Hook personalizado para lógica del componente principal
const useCatalogScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigationActions();
  const { state, actions, filteredAnimals, categories, isLoading } =
    useCatalogManagement();
  const [filtersVisible, setFiltersVisible] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

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
    handleAddAnimal,
    handleEditAnimal,
    handleEditImage,
    handleViewDetails,
    handleToggleFilters,
    handleEndReached,
    clearActions
  };
};

// Componente principal
const CatalogManagementScreen: React.FC = () => {
  const {
    theme,
    styles,
    state,
    actions,
    filteredAnimals,
    categories,
    isLoading,
    filtersVisible,
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

  // Mostrar skeleton loader mientras carga
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
      />

      <View style={styles.content}>
        {!filtersVisible && (
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
          />
        )}

        <FiltersSection
          searchQuery={state.searchQuery}
          onSearchChange={actions.searchAnimals}
          categories={categories}
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
          getItemLayout={undefined} // Permitir que FlatList calcule automáticamente
        />
      </View>
    </SafeAreaView>
  );
};

// Display names para debugging
CatalogHeader.displayName = 'CatalogHeader';
SearchBar.displayName = 'SearchBar';
CategoryFilter.displayName = 'CategoryFilter';
SortFilter.displayName = 'SortFilter';
HabitatFilter.displayName = 'HabitatFilter';
FiltersSection.displayName = 'FiltersSection';
AnimalInfoChips.displayName = 'AnimalInfoChips';
EmptyState.displayName = 'EmptyState';
LoadingFooter.displayName = 'LoadingFooter';
QuickFiltersBar.displayName = 'QuickFiltersBar';
CatalogManagementScreen.displayName = 'CatalogManagementScreen';

export default CatalogManagementScreen;
