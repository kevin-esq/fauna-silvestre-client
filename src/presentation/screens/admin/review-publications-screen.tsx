import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef
} from 'react';
import {
  View,
  FlatList,
  Text,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { useTheme } from '../../contexts/theme.context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PublicationModelResponse } from '../../../domain/models/publication.models';
import { usePublications } from '../../contexts/publication.context';

import PublicationCard, {
  ITEM_HEIGHT
} from '../../components/publication/publication-card.component';
import PublicationSkeleton from '../../components/ui/publication-skeleton.component';
import SearchBar from '../../components/ui/search-bar.component';
import PublicationFilters, {
  FilterOptions
} from '../../components/publication/publication-filters.component';
import { createReviewStyles } from './review-publications-screen.styles';
import { PublicationStatus } from '@/services/publication/publication.service';
import { useNavigationActions } from '@/presentation/navigation/navigation-provider';

const CONFIG = {
  SCROLL: {
    DEBOUNCE_TIME: 300,
    END_REACHED_THRESHOLD: 0.8,
    PADDING_TO_BOTTOM: 20,
    FAST_THRESHOLD: 2
  },
  UI: {
    SKELETON_COUNT: 5,
    INITIAL_RENDER_COUNT: 10
  },
  PERFORMANCE: {
    MAX_RENDER_BATCH: 10,
    WINDOW_SIZE: 5,
    UPDATE_BATCHING_PERIOD: 50
  },
  LOADING: {
    INITIAL_LOAD_DELAY: 100,
    RETRY_DELAY: 2000
  },
  ANIMATION: {
    DURATION: 400
  }
} as const;

const CARD_MARGIN = 16;
const ACTUAL_ITEM_HEIGHT = ITEM_HEIGHT + CARD_MARGIN;

const usePublicationLoader = () => {
  const { loadStatus, getStatusData } = usePublications();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const loadAttemptRef = useRef(0);
  const lastLoadTimeRef = useRef<number>(0);

  const statusData = getStatusData(PublicationStatus.PENDING);

  const shouldLoadData = useCallback((): boolean => {
    const now = Date.now();

    if (now - lastLoadTimeRef.current < 1000) {
      return false;
    }

    if (statusData.publications.length > 0 && !statusData.error) {
      return false;
    }

    if (statusData.isLoading || statusData.isRefreshing) {
      return false;
    }

    if (statusData.error && loadAttemptRef.current >= 3) {
      return false;
    }

    return true;
  }, [statusData]);

  const loadData = useCallback(
    async (force = false): Promise<void> => {
      if (!force && !shouldLoadData()) {
        return;
      }

      const now = Date.now();
      lastLoadTimeRef.current = now;
      loadAttemptRef.current += 1;

      try {
        await loadStatus(PublicationStatus.PENDING, {
          forceRefresh: force,
          searchQuery: ''
        });

        loadAttemptRef.current = 0;
      } catch (error) {
        console.warn('[ReviewLoader] Error loading publications:', error);
      } finally {
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
    },
    [loadStatus, shouldLoadData, isInitialLoad]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInitialLoad) {
        loadData(true);
      }
    }, CONFIG.LOADING.INITIAL_LOAD_DELAY);

    return () => clearTimeout(timer);
  }, [isInitialLoad, loadData]);

  return {
    loadData,
    isInitialLoad,
    loadAttempts: loadAttemptRef.current
  };
};

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
    }, 300);
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

