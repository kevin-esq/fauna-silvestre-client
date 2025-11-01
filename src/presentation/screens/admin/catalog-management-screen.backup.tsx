import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  ListRenderItem,
  ScrollView,
  Animated
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCatalogManagement } from '../../hooks/use-catalog-management.hook';
import { useTheme, Theme } from '../../contexts/theme.context';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { AnimalModelResponse } from '@/domain/models/animal.models';
import { SkeletonLoader } from '../../components/ui/skeleton-loader.component';
import AnimalCard from '../../components/animal/animal-card.component';
import CatalogFilters from '../../components/animal/catalog-filters.component';
import SearchBar from '../../components/ui/search-bar.component';
import { createStyles } from './catalog-management-screen.styles';

const FILTER_CONSTANTS = {
  DEFAULT_CATEGORY: 'Todas',
  DEFAULT_SORT: 'name',
  PAGINATION_THRESHOLD: 0.1
} as const;

interface CleanHeaderProps {
  onToggleFilters: () => void;
  filtersVisible: boolean;
  activeFiltersCount: number;
  styles: ReturnType<typeof createStyles>;
  insets: ReturnType<typeof useSafeAreaInsets>;
}

interface QuickFiltersBarProps {
  searchQuery: string;
  selectedCategory: string;
  selectedSort: string;
  onClearSearch: () => void;
  onClearCategory: () => void;
  onClearSort: () => void;
  onClearAll: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}

