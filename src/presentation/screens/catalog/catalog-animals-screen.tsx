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
  Image,
  ActivityIndicator,
  Animated,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme, themeVariables } from '../../contexts/theme.context';
import SearchBar from '../../components/ui/search-bar.component';
import LoadingIndicator from '../../components/ui/loading-indicator.component';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { Theme } from '../../contexts/theme.context';
import { AnimalModelResponse } from '../../../domain/models/animal.models';
import { createStyles } from './catalog-animals-screen.styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCatalog } from '../../contexts/catalog.context';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PAGE_SIZE = 10;
const ANIMATION_DURATION = 300;
const STAGGER_DELAY = 50;

// ==================== INTERFACES ====================
interface EmptyStateProps {
  searchQuery: string;
  theme: Theme;
  onRefresh: () => void;
  isLoading: boolean;
}

interface CatalogAnimalCardProps {
  animal: AnimalModelResponse;
  onPress: () => void;
  theme: Theme;
  index: number;
  viewMode: 'grid' | 'list';
}

interface CatalogHeaderProps {
  totalCount: number;
  filteredCount: number;
  searchQuery: string;
  theme: Theme;
  onBackPress?: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: 'name' | 'species' | 'category';
  onSortChange: (sort: 'name' | 'species' | 'category') => void;
}

// ==================== CUSTOM HOOKS ====================
const useAnimatedValue = (initialValue: number = 0) => {
  return useRef(new Animated.Value(initialValue)).current;
};

const useSearchDebounce = (value: string, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value.trim().toLowerCase());
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ==================== ENHANCED EMPTY STATE ====================
const EmptyState = React.memo<EmptyStateProps>(
  ({ searchQuery, theme, onRefresh, isLoading }) => {
    const insets = useSafeAreaInsets();
    const styles = createStyles(themeVariables(theme), insets);
    const fadeAnim = useAnimatedValue();
    const scaleAnim = useAnimatedValue(0.8);

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true
        })
      ]).start();
    }, [fadeAnim, scaleAnim]);

    const renderSearchEmpty = () => (
      <Animated.View
        style={[
          styles.emptyStateContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="search-outline"
            size={64}
            color={theme.colors.placeholder}
          />
        </View>
        <Text style={styles.emptyTitle}>Sin resultados</Text>
        <Text style={styles.emptySubtitle}>
          No encontramos animales que coincidan con "{searchQuery}"
        </Text>
        <View style={styles.suggestionContainer}>
          <Text style={styles.suggestionTitle}>Sugerencias:</Text>
          <Text style={styles.suggestionItem}>• Verifica la ortografía</Text>
          <Text style={styles.suggestionItem}>
            • Usa términos más generales
          </Text>
          <Text style={styles.suggestionItem}>
            • Prueba con categorías como "mamífero"
          </Text>
        </View>
      </Animated.View>
    );

    const renderGeneralEmpty = () => (
      <Animated.View
        style={[
          styles.emptyStateContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="leaf-outline"
            size={64}
            color={theme.colors.placeholder}
          />
        </View>
        <Text style={styles.emptyTitle}>Catálogo en construcción</Text>
        <Text style={styles.emptySubtitle}>
          Estamos preparando una increíble colección de fauna para ti
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRefresh}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Animated.View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.textOnPrimary}
              />
            ) : (
              <Ionicons
                name="refresh"
                size={20}
                color={theme.colors.textOnPrimary}
              />
            )}
            <Text style={styles.retryButtonText}>
              {isLoading ? 'Cargando...' : 'Actualizar'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );

    return searchQuery ? renderSearchEmpty() : renderGeneralEmpty();
  }
);