const usePublicationOperations = () => {
  const {
    loadMoreStatus,
    refreshStatus,
    acceptPublication,
    rejectPublication,
    canLoadMore
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

  const handleLoadMore = useCallback(async () => {
    await executeOperation('loadMore', () =>
      loadMoreStatus(PublicationStatus.PENDING)
    );
  }, [executeOperation, loadMoreStatus]);

  const handleRefresh = useCallback(async () => {
    await executeOperation('refresh', () =>
      refreshStatus(PublicationStatus.PENDING)
    );
  }, [executeOperation, refreshStatus]);

  const handleApprove = useCallback(
    async (publicationId: string) => {
      await executeOperation('approve', () =>
        acceptPublication(publicationId, PublicationStatus.PENDING)
      );
    },
    [executeOperation, acceptPublication]
  );

  const handleReject = useCallback(
    async (publicationId: string) => {
      await executeOperation('reject', () =>
        rejectPublication(publicationId, PublicationStatus.PENDING)
      );
    },
    [executeOperation, rejectPublication]
  );

  useEffect(() => {
    const operationsInProgressCopy = operationsInProgress.current;

    return () => {
      operationsInProgressCopy?.clear();
    };
  }, []);

  return {
    handleLoadMore,
    handleRefresh,
    handleApprove,
    handleReject,
    canLoadMore: canLoadMore(PublicationStatus.PENDING)
  };
};

const useScrollOptimization = (
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

  return { handleScroll };
};

const ReviewPublicationsScreen: React.FC = () => {
  const ThemeContext = useTheme();
  const { theme } = ThemeContext;
  const styles = useMemo(() => createReviewStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigationActions();

  const { getStatusData, getTotalCount } = usePublications();
  const publicationLoader = usePublicationLoader();
  const operations = usePublicationOperations();

  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [filteredAndSorted, setFilteredAndSorted] = useState<
    PublicationModelResponse[]
  >([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    sortBy: 'date-desc',
    filterByState: 'all'
  });

  const listRef = useRef<FlatList<PublicationModelResponse>>(null);
  const contentAnim = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-300)).current;

  const pendingData = getStatusData(PublicationStatus.PENDING);
  const publications = pendingData.publications;
  const filteredPublications = pendingData.filteredPublications;
  const isLoading = pendingData.isLoading;
  const isLoadingMore = pendingData.isLoadingMore;
  const isRefreshing = pendingData.isRefreshing;
  const isEmpty = pendingData.isEmpty;
  const error = pendingData.error;
  const totalCount = getTotalCount(PublicationStatus.PENDING);

  const search = useSearch(publications);

  const finalPublications = useMemo(() => {
    if (search.searchQuery.trim()) {
      return search.filteredPublications;
    }

    if (filteredAndSorted.length > 0) {
      return filteredAndSorted;
    }

    return filteredPublications;
  }, [
    search.filteredPublications,
    filteredAndSorted,
    search.searchQuery,
    filteredPublications
  ]);

  const handleFilterChange = useCallback(
    (filtered: PublicationModelResponse[], options: FilterOptions) => {
      setFilteredAndSorted(filtered);
      setFilterOptions(options);
    },
    []
  );

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

  const { handleScroll } = useScrollOptimization(
    operations.canLoadMore,
    isLoadingMore,
    operations.handleLoadMore,
    handleHeaderVisibilityChange
  );

  useEffect(() => {
    const shouldAutoLoad =
      publications.length === 0 &&
      !isLoading &&
      !error &&
      !pendingData.lastUpdated;

    if (shouldAutoLoad) {
      console.log('[ReviewScreen] Auto-loading publications');
      publicationLoader.loadData(true);
    }
  }, [
    publications.length,
    isLoading,
    error,
    pendingData.lastUpdated,
    publicationLoader
  ]);

  useEffect(() => {
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: CONFIG.ANIMATION.DURATION,
      useNativeDriver: true
    }).start();
  }, [contentAnim]);

  const handlePress = useCallback(
    (item: PublicationModelResponse) => {
      navigate('PublicationDetails', {
        publication: item,
        status: PublicationStatus.PENDING
      });
    },
    [navigate]
  );

  const handleRetry = useCallback(() => {
    console.log('[ReviewScreen] Reintentando carga...');
    publicationLoader.loadData(true);
  }, [publicationLoader]);

  const renderPublicationItem = useCallback(
    ({ item }: { item: PublicationModelResponse }) => (
      <PublicationCard
        publication={item}
        status={PublicationStatus.PENDING}
        reviewActions={{
          onApprove: () => operations.handleApprove(item.recordId.toString()),
          onReject: () => operations.handleReject(item.recordId.toString())
        }}
        onPress={() => handlePress(item)}
        viewMode="presentation"
      />
    ),
    [operations, handlePress]
  );

  const renderSkeletons = useCallback(
    () => (
      <View style={styles.skeletonContainer}>
        {Array.from({ length: CONFIG.UI.SKELETON_COUNT }).map((_, index) => (
          <PublicationSkeleton
            key={`skeleton-${index}`}
            viewMode="card"
            style={styles.skeletonItem}
          />
        ))}
      </View>
    ),
    [styles]
  );

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.listFooter}>
          <View style={styles.footerLoadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.footerLoadingText}>
              Cargando más publicaciones...
            </Text>
          </View>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.listFooter}>
          <View style={styles.footerErrorContainer}>
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>
            <Text style={styles.footerErrorText}>{error}</Text>
            <TouchableOpacity
              onPress={handleRetry}
              style={styles.retryButton}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (!operations.canLoadMore && finalPublications.length > 0) {
      return (
        <View style={styles.listFooter}>
          <View style={styles.footerEndContainer}>
            <View style={styles.endDivider} />
            <Text style={styles.footerEndText}>
              Has revisado todas las publicaciones
            </Text>
            <View style={styles.endDivider} />
          </View>
        </View>
      );
    }

    return null;
  }, [
    isLoadingMore,
    error,
    operations.canLoadMore,
    finalPublications.length,
    theme,
    handleRetry,
    styles
  ]);

  const renderEmpty = useCallback(() => {
    if (isLoading && publications.length === 0) {
      return renderSkeletons();
    }

    return (
      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyStateContent}>
          <View style={styles.emptyStateIconContainer}>
            <Text style={styles.emptyStateIcon}>
              {search.searchQuery.trim() ||
              filterOptions.filterByState !== 'all'
                ? '🔍'
                : isEmpty
                  ? '✅'
                  : '📭'}
            </Text>
          </View>
          <Text style={styles.emptyStateTitle}>
            {search.searchQuery.trim() || filterOptions.filterByState !== 'all'
              ? 'No se encontraron resultados'
              : isEmpty
                ? '¡Todo revisado!'
                : 'No hay publicaciones'}
          </Text>
          <Text style={styles.emptyStateDescription}>
            {search.searchQuery.trim()
              ? `No hay publicaciones pendientes que coincidan con "${search.searchQuery}"`
              : filterOptions.filterByState !== 'all'
                ? 'No hay publicaciones con los filtros seleccionados'
                : isEmpty
                  ? 'No hay publicaciones pendientes por revisar en este momento'
                  : 'Las publicaciones pendientes aparecerán aquí'}
          </Text>
        </View>
      </View>
    );
  }, [
    isLoading,
    publications.length,
    isEmpty,
    search.searchQuery,
    filterOptions,
    styles,
    renderSkeletons
  ]);

  const renderStats = useCallback(() => {
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalCount}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{publications.length}</Text>
          <Text style={styles.statLabel}>Cargadas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{finalPublications.length}</Text>
          <Text style={styles.statLabel}>Mostradas</Text>
        </View>
      </View>
    );
  }, [totalCount, publications.length, finalPublications.length, styles]);

  const keyExtractor = useCallback((item: PublicationModelResponse) => {
    return `review-pub-${item.recordId}`;
  }, []);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ACTUAL_ITEM_HEIGHT,
      offset: ACTUAL_ITEM_HEIGHT * index,
      index
    }),
    []
  );

  const flatListOptimizations = useMemo(
    () => ({
      removeClippedSubviews: true,
      initialNumToRender: CONFIG.UI.INITIAL_RENDER_COUNT,
      maxToRenderPerBatch: CONFIG.PERFORMANCE.MAX_RENDER_BATCH,
      windowSize: CONFIG.PERFORMANCE.WINDOW_SIZE,
      updateCellsBatchingPeriod: CONFIG.PERFORMANCE.UPDATE_BATCHING_PERIOD,
      maintainVisibleContentPosition: {
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10
      },
      extraData: `${finalPublications.length}-${isLoadingMore}-${search.searchQuery}`
    }),
    [finalPublications.length, isLoadingMore, search.searchQuery]
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

        <View style={styles.searchContainer}>
          <SearchBar
            value={search.searchQuery}
            onChangeText={search.handleSearchChange}
            placeholder="Buscar publicaciones..."
            theme={theme}
            onClear={search.clearSearch}
          />
        </View>

        <PublicationFilters
          publications={search.filteredPublications}
          onFilterChange={handleFilterChange}
          theme={ThemeContext}
          isVisible={isHeaderVisible}
        />

        {renderStats()}
      </Animated.View>

      {!isHeaderVisible && (
        <TouchableOpacity
          style={[styles.floatingHeaderButton, { top: insets.top + 12 }]}
          onPress={() => handleHeaderVisibilityChange(true)}
          activeOpacity={0.9}
        >
          <View style={styles.floatingHeaderButtonInner}>
            <Text style={styles.floatingHeaderButtonIcon}>▼</Text>
            <Text style={styles.floatingHeaderButtonText}>Mostrar filtros</Text>
          </View>
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
        <FlatList
          ref={listRef}
          data={finalPublications}
          keyExtractor={keyExtractor}
          renderItem={renderPublicationItem}
          getItemLayout={getItemLayout}
          {...flatListOptimizations}
          contentContainerStyle={[
            styles.listContent,
            finalPublications.length === 0 &&
              !isLoading &&
              styles.listContentEmpty
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={operations.handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
              title="Actualizando..."
              titleColor={theme.colors.textSecondary}
            />
          }
          onEndReached={operations.handleLoadMore}
          onEndReachedThreshold={CONFIG.SCROLL.END_REACHED_THRESHOLD}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        />
      </Animated.View>
    </View>
  );
};

export default React.memo(ReviewPublicationsScreen);
