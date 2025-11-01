import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  View,
  FlatList,
  Text,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/theme.context';
import { useCatalogViewPreferences } from '../../contexts/catalog-view-preferences.context';
import SearchBar from '../../components/ui/search-bar.component';
import { CatalogViewSelector } from '../../components/ui/catalog-view-selector.component';
import { AnimalCardVariant } from '../../components/animal/animal-card-variants.component';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { AnimalModelResponse } from '../../../domain/models/animal.models';
import { useCatalog } from '../../contexts/catalog.context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SEARCH_DEBOUNCE_DELAY = 300;

const useSearchDebounce = (
  value: string,
  delay: number = SEARCH_DEBOUNCE_DELAY
) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const normalizedValue = value.trim().toLowerCase();

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(normalizedValue);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};

const normalizeString = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '');
};

const matchesSearch = (animal: AnimalModelResponse, query: string): boolean => {
  if (!query) return true;

  const normalizedQuery = normalizeString(query);
  const searchFields = [
    normalizeString(animal.commonNoun),
    normalizeString(animal.specie),
    normalizeString(animal.category),
    normalizeString(animal.description || ''),
    normalizeString(animal.habitat || '')
  ];

  return searchFields.some(field => field.includes(normalizedQuery));
};

const CatalogAnimalsScreen = () => {
  const { theme, colors, spacing, typography, borderRadius } = useTheme();
  const { push, goBack } = useNavigationActions();
  const { catalog, isLoading, fetchCatalog } = useCatalog();
  const viewPrefs = useCatalogViewPreferences();
  const insets = useSafeAreaInsets();

  const [searchInput, setSearchInput] = useState('');
  const searchQuery = useSearchDebounce(searchInput, SEARCH_DEBOUNCE_DELAY);
  const flatListRef = useRef<FlatList>(null);
  const hasInitiallyLoaded = useRef(false);

  useEffect(() => {
    if (!hasInitiallyLoaded.current && catalog.length === 0) {
      fetchCatalog();
      hasInitiallyLoaded.current = true;
    }
  }, [fetchCatalog, catalog.length]);

  useFocusEffect(
    useCallback(() => {
      if (hasInitiallyLoaded.current && catalog.length > 0) {
        fetchCatalog();
      }
    }, [fetchCatalog, catalog.length])
  );

  const processedCatalog = useMemo(() => {
    let filtered = [...catalog];

    if (searchQuery) {
      filtered = filtered.filter(animal => matchesSearch(animal, searchQuery));
    }

    filtered.sort((a, b) => {
      switch (viewPrefs.sortBy) {
        case 'name-asc':
        case 'species-asc':
          return a.commonNoun.localeCompare(b.commonNoun, 'es', {
            sensitivity: 'base'
          });
        case 'name-desc':
        case 'species-desc':
          return b.commonNoun.localeCompare(a.commonNoun, 'es', {
            sensitivity: 'base'
          });
        case 'habitat-asc':
          return (a.habitat || '').localeCompare(b.habitat || '', 'es', {
            sensitivity: 'base'
          });
        case 'habitat-desc':
          return (b.habitat || '').localeCompare(a.habitat || '', 'es', {
            sensitivity: 'base'
          });
        default:
          return 0;
      }
    });

    return filtered;
  }, [catalog, searchQuery, viewPrefs.sortBy]);

  const handleRefresh = useCallback(() => {
    setSearchInput('');
    fetchCatalog();
  }, [fetchCatalog]);

  const renderAnimalItem = useCallback(
    ({ item }: { item: AnimalModelResponse }) => {
      const handlePress = () => {
        push('AnimalDetails', { animal: item });
      };

      return (
        <AnimalCardVariant
          animal={item}
          onPress={handlePress}
          layout={viewPrefs.layout}
          density={viewPrefs.density}
          showImages={viewPrefs.showImages}
          highlightStatus={viewPrefs.highlightStatus}
          showCategory={viewPrefs.showCategory}
          showSpecies={viewPrefs.showSpecies}
          showHabitat={viewPrefs.showHabitat}
          showDescription={viewPrefs.showDescription}
          reducedMotion={viewPrefs.reducedMotion}
        />
      );
    },
    [push, viewPrefs]
  );

  const keyExtractor = useCallback(
    (item: AnimalModelResponse) => `catalog-animal-${item.catalogId}`,
    []
  );

  const numColumns = viewPrefs.layout === 'grid' ? 2 : 1;

  const styles = useMemo(
    () => ({
      container: {
        flex: 1,
        backgroundColor: colors.background
      },
      header: {
        marginBottom: spacing.large,
        paddingHorizontal: spacing.medium,
        paddingTop: spacing.medium
      },
      headerTop: {
        flexDirection: 'row' as const,
        alignItems: 'flex-start' as const,
        marginBottom: spacing.medium,
        justifyContent: 'space-between' as const
      },
      backButton: {
        padding: spacing.small,
        borderRadius: borderRadius.medium,
        backgroundColor: colors.surfaceVariant,
        marginRight: spacing.small
      },
      headerCenter: {
        flex: 1,
        alignItems: 'center' as const,
        marginHorizontal: spacing.small
      },
      headerTitleRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: spacing.small,
        marginBottom: spacing.tiny
      },
      headerTitle: {
        fontSize: typography.fontSize.xxlarge,
        fontWeight: typography.fontWeight.bold,
        color: colors.forest,
        textAlign: 'center' as const,
        lineHeight: typography.lineHeight.xxlarge
      },
      headerSubtitle: {
        fontSize: typography.fontSize.small,
        color: colors.textSecondary,
        textAlign: 'center' as const,
        lineHeight: typography.lineHeight.small
      },
      headerPlaceholder: {
        width: 48
      },
      searchRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: spacing.small
      },
      list: {
        paddingTop: spacing.small,
        paddingBottom: spacing.xlarge
      },
      emptyContainer: {
        alignItems: 'center' as const,
        paddingHorizontal: spacing.large,
        paddingVertical: spacing.xlarge * 2
      },
      emptyIcon: {
        marginBottom: spacing.large
      },
      emptyTitle: {
        fontSize: typography.fontSize.large,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.small,
        textAlign: 'center' as const
      },
      emptySubtitle: {
        fontSize: typography.fontSize.medium,
        color: colors.textSecondary,
        textAlign: 'center' as const,
        marginBottom: spacing.large
      },
      retryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.large,
        paddingVertical: spacing.medium,
        borderRadius: borderRadius.medium,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: spacing.small
      },
      retryButtonText: {
        color: colors.textOnPrimary,
        fontSize: typography.fontSize.medium,
        fontWeight: typography.fontWeight.medium
      }
    }),
    [colors, spacing, typography, borderRadius]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={goBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.forest} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="paw" size={28} color={colors.forest} />
              <Text style={styles.headerTitle}>Catálogo de Fauna</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              {searchQuery
                ? `${processedCatalog.length} de ${catalog.length} ${
                    processedCatalog.length === 1 ? 'animal' : 'animales'
                  }`
                : `${catalog.length} ${
                    catalog.length === 1 ? 'especie' : 'especies'
                  }`}
            </Text>
          </View>

          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar
              value={searchInput}
              onChangeText={setSearchInput}
              onClear={() => setSearchInput('')}
              placeholder="Buscar animales..."
              theme={theme}
            />
          </View>
          <View style={{ marginLeft: 8 }}>
            <CatalogViewSelector minimal />
          </View>
        </View>
      </View>
    ),
    [
      goBack,
      colors,
      searchQuery,
      processedCatalog.length,
      catalog.length,
      searchInput,
      theme,
      styles
    ]
  );

  const renderEmptyState = () => {
    if (searchQuery) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="search-outline"
            size={64}
            color={colors.textSecondary}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>Sin resultados</Text>
          <Text style={styles.emptySubtitle}>
            No encontramos animales que coincidan con "{searchQuery}"
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="leaf-outline"
          size={64}
          color={colors.textSecondary}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyTitle}>Catálogo en construcción</Text>
        <Text style={styles.emptySubtitle}>
          Estamos preparando una increíble colección de fauna para ti
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRefresh}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.textOnPrimary} />
          ) : (
            <Ionicons name="refresh" size={20} color={colors.textOnPrimary} />
          )}
          <Text style={styles.retryButtonText}>
            {isLoading ? 'Cargando...' : 'Actualizar'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading && catalog.length === 0 && !hasInitiallyLoaded.current) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' }
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={{
            marginTop: spacing.medium,
            color: colors.textSecondary
          }}
        >
          Explorando la biodiversidad...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />

      <FlatList
        ref={flatListRef}
        data={processedCatalog}
        renderItem={renderAnimalItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        key={`catalog-${viewPrefs.layout}-${numColumns}`}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && hasInitiallyLoaded.current}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState()}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />
    </SafeAreaView>
  );
};

export default CatalogAnimalsScreen;

export { AnimalCardVariant as CatalogAnimalCard };
