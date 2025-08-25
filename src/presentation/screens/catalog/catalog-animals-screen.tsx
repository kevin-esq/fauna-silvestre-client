import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { View, FlatList, Text, RefreshControl } from 'react-native';
import { useTheme, themeVariables } from '../../contexts/theme.context';
import SearchBar from '../../components/ui/search-bar.component';
import LoadingIndicator from '../../components/ui/loading-indicator.component';
import { useCatalog } from '../../contexts/catalog.context';
import AnimalCard from '../../components/animal/animal-card.component'; // ya tienes este componente
import { createStyles } from './catalog-animals-screen.styles';
import Animal from '../../../domain/entities/animal.entity';
import { AnimalModel } from '../../../domain/models/animal.models';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { Theme } from '../../contexts/theme.context';

const PAGE_SIZE = 10;

const EmptyList = React.memo(
  ({ searchQuery, theme }: { searchQuery: string; theme: Theme }) => {
    const styles = createStyles(themeVariables(theme));
    const message = searchQuery
      ? 'Sin resultados'
      : 'No hay animales en el catálogo.';

    return (
      <View style={styles.centered}>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          {message}
        </Text>
      </View>
    );
  }
);

const CatalogAnimalsScreen = () => {
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);
  const { navigate } = useNavigationActions();

  const { catalog, isLoading, fetchCatalog } = useCatalog();

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput.trim().toLowerCase());
    }, 300);
    timeoutRef.current = handler;
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [searchInput]);

  // filter
  const filteredCatalog = useMemo(() => {
    if (!searchQuery) return catalog;
    return catalog.filter(animal => {
      const query = searchQuery.toLowerCase();
      return (
        animal.commonNoun.toLowerCase().includes(query) ||
        animal.specie.toLowerCase().includes(query)
      );
    });
  }, [catalog, searchQuery]);

  const renderAnimalItem = useCallback(
    ({ item }: { item: Animal }) => {
      const mappedAnimal: AnimalModel = {
        id: item.specie,
        commonName: item.commonNoun,
        catalogId: Number(item.catalogId),
        scientificName: item.specie,
        status: 'catalogado',
        statusColor: '#4caf50',
        image: item.image
      };

      const handlePress = () => {
        navigate('AnimalDetails', { animal: item });
      };

      return <AnimalCard animal={mappedAnimal} onPress={handlePress} />;
    },
    [navigate]
  );

  if (isLoading && catalog.length === 0) {
    return <LoadingIndicator theme={theme} text="Cargando animales..." />;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <SearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Buscar por nombre o especie..."
        theme={theme}
        onClear={() => setSearchInput('')}
      />

      <FlatList
        data={filteredCatalog}
        renderItem={renderAnimalItem}
        keyExtractor={item => item.specie}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && searchQuery === ''}
            onRefresh={fetchCatalog}
            colors={[variables['--primary']]}
            tintColor={variables['--primary']}
          />
        }
        ListEmptyComponent={
          <EmptyList searchQuery={searchQuery} theme={theme} />
        }
        initialNumToRender={PAGE_SIZE}
        windowSize={11}
      />
    </View>
  );
};

export default CatalogAnimalsScreen;
