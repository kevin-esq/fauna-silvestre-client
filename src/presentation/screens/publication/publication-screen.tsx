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
  StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../contexts/theme.context';
import { usePublications } from '../../contexts/publication.context';
import PublicationCard, {
  ITEM_HEIGHT
} from '../../components/publication/publication-card.component';
import PublicationSkeleton from '../../components/ui/publication-skeleton.component';

import { PublicationModelResponse } from '../../../domain/models/publication.models';
import { PublicationStatus } from '../../../services/publication/publication.service';
import { useAuth } from '@/presentation/contexts/auth.context';
import { useNavigationActions } from '../../navigation/navigation-provider';

const CONFIG = {
  SCROLL: {
    FAST_THRESHOLD: 2,
    PREFETCH_THRESHOLD: 0.7,
    DEBOUNCE_TIME: 100,
    END_REACHED_THRESHOLD: 0.8
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
  }
} as const;

const usePublicationData = (selectedStatus: PublicationStatus) => {
  const { state, getStatusData, getTotalCount, canLoadMore } =
    usePublications();

  return useMemo(() => {
    const statusData = getStatusData(selectedStatus);
    const circuitBreaker = state.circuitBreaker;

    return {
      statusData,
      publications: statusData.filteredPublications,
      pagination: statusData.pagination,
      totalCount: getTotalCount(selectedStatus),
      canLoadMore: canLoadMore(selectedStatus),
      isLoading: statusData.isLoading,
      isLoadingMore: statusData.isLoadingMore,
      isRefreshing: statusData.isRefreshing,
      isEmpty: statusData.isEmpty,
      error: statusData.error,
      circuitBreaker
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

const useScrollOptimization = (
  selectedStatus: PublicationStatus,
  canLoadMore: boolean,
  isLoadingMore: boolean,
  onLoadMore: () => void
) => {
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const loadMoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isNearEndRef = useRef(false);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const currentY = contentOffset.y;
      const currentTime = Date.now();

      const scrollProgress =
        (currentY + layoutMeasurement.height) / contentSize.height;
      const timeDelta = currentTime - lastScrollTime.current;
      const distanceDelta = Math.abs(currentY - lastScrollY.current);
      const velocity = timeDelta > 0 ? distanceDelta / timeDelta : 0;

      const wasNearEnd = isNearEndRef.current;
      isNearEndRef.current = scrollProgress > CONFIG.SCROLL.PREFETCH_THRESHOLD;

      if (!wasNearEnd && isNearEndRef.current && canLoadMore) {
        onLoadMore();
      }

      if (
        velocity > CONFIG.SCROLL.FAST_THRESHOLD &&
        canLoadMore &&
        !isLoadingMore
      ) {
        onLoadMore();
      }

      lastScrollY.current = currentY;
      lastScrollTime.current = currentTime;
    },
    [canLoadMore, isLoadingMore, onLoadMore]
  );

  useEffect(() => {
    const timeoutRef = loadMoreTimeoutRef;
    return () => {
      const timeoutId = timeoutRef.current;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return { handleScroll };
};

const usePublicationOperations = (selectedStatus: PublicationStatus) => {
  const {
    loadStatus,
    loadMoreStatus,
    refreshStatus,
    resetStatus,
    resetCircuitBreaker
  } = usePublications();

  const loadMoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInitialLoad = useCallback(async () => {
    await loadStatus(selectedStatus, { forceRefresh: true });
  }, [loadStatus, selectedStatus]);

  const handleLoadMore = useCallback(() => {
    if (loadMoreTimeoutRef.current) return;

    const timeoutId = setTimeout(() => {
      loadMoreStatus(selectedStatus);
      loadMoreTimeoutRef.current = null;
    }, CONFIG.SCROLL.DEBOUNCE_TIME);
    loadMoreTimeoutRef.current = timeoutId;
  }, [loadMoreStatus, selectedStatus]);

  const handleRefresh = useCallback(async () => {
    await refreshStatus(selectedStatus);
  }, [refreshStatus, selectedStatus]);

  const handleRetry = useCallback(async () => {
    resetStatus(selectedStatus);
    await loadStatus(selectedStatus, { forceRefresh: true });
  }, [loadStatus, selectedStatus, resetStatus]);

  const handleForceRetry = useCallback(async () => {
    resetStatus(selectedStatus);
    resetCircuitBreaker();
    await loadStatus(selectedStatus, { forceRefresh: true });
  }, [loadStatus, selectedStatus, resetStatus, resetCircuitBreaker]);

  useEffect(() => {
    const timeoutRef = loadMoreTimeoutRef;
    return () => {
      const timeoutId = timeoutRef.current;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutRef.current = null;
      }
    };
  }, []);

  return {
    handleInitialLoad,
    handleLoadMore,
    handleRefresh,
    handleRetry,
    handleForceRetry
  };
};

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

  const statusOptions = useMemo(
    () => [
      { label: 'Pendientes', value: PublicationStatus.PENDING, icon: '⏳' },
      { label: 'Aceptadas', value: PublicationStatus.ACCEPTED, icon: '✅' },
      { label: 'Rechazadas', value: PublicationStatus.REJECTED, icon: '❌' }
    ],
    []
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

  return (
    <View style={styles.tabsContainer}>
      {filteredOptions.map(option => {
        const isSelected = selectedStatus === option.value;
        const showStats =
          isSelected && (statusStats.total > 0 || statusStats.hasError);

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onStatusChange(option.value)}
            style={[
              styles.tab,
              isSelected && [
                styles.activeTab,
                { backgroundColor: theme.colors.primary }
              ],
              statusStats.hasError && isSelected && styles.errorTab,
              statusStats.hasTemporaryError && !isSelected && styles.warningTab,
              statusStats.isCircuitBreakerOpen && styles.circuitBreakerTab
            ]}
            disabled={statusStats.isLoading}
          >
            <View style={styles.tabContent}>
              <Text
                style={[
                  styles.tabText,
                  { color: theme.colors.text },
                  isSelected && [
                    styles.activeTabText,
                    { color: theme.colors.background }
                  ],
                  statusStats.hasError && isSelected && { color: '#fff' }
                ]}
              >
                {option.icon} {option.label}
              </Text>
              {showStats && (
                <Text
                  style={[
                    styles.tabStats,
                    {
                      color: isSelected
                        ? theme.colors.background
                        : theme.colors.textSecondary
                    },
                    statusStats.hasError && isSelected && { color: '#fff' }
                  ]}
                >
                  {statusStats.hasError
                    ? 'Error persistente'
                    : statusStats.hasTemporaryError
                      ? 'Conectando...'
                      : `${statusStats.loaded}/${statusStats.total}`}
                </Text>
              )}
            </View>
            {statusStats.isLoading && isSelected && (
              <ActivityIndicator
                size="small"
                color={
                  isSelected ? theme.colors.background : theme.colors.primary
                }
                style={styles.tabLoader}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const PublicationScreen: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigationActions();

  const [selectedStatus, setSelectedStatus] = useState<PublicationStatus>(
    user?.role === 'Admin'
      ? PublicationStatus.ACCEPTED
      : PublicationStatus.PENDING
  );

  const publicationData = usePublicationData(selectedStatus);
  const errorState = useErrorState(
    publicationData.publications,
    publicationData.circuitBreaker,
    publicationData.error
  );
  const operations = usePublicationOperations(selectedStatus);
  const { handleScroll } = useScrollOptimization(
    selectedStatus,
    publicationData.canLoadMore,
    publicationData.isLoadingMore,
    operations.handleLoadMore
  );

  const listRef = useRef<FlatList<PublicationModelResponse>>(null);

  const { handleInitialLoad } = operations;

  useEffect(() => {
    const hasNoData = publicationData.statusData.publications.length === 0;
    const isNotLoading = !publicationData.statusData.isLoading;
    const isNotRefreshing = !publicationData.statusData.isRefreshing;
    const total = publicationData.statusData.pagination.total;
    const hasError = publicationData.statusData.error;

    const hasSuccessfullyLoadedEmpty =
      total === 0 && !hasError && publicationData.statusData.lastUpdated;
    if (hasSuccessfullyLoadedEmpty) {
      return;
    }

    const shouldLoad = isNotLoading && isNotRefreshing && hasNoData;

    if (shouldLoad) {
      console.log(
        `[PublicationScreen] Loading data for status: ${selectedStatus}`
      );
      handleInitialLoad();
    }
  }, [
    selectedStatus,
    publicationData.statusData.publications.length,
    publicationData.statusData.isLoading,
    publicationData.statusData.isRefreshing,
    publicationData.statusData.lastUpdated,
    handleInitialLoad
  ]);

  const handleStatusChange = useCallback(
    async (status: PublicationStatus) => {
      if (status === selectedStatus) return;

      setSelectedStatus(status);

      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    },
    [selectedStatus]
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
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text
            style={[styles.footerText, { color: theme.colors.textSecondary }]}
          >
            Cargando más publicaciones...
          </Text>
        </View>
      );
    }

    if (errorState.isPersistentError) {
      return (
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.error }]}>
            {publicationData.error}
          </Text>
          <TouchableOpacity
            onPress={operations.handleRetry}
            style={styles.retryButton}
          >
            <Text
              style={[styles.retryButtonText, { color: theme.colors.primary }]}
            >
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (
      !publicationData.canLoadMore &&
      publicationData.publications.length > 0
    ) {
      return (
        <View style={styles.footer}>
          <Text
            style={[styles.footerText, { color: theme.colors.textSecondary }]}
          >
            Has visto todas las publicaciones
          </Text>
        </View>
      );
    }

    return null;
  }, [
    publicationData.isLoadingMore,
    publicationData.canLoadMore,
    publicationData.publications.length,
    publicationData.error,
    errorState.isPersistentError,
    theme,
    operations.handleRetry
  ]);

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        {errorState.showDelayedError ? (
          <View style={styles.temporaryErrorContainer}>
            <Text
              style={[styles.emptyText, { color: theme.colors.textSecondary }]}
            >
              Conectando...
            </Text>
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={{ marginTop: 8 }}
            />
          </View>
        ) : (
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            {publicationData.isLoading
              ? 'Cargando publicaciones...'
              : 'No hay publicaciones para mostrar'}
          </Text>
        )}
      </View>
    ),
    [errorState.showDelayedError, publicationData.isLoading, theme]
  );

  const renderSkeletons = useCallback(
    () => (
      <View style={styles.skeletonContainer}>
        {Array.from({ length: CONFIG.UI.SKELETON_COUNT }).map((_, index) => (
          <PublicationSkeleton
            key={index}
            viewMode="card"
            style={{ marginBottom: 16 }}
          />
        ))}
      </View>
    ),
    []
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index
    }),
    []
  );

  const keyExtractor = useCallback(
    (item: PublicationModelResponse, index: number) => {
      const id = item.recordId?.toString() || `unknown-${index}`;
      return `${selectedStatus}-${id}-${index}`;
    },
    [selectedStatus]
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {errorState.showDelayedError && (
          <View
            style={[
              styles.connectionBanner,
              { backgroundColor: theme.colors.warning || '#ff9800' }
            ]}
          >
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.connectionBannerText}>Reconectando...</Text>
          </View>
        )}
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
      </View>

      <FlatList
        ref={listRef}
        data={publicationData.publications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          publicationData.isEmpty &&
            !publicationData.isLoading &&
            styles.emptyListContent
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
        getItemLayout={getItemLayout}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        maxToRenderPerBatch={CONFIG.PERFORMANCE.MAX_RENDER_BATCH}
        windowSize={CONFIG.PERFORMANCE.WINDOW_SIZE}
        initialNumToRender={CONFIG.UI.INITIAL_RENDER_COUNT}
        updateCellsBatchingPeriod={CONFIG.PERFORMANCE.UPDATE_BATCHING_PERIOD}
        showsVerticalScrollIndicator={true}
        extraData={selectedStatus}
        legacyImplementation={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  listContent: { paddingHorizontal: 16, paddingVertical: 8 },
  emptyListContent: { flexGrow: 1, justifyContent: 'center' },
  footer: { paddingVertical: 20, alignItems: 'center' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64
  },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  skeletonContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    minHeight: 60
  },
  activeTab: {
    borderColor: 'transparent',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  errorTab: { backgroundColor: '#ffebee', borderColor: '#f44336' },
  warningTab: { borderColor: '#ff9800' },
  circuitBreakerTab: { backgroundColor: '#ff9800', borderColor: '#ff9800' },
  tabContent: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  activeTabText: { fontWeight: '600' },
  tabStats: { fontSize: 11, fontWeight: '400', marginTop: 2, opacity: 0.8 },
  tabLoader: { position: 'absolute', top: 4, right: 4 },
  footerText: { fontSize: 13, marginTop: 8, textAlign: 'center' },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8
  },
  retryButtonText: { fontSize: 14, fontWeight: '500' },
  temporaryErrorContainer: { justifyContent: 'center', alignItems: 'center' },
  connectionBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16
  },
  connectionBannerText: { fontSize: 14, color: '#fff', marginLeft: 8 }
});

export default PublicationScreen;
