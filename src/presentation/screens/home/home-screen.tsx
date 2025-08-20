import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { createStyles } from './home-screen.styles';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { usePublications } from '../../contexts/publication.context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import 'moment/locale/es';
import moment from 'moment';
import FloatingActionButton from '../../components/ui/floating-action-button.component';
import { useAuth } from '../../contexts/auth.context';
import { useTheme, themeVariables } from '../../contexts/theme.context';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useCatalog } from '../../contexts/catalog.context';
import AnimalCard from '../../components/animal/animal-card.component';
import AnimalSearchableDropdown from '../../components/animal/animal-searchable-dropdown.component';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useLocationInfo } from '../../hooks/use-location-info';
import { AnimalModel } from '@/domain/models/animal.models';

moment.locale('es');

const HomeScreen: React.FC = React.memo(() => {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const styles = createStyles(theme);
  const { navigate } = useNavigationActions();
  const { state, actions, } = usePublications();
  const [totalEspecies, setTotalEspecies] = useState(0);
  const [totalPublications, setTotalPublications] = useState<number>(0);
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const { catalog, isLoading: isCatalogLoading } = useCatalog();
  const { city, state: stateLoc, country, loading: locLoading } = useLocationInfo();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAllAnimals, setShowAllAnimals] = useState(false);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(catalog.map(animal => animal.category))].filter(Boolean);
    return ['Todas las categorías', ...uniqueCategories] as const;
  }, [catalog]);

  const filteredAnimals = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'Todas las categorías') {
      return catalog;
    }
    return catalog.filter(animal => animal.category === selectedCategory);
  }, [catalog, selectedCategory]);

  const animalsToShow = useMemo(() => {
    return showAllAnimals ? filteredAnimals : filteredAnimals.slice(0, 5);
  }, [filteredAnimals, showAllAnimals]);

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      actions.loadCounts();
      hasLoaded.current = true;
    }
  }, [actions]);

  useEffect(() => {
    setTotalPublications(state.counts.records);
    setTotalEspecies(state.counts.users);
    setTotalPublications(state.counts.records);
  }, [state.counts]);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, cerrar', onPress: signOut, style: 'destructive' },
      ],
      { cancelable: true }
    );
  };

  const handleAddPublication = () => {
    navigate('AddPublication' as never);
  };

  const handleToggleShowAll = () => {
    setShowAllAnimals(!showAllAnimals);
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => backHandler.remove();
    }, [])
  );


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.greeting}>¡Hola 👋, {user?.name || 'Usuario'}!</Text>
              <Text style={styles.subGreeting}>Qué bueno verte de nuevo.</Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color={variables['--text-secondary']} />
              <Text accessibilityLabel="Salir" style={styles.logoutButtonText}>Salir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeAndLocationContainer}>
            <Ionicons name="time-outline" size={16} color={variables['--text-secondary']} />
            <Text style={styles.timeAndLocationText}>{moment().format('h:mm A')}</Text>
            <View style={styles.separator} />
            <Ionicons name="location-outline" size={16} color={variables['--text-secondary']} />
            {locLoading ? (
              <ActivityIndicator
                size="small"
                color={variables['--text-secondary']}
                style={styles.activityIndicator}
              />
            ) : (
              <Text style={styles.timeAndLocationText}>
                {city}, {stateLoc}, {country}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statCard}>
              <Text style={styles.statNumber}>{totalPublications}</Text>
              <Text style={styles.statLabel}>Publicaciones</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard}>
              <Text style={styles.statNumber}>{totalEspecies}</Text>
              <Text style={styles.statLabel}>Especies</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.imageSection}>

          <Text style={styles.sectionTitle}>Catálogo de Animales</Text>

          <View style={styles.filterContainer}>
            <AnimalSearchableDropdown
              options={categories}
              selectedValue={selectedCategory}
              onValueChange={setSelectedCategory}
              placeholder="Filtrar por categoría..."
              theme={theme}
            />
          </View>

          <View style={styles.resultsInfo}>
            <Text style={styles.resultsText}>
              {selectedCategory && selectedCategory !== 'Todas las categorías'
                ? `${filteredAnimals.length} ${filteredAnimals.length === 1 ? 'animal' : 'animales'} en "${selectedCategory}"`
                : `${catalog.length} ${catalog.length === 1 ? 'animal' : 'animales'} en total`
              }
            </Text>
            {filteredAnimals.length > 5 && (
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={handleToggleShowAll}
              >
                <Text style={styles.toggleButtonText}>
                  {showAllAnimals ? 'Ver menos' : `Ver todos (${filteredAnimals.length})`}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {isCatalogLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={variables['--primary']} />
              <Text style={styles.loadingText}>Cargando animales...</Text>
            </View>
          ) : animalsToShow.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={variables['--text-secondary']} />
              <Text style={styles.emptyStateTitle}>No se encontraron animales</Text>
              <Text style={styles.emptyStateText}>
                {selectedCategory && selectedCategory !== 'Todas las categorías'
                  ? `No hay animales en la categoría "${selectedCategory}"`
                  : 'No hay animales disponibles en el catálogo'
                }
              </Text>
            </View>
          ) : (
            <FlatList
              data={animalsToShow}
              keyExtractor={(item) => item.specie}
              renderItem={({ item }) => {
                const mappedAnimal: AnimalModel = {
                  id: item.specie,
                  commonName: item.commonNoun,
                  scientificName: item.specie,
                  status: 'catalogado',
                  statusColor: '#4caf50',
                  image: item.image,
                  catalogId: Number(item.catalogId),
                };

                return (
                  <AnimalCard
                    key={mappedAnimal.id}
                    animal={mappedAnimal}
                    onPress={() => {
                      navigate('AnimalDetails', { animal: item });
                    }}
                  />
                );
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}
            />
          )}
        </View>
      </ScrollView>

      <FloatingActionButton
        onPress={handleAddPublication}
        icon={<Ionicons name="camera-outline" size={24} color={theme.colors.textOnPrimary} />}
      />
    </SafeAreaView>
  );
});

export default HomeScreen;