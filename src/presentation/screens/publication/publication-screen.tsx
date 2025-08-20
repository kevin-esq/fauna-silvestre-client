import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  useDeferredValue,
  useLayoutEffect,
} from 'react';
import {
  View,
  FlatList,
  Text,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Platform,
  StatusBar,
  Pressable,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/presentation/contexts/auth.context';
import {
  useTheme,
  themeVariables,
} from '@/presentation/contexts/theme.context';
import { 
  usePublicationStatus
} from '@/presentation/contexts/publication.context';
import { useNavigationActions } from '@/presentation/navigation/navigation-provider';

import StatusTabs from '@/presentation/components/publication/status-tabs.component';
import PublicationCard from '@/presentation/components/publication/publication-card.component';
import SearchBar from '@/presentation/components/ui/search-bar.component';
import ErrorBoundary from '@/presentation/components/ui/error-boundary.component';
import SkeletonLoader from '@/presentation/components/ui/skeleton-loader.component';
import FloatingActionButton from '@/presentation/components/ui/floating-action-button.component';

import {
  PublicationResponse,
} from '@/domain/models/publication.models';
import { createStyles } from './publication-screen.styles';
import { PublicationStatus } from '@/services/publication/publication.service';

const CONFIG = {
  SEARCH_DEBOUNCE: 500,
  PREFETCH_THRESHOLD: 0.5,
  INITIAL_RENDER: 8,
  MAX_RENDER_BATCH: 10,
  WINDOW_SIZE: 15,
  UPDATE_CELLS_PERIOD: 100,
  REFRESH_THRESHOLD: 100,
  FAB_SHOW_THRESHOLD: 200,
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
} as const;

const STATUS_OPTIONS = [
  { 
    label: 'Pendientes', 
    value: PublicationStatus.PENDING,
    icon: 'clock',
    badge: true,
  },
  { 
    label: 'Aceptados', 
    value: PublicationStatus.ACCEPTED,
    icon: 'check-circle',
    badge: false,
  },
  { 
    label: 'Rechazados', 
    value: PublicationStatus.REJECTED,
    icon: 'x-circle',
    badge: false,
  },
] as const;

const useScrollHandler = (onScroll?: (offset: number) => void) => {
  const lastScrollY = useRef(0);
  const scrollThrottleRef = useRef<NodeJS.Timeout | null>(null);

  const scrollHandler = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    
    // Throttle manual para evitar llamadas excesivas
    if (Math.abs(offsetY - lastScrollY.current) < 10) {
      return;
    }
    
    lastScrollY.current = offsetY;
    
    if (scrollThrottleRef.current) {
      clearTimeout(scrollThrottleRef.current);
    }
    
    scrollThrottleRef.current = setTimeout(() => {
      onScroll?.(offsetY);
    }, 100);
  }, [onScroll]);

  useEffect(() => {
    return () => {
      if (scrollThrottleRef.current) {
        clearTimeout(scrollThrottleRef.current);
      }
    };
  }, []);

  return { scrollHandler };
};

const useOptimizedSearch = (initialValue = '') => {
  const [searchInput, setSearchInput] = useState(initialValue);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchInput.toLowerCase().trim());
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchRef = useRef('');

  const updateSearchQuery = useCallback((value: string) => {
    const trimmedValue = value.toLowerCase().trim();
    
    // Evitar búsquedas duplicadas
    if (trimmedValue === lastSearchRef.current) {
      return;
    }
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      lastSearchRef.current = trimmedValue;
      setSearchQuery(trimmedValue);
    }, CONFIG.SEARCH_DEBOUNCE);
  }, []);

  useEffect(() => {
    updateSearchQuery(searchInput);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput, updateSearchQuery]);

  const clearSearch = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
    lastSearchRef.current = '';
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  return {
    searchInput,
    setSearchInput,
    searchQuery,
    deferredSearchQuery,
    clearSearch,
  };
};

const useErrorHandling = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const executeWithRetry = useCallback(async (
    operation: () => Promise<void>,
    onError?: (error: Error, retries: number) => void
  ) => {
    try {
      setIsRetrying(true);
      await operation();
      setRetryCount(0); // Reset en caso de éxito
    } catch (error) {
      const currentRetries = retryCount + 1;
      
      if (currentRetries < CONFIG.MAX_RETRIES) {
        setRetryCount(currentRetries);
        onError?.(error as Error, currentRetries);
        
        // Exponential backoff
        const delay = CONFIG.RETRY_DELAY * Math.pow(2, currentRetries - 1);
        
        retryTimeoutRef.current = setTimeout(() => {
          executeWithRetry(operation, onError);
        }, delay);
      } else {
        setRetryCount(0);
        throw error;
      }
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount]);

  const resetRetries = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    executeWithRetry,
    resetRetries,
    isRetrying,
    retryCount,
  };
};

