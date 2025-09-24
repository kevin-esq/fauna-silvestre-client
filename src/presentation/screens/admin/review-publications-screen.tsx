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
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useTheme, themeVariables } from '../../contexts/theme.context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PublicationModelResponse } from '../../../domain/models/publication.models';
import { usePublications } from '../../contexts/publication.context';

import PublicationCard, {
  ITEM_HEIGHT
} from '../../components/publication/publication-card.component';
import PublicationSkeleton from '../../components/ui/publication-skeleton.component';
import SearchBar from '../../components/ui/search-bar.component';
import RejectionModal from '../../components/publication/rejection-modal.component';
import { createStyles } from './review-publications-screen.styles';
import { PublicationStatus } from '@/services/publication/publication.service';

const LOAD_CONFIG = {
  DEBOUNCE_TIME: 300,
  END_REACHED_THRESHOLD: 0.8,
  RETRY_DELAY: 2000
} as const;

const ReviewPublicationsScreen: React.FC = () => {
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);
  const insets = useSafeAreaInsets();

  const {
    loadStatus,
    loadMoreStatus,
    refreshStatus,
    acceptPublication,
    rejectPublication,
    canLoadMore,
    getStatusData
  } = usePublications();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const loadMoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listRef = useRef<FlatList<PublicationModelResponse>>(null);

  const pendingData = getStatusData(PublicationStatus.PENDING);
  const publications = pendingData.publications;
  const isLoading = pendingData.isLoading;
  const isLoadingMore = pendingData.isLoadingMore;
  const isRefreshing = pendingData.isRefreshing;
  const isEmpty = pendingData.isEmpty;
  const error = pendingData.error;

  const filteredPublications = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return publications;

    return publications.filter(
      pub =>
        pub.commonNoun?.toLowerCase().includes(query) ||
        pub.description?.toLowerCase().includes(query) ||
        pub.location?.toLowerCase().includes(query)
    );
  }, [publications, searchQuery]);

  useEffect(() => {
    if (!hasInitialLoad && publications.length === 0 && !isLoading && !error) {
      console.log('[ReviewPublications] Initial load');
      setHasInitialLoad(true);
      loadStatus(PublicationStatus.PENDING);
    }
  }, [hasInitialLoad, publications.length, isLoading, error, loadStatus]);

  const handleRefresh = useCallback(async () => {
    console.log('[ReviewPublications] Manual refresh');
    await refreshStatus(PublicationStatus.PENDING);

    if (listRef.current) {
      listRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, [refreshStatus]);

  const handleLoadMore = useCallback(() => {
    if (
      !canLoadMore(PublicationStatus.PENDING) ||
      isLoadingMore ||
      loadMoreTimeoutRef.current
    ) {
      return;
    }

    console.log('[ReviewPublications] Load more triggered');

    loadMoreTimeoutRef.current = setTimeout(() => {
      if (canLoadMore(PublicationStatus.PENDING) && !isLoadingMore) {
        loadMoreStatus(PublicationStatus.PENDING);
      }
      loadMoreTimeoutRef.current = null;
    }, LOAD_CONFIG.DEBOUNCE_TIME);
  }, [canLoadMore, isLoadingMore, loadMoreStatus]);

  const handleRetry = useCallback(() => {
    if (retryTimeoutRef.current) return;

    console.log('[ReviewPublications] Retry after error');

    retryTimeoutRef.current = setTimeout(() => {
      loadStatus(PublicationStatus.PENDING, { forceRefresh: true });
      retryTimeoutRef.current = null;
    }, LOAD_CONFIG.RETRY_DELAY);
  }, [loadStatus]);

  useEffect(() => {
    return () => {
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleApprove = useCallback(
    (id: string) => {
      Alert.alert(
        'Aprobar publicación',
        '¿Confirmas aprobación?',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Aprobar',
            onPress: () => acceptPublication(id, PublicationStatus.PENDING),
            style: 'default'
          }
        ],
        { cancelable: true }
      );
    },
    [acceptPublication]
  );

  const handleReject = useCallback((id: string) => {
    setCurrentId(id);
    setReason('');
  }, []);

  const confirmReject = useCallback(() => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Por favor ingresa una razón para el rechazo');
      return;
    }
    rejectPublication(currentId!, PublicationStatus.PENDING);
    setCurrentId(null);
    setReason('');
  }, [currentId, reason, rejectPublication]);

  const renderPublicationItem = useCallback(
    ({ item }: { item: PublicationModelResponse }) => (
      <PublicationCard
        publication={item}
        status={PublicationStatus.PENDING}
        reviewActions={{
          onApprove: () => handleApprove(item.recordId.toString()),
          onReject: () => handleReject(item.recordId.toString())
        }}
        viewMode="presentation"
      />
    ),
    [handleApprove, handleReject]
  );

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Cargando más publicaciones...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.footer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
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
      !canLoadMore(PublicationStatus.PENDING) &&
      filteredPublications.length > 0
    ) {
      return (
        <View style={styles.footer}>
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Has visto todas las publicaciones pendientes
          </Text>
        </View>
      );
    }

    return null;
  }, [
    isLoadingMore,
    error,
    canLoadMore,
    filteredPublications.length,
    theme,
    handleRetry,
    styles
  ]);

  const renderEmptyComponent = useCallback(() => {
    if (isLoading && publications.length === 0) {
      return (
        <View style={styles.skeletonContainer}>
          {Array.from({ length: 5 }).map((_, index) => (
            <PublicationSkeleton
              key={index}
              viewMode="card"
              style={{ marginBottom: 16 }}
            />
          ))}
        </View>
      );
    }

    return (
      <View style={styles.centered}>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          {isEmpty ? 'No hay publicaciones pendientes.' : 'Sin resultados'}
        </Text>
      </View>
    );
  }, [isLoading, publications.length, isEmpty, theme, styles]);

  const renderResultCount = useCallback(() => {
    if (filteredPublications.length === 0) return null;

    return (
      <View style={styles.resultsContainer}>
        <Text
          style={[styles.resultText, { color: theme.colors.textSecondary }]}
        >
          {filteredPublications.length}{' '}
          {filteredPublications.length === 1 ? 'resultado' : 'resultados'}
        </Text>
      </View>
    );
  }, [filteredPublications.length, theme, styles]);

  const keyExtractor = useCallback(
    (item: PublicationModelResponse, index: number) => {
      const id = item.recordId?.toString() || `unknown-${index}`;
      return `pending-${id}-${index}`;
    },
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

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: theme.colors.background
        }
      ]}
    >
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar publicaciones..."
        theme={theme}
        onClear={() => setSearchQuery('')}
      />

      {renderResultCount()}

      <FlatList
        ref={listRef}
        data={filteredPublications as PublicationModelResponse[]}
        keyExtractor={keyExtractor}
        renderItem={renderPublicationItem}
        contentContainerStyle={[
          styles.listContent,
          filteredPublications.length === 0 &&
            !isLoading &&
            styles.emptyListContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            progressBackgroundColor={theme.colors.background}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={LOAD_CONFIG.END_REACHED_THRESHOLD}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        updateCellsBatchingPeriod={100}
        keyboardShouldPersistTaps="handled"
        extraData={searchQuery}
      />

      <RejectionModal
        visible={!!currentId}
        rejectionReason={reason}
        setRejectionReason={setReason}
        onConfirm={confirmReject}
        onDismiss={() => {
          setCurrentId(null);
          setReason('');
        }}
        theme={theme}
      />
    </View>
  );
};

export default React.memo(ReviewPublicationsScreen);
