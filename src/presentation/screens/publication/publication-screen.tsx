import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { View, FlatList, Text, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import debounce from 'lodash.debounce';

import { useAuth } from '../../contexts/auth-context';
import { useTheme, themeVariables } from '../../contexts/theme-context';
import { usePublications } from '../../contexts/publication-context';
import { useNavigationActions } from '../../navigation/navigation-provider';

import useBackHandler from '../../hooks/use-back-handler.hook';

import StatusTabs from '../../components/publication/status-tabs.component';
import PublicationCard from '../../components/publication/publication-card.component';
import SearchBar from '../../components/ui/search-bar.component';
import LoadingIndicator from '../../components/ui/loading-indicator.component';

import {
  PublicationResponse,
  PublicationStatus,
} from '../../../domain/models/publication.models';
import { createStyles } from './publication-screen.styles';

const STATUS_OPTIONS = [
  { label: 'Pendientes', value: 'pending' },
  { label: 'Aceptados', value: 'accepted' },
  { label: 'Rechazados', value: 'rejected' },
] as const;

const EmptyList = React.memo(
  ({
    searchQuery,
    theme,
  }: {
    searchQuery: string;
    theme: ReturnType<typeof useTheme>['theme'];
  }) => {
    const styles = createStyles(themeVariables(theme));
    const message = searchQuery ? 'Sin resultados' : 'No hay publicaciones.';

    return (
      <View style={styles.centered}>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          {message}
        </Text>
      </View>
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

  const {
    state,
    actions: { loadStatus, loadMoreStatus },
  } = usePublications();

  const [selectedStatus, setSelectedStatus] = useState<PublicationStatus>(() =>
    isAdmin ? 'accepted' : 'pending',
  );
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [publications, setPublications] = useState<PublicationResponse[]>([]);

  useBackHandler();

  const statusState = useMemo(
    () => state[selectedStatus],
    [state, selectedStatus],
  );
  const isLoading = useMemo(() => statusState.isLoading, [statusState]);
  const hasMore = useMemo(() => statusState.hasMore, [statusState]);

  const prevQuery = useRef<string>('');
  const prevStatus = useRef<PublicationStatus>(selectedStatus);

  const debouncedSetSearch = useMemo(
    () =>
      debounce(
        (value: string) => setSearchQuery(value.trim().toLowerCase()),
        300,
      ),
    [],
  );

  useEffect(() => {
    debouncedSetSearch(searchInput);
    return () => debouncedSetSearch.cancel();
  }, [searchInput, debouncedSetSearch]);

  const loadPublications = useCallback(async () => {
    await loadStatus(selectedStatus, searchQuery);
    console.log('Publications loaded');
    console.log(state);
  }, [loadStatus, selectedStatus, searchQuery]);

  useEffect(() => {
    const shouldLoad =
      selectedStatus !== prevStatus.current ||
      searchQuery !== prevQuery.current;

    const loadCached = async () => {
      try {
        const cached = await AsyncStorage.getItem(`cached_${selectedStatus}`);
        if (cached && shouldLoad) {
          setPublications(JSON.parse(cached));
        }
        await loadPublications();
      } catch (e) {
        console.warn('Error loading from cache', e);
      }
    };
    loadCached();
    prevQuery.current = searchQuery;
    prevStatus.current = selectedStatus;
  }, [selectedStatus, loadPublications, searchQuery]);

  useEffect(() => {
    if (!state[selectedStatus].isLoading) {
      setPublications(state[selectedStatus].publications);
    }
  }, [state, selectedStatus]);

  useEffect(() => {
    if (publications.length > 0) {
      AsyncStorage.setItem(
        `cached_${selectedStatus}`,
        JSON.stringify(publications),
      );
    }
  }, [publications, selectedStatus]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadMoreStatus(selectedStatus);
    }
  }, [isLoading, hasMore, loadMoreStatus, selectedStatus]);

  const handlePublicationPress = useCallback(
    (item: PublicationResponse) => {
      navigate('PublicationDetails', {
        publication: item,
        status: selectedStatus,
      });
    },
    [navigate, selectedStatus],
  );

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
    if (isLoading && publications.length > 0) {
      return <LoadingIndicator theme={theme} text="Cargando más..." />;
    }
    return null;
  }, [isLoading, publications.length, theme]);

  if (isLoading && publications.length === 0) {
    return <LoadingIndicator theme={theme} text="Cargando publicaciones..." />;
  }

  const visibleStatusOptions = isAdmin
    ? STATUS_OPTIONS.filter(option => option.value !== 'pending')
    : STATUS_OPTIONS;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusTabs
        statuses={visibleStatusOptions}
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
        data={publications}
        renderItem={renderPublicationItem}
        keyExtractor={item => item.recordId.toString()}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadPublications}
            colors={[variables['--primary']]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        removeClippedSubviews={true}
        initialNumToRender={5}
        windowSize={10}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
};

export default PublicationScreen;
