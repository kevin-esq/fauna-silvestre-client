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
  ActivityIndicator
} from 'react-native';
import { useTheme, themeVariables } from '../../contexts/theme.context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PublicationResponse } from '../../../domain/models/publication.models';
import { usePublications } from '../../contexts/publication.context';

import PublicationCard from '../../components/publication/publication-card.component';
import SearchBar from '../../components/ui/search-bar.component';
import RejectionModal from '../../components/publication/rejection-modal.component';
import { createStyles } from './review-publications-screen.styles';

const PAGE_SIZE = 5;

const ReviewPublicationsScreen: React.FC = () => {
  const isMounted = useRef<boolean>(false);
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);
  const insets = useSafeAreaInsets();

  const {
    state: { pending, error },
    actions: { loadStatus, approve, reject, loadMoreStatus }
  } = usePublications();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const filteredPublications = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return pending.publications;

    return pending.publications.filter(
      pub =>
        pub.commonNoun.toLowerCase().includes(query) ||
        pub.description.toLowerCase().includes(query)
    );
  }, [pending.publications, searchQuery]);

  const loadPendingPublications = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await loadStatus('pending', searchQuery);
    } catch (error: unknown) {
      console.error('Error loading pending publications:', error);
      Alert.alert('Error', 'No se pudieron cargar publicaciones pendientes.');
    } finally {
      setIsRefreshing(false);
    }
  }, [loadStatus, searchQuery]);

  useEffect(() => {
    if (!isMounted.current) {
      loadPendingPublications();
    }
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (
      isLoadingMore ||
      !pending.hasMore ||
      filteredPublications.length < PAGE_SIZE
    )
      return;

    try {
      setIsLoadingMore(true);
      await loadMoreStatus('pending', searchQuery);
    } catch (error: unknown) {
      console.error('Error loading more:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    pending.hasMore,
    filteredPublications.length,
    loadMoreStatus,
    searchQuery
  ]);

  const handleApprove = useCallback(
    (id: string) => {
      Alert.alert(
        'Aprobar publicación',
        '¿Confirmas aprobación?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => console.log('Cancel pressed')
          },
          {
            text: 'Aprobar',
            onPress: () => approve(id),
            style: 'default'
          }
        ],
        { cancelable: true }
      );
    },
    [approve]
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
    reject(currentId!);
    setCurrentId(null);
    setReason('');
  }, [currentId, reason, reject]);

  const renderPublicationItem = useCallback(
    ({ item }: { item: PublicationResponse }) => (
      <PublicationCard
        publication={item}
        status="pending"
        reviewActions={{
          onApprove: () => handleApprove(item.recordId.toString()),
          onReject: () => handleReject(item.recordId.toString())
        }}
        viewMode="presentation"
      />
    ),
    [handleApprove, handleReject]
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Cargando más publicaciones...
        </Text>
      </View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.centered}>
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        {searchQuery ? 'Sin resultados' : 'No hay publicaciones pendientes.'}
      </Text>
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );

  const renderResultCount = () => (
    <View style={styles.resultsContainer}>
      <Text style={[styles.resultText, { color: theme.colors.textSecondary }]}>
        {filteredPublications.length}{' '}
        {filteredPublications.length === 1 ? 'resultado' : 'resultados'}
      </Text>
    </View>
  );

  // Estado de carga inicial
  if (pending.isLoading && !isRefreshing && pending.publications.length === 0) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Cargando publicaciones...
        </Text>
      </View>
    );
  }

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

      {filteredPublications.length > 0 && renderResultCount()}

      <FlatList
        data={filteredPublications}
        keyExtractor={item => item.recordId.toString()}
        renderItem={renderPublicationItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={loadPendingPublications}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            progressBackgroundColor={theme.colors.background}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        removeClippedSubviews
        initialNumToRender={PAGE_SIZE}
        maxToRenderPerBatch={PAGE_SIZE}
        windowSize={21}
        updateCellsBatchingPeriod={100}
        keyboardShouldPersistTaps="handled"
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