// ==================== ENHANCED ANIMAL CARD ====================
export const CatalogAnimalCard = React.memo<CatalogAnimalCardProps>(
  ({ animal, onPress, theme, index, viewMode }) => {
    const insets = useSafeAreaInsets();
    const styles = createStyles(themeVariables(theme), insets);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    // Animation values
    const scaleAnim = useAnimatedValue(0.9);
    const fadeAnim = useAnimatedValue(0);
    const slideAnim = useAnimatedValue(50);
    const progressAnim = useAnimatedValue(0);

    useEffect(() => {
      const delay = index * STAGGER_DELAY;

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          delay,
          tension: 100,
          friction: 8,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          delay,
          duration: ANIMATION_DURATION,
          useNativeDriver: true
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          delay,
          duration: ANIMATION_DURATION,
          useNativeDriver: true
        })
      ]).start();
    }, [index, scaleAnim, fadeAnim, slideAnim]);

    const handleImageLoad = useCallback(() => {
      setImageLoading(false);
      setImageError(false);

      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false
      }).start();
    }, [progressAnim]);

    const handleImageError = useCallback(() => {
      setImageLoading(false);
      setImageError(true);
    }, []);

    const handlePress = useCallback(() => {
      // Haptic feedback simulation with animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start(() => {
        onPress();
      });
    }, [onPress, scaleAnim]);

    const renderImage = () => {
      if (!animal.image || imageError) {
        return (
          <View style={styles.catalogImagePlaceholder}>
            <View style={styles.placeholderIconContainer}>
              <Ionicons
                name="camera-outline"
                size={viewMode === 'grid' ? 32 : 24}
                color={theme.colors.placeholder}
              />
            </View>
            <Text style={styles.placeholderText}>Sin imagen</Text>
          </View>
        );
      }

      return (
        <>
          <Image
            source={{ uri: animal.image }}
            style={styles.catalogImage}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {imageLoading && (
            <View style={styles.catalogImageLoading}>
              <ActivityIndicator size="small" color={theme.colors.forest} />
              <Animated.View
                style={[
                  styles.loadingProgress,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
          )}
          <View style={styles.imageOverlay} />
        </>
      );
    };

    const renderBadges = () => (
      <>
        <View style={styles.catalogBadge}>
          <Text style={styles.catalogBadgeText}>{animal.category}</Text>
        </View>

        {index < 3 && (
          <Animated.View
            style={[
              styles.newBadge,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <Ionicons
              name="sparkles"
              size={10}
              color={theme.colors.textOnPrimary}
            />
            <Text style={styles.newBadgeText}>Nuevo</Text>
          </Animated.View>
        )}
      </>
    );

    const renderContent = () => (
      <View
        style={
          viewMode === 'list'
            ? styles.catalogContentList
            : styles.catalogContent
        }
      >
        <View style={styles.titleContainer}>
          <Text
            style={styles.catalogTitle}
            numberOfLines={viewMode === 'grid' ? 1 : 2}
          >
            {animal.commonNoun}
          </Text>
          {animal.specie && (
            <Text style={styles.catalogSpecies} numberOfLines={1}>
              <Text style={styles.speciesLabel}>Especie: </Text>
              {animal.specie}
            </Text>
          )}
        </View>

        <View style={styles.catalogMeta}>
          <View style={styles.catalogMetaItem}>
            <Ionicons
              name="leaf-outline"
              size={14}
              color={theme.colors.forest}
            />
            <Text style={styles.catalogMetaText}>
              {animal.habitat ? 'Hábitat definido' : 'Info básica'}
            </Text>
          </View>

          {animal.description && (
            <View style={styles.catalogMetaItem}>
              <Ionicons
                name="document-text-outline"
                size={14}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.catalogMetaText}>
                {animal.description.length > 50
                  ? 'Descripción completa'
                  : 'Descripción'}
              </Text>
            </View>
          )}

          <View style={styles.catalogMetaItem}>
            <Ionicons
              name="time-outline"
              size={14}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.catalogMetaText}>Reciente</Text>
          </View>
        </View>
      </View>
    );

    const cardStyle =
      viewMode === 'grid' ? styles.catalogCard : styles.catalogCardList;

    return (
      <Animated.View
        style={[
          cardStyle,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalles de ${animal.commonNoun}, ${animal.specie}`}
          style={
            viewMode === 'list'
              ? styles.catalogCardTouchableList
              : styles.catalogCardTouchable
          }
        >
          <View
            style={
              viewMode === 'grid'
                ? styles.catalogImageContainer
                : styles.catalogImageContainerList
            }
          >
            {renderImage()}
            {renderBadges()}
          </View>

          {renderContent()}

          <View style={styles.actionButton}>
            <Ionicons
              name={viewMode === 'grid' ? 'arrow-forward' : 'chevron-forward'}
              size={16}
              color={theme.colors.textOnPrimary}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

// ==================== ENHANCED HEADER WITH CONTROLS ====================
const CatalogHeader = React.memo<CatalogHeaderProps>(
  ({
    totalCount,
    filteredCount,
    searchQuery,
    theme,
    onBackPress,
    viewMode,
    onViewModeChange,
    sortBy,
    onSortChange
  }) => {
    const styles = createStyles(themeVariables(theme), useSafeAreaInsets());
    const [showControls, setShowControls] = useState(false);
    const controlsAnim = useAnimatedValue(0);

    const toggleControls = useCallback(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowControls(!showControls);

      Animated.timing(controlsAnim, {
        toValue: showControls ? 0 : 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true
      }).start();
    }, [showControls, controlsAnim]);

    const renderSortButton = (
      sortType: 'name' | 'species' | 'category',
      label: string,
      icon: string
    ) => (
      <TouchableOpacity
        style={[
          styles.sortButton,
          sortBy === sortType && styles.sortButtonActive
        ]}
        onPress={() => onSortChange(sortType)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon}
          size={16}
          color={
            sortBy === sortType
              ? theme.colors.textOnPrimary
              : theme.colors.textSecondary
          }
        />
        <Text
          style={[
            styles.sortButtonText,
            sortBy === sortType && styles.sortButtonTextActive
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );

    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          {onBackPress && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackPress}
              accessibilityRole="button"
              accessibilityLabel="Regresar"
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.colors.forest}
              />
            </TouchableOpacity>
          )}

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Catálogo de Fauna</Text>
            <Text style={styles.headerSubtitle}>
              {searchQuery
                ? `${filteredCount} de ${totalCount} animales`
                : `${totalCount} especies documentadas`}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={toggleControls}
              activeOpacity={0.7}
            >
              <Ionicons
                name="options-outline"
                size={20}
                color={theme.colors.forest}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'grid' && styles.viewModeButtonActive
              ]}
              onPress={() =>
                onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')
              }
              activeOpacity={0.7}
            >
              <Ionicons
                name={viewMode === 'grid' ? 'grid-outline' : 'list-outline'}
                size={20}
                color={
                  viewMode === 'grid'
                    ? theme.colors.textOnPrimary
                    : theme.colors.forest
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {showControls && (
          <Animated.View
            style={[
              styles.controlsContainer,
              {
                opacity: controlsAnim,
                transform: [
                  {
                    translateY: controlsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.controlsTitle}>Ordenar por:</Text>
            <View style={styles.sortButtonsContainer}>
              {renderSortButton('name', 'Nombre', 'text-outline')}
              {renderSortButton('species', 'Especie', 'leaf-outline')}
              {renderSortButton('category', 'Categoría', 'library-outline')}
            </View>
          </Animated.View>
        )}
      </View>
    );
  }
);

// ==================== MAIN COMPONENT ENHANCED ====================
const CatalogAnimalsScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(
    () => createStyles(variables, insets),
    [variables, insets]
  );
  const { push, goBack } = useNavigationActions();
  const { catalog, isLoading, fetchCatalog } = useCatalog();

  // State management
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'species' | 'category'>('name');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchQuery = useSearchDebounce(searchInput);

  // Effects
  useEffect(() => {
    if (isInitialLoading) {
      fetchCatalog();
      setIsInitialLoading(false);
    }
  }, [fetchCatalog, isInitialLoading]);

  // Enhanced filtering and sorting
  const processedCatalog = useMemo(() => {
    let filtered = catalog;

    // Apply search filter
    if (searchQuery) {
      filtered = catalog.filter(animal => {
        const query = searchQuery.toLowerCase();
        return (
          animal.commonNoun.toLowerCase().includes(query) ||
          animal.specie.toLowerCase().includes(query) ||
          animal.category.toLowerCase().includes(query) ||
          (animal.description &&
            animal.description.toLowerCase().includes(query))
        );
      });
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.commonNoun.localeCompare(b.commonNoun);
        case 'species':
          return a.specie.localeCompare(b.specie);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  }, [catalog, searchQuery, sortBy]);

  // Handlers
  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setViewMode(mode);
  }, []);

  const handleSortChange = useCallback(
    (sort: 'name' | 'species' | 'category') => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSortBy(sort);
    },
    []
  );

  const renderAnimalItem = useCallback(
    ({ item, index }: { item: AnimalModelResponse; index: number }) => {
      const handlePress = () => {
        push('AnimalDetails', { animal: item });
      };

      return (
        <CatalogAnimalCard
          animal={item}
          onPress={handlePress}
          theme={theme}
          index={index}
          viewMode={viewMode}
        />
      );
    },
    [push, theme, viewMode]
  );

  const keyExtractor = useCallback(
    (item: AnimalModelResponse, index: number) => `${item.catalogId}-${index}`,
    []
  );

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.95],
    extrapolate: 'clamp'
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: 'clamp'
  });

  // Loading state
  if (isLoading && catalog.length === 0) {
    return (
      <LoadingIndicator theme={theme} text="Explorando la biodiversidad..." />
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        backgroundColor={theme.colors.surface}
        barStyle={theme.colors.textOnPrimary ? 'light-content' : 'dark-content'}
      />

      <Animated.View
        style={[
          styles.headerWrapper,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}
      >
        <CatalogHeader
          totalCount={catalog.length}
          filteredCount={processedCatalog.length}
          searchQuery={searchQuery}
          theme={theme}
          onBackPress={goBack}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />

        <SearchBar
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Buscar por nombre, especie o categoría..."
          theme={theme}
          onClear={() => setSearchInput('')}
        />
      </Animated.View>

      <FlatList
        data={processedCatalog}
        renderItem={renderAnimalItem}
        keyExtractor={keyExtractor}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render on view mode change
        columnWrapperStyle={viewMode === 'grid' ? styles.row : undefined}
        contentContainerStyle={[
          styles.list,
          processedCatalog.length === 0 && styles.listEmpty
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && searchQuery === ''}
            onRefresh={fetchCatalog}
            colors={[variables['--primary']]}
            tintColor={variables['--primary']}
            title="Actualizando catálogo..."
            titleColor={variables['--text-secondary']}
          />
        }
        ListEmptyComponent={
          <EmptyState
            searchQuery={searchQuery}
            theme={theme}
            onRefresh={fetchCatalog}
            isLoading={isLoading}
          />
        }
        initialNumToRender={PAGE_SIZE}
        maxToRenderPerBatch={PAGE_SIZE}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={
          viewMode === 'grid'
            ? (_, index) => ({
                length: 280,
                offset: 280 * Math.floor(index / 2),
                index
              })
            : undefined
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default CatalogAnimalsScreen;
