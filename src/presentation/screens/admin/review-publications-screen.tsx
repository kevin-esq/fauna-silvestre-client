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
import { useTheme } from '@/presentation/contexts/theme.context';
import { PublicationModelResponse } from '@/domain/models/publication.models';
import { usePublications } from '@/presentation/contexts/publication.context';
import { usePublicationViewPreferences } from '@/presentation/contexts/publication-view-preferences.context';

import { ITEM_HEIGHT } from '@/presentation/components/publication/publication-card.component';
import { PublicationCardWithActions } from '@/presentation/components/publication/publication-card-with-actions.component';
import { PublicationViewSelector } from '@/presentation/components/publication/publication-view-selector.component';
import PublicationSkeleton from '@/presentation/components/ui/publication-skeleton.component';
import SearchBar from '@/presentation/components/ui/search-bar.component';
import { createReviewStyles } from '@/presentation/screens/admin/review-publications-screen.styles';
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
  const [inputValue, setInputValue] = useState('');
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
    setInputValue(text);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(text);
    }, 300);
  }, []);

  const clearSearch = useCallback(() => {
    setInputValue('');
    setSearchQuery('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    inputValue,
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
    async (publicationId: string, reason?: string) => {
      await executeOperation('reject', () =>
        rejectPublication(publicationId, PublicationStatus.PENDING, reason)
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
  const { navigate } = useNavigationActions();

  const { getStatusData } = usePublications();
  const publicationLoader = usePublicationLoader();
  const operations = usePublicationOperations();

  const listRef = useRef<FlatList<PublicationModelResponse>>(null);
  const contentAnim = useRef(new Animated.Value(0)).current;

  const pendingData = getStatusData(PublicationStatus.PENDING);
  const publications = pendingData.publications;
  const filteredPublications = pendingData.filteredPublications;
  const isLoading = pendingData.isLoading;
  const isLoadingMore = pendingData.isLoadingMore;
  const isRefreshing = pendingData.isRefreshing;
  const isEmpty = pendingData.isEmpty;
  const error = pendingData.error;

  const search = useSearch(publications);

  const finalPublications = useMemo(() => {
    if (search.searchQuery.trim()) {
      return search.filteredPublications;
    }

    return filteredPublications;
  }, [search.filteredPublications, search.searchQuery, filteredPublications]);

  const { handleScroll } = useScrollOptimization(
    operations.canLoadMore,
    isLoadingMore,
    operations.handleLoadMore
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

  const viewPrefs = usePublicationViewPreferences();

  const renderPublicationItem = useCallback(
    ({ item }: { item: PublicationModelResponse }) => {
      const publication = {
        ...item,
        status: PublicationStatus.PENDING,
        createdDate: item.createdDate
      };

      return (
        <PublicationCardWithActions
          publication={publication}
          onPress={() => handlePress(item)}
          reviewActions={{
            onApprove: () => operations.handleApprove(item.recordId.toString()),
            onReject: (reason?: string) =>
              operations.handleReject(item.recordId.toString(), reason)
          }}
          layout={viewPrefs.layout}
          density={viewPrefs.density}
          showImages={viewPrefs.showImages}
          highlightStatus={viewPrefs.highlightStatus}
          showCreatedDate={viewPrefs.showCreatedDate}
          showAcceptedDate={viewPrefs.showAcceptedDate}
          showAnimalState={viewPrefs.showAnimalState}
          showLocation={viewPrefs.showLocation}
          showRejectReason={viewPrefs.showRejectReason}
          reducedMotion={viewPrefs.reducedMotion}
        />
      );
    },
    [operations, handlePress, viewPrefs]
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
              {search.searchQuery.trim() ? '🔍' : isEmpty ? '✅' : '📊'}
            </Text>
          </View>
          <Text style={styles.emptyStateTitle}>
            {search.searchQuery.trim()
              ? 'No se encontraron resultados'
              : isEmpty
                ? '¡Todo revisado!'
                : 'No hay datos disponibles'}
          </Text>
          <Text style={styles.emptyStateDescription}>
            {search.searchQuery.trim()
              ? `No hay publicaciones pendientes que coincidan con "${search.searchQuery}"`
              : isEmpty
                ? 'No hay publicaciones pendientes por revisar en este momento'
                : 'Los datos se cargarán pronto'}
          </Text>
        </View>
      </View>
    );
  }, [
    isLoading,
    publications.length,
    isEmpty,
    search.searchQuery,
    styles,
    renderSkeletons
  ]);

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
      <View style={styles.header}>
        <View style={styles.compactHeader}>
          <View style={styles.searchRow}>
            <View style={{ flex: 1 }}>
              <SearchBar
                value={search.inputValue}
                onChangeText={search.handleSearchChange}
                onClear={search.clearSearch}
                placeholder="Buscar..."
                theme={theme}
              />
            </View>
            <View style={{ marginLeft: 8 }}>
              <PublicationViewSelector minimal currentStatus="pending" />
            </View>
          </View>
        </View>
      </View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
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
          key={viewPrefs.layout}
          numColumns={viewPrefs.layout === 'grid' ? 2 : 1}
          columnWrapperStyle={
            viewPrefs.layout === 'grid'
              ? { justifyContent: 'space-between', paddingHorizontal: 16 }
              : undefined
          }
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
