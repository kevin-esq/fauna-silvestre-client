import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { View, FlatList, Text, RefreshControl } from 'react-native';
import { useTheme } from '../../contexts/theme-context';
import useDrawerBackHandler from '../../hooks/use-drawer-back-handler.hook';
import PublicationCard from '../../components/publication/publication-card.component';
import StatusTabs from '../../components/publication/status-tabs.component';
import SearchBar from '../../components/ui/search-bar.component';
import LoadingIndicator from '../../components/ui/loading-indicator.component';
import { usePublications } from '../../contexts/publication-context';
import { PublicationsModel, PublicationStatus } from '../../../domain/models/publication.models';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { createStyles } from './publication-screen.styles';
import { themeVariables } from '../../contexts/theme-context';
import moment from 'moment';
import { Theme } from '../../contexts/theme-context';

const statusOptions = [
    { label: 'Todos', value: 'all' as const },
    { label: 'Pendientes', value: 'pending' as const },
    { label: 'Aceptados', value: 'accepted' as const },
    { label: 'Rechazados', value: 'rejected' as const },
];

const PAGE_SIZE = 10;

const EmptyListComponent = React.memo(({ searchQuery, styles, theme }: { searchQuery: string, styles: ReturnType<typeof createStyles>, theme: Theme }) => (
    <View style={styles.centered}>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            {searchQuery ? 'Sin resultados' : 'No hay publicaciones.'}
        </Text>
    </View>
));

const PublicationScreen: React.FC = () => {
    const { theme } = useTheme();
    const variables = themeVariables(theme);
    const styles = createStyles(variables);
    const { state, actions: { loadAll } } = usePublications();
    const { navigate } = useNavigationActions();

    const [selectedStatus, setSelectedStatus] = useState<PublicationStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [paginatedData, setPaginatedData] = useState<PublicationsModel[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const currentPageRef = useRef(1);
    const currentTimeRef = useRef(moment().format('h:mm A'));

    const searchRef = useRef('');
    const timeoutRef = useRef<NodeJS.Timeout>(null);

    const MemoizedPublicationCard = React.memo(PublicationCard);

    const loadPublications = useCallback(async () => {
        setRefreshing(true);
        try {
            const timer = setInterval(() => currentTimeRef.current = moment().format('h:mm A'), 60000);
            await loadAll();
            clearInterval(timer);
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    }, [loadAll]);

    useEffect(() => {
        loadPublications();
    }, [loadPublications]);

        useDrawerBackHandler();

    const filtered = useMemo(() =>
            state.all.publications.filter((pub: PublicationsModel) => {
                const matchStatus = selectedStatus === 'all' || pub.status === selectedStatus;
                const matchQuery = !searchQuery ||
                pub.commonNoun.toLowerCase().includes(searchQuery) ||
                pub.description.toLowerCase().includes(searchQuery);

                return matchStatus && matchQuery;
            }),
        [state.all.publications, selectedStatus, searchQuery]
    );

    // PAGINATION LOGIC (from filtered publications)
    useEffect(() => {
        // When filters change, reset pagination
        setPaginatedData(filtered.slice(0, PAGE_SIZE));
        currentPageRef.current = 1;
        setHasMore(filtered.length > PAGE_SIZE);
    }, [filtered]);

    const handleSearch = (text: string) => {
        searchRef.current = text.toLowerCase().trim();

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setSearchQuery(searchRef.current);
        }, 300);
    };

        const loadMore = () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        // Using setTimeout to prevent blocking the UI thread and allow the loading footer to render.
        setTimeout(() => {
            const currentLength = paginatedData.length;
            const newItems = filtered.slice(currentLength, currentLength + PAGE_SIZE);

            if (newItems.length > 0) {
                setPaginatedData(prevData => [...prevData, ...newItems]);
                currentPageRef.current += 1;
            }

            if (currentLength + newItems.length >= filtered.length) {
                setHasMore(false);
            }
            setIsLoading(false);
        }, 250);
    };

    const handlePress = useCallback((item: PublicationsModel) => {
        navigate('PublicationDetails', { publication: item });
        }, [navigate]);

    const renderPublicationItem = useCallback(({ item } : { item: PublicationsModel }) => (
  <MemoizedPublicationCard
    publication={item}
    onPress={() => handlePress(item) }
  />
), [handlePress, MemoizedPublicationCard]);

    const renderFooter = () => {
        if (!isLoading) return null;
        return <LoadingIndicator theme={theme} text="Cargando más publicaciones..." />;
    };

    if (state.all.isLoading && !refreshing && state.all.publications.length === 0) {
        return <LoadingIndicator theme={theme} text="Cargando publicaciones..." />;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusTabs
                statuses={statusOptions}
                active={selectedStatus}
                onSelect={setSelectedStatus}
                theme={theme}
            />

            <SearchBar
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Buscar publicaciones..."
                theme={theme}
            />

            <FlatList
                data={paginatedData}
                keyExtractor={item => item.recordId.toString()}
                renderItem={renderPublicationItem}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={loadPublications}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
                ListEmptyComponent={
                    <EmptyListComponent searchQuery={searchQuery} styles={styles} theme={theme} />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                removeClippedSubviews
                updateCellsBatchingPeriod={50}
                windowSize={11}
                initialNumToRender={PAGE_SIZE}
                maxToRenderPerBatch={PAGE_SIZE}
            />
        </View>
    );
};

export default PublicationScreen;
