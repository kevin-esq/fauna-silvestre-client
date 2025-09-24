import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar
} from 'react-native';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import 'moment/locale/es';

import { useAuth } from '../../contexts/auth.context';
import { Theme, useTheme } from '../../contexts/theme.context';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { useLocationInfo } from '../../hooks/use-location-info';
import { useHomeData } from '../../hooks/use-home-data.hook';

import FloatingActionButton from '../../components/ui/floating-action-button.component';
import { CatalogAnimalCard } from '../catalog/catalog-animals-screen';
import AnimalSearchableDropdown from '../../components/animal/animal-searchable-dropdown.component';
import {
  SkeletonLoader,
  StatCardSkeleton,
  AnimalCardSkeleton
} from '../../components/ui/skeleton-loader.component';

import { createStyles } from './home-screen.styles';
import {
  AnimalModelResponse,
  CommonNounResponse
} from '@/domain/models/animal.models';
import User from '@/domain/entities/user.entity';

moment.locale('es');

// ==================== COMPONENTES MEJORADOS ====================

const UserHeader = React.memo<{
  user: User | null;
  onLogout: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}>(({ user, onLogout, styles, theme }) => {
  const { city, state: stateLoc, loading: locLoading } = useLocationInfo();

  const currentHour = moment().hour();
  const getGreetingIcon = () => {
    if (currentHour < 12) return '🌅';
    if (currentHour < 18) return '☀️';
    return '🌙';
  };

  const getGreetingMessage = () => {
    if (currentHour < 12) return 'Buenos días';
    if (currentHour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <View
      style={[styles.headerGradient, { backgroundColor: theme.colors.primary }]}
    >
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <View style={styles.greetingSection}>
            <Text style={styles.greetingIcon}>{getGreetingIcon()}</Text>
            <View>
              <Text style={styles.greeting}>
                {getGreetingMessage()}, {user?.name || 'Usuario'}
              </Text>
              <Text style={styles.subGreeting}>
                Descubre la fauna de tu región
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
          >
            <Ionicons name="log-out-outline" style={styles.logoutIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.timeAndLocationContainer}>
          <View style={styles.infoChip}>
            <Ionicons
              name="time-outline"
              size={14}
              color={theme.colors.textOnPrimary}
            />
            <Text style={styles.infoChipText}>{moment().format('h:mm A')}</Text>
          </View>

          <View style={styles.infoChip}>
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.colors.textOnPrimary}
            />
            {locLoading ? (
              <SkeletonLoader width={80} height={14} borderRadius={4} />
            ) : (
              <Text style={styles.infoChipText} numberOfLines={1}>
                {city}, {stateLoc}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
});

const StatsSection = React.memo<{
  totalPublications: number;
  totalUsers: number;
  isLoading: boolean;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}>(({ totalPublications, totalUsers, isLoading, styles, theme }) => {
  if (isLoading) {
    return (
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Estadísticas en Vivo</Text>
        <View style={styles.statsContainer}>
          <StatCardSkeleton />
          <StatCardSkeleton />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Estadísticas en Vivo</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="camera" size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.statNumber}>
            {totalPublications.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Publicaciones</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="people" size={24} color={theme.colors.forest} />
          </View>
          <Text style={styles.statNumber}>{totalUsers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Usuarios Activos</Text>
        </View>
      </View>
    </View>
  );
});

const QuickActions = React.memo<{
  onAddPublication: () => void;
  onViewCatalog: () => void;
  onDownloadedCards: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}>(({ onAddPublication, onViewCatalog, onDownloadedCards, styles, theme }) => (
  <View style={styles.quickActionsSection}>
    <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity
        style={[styles.quickActionCard, styles.quickActionPrimary]}
        onPress={onAddPublication}
        activeOpacity={0.8}
      >
        <View style={styles.quickActionIcon}>
          <Ionicons
            name="camera"
            size={24}
            color={theme.colors.textOnPrimary}
          />
        </View>
        <Text style={styles.quickActionTitle}>Nueva Publicación</Text>
        <Text style={styles.quickActionSubtitle}>
          Comparte tu descubrimiento
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.quickActionCard, styles.quickActionSecondary]}
        onPress={onViewCatalog}
        activeOpacity={0.8}
      >
        <View style={styles.quickActionIcon}>
          <Ionicons name="library" size={24} color={theme.colors.forest} />
        </View>
        <Text style={[styles.quickActionTitle, { color: theme.colors.forest }]}>
          Explorar Catálogo
        </Text>
        <Text
          style={[styles.quickActionSubtitle, { color: theme.colors.forest }]}
        >
          Descubre especies
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.quickActionCard, styles.quickActionTertiary]}
        onPress={onDownloadedCards}
        activeOpacity={0.8}
      >
        <View style={styles.quickActionIcon}>
          <Ionicons
            name="file-tray-full"
            size={24}
            color={theme.colors.forest}
          />
        </View>
        <Text style={[styles.quickActionTitle, { color: theme.colors.forest }]}>
          Fichas Descargadas
        </Text>
        <Text
          style={[styles.quickActionSubtitle, { color: theme.colors.forest }]}
        >
          Ver fichas descargadas
        </Text>
      </TouchableOpacity>
    </View>
  </View>
));

const CatalogFilters = React.memo<{
  categories: CommonNounResponse[];
  selectedCategory: CommonNounResponse | null;
  onCategoryChange: (category: CommonNounResponse | null) => void;
  onDropdownToggle: (open: boolean) => void;
  isDropdownOpen: boolean;
  filteredAnimals: AnimalModelResponse[];
  showAllAnimals: boolean;
  onToggleShowAll: () => void;
  catalogLength: number;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}>(
  ({
    categories,
    selectedCategory,
    onCategoryChange,
    onDropdownToggle,
    isDropdownOpen,
    filteredAnimals,
    showAllAnimals,
    onToggleShowAll,
    catalogLength,
    theme,
    styles
  }) => (
    <View style={styles.filtersSection}>
      <View style={styles.filtersHeader}>
        <Text style={styles.sectionTitle}>Fauna Destacada</Text>
        <TouchableOpacity style={styles.filterToggle}>
          <Ionicons name="options" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.filterContainer,
          isDropdownOpen && styles.filterContainerOpen
        ]}
      >
        <AnimalSearchableDropdown
          options={categories}
          selectedValue={selectedCategory}
          onValueChange={onCategoryChange}
          placeholder="Filtrar por categoría..."
          theme={theme}
          onDropdownToggle={onDropdownToggle}
        />
      </View>

      <View style={styles.resultsInfo}>
        <View style={styles.resultsCount}>
          <Text style={styles.resultsNumber}>
            {selectedCategory &&
            selectedCategory.commonNoun !== 'Todas las categorías'
              ? filteredAnimals.length
              : catalogLength || 0}
          </Text>
          <Text style={styles.resultsLabel}>
            {selectedCategory &&
            selectedCategory.commonNoun !== 'Todas las categorías'
              ? `en "${selectedCategory.commonNoun}"`
              : 'especies registradas'}
          </Text>
        </View>

        {filteredAnimals.length > 5 && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={onToggleShowAll}
            activeOpacity={0.8}
          >
            <Text style={styles.toggleButtonText}>
              {showAllAnimals
                ? 'Ver menos'
                : `Ver todas (${filteredAnimals.length})`}
            </Text>
            <Ionicons
              name={showAllAnimals ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
);

const EmptyState = React.memo<{
  selectedCategory: CommonNounResponse | null;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}>(({ selectedCategory, styles, theme }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconContainer}>
      <Ionicons
        name="leaf-outline"
        size={64}
        color={theme.colors.placeholder}
      />
    </View>
    <Text style={styles.emptyStateTitle}>
      {selectedCategory &&
      selectedCategory.commonNoun !== 'Todas las categorías'
        ? 'Sin especies en esta categoría'
        : 'Catálogo en construcción'}
    </Text>
    <Text style={styles.emptyStateText}>
      {selectedCategory &&
      selectedCategory.commonNoun !== 'Todas las categorías'
        ? `No hay animales registrados en "${selectedCategory.commonNoun}"`
        : 'Sé el primero en contribuir al catálogo de fauna local'}
    </Text>
  </View>
));

const LoadingState = React.memo<{
  styles: ReturnType<typeof createStyles>;
}>(({ styles }) => (
  <View style={styles.loadingSection}>
    <Text style={styles.loadingTitle}>Cargando especies...</Text>
    <View style={styles.skeletonGrid}>
      {Array.from({ length: 4 }).map((_, index) => (
        <AnimalCardSkeleton key={index} />
      ))}
    </View>
  </View>
));

// ==================== COMPONENTE PRINCIPAL ====================

const HomeScreen: React.FC = React.memo(() => {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const { navigate, push } = useNavigationActions();
  const styles = createStyles(theme);

  const {
    state,
    actions,
    categories,
    filteredAnimals,
    animalsToShow,
    isLoading
  } = useHomeData();

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', onPress: signOut, style: 'destructive' }
      ],
      { cancelable: true }
    );
  }, [signOut]);

  const handleAddPublication = useCallback(() => {
    navigate('AddPublication' as never);
  }, [navigate]);

  const handleViewCatalog = useCallback(() => {
    navigate('Catalog');
  }, [navigate]);

  const handleDownloadedCards = useCallback(() => {
    push('DownloadedFiles');
  }, [push]);

  const handleAnimalPress = useCallback(
    (animal: AnimalModelResponse) => {
      navigate('AnimalDetails', { animal });
    },
    [navigate]
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
      return () => backHandler.remove();
    }, [])
  );

  const renderAnimalItem = useCallback(
    ({ item, index }: { item: AnimalModelResponse; index: number }) => (
      <View
        style={[
          styles.animalCardWrapper,
          index % 2 === 0 ? styles.animalCardLeft : styles.animalCardRight
        ]}
      >
        <CatalogAnimalCard
          animal={item}
          onPress={() => handleAnimalPress(item)}
          theme={theme}
          index={index}
          viewMode="grid"
        />
      </View>
    ),
    [handleAnimalPress, theme, styles]
  );

  const keyExtractor = useCallback(
    (item: AnimalModelResponse) => item.catalogId.toString(),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={actions.refreshData}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <UserHeader
          user={user}
          onLogout={handleLogout}
          styles={styles}
          theme={theme}
        />

        <StatsSection
          totalPublications={state.totalPublications}
          totalUsers={state.totalUsers}
          isLoading={isLoading}
          styles={styles}
          theme={theme}
        />

        <QuickActions
          onAddPublication={handleAddPublication}
          onViewCatalog={handleViewCatalog}
          onDownloadedCards={handleDownloadedCards}
          styles={styles}
          theme={theme}
        />

        <CatalogFilters
          categories={categories}
          selectedCategory={state.selectedCategory}
          onCategoryChange={actions.setSelectedCategory}
          onDropdownToggle={actions.setIsDropdownOpen}
          isDropdownOpen={state.isDropdownOpen}
          filteredAnimals={filteredAnimals}
          showAllAnimals={state.showAllAnimals}
          onToggleShowAll={actions.handleToggleShowAll}
          catalogLength={filteredAnimals.length}
          theme={theme}
          styles={styles}
        />

        {isLoading && <LoadingState styles={styles} />}

        {!isLoading && animalsToShow.length === 0 && (
          <EmptyState
            selectedCategory={state.selectedCategory}
            styles={styles}
            theme={theme}
          />
        )}

        {!isLoading && animalsToShow.length > 0 && (
          <View style={styles.animalsGrid}>
            <FlatList
              data={animalsToShow}
              keyExtractor={keyExtractor}
              renderItem={renderAnimalItem}
              numColumns={2}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.animalsContainer}
              columnWrapperStyle={styles.animalsRow}
              initialNumToRender={6}
              maxToRenderPerBatch={4}
              windowSize={8}
              removeClippedSubviews={true}
            />
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <FloatingActionButton
        onPress={handleAddPublication}
        icon={
          <Ionicons
            name="camera-outline"
            size={24}
            color={theme.colors.textOnPrimary}
          />
        }
        accessibilityLabel="Crear nueva publicación"
      />
    </SafeAreaView>
  );
});

// Display names
UserHeader.displayName = 'UserHeader';
StatsSection.displayName = 'StatsSection';
QuickActions.displayName = 'QuickActions';
CatalogFilters.displayName = 'CatalogFilters';
EmptyState.displayName = 'EmptyState';
LoadingState.displayName = 'LoadingState';
HomeScreen.displayName = 'HomeScreen';

export default HomeScreen;
