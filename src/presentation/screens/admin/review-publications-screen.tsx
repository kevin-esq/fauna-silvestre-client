import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme, themeVariables } from '../../contexts/theme-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PublicationResponse } from '../../../domain/models/publication.models';
import { usePublications } from '../../contexts/publication-context';

import PublicationCard from '../../components/publication/publication-card.component';
import SearchBar from '../../components/ui/search-bar.component';
import LoadingIndicator from '../../components/ui/loading-indicator.component';
import RejectionModal from '../../components/publication/rejection-modal.component';
import { createStyles } from './review-publications-screen.styles';

const PAGE_SIZE = 10;

const ReviewPublicationsScreen: React.FC = () => {
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);
  const insets = useSafeAreaInsets();
  const { pending } = usePublications();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paginatedData, setPaginatedData] = useState<PublicationResponse[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const loadPending = useCallback(async () => {
    setRefreshing(true);
    try {
      await pending.load();
    } catch {
      Alert.alert('Error', 'No se pudieron cargar publicaciones pendientes.');
    } finally {
      setRefreshing(false);
    }
  }, [pending]);

  useEffect(() => {
    loadPending();
  }, []);

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return pending.publications.filter((pub) =>
      query
        ? pub.commonNoun.toLowerCase().includes(query) ||
          pub.description.toLowerCase().includes(query)
        : true
    );
  }, [pending.publications, searchQuery]);

  useEffect(() => {
    setPaginatedData(filtered.slice(0, PAGE_SIZE));
    setHasMore(filtered.length > PAGE_SIZE);
  }, [filtered]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setTimeout(() => {
      const currentLength = paginatedData.length;
      const newItems = filtered.slice(currentLength, currentLength + PAGE_SIZE);

      if (newItems.length > 0) {
        setPaginatedData((prev) => [...prev, ...newItems]);
      }

      if (currentLength + newItems.length >= filtered.length) {
        setHasMore(false);
      }
      setIsLoading(false);
    }, 250);
  }, [filtered, hasMore, isLoading, paginatedData.length]);

  const handleApprove = useCallback(
    (id: string) => {
      Alert.alert('Aprobar publicación', '¿Confirmas aprobación?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí', onPress: () => pending.approve(id) },
      ]);
    },
    [pending]
  );

  const handleReject = useCallback((id: string) => setCurrentId(id), []);

  const confirmReject = useCallback(() => {
    if (!reason.trim()) return;
    pending.reject(currentId!);
    setCurrentId(null);
    setReason('');
  }, [currentId, reason, pending]);

  const renderPublicationItem = useCallback(
    ({ item }: { item: PublicationResponse }) => (
      <PublicationCard
        publication={{ ...item, status: 'pending' }}
        reviewActions={{
          onApprove: () => handleApprove(item.recordId.toString()),
          onReject: () => handleReject(item.recordId.toString()),
        }}
        viewMode="presentation"
      />
    ),
    [handleApprove, handleReject]
  );

  const renderFooter = () =>
    isLoading ? <LoadingIndicator theme={theme} text="Cargando más..." /> : null;

  const renderEmptyComponent = () => (
    <View style={styles.centered}>
      <Text style={[styles.emptyText, { color: theme.colors.text }]}> 
        {searchQuery ? 'Sin resultados' : 'No hay publicaciones pendientes.'}
      </Text>
    </View>
  );

  const renderResultCount = () => (
    <Text style={[styles.resultText, { color: theme.colors.textSecondary }]}> 
      {filtered.length} resultado{filtered.length !== 1 && 's'}
    </Text>
  );

  const showInitialLoading = pending.isLoading && !refreshing && pending.publications.length === 0;

  if (showInitialLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <LoadingIndicator theme={theme} text="Cargando publicaciones..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar publicaciones..."
        theme={theme}
      />

      {filtered.length > 0 && renderResultCount()}

      {pending.error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}> {pending.error} </Text>
      )}

      <FlatList
        data={paginatedData}
        keyExtractor={(item) => item.recordId.toString()}
        renderItem={renderPublicationItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadPending}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        removeClippedSubviews
        updateCellsBatchingPeriod={50}
        windowSize={11}
        initialNumToRender={PAGE_SIZE}
        maxToRenderPerBatch={PAGE_SIZE}
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

export default ReviewPublicationsScreen;
