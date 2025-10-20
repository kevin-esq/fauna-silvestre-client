import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo
} from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Text,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../contexts/theme.context';
import { usePublications } from '../../contexts/publication.context';
import PublicationCard, {
  ITEM_HEIGHT
} from '../../components/publication/publication-card.component';
import PublicationSkeleton from '../../components/ui/publication-skeleton.component';
import PublicationFilters, {
  FilterOptions
} from '../../components/publication/publication-filters.component';

import { PublicationModelResponse } from '../../../domain/models/publication.models';
import { PublicationStatus } from '../../../services/publication/publication.service';
import { useAuth } from '@/presentation/contexts/auth.context';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { createPublicationScreenStyles } from './publication-screen.styles';

const CONFIG = {
  SCROLL: {
    FAST_THRESHOLD: 2,
    PREFETCH_THRESHOLD: 0.7,
    DEBOUNCE_TIME: 100,
    END_REACHED_THRESHOLD: 0.8,
    PADDING_TO_BOTTOM: 20
  },
  UI: {
    SKELETON_COUNT: 5,
    ERROR_DELAY: 5000,
    INITIAL_RENDER_COUNT: 10
  },
  PERFORMANCE: {
    MAX_RENDER_BATCH: 10,
    WINDOW_SIZE: 5,
    UPDATE_BATCHING_PERIOD: 50
  },
  ANIMATION: {
    DURATION: 250,
    SPRING_CONFIG: {
      tension: 40,
      friction: 7
    }
  },
  SEARCH: {
    DEBOUNCE_TIME: 300
  },
  LOADING: {
    INITIAL_LOAD_DELAY: 100,
    RETRY_DELAY: 2000
  }
} as const;

const CARD_MARGIN = 16;
const ACTUAL_ITEM_HEIGHT = ITEM_HEIGHT + CARD_MARGIN;

const useSearch = (publications: PublicationModelResponse[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);

  const filteredPublications = useMemo(() => {
    if (!searchQuery.trim()) {
      return publications;
    }

    const query = searchQuery.toLowerCase().trim();
    return publications.filter(pub => {
      const title = pub.commonNoun?.toLowerCase() || '';
      const description = pub.description?.toLowerCase() || '';
      const location = pub.location?.toLowerCase() || '';

      return (
        title.includes(query) ||
        description.includes(query) ||
        location.includes(query)
      );
    });
  }, [publications, searchQuery]);

  const handleSearchChange = useCallback((text: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(text);
    }, CONFIG.SEARCH.DEBOUNCE_TIME);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filteredPublications,
    handleSearchChange,
    clearSearch,
    isFocused,
    setIsFocused
  };
};

const usePublicationData = (selectedStatus: PublicationStatus) => {
  const { state, getStatusData, getTotalCount, canLoadMore } =
    usePublications();

  return useMemo(() => {
    const statusData = getStatusData(selectedStatus);
    const circuitBreaker = state.circuitBreaker;

    return {
      statusData,
      publications: statusData.publications,
      filteredPublications: statusData.filteredPublications,
      pagination: statusData.pagination,
      totalCount: getTotalCount(selectedStatus),
      canLoadMore: canLoadMore(selectedStatus),
      isLoading: statusData.isLoading,
      isLoadingMore: statusData.isLoadingMore,
      isRefreshing: statusData.isRefreshing,
      isEmpty: statusData.isEmpty,
      error: statusData.error,
      circuitBreaker,
      lastUpdated: statusData.lastUpdated
    };
  }, [selectedStatus, state, getStatusData, getTotalCount, canLoadMore]);
};

const useErrorState = (
  publications: PublicationModelResponse[],
  circuitBreaker: {
    failureCount: number;
    isOpen: boolean;
    lastFailureTime: number | null;
  },
  error?: string
) => {
  const [hasHadSuccessfulLoad, setHasHadSuccessfulLoad] = useState(false);
  const [showDelayedError, setShowDelayedError] = useState(false);

  const isPersistentError = useMemo(
    () => Boolean(error && circuitBreaker.failureCount >= 3),
    [error, circuitBreaker.failureCount]
  );

  const hasTemporaryError = useMemo(
    () => Boolean(error && !isPersistentError),
    [error, isPersistentError]
  );

  useEffect(() => {
    if (publications.length > 0 && !error) {
      setHasHadSuccessfulLoad(true);
    }
  }, [publications.length, error]);

  useEffect(() => {
    if (hasTemporaryError && hasHadSuccessfulLoad) {
      const timer = setTimeout(() => {
        setShowDelayedError(true);
      }, CONFIG.UI.ERROR_DELAY);
      return () => clearTimeout(timer);
    } else {
      setShowDelayedError(false);
    }
  }, [hasTemporaryError, hasHadSuccessfulLoad]);

  return {
    isPersistentError,
    hasTemporaryError,
    showDelayedError,
    isCircuitBreakerOpen: circuitBreaker.isOpen || false
  };
};

