import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef
} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCatalogManagement } from '../../hooks/admin/use-catalog-management.hook';
import { useTheme } from '../../contexts/theme.context';
import { useCatalogViewPreferences } from '../../contexts/catalog-view-preferences.context';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { AnimalModelResponse } from '@/domain/models/animal.models';
import SearchBar from '../../components/ui/search-bar.component';
import { CatalogViewSelector } from '../../components/ui/catalog-view-selector.component';
import { AnimalCardWithActions } from '../../components/animal/animal-card-with-actions.component';
import { addEventListener, AppEvents } from '@/shared/utils/event-emitter';

const CatalogManagementScreen: React.FC = () => {
  const { theme, colors, spacing, typography, borderRadius } = useTheme();
  const navigation = useNavigationActions();
  const { state, actions, filteredAnimals, isLoading } = useCatalogManagement();
  const viewPrefs = useCatalogViewPreferences();
  const flatListRef = useRef<FlatList>(null);

  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const updateSubscription = addEventListener(
      AppEvents.ANIMAL_UPDATED,
      () => {
        console.log(
          '🔄 Animal actualizado, recargando catálogo de administración...'
        );
        actions.refreshAnimals();
      }
    );

    const deleteSubscription = addEventListener(
      AppEvents.ANIMAL_DELETED,
      () => {
        console.log(
          '🔄 Animal eliminado, recargando catálogo de administración...'
        );
        actions.refreshAnimals();
      }
    );

    return () => {
      updateSubscription.remove();
      deleteSubscription.remove();
    };
  }, [actions]);

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

  const handleDeleteAnimal = useCallback(
    async (catalogId: string) => {
      await actions.deleteAnimal(catalogId);
    },
    [actions]
  );

  const handleEndReached = useCallback(() => {
    if (!state.isLoadingMore && state.hasNextPage) {
      actions.loadMoreAnimals();
    }
  }, [state.isLoadingMore, state.hasNextPage, actions]);

  const processedAnimals = useMemo(() => {
    let filtered = [...filteredAnimals];

    if (searchInput.trim()) {
      const query = searchInput.toLowerCase();
      filtered = filtered.filter(
        animal =>
          animal.commonNoun.toLowerCase().includes(query) ||
          animal.specie.toLowerCase().includes(query) ||
          animal.category.toLowerCase().includes(query)
      );
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
  }, [filteredAnimals, searchInput, viewPrefs.sortBy]);

  const keyExtractor = useCallback(
    (item: AnimalModelResponse) => `animal-${item.catalogId}`,
    []
  );

  const renderAnimalItem = useCallback(
    ({ item }: { item: AnimalModelResponse }) => {
      const handlePress = () => {
        navigation.navigate('AnimalDetails', { animal: item });
      };

      return (
        <AnimalCardWithActions
          animal={item}
          onPress={handlePress}
          actions={{
            onEdit: handleEditAnimal,
            onDelete: handleDeleteAnimal,
            onImageEdit: handleEditImage
          }}
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
    [
      handleEditAnimal,
      handleDeleteAnimal,
      handleEditImage,
      viewPrefs,
      navigation
    ]
  );

  const renderFooter = () => {
    if (state.error) {
      return (
        <View style={styles.footerError}>
          <Ionicons name="alert-circle" size={32} color={colors.error} />
          <Text style={styles.footerErrorText}>Error al cargar</Text>
          <TouchableOpacity
            onPress={actions.loadMoreAnimals}
            style={styles.footerRetryButton}
          >
            <Text style={styles.footerRetryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (state.isLoadingMore) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.footerLoadingText}>Cargando más...</Text>
        </View>
      );
    }

    if (!state.hasNextPage && processedAnimals.length > 0) {
      return (
        <View style={styles.footerEnd}>
          <View style={styles.footerEndDivider} />
          <Text style={styles.footerEndText}>Fin del catálogo</Text>
          <View style={styles.footerEndDivider} />
        </View>
      );
    }

    return null;
  };

  const renderEmptyState = () => {
    const hasSearch = searchInput.trim().length > 0;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name={hasSearch ? 'search-outline' : 'paw-outline'}
          size={64}
          color={colors.textSecondary}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyTitle}>
          {hasSearch ? 'Sin resultados' : 'Catálogo vacío'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {hasSearch
            ? 'No encontramos animales con ese criterio'
            : 'Agrega tu primer animal usando el botón flotante'}
        </Text>
      </View>
    );
  };

  const styles = useMemo(
    () => ({
      container: {
        flex: 1,
        backgroundColor: colors.background
      },
      header: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.medium,
        paddingTop: spacing.small,
        paddingBottom: spacing.small,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider
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
        textAlign: 'center' as const
      },
      floatingAddButton: {
        position: 'absolute' as const,
        right: spacing.large,
        bottom: spacing.large + 20,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.forest,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
        borderWidth: 3,
        borderColor: colors.leaf + '40'
      },
      footerError: {
        alignItems: 'center' as const,
        paddingVertical: spacing.large
      },
      footerErrorText: {
        color: colors.error,
        fontSize: typography.fontSize.medium,
        marginVertical: spacing.small
      },
      footerRetryButton: {
        paddingHorizontal: spacing.medium,
        paddingVertical: spacing.small,
        backgroundColor: colors.error,
        borderRadius: borderRadius.medium
      },
      footerRetryText: {
        color: colors.textOnPrimary,
        fontSize: typography.fontSize.medium,
        fontWeight: typography.fontWeight.medium
      },
      footerLoading: {
        alignItems: 'center' as const,
        paddingVertical: spacing.large,
        flexDirection: 'row' as const,
        justifyContent: 'center' as const,
        gap: spacing.small
      },
      footerLoadingText: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.small
      },
      footerEnd: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingVertical: spacing.large,
        paddingHorizontal: spacing.medium
      },
      footerEndDivider: {
        flex: 1,
        height: 1,
        backgroundColor: colors.divider
      },
      footerEndText: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.small,
        fontWeight: typography.fontWeight.medium
      }
    }),
    [colors, spacing, typography, borderRadius]
  );

  if (isLoading && filteredAnimals.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
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
            Cargando catálogo...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />

      <View style={styles.header}>
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

      <FlatList
        ref={flatListRef}
        data={processedAnimals}
        keyExtractor={keyExtractor}
        renderItem={renderAnimalItem}
        numColumns={viewPrefs.layout === 'grid' ? 2 : 1}
        key={`catalog-mgmt-${viewPrefs.layout}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={state.isRefreshing}
            onRefresh={actions.refreshAnimals}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState()}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />

      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={handleAddAnimal}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Agregar nuevo animal"
      >
        <Ionicons name="add-circle" size={32} color={colors.textOnPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CatalogManagementScreen;