const EmptyListComponent = React.memo(
  ({
    searchQuery,
    isLoading,
    error,
    onRetry,
    theme,
  }: {
    searchQuery: string;
    isLoading: boolean;
    error?: string;
    onRetry: () => void;
    theme: ReturnType<typeof useTheme>['theme'];
  }) => {
    const styles = createStyles(themeVariables(theme));
    const insets = useSafeAreaInsets();

    if (isLoading) {
      return (
        <View style={[styles.centered, { paddingTop: insets.top + 100 }]}>
          <SkeletonLoader count={3} height={120} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.centered, { paddingTop: insets.top + 100 }]}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={onRetry}
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.surface }]}>
              Reintentar
            </Text>
          </Pressable>
        </View>
      );
    }

    const message = searchQuery
      ? 'No se encontraron publicaciones'
      : 'No hay publicaciones disponibles';
    const subMessage = searchQuery
      ? 'Intenta con otros términos de búsqueda'
      : 'Desliza hacia abajo para actualizar';

    return (
      <View style={[styles.centered, { paddingTop: insets.top + 100 }]}>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          {message}
        </Text>
        <Text style={[styles.emptySubText, { color: theme.colors.textSecondary }]}>
          {subMessage}
        </Text>
      </View>
    );
  },
);

const StickyHeader = React.memo(
  ({
    searchInput,
    onSearchChange,
    onSearchClear,
    theme,
    isScrolled,
  }: {
    searchInput: string;
    onSearchChange: (text: string) => void;
    onSearchClear: () => void;
    theme: ReturnType<typeof useTheme>['theme'];
    isScrolled: boolean;
  }) => {
    const styles = createStyles(themeVariables(theme));
    const animatedStyle = useMemo(() => ({
      elevation: isScrolled ? 8 : 0,
      shadowOpacity: isScrolled ? 0.1 : 0,
    }), [isScrolled]);

    return (
      <Animated.View style={[styles.stickyHeader, animatedStyle]}>
        <SearchBar
          value={searchInput}
          onChangeText={onSearchChange}
          placeholder="Buscar por nombre o descripción..."
          theme={theme}
          onClear={onSearchClear}
        />
      </Animated.View>
    );
  },
);