const usePublicationOperations = (selectedStatus: PublicationStatus) => {
  const {
    loadStatus,
    loadMoreStatus,
    refreshStatus,
    resetStatus,
    resetCircuitBreaker
  } = usePublications();

  const operationsInProgress = useRef<Set<string>>(new Set());

  const executeOperation = useCallback(
    async (operation: string, action: () => Promise<void>): Promise<void> => {
      if (operationsInProgress.current.has(operation)) {
        return;
      }

      operationsInProgress.current.add(operation);
      try {
        await action();
      } finally {
        operationsInProgress.current.delete(operation);
      }
    },
    []
  );

  const handleInitialLoad = useCallback(
    async (force = false) => {
      await executeOperation('initialLoad', () =>
        loadStatus(selectedStatus, { forceRefresh: force })
      );
    },
    [executeOperation, loadStatus, selectedStatus]
  );

  const handleLoadMore = useCallback(async () => {
    await executeOperation('loadMore', () => loadMoreStatus(selectedStatus));
  }, [executeOperation, loadMoreStatus, selectedStatus]);

  const handleRefresh = useCallback(async () => {
    await executeOperation('refresh', () => refreshStatus(selectedStatus));
  }, [executeOperation, refreshStatus, selectedStatus]);

  const handleRetry = useCallback(async () => {
    resetStatus(selectedStatus);
    await handleInitialLoad(true);
  }, [handleInitialLoad, resetStatus, selectedStatus]);

  const handleForceRetry = useCallback(async () => {
    resetStatus(selectedStatus);
    resetCircuitBreaker();
    await handleInitialLoad(true);
  }, [handleInitialLoad, resetStatus, resetCircuitBreaker, selectedStatus]);

  useEffect(() => {
    const operations = operationsInProgress.current;
    return () => {
      operations.clear();
    };
  }, [selectedStatus]);

  return {
    handleInitialLoad,
    handleLoadMore,
    handleRefresh,
    handleRetry,
    handleForceRetry
  };
};

const useScrollOptimization = (
  selectedStatus: PublicationStatus,
  canLoadMore: boolean,
  isLoadingMore: boolean,
  onLoadMore: () => void,
  onHeaderVisibilityChange?: (visible: boolean) => void
) => {
  const lastScrollY = useRef(0);
  const scrollDirectionRef = useRef<'up' | 'down'>('down');
  const loadMoreTriggeredRef = useRef(false);
  const lastLoadMoreTimeRef = useRef(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const currentY = contentOffset.y;

      const scrollDelta = currentY - lastScrollY.current;
      if (Math.abs(scrollDelta) > 5) {
        const newDirection = scrollDelta > 0 ? 'down' : 'up';
        if (newDirection !== scrollDirectionRef.current) {
          scrollDirectionRef.current = newDirection;
          if (newDirection === 'down' && currentY > 50) {
            onHeaderVisibilityChange?.(false);
          }
        }
      }

      const distanceFromEnd =
        contentSize.height - layoutMeasurement.height - currentY;

      const isNearEnd = distanceFromEnd < layoutMeasurement.height * 0.5;
      const canTriggerLoadMore =
        canLoadMore &&
        !isLoadingMore &&
        !loadMoreTriggeredRef.current &&
        Date.now() - lastLoadMoreTimeRef.current > 1000;

      if (isNearEnd && canTriggerLoadMore) {
        loadMoreTriggeredRef.current = true;
        lastLoadMoreTimeRef.current = Date.now();
        onLoadMore();

        setTimeout(() => {
          loadMoreTriggeredRef.current = false;
        }, 2000);
      }

      lastScrollY.current = currentY;
    },
    [canLoadMore, isLoadingMore, onLoadMore, onHeaderVisibilityChange]
  );

  useEffect(() => {
    loadMoreTriggeredRef.current = false;
    lastLoadMoreTimeRef.current = 0;
  }, [selectedStatus]);

  return { handleScroll };
};

