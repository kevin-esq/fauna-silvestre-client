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
  Animated
} from 'react-native';

import { useTheme } from '@/presentation/contexts/theme.context';
import { usePublications } from '@/presentation/contexts/publication.context';
import { usePublicationViewPreferences } from '@/presentation/contexts/publication-view-preferences.context';
import { ITEM_HEIGHT } from '@/presentation/components/publication/publication-card.component';
import { PublicationCardVariant } from '@/presentation/components/publication/publication-card-variants.component';
import { PublicationViewSelector } from '@/presentation/components/publication/publication-view-selector.component';
import PublicationSkeleton from '@/presentation/components/ui/publication-skeleton.component';
import SearchBar from '@/presentation/components/ui/search-bar.component';

import { PublicationModelResponse } from '@/domain/models/publication.models';
import { PublicationStatus } from '@/services/publication/publication.service';
import { useAuth } from '@/presentation/contexts/auth.context';
import { useNavigationActions } from '@/presentation/navigation/navigation-provider';
import { createPublicationScreenStyles } from '@/presentation/screens/publication/publication-screen.styles';

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
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
    }, CONFIG.SEARCH.DEBOUNCE_TIME);
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
    clearSearch
  };
};

const usePublicationData = (selectedStatus: PublicationStatus) => {
  const {  getStatusData, getTotalCount, canLoadMore } =
    usePublications();

  return useMemo(() => {
    const statusData = getStatusData(selectedStatus);

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
      lastUpdated: statusData.lastUpdated
    };
  }, [selectedStatus, getStatusData, getTotalCount, canLoadMore]);
};

const useErrorState = (
  publications: PublicationModelResponse[],
  error?: string
) => {
  const [hasHadSuccessfulLoad, setHasHadSuccessfulLoad] = useState(false);
  const [showDelayedError, setShowDelayedError] = useState(false);

  const isPersistentError = useMemo(
    () => Boolean(error && publications.length === 0),
    [error, publications.length]
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
    showDelayedError
  };
};

const usePublicationOperations = (selectedStatus: PublicationStatus) => {
  const {
    loadStatus,
    loadMoreStatus,
    refreshStatus,
    resetStatus
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
    await handleInitialLoad(true);
  }, [handleInitialLoad, resetStatus, selectedStatus]);

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
  loadMore: () => void
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
        loadMore();

        setTimeout(() => {
          loadMoreTriggeredRef.current = false;
        }, 2000);
      }

      lastScrollY.current = currentY;
    },
    [canLoadMore, isLoadingMore, loadMore]
  );

  useEffect(() => {
    loadMoreTriggeredRef.current = false;
    lastLoadMoreTimeRef.current = 0;
  }, [selectedStatus]);

  return { handleScroll };
};