const PublicationScreen = () => {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'Admin';
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);
  const { navigate } = useNavigationActions();
  const insets = useSafeAreaInsets();

  const [selectedStatus, setSelectedStatus] = useState<PublicationStatus>(() =>
    isAdmin ? PublicationStatus.ACCEPTED : PublicationStatus.PENDING,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFAB, setShowFAB] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const { 
    searchInput, 
    setSearchInput, 
    searchQuery, 
    deferredSearchQuery, 
    clearSearch 
  } = useOptimizedSearch();

  const { executeWithRetry, resetRetries, isRetrying } = useErrorHandling();

  const {
    data: statusData,
    isLoading,
    isLoadingMore,
    error,
    canLoadMore,
    shouldPrefetch,
    load,
    loadMore,
    prefetch,
  } = usePublicationStatus(selectedStatus);

  const listRef = useRef<FlatList>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fabAnimatedValue = useRef(new Animated.Value(0)).current;
  const lastLoadParamsRef = useRef<{
    status: PublicationStatus;
    searchQuery: string;
    timestamp: number;
  }>({ status: selectedStatus, searchQuery: '', timestamp: 0 });
  const isLoadingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const filteredPublications = useMemo(() => {
    if (!deferredSearchQuery) {
      return statusData.filteredPublications;
    }
    
    return statusData.publications.filter((publication: PublicationResponse) =>
      publication.commonNoun?.toLowerCase().includes(deferredSearchQuery) ||
      publication.description?.toLowerCase().includes(deferredSearchQuery) 
    );
  }, [statusData, deferredSearchQuery]);

  const loadDataSafely = useCallback(async (params: {
    searchQuery?: string;
    forceRefresh?: boolean;
    useCache?: boolean;
  }) => {
    if (!isMountedRef.current) {
      return;
    }

    const currentParams = {
      status: selectedStatus,
      searchQuery: params.searchQuery || '',
      timestamp: Date.now(),
    };

    const timeDiff = currentParams.timestamp - lastLoadParamsRef.current.timestamp;
    const isSameParams = 
      lastLoadParamsRef.current.status === currentParams.status &&
      lastLoadParamsRef.current.searchQuery === currentParams.searchQuery;

    if (isSameParams && timeDiff < 1000 && !params.forceRefresh) {
      console.log('Carga duplicada evitada:', currentParams);
      return;
    }

    if (isLoadingRef.current && !params.forceRefresh) {
      console.log('Carga ya en progreso, saltando...');
      return;
    }

    try {
      isLoadingRef.current = true;
      setIsLoadingData(true);
      lastLoadParamsRef.current = currentParams;

      await executeWithRetry(
        async () => {
          if (!isMountedRef.current) return;
          
          await load({
            searchQuery: params.searchQuery || undefined,
            forceRefresh: params.forceRefresh || false,
            useCache: params.useCache !== false
          });
        },
        (error, retries) => {
          console.warn(`Error en carga (intento ${retries}):`, error.message);
          if (isMountedRef.current) {
            Alert.alert(
              'Error de conexión',
              `Reintentando... (${retries}/${CONFIG.MAX_RETRIES})`
            );
          }
        }
      );

    } catch (error) {
      console.error('Error final en carga de datos:', error);
      if (isMountedRef.current) {
        Alert.alert(
          'Error',
          'No se pudieron cargar las publicaciones. Verifica tu conexión.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Reintentar', 
              onPress: () => loadDataSafely({ ...params, forceRefresh: true })
            },
          ]
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingData(false);
        isLoadingRef.current = false;
      }
    }
  }, [selectedStatus, load, executeWithRetry]);

  const handleScroll = useCallback((offset: number) => {
    if (!isMountedRef.current) return;

    const shouldShowFAB = offset > CONFIG.FAB_SHOW_THRESHOLD;
    const headerScrolled = offset > CONFIG.REFRESH_THRESHOLD;
  
    if (shouldShowFAB !== showFAB) {
      setShowFAB(shouldShowFAB);
      Animated.timing(fabAnimatedValue, {
        toValue: shouldShowFAB ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    if (headerScrolled !== isHeaderScrolled) {
      setIsHeaderScrolled(headerScrolled);
    }

    if (shouldPrefetch && offset > 0 && !isLoadingRef.current) {
      if (!prefetchTimeoutRef.current) {
        prefetchTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && !isLoadingRef.current) {
            prefetch().catch(error => {
              console.warn('Error en prefetch:', error);
            });
          }
          prefetchTimeoutRef.current = null;
        }, 2000); // Mayor delay para prefetch
      }
    }
  }, [showFAB, isHeaderScrolled, shouldPrefetch, prefetch, fabAnimatedValue]);

  const { scrollHandler } = useScrollHandler(handleScroll);

  useEffect(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    resetRetries();

    const shouldLoad = 
      isMountedRef.current && 
      !isLoadingRef.current && 
      !isRetrying;

    if (!shouldLoad) {
      return;
    }

    const delay = searchQuery ? 600 : 100;

    loadingTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        loadDataSafely({
          searchQuery: searchQuery || undefined,
          forceRefresh: false,
          useCache: !searchQuery
        });
      }
    }, delay);

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, [selectedStatus, searchQuery, loadDataSafely, resetRetries, isRetrying]);

  useLayoutEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(theme.colors.surface, true);
    }
  }, [theme.colors.surface]);

  const handleRefresh = useCallback(async () => {
    if (isLoadingRef.current) return;

    try {
      setIsRefreshing(true);
      resetRetries();
      await loadDataSafely({
        searchQuery: searchQuery || undefined,
        forceRefresh: true
      });
    } catch (error) {
      console.error('Error en refresh:', error);
    } finally {
      if (isMountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [loadDataSafely, searchQuery, resetRetries]);

  const handleLoadMore = useCallback(async () => {
    if (!canLoadMore || isLoadingMore || isLoadingRef.current) {
      return;
    }

    try {
      await loadMore(searchQuery);
    } catch (error) {
      console.error('Error loading more:', error);
      if (isMountedRef.current) {
        Alert.alert(
          'Error',
          'No se pudieron cargar más publicaciones.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Reintentar', onPress: () => handleLoadMore() },
          ]
        );
      }
    }
  }, [canLoadMore, isLoadingMore, loadMore, searchQuery]);

  const handlePublicationPress = useCallback(
    (item: PublicationResponse) => {
      navigate('PublicationDetails', {
        publication: item,
        status: selectedStatus,
      });
    },
    [navigate, selectedStatus],
  );

  const handleStatusChange = useCallback((status: PublicationStatus) => {
    if (status === selectedStatus) return;
    
    setSelectedStatus(status);
    clearSearch();
    resetRetries();
    
    listRef.current?.scrollToOffset({ 
      animated: true, 
      offset: 0 
    });
  }, [selectedStatus, clearSearch, resetRetries]);

  const handleScrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ 
      animated: true, 
      offset: 0 
    });
  }, []);

  const handleRetry = useCallback(async () => {
    try {
      resetRetries();
      await loadDataSafely({
        searchQuery: searchQuery || undefined,
        forceRefresh: true
      });
    } catch (error) {
      console.error('Retry failed:', error);
    }
  }, [loadDataSafely, searchQuery, resetRetries]);

  const renderPublicationItem = useCallback(
    ({ item }: { item: PublicationResponse }) => (
      <PublicationCard
        publication={item}
        onPress={() => handlePublicationPress(item)}
        status={selectedStatus}
      />
    ),
    [handlePublicationPress, selectedStatus],
  );

  const renderFooter = useCallback(() => {
    if (isLoadingMore && filteredPublications.length > 0) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Cargando más publicaciones...
          </Text>
        </View>
      );
    }
    return null;
  }, [isLoadingMore, filteredPublications.length, styles, theme]);

  const renderEmptyComponent = useCallback(
    () => (
      <EmptyListComponent
        searchQuery={deferredSearchQuery}
        isLoading={(isLoading || isLoadingData) && !isRefreshing}
        error={error}
        onRetry={handleRetry}
        theme={theme}
      />
    ),
    [deferredSearchQuery, isLoading, isLoadingData, isRefreshing, error, handleRetry, theme],
  );

  const keyExtractor = useCallback(
    (item: PublicationResponse) => `publication-${item.recordId}`,
    [],
  );

  const visibleStatusOptions = useMemo(() => {
    return isAdmin 
      ? STATUS_OPTIONS.filter(option => option.value !== PublicationStatus.PENDING)
      : STATUS_OPTIONS;
  }, [isAdmin]);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: 140,
      offset: 140 * index,
      index,
    }),
    [],
  );

  return (
    <ErrorBoundary>
      <View
        style={[
          styles.container, 
          { 
            backgroundColor: theme.colors.background,
            paddingTop: insets.top,
          }
        ]}
      >
        <StatusTabs
          statuses={visibleStatusOptions}
          active={selectedStatus}
          onSelect={handleStatusChange}
          theme={theme}
        />

        <StickyHeader
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onSearchClear={clearSearch}
          theme={theme}
          isScrolled={isHeaderScrolled}
        />

        <FlatList
          ref={listRef}
          data={filteredPublications}
          renderItem={renderPublicationItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
              progressBackgroundColor={theme.colors.surface}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={CONFIG.PREFETCH_THRESHOLD}
          onScroll={scrollHandler}
          scrollEventThrottle={32}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyComponent}
          removeClippedSubviews={Platform.OS === 'android'}
          initialNumToRender={CONFIG.INITIAL_RENDER}
          maxToRenderPerBatch={CONFIG.MAX_RENDER_BATCH}
          windowSize={CONFIG.WINDOW_SIZE}
          updateCellsBatchingPeriod={CONFIG.UPDATE_CELLS_PERIOD}
          contentContainerStyle={[
            styles.listContent,
            filteredPublications.length === 0 && styles.flexGrow,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 100,
          }}
        />
        
        <FloatingActionButton
          visible={showFAB}
          onPress={handleScrollToTop}
          icon="arrow-up"
          style={[
            styles.fab,
            {
              bottom: insets.bottom + 20,
              right: 20,
            },
          ]}
        />

        {(isLoading || isLoadingData) && !isRefreshing && filteredPublications.length === 0 && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingOverlayText, { color: theme.colors.text }]}>
              {isRetrying ? `Reintentando conexión...` : 'Cargando publicaciones...'}
            </Text>
          </View>
        )}
      </View>
    </ErrorBoundary>
  );
};

export default React.memo(PublicationScreen);