const SearchBar: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  resultsCount?: number;
  totalCount?: number;
}> = React.memo(
  ({
    value,
    onChangeText,
    onClear,
    isFocused,
    onFocus,
    onBlur,
    resultsCount,
    totalCount
  }) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createPublicationScreenStyles(theme), [theme]);
    const [inputValue, setInputValue] = useState(value);

    const handleChange = (text: string) => {
      setInputValue(text);
      onChangeText(text);
    };

    const handleClear = () => {
      setInputValue('');
      onClear();
    };

    return (
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            isFocused && styles.searchInputFocused
          ]}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar publicaciones..."
            placeholderTextColor={theme.colors.placeholder}
            value={inputValue}
            onChangeText={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {inputValue.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {inputValue.length > 0 &&
          resultsCount !== undefined &&
          totalCount !== undefined && (
            <View style={styles.searchResultsCount}>
              <Text style={styles.searchResultsText}>
                Mostrando{' '}
                <Text style={styles.searchResultsHighlight}>
                  {resultsCount}
                </Text>{' '}
                de {totalCount} publicaciones
              </Text>
              {resultsCount === 0 && (
                <TouchableOpacity
                  style={styles.clearSearchButton}
                  onPress={handleClear}
                >
                  <Text style={styles.clearSearchText}>Limpiar búsqueda</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
      </View>
    );
  }
);

const StatusTabs: React.FC<{
  selectedStatus: PublicationStatus;
  onStatusChange: (status: PublicationStatus) => void;
  statusStats: {
    total: number;
    loaded: number;
    isLoading: boolean;
    hasError: boolean;
    hasTemporaryError: boolean;
    isCircuitBreakerOpen: boolean;
  };
}> = React.memo(({ selectedStatus, onStatusChange, statusStats }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createPublicationScreenStyles(theme), [theme]);

  const animatedValues = useRef<
    Map<
      string,
      {
        scale: Animated.Value;
        opacity: Animated.Value;
      }
    >
  >(new Map());

  const statusOptions = useMemo(
    () => [
      {
        label: 'Pendientes',
        value: PublicationStatus.PENDING,
        color: theme.colors.warning,
        gradient: [theme.colors.warning, theme.colors.secondaryDark]
      },
      {
        label: 'Aceptadas',
        value: PublicationStatus.ACCEPTED,
        color: theme.colors.success,
        gradient: [theme.colors.success, theme.colors.primaryDark]
      },
      {
        label: 'Rechazadas',
        value: PublicationStatus.REJECTED,
        color: theme.colors.error,
        gradient: [theme.colors.error, '#C62828']
      }
    ],
    [theme]
  );

  const filteredOptions = useMemo(
    () =>
      user?.role === 'Admin'
        ? statusOptions.filter(
            option => option.value !== PublicationStatus.PENDING
          )
        : statusOptions,
    [user?.role, statusOptions]
  );

  const getAnimatedValue = useCallback(
    (key: string) => {
      if (!animatedValues.current.has(key)) {
        animatedValues.current.set(key, {
          scale: new Animated.Value(selectedStatus === key ? 1 : 0.95),
          opacity: new Animated.Value(selectedStatus === key ? 1 : 0.7)
        });
      }
      return animatedValues.current.get(key)!;
    },
    [selectedStatus]
  );

  useEffect(() => {
    filteredOptions.forEach(option => {
      const anim = getAnimatedValue(option.value);
      Animated.parallel([
        Animated.spring(anim.scale, {
          toValue: selectedStatus === option.value ? 1 : 0.95,
          ...CONFIG.ANIMATION.SPRING_CONFIG,
          useNativeDriver: true
        }),
        Animated.timing(anim.opacity, {
          toValue: selectedStatus === option.value ? 1 : 0.7,
          duration: CONFIG.ANIMATION.DURATION,
          useNativeDriver: true
        })
      ]).start();
    });
  }, [selectedStatus, filteredOptions, getAnimatedValue]);

  return (
    <View style={styles.tabsContainer}>
      {filteredOptions.map(option => {
        const isSelected = selectedStatus === option.value;
        const showStats =
          isSelected && (statusStats.total > 0 || statusStats.hasError);
        const animValue = getAnimatedValue(option.value);

        return (
          <Animated.View
            key={option.value}
            style={[
              styles.tabWrapper,
              {
                transform: [{ scale: animValue.scale }],
                opacity: animValue.opacity
              }
            ]}
          >
            <TouchableOpacity
              onPress={() => onStatusChange(option.value)}
              style={[
                styles.tab,
                isSelected && [
                  styles.tabActive,
                  { backgroundColor: option.color }
                ],
                statusStats.hasError && isSelected && styles.tabError
              ]}
              disabled={statusStats.isLoading}
              activeOpacity={0.8}
            >
              <View style={styles.tabContent}>
                <Text
                  style={[styles.tabLabel, isSelected && styles.tabLabelActive]}
                >
                  {option.label}
                </Text>
                {showStats && (
                  <View
                    style={[
                      styles.tabBadge,
                      isSelected && styles.tabBadgeActive
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabBadgeText,
                        isSelected && styles.tabBadgeTextActive
                      ]}
                    >
                      {statusStats.hasError
                        ? '!'
                        : `${statusStats.loaded}/${statusStats.total}`}
                    </Text>
                  </View>
                )}
              </View>
              {statusStats.isLoading && isSelected && (
                <View style={styles.tabLoadingIndicator}>
                  <ActivityIndicator
                    size="small"
                    color={isSelected ? '#FFFFFF' : option.color}
                  />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
});

const PublicationScreen: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigationActions();
  const styles = useMemo(
    () => createPublicationScreenStyles(theme.theme),
    [theme]
  );

  const [selectedStatus, setSelectedStatus] = useState<PublicationStatus>(
    user?.role === 'Admin'
      ? PublicationStatus.ACCEPTED
      : PublicationStatus.PENDING
  );

  const publicationData = usePublicationData(selectedStatus);
  const search = useSearch(publicationData.publications);
  const operations = usePublicationOperations(selectedStatus);

  const [filteredAndSorted, setFilteredAndSorted] = useState<
    PublicationModelResponse[]
  >([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    sortBy: 'date-desc',
    filterByState: 'all'
  });

  const finalPublications = useMemo(() => {
    if (search.searchQuery.trim()) {
      return search.filteredPublications;
    }

    if (filteredAndSorted.length > 0) {
      return filteredAndSorted;
    }

    return publicationData.filteredPublications;
  }, [
    search.filteredPublications,
    filteredAndSorted,
    search.searchQuery,
    publicationData.filteredPublications
  ]);

  const handleFilterChange = useCallback(
    (filtered: PublicationModelResponse[], options: FilterOptions) => {
      setFilteredAndSorted(filtered);
      setFilterOptions(options);
    },
    []
  );

  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const headerTranslateY = useRef(new Animated.Value(-300)).current;

  const handleHeaderVisibilityChange = useCallback(
    (visible: boolean) => {
      setIsHeaderVisible(visible);
      Animated.timing(headerTranslateY, {
        toValue: visible ? 0 : -300,
        duration: 300,
        useNativeDriver: true
      }).start();
    },
    [headerTranslateY]
  );

  const errorState = useErrorState(
    publicationData.publications,
    publicationData.circuitBreaker,
    publicationData.error
  );

  const { handleScroll } = useScrollOptimization(
    selectedStatus,
    publicationData.canLoadMore,
    publicationData.isLoadingMore,
    operations.handleLoadMore,
    handleHeaderVisibilityChange
  );

  const listRef = useRef<FlatList<PublicationModelResponse>>(null);
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shouldAutoLoad =
      publicationData.publications.length === 0 &&
      !publicationData.isLoading &&
      !publicationData.error &&
      publicationData.lastUpdated === null;

    if (shouldAutoLoad) {
      console.log(`[PublicationScreen] Auto-loading ${selectedStatus}`);
      operations.handleInitialLoad(true);
    }
  }, [
    selectedStatus,
    publicationData.publications.length,
    publicationData.isLoading,
    publicationData.error,
    publicationData.lastUpdated,
    operations
  ]);

  useEffect(() => {
    Animated.timing(bannerAnim, {
      toValue: errorState.showDelayedError ? 1 : 0,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [errorState.showDelayedError, bannerAnim]);

  useEffect(() => {
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true
    }).start();
  }, [selectedStatus, contentAnim]);

  const handleStatusChange = useCallback(
    async (status: PublicationStatus) => {
      if (status === selectedStatus) return;

      contentAnim.setValue(0);
      setSelectedStatus(status);
      search.clearSearch();
      setFilteredAndSorted([]);
      setFilterOptions({
        sortBy: 'date-desc',
        filterByState: 'all'
      });
      listRef.current?.scrollToOffset({ offset: 0, animated: false });

      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }).start();
    },
    [selectedStatus, contentAnim, search]
  );

  const renderItem = useCallback(
    ({ item }: { item: PublicationModelResponse }) => (
      <PublicationCard
        publication={item}
        status={selectedStatus}
        viewMode="card"
        onPress={() =>
          navigate('PublicationDetails', {
            publication: item,
            status: selectedStatus
          })
        }
      />
    ),
    [selectedStatus, navigate]
  );

  const renderFooter = useCallback(() => {
    if (publicationData.isLoadingMore) {
      return (
        <View style={styles.listFooter}>
          <View style={styles.footerLoadingContainer}>
            <ActivityIndicator
              size="small"
              color={theme.theme.colors.primary}
            />
            <Text style={styles.footerLoadingText}>
              Cargando más publicaciones...
            </Text>
          </View>
        </View>
      );
    }

    if (errorState.isPersistentError) {
      return (
        <View style={styles.listFooter}>
          <View style={styles.footerErrorContainer}>
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>
            <Text style={styles.footerErrorText}>
              {publicationData.error || 'Error al cargar publicaciones'}
            </Text>
            <TouchableOpacity
              onPress={operations.handleRetry}
              style={styles.retryButton}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (!publicationData.canLoadMore && finalPublications.length > 0) {
      return (
        <View style={styles.listFooter}>
          <View style={styles.footerEndContainer}>
            <View style={styles.endDivider} />
            <Text style={styles.footerEndText}>
              Has visto todas las publicaciones
            </Text>
            <View style={styles.endDivider} />
          </View>
        </View>
      );
    }

    return null;
  }, [
    publicationData.isLoadingMore,
    publicationData.canLoadMore,
    finalPublications.length,
    publicationData.error,
    errorState.isPersistentError,
    theme,
    operations.handleRetry,
    styles
  ]);

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyStateContainer}>
        {errorState.showDelayedError ? (
          <View style={styles.emptyStateContent}>
            <View style={styles.emptyStateIconContainer}>
              <ActivityIndicator
                size="large"
                color={theme.theme.colors.primary}
              />
            </View>
            <Text style={styles.emptyStateTitle}>
              Conectando con el servidor
            </Text>
            <Text style={styles.emptyStateDescription}>
              Por favor espera mientras establecemos la conexión
            </Text>
          </View>
        ) : search.searchQuery.trim() ||
          filterOptions.filterByState !== 'all' ||
          filterOptions.sortBy !== 'date-desc' ? (
          <View style={styles.emptyStateContent}>
            <View style={styles.emptyStateIconContainer}>
              <Text style={styles.emptyStateIcon}>🔍</Text>
            </View>
            <Text style={styles.emptyStateTitle}>
              No se encontraron resultados
            </Text>
            <Text style={styles.emptyStateDescription}>
              {search.searchQuery.trim()
                ? `No hay publicaciones que coincidan con "${search.searchQuery}"`
                : 'No hay publicaciones con los filtros seleccionados'}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyStateContent}>
            <View style={styles.emptyStateIconContainer}>
              <Text style={styles.emptyStateIcon}>
                {publicationData.isLoading ? '⏳' : '📭'}
              </Text>
            </View>
            <Text style={styles.emptyStateTitle}>
              {publicationData.isLoading
                ? 'Cargando publicaciones'
                : 'No hay publicaciones'}
            </Text>
            <Text style={styles.emptyStateDescription}>
              {publicationData.isLoading
                ? 'Obteniendo los datos más recientes'
                : 'No hay publicaciones disponibles en esta clase de animal'}
            </Text>
          </View>
        )}
      </View>
    ),
    [
      errorState.showDelayedError,
      publicationData.isLoading,
      search.searchQuery,
      filterOptions,
      theme,
      styles
    ]
  );

  const renderSkeletons = useCallback(
    () => (
      <View style={styles.skeletonContainer}>
        {Array.from({ length: CONFIG.UI.SKELETON_COUNT }).map((_, index) => (
          <PublicationSkeleton
            key={index}
            viewMode="card"
            style={styles.skeletonItem}
          />
        ))}
      </View>
    ),
    [styles]
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ACTUAL_ITEM_HEIGHT,
      offset: ACTUAL_ITEM_HEIGHT * index,
      index
    }),
    []
  );

  const keyExtractor = useCallback(
    (item: PublicationModelResponse) => {
      return `pub-${item.recordId}-${selectedStatus}`;
    },
    [selectedStatus]
  );

  const flatListOptimizations = useMemo(
    () => ({
      removeClippedSubviews: true,
      maxToRenderPerBatch: CONFIG.PERFORMANCE.MAX_RENDER_BATCH,
      windowSize: CONFIG.PERFORMANCE.WINDOW_SIZE,
      initialNumToRender: CONFIG.UI.INITIAL_RENDER_COUNT,
      updateCellsBatchingPeriod: CONFIG.PERFORMANCE.UPDATE_BATCHING_PERIOD,
      maintainVisibleContentPosition: {
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10
      },
      extraData: `${selectedStatus}-${finalPublications.length}-${publicationData.isLoadingMore}`
    }),
    [selectedStatus, finalPublications.length, publicationData.isLoadingMore]
  );

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            transform: [{ translateY: headerTranslateY }],
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000
          }
        ]}
      >
        <TouchableOpacity
          style={styles.collapseHeaderButton}
          onPress={() => handleHeaderVisibilityChange(false)}
          activeOpacity={0.7}
        >
          <Text style={styles.collapseHeaderIcon}>▲</Text>
          <Text style={styles.collapseHeaderText}>Ocultar</Text>
        </TouchableOpacity>

        {errorState.showDelayedError && (
          <Animated.View
            style={[
              styles.connectionBanner,
              {
                opacity: bannerAnim,
                transform: [
                  {
                    translateY: bannerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.connectionBannerContent}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.connectionBannerText}>
                Reconectando con el servidor...
              </Text>
            </View>
          </Animated.View>
        )}

        <SearchBar
          value={search.searchQuery}
          onChangeText={search.handleSearchChange}
          onClear={search.clearSearch}
          isFocused={search.isFocused}
          onFocus={() => search.setIsFocused(true)}
          onBlur={() => search.setIsFocused(false)}
          resultsCount={search.filteredPublications.length}
          totalCount={publicationData.publications.length}
        />

        <PublicationFilters
          publications={search.filteredPublications}
          onFilterChange={handleFilterChange}
          theme={theme}
          isVisible={isHeaderVisible}
        />

        <StatusTabs
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          statusStats={{
            total: publicationData.totalCount,
            loaded: publicationData.publications.length,
            isLoading: publicationData.isLoading,
            hasError: errorState.isPersistentError,
            hasTemporaryError: errorState.showDelayedError,
            isCircuitBreakerOpen: errorState.isCircuitBreakerOpen
          }}
        />
      </Animated.View>

      {!isHeaderVisible && (
        <TouchableOpacity
          style={[styles.floatingHeaderButton, { top: insets.top + 12 }]}
          onPress={() => handleHeaderVisibilityChange(true)}
          activeOpacity={0.9}
        >
          <Text style={styles.floatingHeaderButtonIcon}>▼</Text>
          <Text style={styles.floatingHeaderButtonText}>Mostrar filtros</Text>
        </TouchableOpacity>
      )}

      <Animated.View
        style={[
          styles.contentContainer,
          {
            paddingTop: insets.top + 12,
            opacity: contentAnim,
            transform: [
              {
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }
            ]
          }
        ]}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.titleMain} accessibilityRole="header">
            Publicaciones
          </Text>
          <Text style={styles.titleStatus}>
            {selectedStatus.toLowerCase() === 'pending'
              ? 'Pendientes de revisión'
              : selectedStatus.toLowerCase() === 'accepted'
                ? 'Aceptadas'
                : 'Rechazadas'}
            {'  👉'}
          </Text>
        </View>
        <FlatList
          ref={listRef}
          data={finalPublications}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          {...flatListOptimizations}
          contentContainerStyle={[
            styles.listContent,
            finalPublications.length === 0 &&
              !publicationData.isLoading &&
              styles.listContentEmpty
          ]}
          refreshControl={
            <RefreshControl
              refreshing={publicationData.isRefreshing}
              onRefresh={operations.handleRefresh}
              colors={[theme.theme.colors.primary]}
              tintColor={theme.theme.colors.primary}
              title="Actualizando..."
              titleColor={theme.theme.colors.textSecondary}
            />
          }
          onEndReached={operations.handleLoadMore}
          onEndReachedThreshold={CONFIG.SCROLL.END_REACHED_THRESHOLD}
          ListEmptyComponent={
            publicationData.isLoading ? renderSkeletons : renderEmpty
          }
          ListFooterComponent={renderFooter}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={true}
          legacyImplementation={false}
        />
      </Animated.View>
    </View>
  );
};

export default PublicationScreen;
