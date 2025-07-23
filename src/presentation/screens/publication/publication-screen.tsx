import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, FlatList, Text, RefreshControl } from 'react-native';
import { Theme, useTheme } from '../../contexts/theme-context';
import useDrawerBackHandler from '../../hooks/use-drawer-back-handler.hook';
import PublicationCard from '../../components/publication/publication-card.component';
import StatusTabs from '../../components/publication/status-tabs.component';
import SearchBar from '../../components/ui/search-bar.component';
import LoadingIndicator from '../../components/ui/loading-indicator.component';
import { usePublications } from '../../contexts/publication-context';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { createStyles } from './publication-screen.styles';
import { PublicationResponse } from '../../../domain/models/publication.models';
import { themeVariables } from '../../contexts/theme-context';

const STATUS_OPTIONS = [
  { label: 'Pendientes', value: 'pending' },
  { label: 'Aceptados', value: 'accepted' },
  { label: 'Rechazados', value: 'rejected' },
] as const;

type StatusValue = typeof STATUS_OPTIONS[number]['value'];

const PAGE_SIZE = 5;

const EmptyList = React.memo(({ searchQuery, theme }: { searchQuery: string; theme: Theme }) => {
  const styles = createStyles(themeVariables(theme));
  const message = searchQuery ? 'Sin resultados' : 'No hay publicaciones.';
  
  return (
    <View style={styles.centered}>
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        {message}
      </Text>
    </View>
  );
});

const PublicationScreen = () => {
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);
  const { navigate } = useNavigationActions();
  
  const {
    state,
    actions: { loadStatus, loadMoreStatus },
  } = usePublications();

  const [selectedStatus, setSelectedStatus] = useState<StatusValue>('pending');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useDrawerBackHandler();

  // Memoized selectors
  const statusState = useMemo(() => state[selectedStatus], [state, selectedStatus]);
  const publications = useMemo(() => statusState.publications, [statusState]);
  const isLoading = useMemo(() => statusState.isLoading, [statusState]);
  const hasMore = useMemo(() => statusState.hasMore, [statusState]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput.trim().toLowerCase());
    }, 300);

    timeoutRef.current = handler;
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [searchInput]);

  // Filter publications
  const filteredPublications = useMemo(() => {
    if (!searchQuery) return publications;
    
    return publications.filter(pub => {
      const normalizedQuery = searchQuery.toLowerCase();
      return (
        pub.commonNoun.toLowerCase().includes(normalizedQuery) ||
        pub.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [publications, searchQuery]);

  // Load publications on status change
  const loadPublications = useCallback(async () => {
    try {
      await loadStatus(selectedStatus);
    } catch (error) {
      console.error('Error loading publications:', error);
    }
  }, [selectedStatus, loadStatus]);

  useEffect(() => {
    loadPublications();
  }, [loadPublications]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadPublications();
  }, [loadPublications]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadMoreStatus(selectedStatus);
    }
  }, [isLoading, hasMore, loadMoreStatus, selectedStatus]);

  // Handle publication press
  const handlePublicationPress = useCallback((item: PublicationResponse) => {
    navigate('PublicationDetails', { 
      publication: item, 
      status: selectedStatus 
    });
  }, [navigate, selectedStatus]);

  // Render publication item
  const renderPublicationItem = useCallback(
    ({ item }: { item: PublicationResponse }) => (
      <PublicationCard 
        publication={item} 
        onPress={() => handlePublicationPress(item)} 
        status={selectedStatus} 
      />
    ), 
    [handlePublicationPress, selectedStatus]
  );

  // Render footer
  const renderFooter = useCallback(() => {
    if (isLoading && publications.length > 0) {
      return <LoadingIndicator theme={theme} text="Cargando más..." />;
    }
    return null;
  }, [isLoading, publications.length, theme]);

  // Initial loading
  if (isLoading && publications.length === 0) {
    return <LoadingIndicator theme={theme} text="Cargando publicaciones..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusTabs
        statuses={STATUS_OPTIONS}
        active={selectedStatus}
        onSelect={setSelectedStatus}
        theme={theme}
      />
      
      <SearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Buscar por nombre o descripción..."
        theme={theme}
      />
      
      <FlatList
        data={filteredPublications}
        renderItem={renderPublicationItem}
        keyExtractor={(item) => item.recordId.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && searchQuery === ''}
            onRefresh={handleRefresh}
            colors={[variables['--primary']]}
            tintColor={variables['--primary']}
          />
        }
        ListEmptyComponent={
          <EmptyList 
            searchQuery={searchQuery} 
            theme={theme} 
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        initialNumToRender={PAGE_SIZE}
        windowSize={11}
      />
    </View>
  );
};

export default PublicationScreen;