const PublicationScreen: React.FC = () => {
  const { user } = useAuth();
  const themeContext = useTheme();
  const theme = themeContext.theme;
  const { navigate } = useNavigationActions();
  const styles = useMemo(() => createPublicationScreenStyles(theme), [theme]);

  const [selectedStatus, setSelectedStatus] = useState<PublicationStatus>(
    user?.role === 'Admin'
      ? PublicationStatus.ACCEPTED
      : PublicationStatus.PENDING
  );

  const publicationData = usePublicationData(selectedStatus);
  const search = useSearch(publicationData.publications);
  const operations = usePublicationOperations(selectedStatus);
  const viewPrefs = usePublicationViewPreferences();

  const finalPublications = useMemo(() => {
    let filtered = publicationData.publications;

    if (search.searchQuery.trim()) {
      filtered = search.filteredPublications;
    }

    if (viewPrefs.filterByAnimalState !== 'all') {
      filtered = filtered.filter(
        pub => pub.animalState === viewPrefs.filterByAnimalState
      );
    }

    const sorted = [...filtered];
    switch (viewPrefs.sortBy) {
      case 'date-desc':
        sorted.sort(
          (a, b) =>
            new Date(b.createdDate || 0).getTime() -
            new Date(a.createdDate || 0).getTime()
        );
        break;
      case 'date-asc':
        sorted.sort(
          (a, b) =>
            new Date(a.createdDate || 0).getTime() -
            new Date(b.createdDate || 0).getTime()
        );
        break;
      case 'accepted-desc':
        sorted.sort(
          (a, b) =>
            new Date(b.acceptedDate || 0).getTime() -
            new Date(a.acceptedDate || 0).getTime()
        );
        break;
      case 'accepted-asc':
        sorted.sort(
          (a, b) =>
            new Date(a.acceptedDate || 0).getTime() -
            new Date(b.acceptedDate || 0).getTime()
        );
        break;
      case 'species-asc':
        sorted.sort((a, b) =>
          (a.commonNoun || '').localeCompare(b.commonNoun || '')
        );
        break;
      case 'species-desc':
        sorted.sort((a, b) =>
          (b.commonNoun || '').localeCompare(a.commonNoun || '')
        );
        break;
      case 'location-asc':
        sorted.sort((a, b) =>
          (a.location || '').localeCompare(b.location || '')
        );
        break;
      case 'location-desc':
        sorted.sort((a, b) =>
          (b.location || '').localeCompare(a.location || '')
        );
        break;
    }

    return sorted;
  }, [
    search.filteredPublications,
    search.searchQuery,
    publicationData.publications,
    viewPrefs.filterByAnimalState,
    viewPrefs.sortBy
  ]);

  const errorState = useErrorState(
    publicationData.publications,
    publicationData.error
  );

  const { handleScroll } = useScrollOptimization(
    selectedStatus,
    publicationData.canLoadMore,
    publicationData.isLoadingMore,
    operations.handleLoadMore
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
    ({ item }: { item: PublicationModelResponse }) => {
      const publication = {
        ...item,
        status: selectedStatus,
        createdDate: item.createdDate
      };

      return (
        <PublicationCardVariant
          publication={publication}
          onPress={() =>
            navigate('PublicationDetails', {
              publication: item,
              status: selectedStatus
            })
          }
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
    [selectedStatus, navigate, viewPrefs]
  );

  const renderFooter = useCallback(() => {
    if (publicationData.isLoadingMore) {
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
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyStateTitle}>
              Conectando con el servidor
            </Text>
            <Text style={styles.emptyStateDescription}>
              Por favor espera mientras establecemos la conexión
            </Text>
          </View>
        ) : search.searchQuery.trim() ? (
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
              <PublicationViewSelector
                minimal
                currentStatus={
                  selectedStatus.toLowerCase() as
                    | 'pending'
                    | 'accepted'
                    | 'rejected'
                }
              />
            </View>
          </View>

          <View style={styles.statusPills}>
            {user?.role !== 'Admin' && (
              <TouchableOpacity
                style={[
                  styles.pill,
                  selectedStatus === PublicationStatus.PENDING &&
                    styles.pillActive
                ]}
                onPress={() => handleStatusChange(PublicationStatus.PENDING)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillText,
                    selectedStatus === PublicationStatus.PENDING &&
                      styles.pillTextActive
                  ]}
                >
                  Pendientes
                </Text>
                {publicationData.totalCount > 0 &&
                  selectedStatus === PublicationStatus.PENDING && (
                    <View style={styles.pillBadge}>
                      <Text style={styles.pillBadgeText}>
                        {publicationData.totalCount}
                      </Text>
                    </View>
                  )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.pill,
                selectedStatus === PublicationStatus.ACCEPTED &&
                  styles.pillActive
              ]}
              onPress={() => handleStatusChange(PublicationStatus.ACCEPTED)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedStatus === PublicationStatus.ACCEPTED &&
                    styles.pillTextActive
                ]}
              >
                Aceptadas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.pill,
                selectedStatus === PublicationStatus.REJECTED &&
                  styles.pillActive
              ]}
              onPress={() => handleStatusChange(PublicationStatus.REJECTED)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedStatus === PublicationStatus.REJECTED &&
                    styles.pillTextActive
                ]}
              >
                Rechazadas
              </Text>
            </TouchableOpacity>
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
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          key={viewPrefs.layout}
          numColumns={viewPrefs.layout === 'grid' ? 2 : 1}
          columnWrapperStyle={
            viewPrefs.layout === 'grid'
              ? { justifyContent: 'space-between', paddingHorizontal: 16 }
              : undefined
          }
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
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
              title="Actualizando..."
              titleColor={theme.colors.textSecondary}
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