interface EmptyStateProps {
  searchQuery: string;
  selectedCategory: string;
  selectedSort: string;
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

const hasActiveFilters = (
  searchQuery: string,
  selectedCategory: string,
  selectedSort: string
): boolean => {
  return (
    searchQuery.length > 0 ||
    selectedCategory !== FILTER_CONSTANTS.DEFAULT_CATEGORY ||
    selectedSort !== FILTER_CONSTANTS.DEFAULT_SORT
  );
};

const getActiveFiltersCount = (
  searchQuery: string,
  selectedCategory: string,
  selectedSort: string
): number => {
  let count = 0;
  if (searchQuery.length > 0) count++;
  if (selectedCategory !== FILTER_CONSTANTS.DEFAULT_CATEGORY) count++;
  if (selectedSort !== FILTER_CONSTANTS.DEFAULT_SORT) count++;
  return count;
};

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const CleanHeader = React.memo<CleanHeaderProps>(
  ({ onToggleFilters, filtersVisible, activeFiltersCount, styles, insets }) => (
    <Animated.View
      style={[styles.cleanHeader, { paddingTop: insets.top + 12 }]}
    >
      <TouchableOpacity
        style={styles.collapseHeaderButton}
        onPress={onToggleFilters}
        activeOpacity={0.7}
      >
        <Text style={styles.collapseHeaderIcon}>
          {filtersVisible ? '▲' : '▼'}
        </Text>
        <Text style={styles.collapseHeaderText}>
          {filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Text>
        {activeFiltersCount > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{activeFiltersCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
);

const EmptyState = React.memo<EmptyStateProps>(
  ({ searchQuery, selectedCategory, selectedSort, theme, styles }) => {
    const hasFilters = hasActiveFilters(
      searchQuery,
      selectedCategory,
      selectedSort
    );

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name={hasFilters ? 'search' : 'paw-outline'}
            size={60}
            color={theme.colors.forest}
          />
        </View>
        <Text style={styles.emptyTitle}>
          {hasFilters ? 'Sin resultados' : 'Catálogo vacío'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {hasFilters
            ? 'Prueba ajustando los filtros de búsqueda'
            : 'Agrega tu primer animal al catálogo usando el botón flotante'}
        </Text>
      </View>
    );
  }
);

const LoadingFooter = React.memo<LoadingFooterProps>(
  ({ isLoadingMore, hasNextPage, error, onRetry, theme, styles }) => {
    if (error) {
      return (
        <View style={styles.footerError}>
          <View style={styles.errorIconContainer}>
            <Ionicons
              name="alert-circle"
              size={32}
              color={theme.colors.error}
            />
          </View>
          <Text style={styles.footerErrorText}>Error al cargar</Text>
          <TouchableOpacity onPress={onRetry} style={styles.footerRetryButton}>
            <Text style={styles.footerRetryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isLoadingMore) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.footerLoadingText}>Cargando más...</Text>
        </View>
      );
    }

    if (!hasNextPage) {
      return (
        <View style={styles.footerEnd}>
          <View style={styles.footerEndDivider} />
          <Text style={styles.footerEndText}>Fin del catálogo</Text>
          <View style={styles.footerEndDivider} />
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
    onClearSearch,
    onClearCategory,
    onClearSort,
    onClearAll,
    styles,
    theme
  }) => {
    const filtersActive = hasActiveFilters(
      searchQuery,
      selectedCategory,
      selectedSort
    );

    if (!filtersActive) return null;

    const SORT_OPTIONS = [
      { id: 'name', label: 'Nombre' },
      { id: 'specie', label: 'Especie' },
      { id: 'class', label: 'Clase' },
      { id: 'date', label: 'Fecha' }
    ];

    const getSortLabel = (sortId: string) => {
      return SORT_OPTIONS.find(opt => opt.id === sortId)?.label || sortId;
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
                  {truncateText(searchQuery, 15)}
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
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.clearAllButton} onPress={onClearAll}>
          <Ionicons name="close-circle" size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    );
  }
);

const useCatalogScreen = () => {
  const themeContext = useTheme();
  const theme = themeContext.theme;
  const navigation = useNavigationActions();
  const insets = useSafeAreaInsets();
  const { state, actions, filteredAnimals, isLoading } = useCatalogManagement();
  const [filtersVisible, setFiltersVisible] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const activeFiltersCount = useMemo(
    () =>
      getActiveFiltersCount(
        state.searchQuery,
        state.selectedCategory,
        state.selectedSort
      ),
    [state.searchQuery, state.selectedCategory, state.selectedSort]
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
      clearAll: () => {
        actions.searchAnimals('');
        actions.filterByCategory(FILTER_CONSTANTS.DEFAULT_CATEGORY);
        actions.sortAnimals(FILTER_CONSTANTS.DEFAULT_SORT);
      }
    }),
    [actions]
  );

  return {
    theme,
    themeContext,
    styles,
    state,
    actions,
    filteredAnimals,
    isLoading,
    filtersVisible,
    setFiltersVisible,
    activeFiltersCount,
    handleAddAnimal,
    handleEditAnimal,
    handleEditImage,
    handleViewDetails,
    handleToggleFilters,
    handleEndReached,
    clearActions,
    insets
  };
};

const CatalogManagementScreen: React.FC = () => {
  const {
    theme,
    themeContext,
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
    clearActions,
    insets
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
        theme={theme}
        styles={styles}
      />
    ),
    [state, theme, styles]
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
        <CleanHeader
          onToggleFilters={handleToggleFilters}
          filtersVisible={filtersVisible}
          activeFiltersCount={activeFiltersCount}
          styles={styles}
          insets={insets}
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
      {filtersVisible && (
        <CleanHeader
          onToggleFilters={handleToggleFilters}
          filtersVisible={filtersVisible}
          activeFiltersCount={activeFiltersCount}
          styles={styles}
          insets={insets}
        />
      )}

      {!filtersVisible && (
        <TouchableOpacity
          style={[styles.floatingFilterButton, { top: insets.top + 12 }]}
          onPress={handleToggleFilters}
          activeOpacity={0.9}
        >
          <Ionicons
            name="funnel"
            size={20}
            color={theme.colors.textOnPrimary}
          />
          <Text style={styles.floatingButtonText}>Filtros</Text>
          {activeFiltersCount > 0 && (
            <View style={styles.floatingButtonBadge}>
              <Text style={styles.floatingButtonBadgeText}>
                {activeFiltersCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      <FlatList
        data={filteredAnimals}
        keyExtractor={keyExtractor}
        renderItem={renderAnimalCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={FILTER_CONSTANTS.PAGINATION_THRESHOLD}
        refreshControl={refreshControl}
        ListHeaderComponent={
          filtersVisible ? (
            <View>
              <SearchBar
                value={state.inputValue}
                onChangeText={actions.searchAnimals}
                onClear={clearActions.clearSearch}
                placeholder="Buscar animales..."
                theme={theme}
              />

              <CatalogFilters
                animals={filteredAnimals}
                onFilterChange={() => {}}
                theme={themeContext}
                isVisible={filtersVisible}
              />

              <QuickFiltersBar
                searchQuery={state.searchQuery}
                selectedCategory={state.selectedCategory}
                selectedSort={state.selectedSort}
                onClearSearch={clearActions.clearSearch}
                onClearCategory={clearActions.clearCategory}
                onClearSort={clearActions.clearSort}
                onClearAll={clearActions.clearAll}
                styles={styles}
                theme={theme}
              />
            </View>
          ) : null
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />

      <TouchableOpacity
        style={[styles.floatingAddButton, { bottom: insets.bottom + 20 }]}
        onPress={handleAddAnimal}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color={theme.colors.textOnPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

CleanHeader.displayName = 'CleanHeader';
EmptyState.displayName = 'EmptyState';
LoadingFooter.displayName = 'LoadingFooter';
QuickFiltersBar.displayName = 'QuickFiltersBar';
CatalogManagementScreen.displayName = 'CatalogManagementScreen';

export default CatalogManagementScreen;
