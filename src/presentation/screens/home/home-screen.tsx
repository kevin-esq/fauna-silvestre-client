import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/auth.context';
import { Theme, useTheme } from '../../contexts/theme.context';
import { useDraftContext } from '../../contexts/draft.context';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { useLocationInfo } from '../../hooks/catalog/use-location-info';
import { useHomeData } from '../../hooks/publication/use-home-data.hook';

import { AnimalCardVariant } from '../../components/animal/animal-card-variants.component';
import { useCatalogViewPreferences } from '../../contexts/catalog-view-preferences.context';
import AnimalSearchableDropdown from '../../components/animal/animal-searchable-dropdown.component';
import CustomModal from '../../components/ui/custom-modal.component';
import { OfflineBanner } from '../../components/ui/offline-banner.component';
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
import { useCurrentTime } from '@/presentation/hooks/common/use-current-time.hook';
import { useDoubleBackExit } from '@/presentation/hooks/common/use-double-back-exit.hook';

const UserHeader = React.memo<{
  user: User | null;
  onLogout: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}>(({ user, onLogout, styles, theme }) => {
  const { city, state: stateLoc, loading: locLoading } = useLocationInfo();
  const time = useCurrentTime();

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return '🌅';
    if (hour >= 12 && hour < 19) return '☀️';
    return '🌙';
  };

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 19) return 'Buenas tardes';
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
            <View style={styles.greetingTextContainer}>
              <Text style={styles.greeting}>
                {getGreetingMessage()}, {user?.name || 'Usuario'} 👋
              </Text>
              <Text style={styles.subGreeting}>
                Descubre la fauna de tu región
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            accessibilityHint="Cierra tu sesión actual"
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
            <Text style={styles.infoChipText}>{time}</Text>
          </View>

          <View style={styles.infoChip}>
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.colors.textOnPrimary}
            />
            {locLoading ? (
              <SkeletonLoader width={80} height={14} borderRadius={7} />
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
          <View
            style={[
              styles.statIconContainer,
              { backgroundColor: theme.colors.primary + '15' }
            ]}
          >
            <Ionicons name="camera" size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.statNumber}>
            {totalPublications.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Publicaciones</Text>
        </View>

        <View style={styles.statCard}>
          <View
            style={[
              styles.statIconContainer,
              { backgroundColor: theme.colors.forest + '15' }
            ]}
          >
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
  onDrafts: () => void;
  draftsCount: number;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}>(
  ({
    onAddPublication,
    onViewCatalog,
    onDownloadedCards,
    onDrafts,
    draftsCount,
    styles,
    theme
  }) => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={[styles.quickActionCard, styles.quickActionPrimary]}
          onPress={onAddPublication}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Nueva publicación"
        >
          <View style={styles.quickActionIcon}>
            <Ionicons
              name="camera"
              size={24}
              color={theme.colors.textOnPrimary}
            />
          </View>
          <View style={styles.quickActionContent}>
            <Text style={styles.quickActionTitle}>Nueva Publicación</Text>
            <Text style={styles.quickActionSubtitle}>
              Comparte tu descubrimiento
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textOnPrimary}
            style={{ opacity: 0.7 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionCard, styles.quickActionSecondary]}
          onPress={onViewCatalog}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Explorar catálogo"
        >
          <View
            style={[
              styles.quickActionIcon,
              { backgroundColor: theme.colors.forest + '20' }
            ]}
          >
            <Ionicons name="library" size={24} color={theme.colors.forest} />
          </View>
          <View style={styles.quickActionContent}>
            <Text
              style={[styles.quickActionTitle, { color: theme.colors.forest }]}
            >
              Explorar Catálogo
            </Text>
            <Text
              style={[
                styles.quickActionSubtitle,
                { color: theme.colors.forest }
              ]}
            >
              Descubre especies
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.forest}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionCard, styles.quickActionTertiary]}
          onPress={onDownloadedCards}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Fichas descargadas"
        >
          <View
            style={[
              styles.quickActionIcon,
              { backgroundColor: theme.colors.info + '20' }
            ]}
          >
            <Ionicons
              name="file-tray-full"
              size={24}
              color={theme.colors.info}
            />
          </View>
          <View style={styles.quickActionContent}>
            <Text
              style={[styles.quickActionTitle, { color: theme.colors.info }]}
            >
              Fichas Descargadas
            </Text>
            <Text
              style={[styles.quickActionSubtitle, { color: theme.colors.info }]}
            >
              Ver fichas guardadas
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.info}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionCard, styles.quickActionTertiary]}
          onPress={onDrafts}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Mis borradores"
        >
          <View
            style={[
              styles.quickActionIcon,
              { backgroundColor: theme.colors.water + '20' }
            ]}
          >
            <Ionicons name="documents" size={24} color={theme.colors.water} />
          </View>
          <View style={styles.quickActionContent}>
            <Text
              style={[styles.quickActionTitle, { color: theme.colors.water }]}
            >
              Mis Borradores
            </Text>
            <Text
              style={[
                styles.quickActionSubtitle,
                { color: theme.colors.water }
              ]}
            >
              {draftsCount > 0
                ? `${draftsCount} borrador${draftsCount > 1 ? 'es' : ''}`
                : 'Sin borradores'}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.water}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
);

const CatalogFilters = React.memo<{
  categories: CommonNounResponse[];
  selectedCategory: CommonNounResponse | null;
  onCategoryChange: (category: CommonNounResponse | null) => void;
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
          placeholder="Filtrar por clase..."
          theme={theme}
        />
      </View>

      <View style={styles.resultsInfo}>
        <View style={styles.resultsCount}>
          <Text style={styles.resultsNumber}>
            {selectedCategory &&
            selectedCategory.commonNoun !== 'Todas las clases'
              ? filteredAnimals.length
              : catalogLength || 0}
          </Text>
          <Text style={styles.resultsLabel}>
            {selectedCategory &&
            selectedCategory.commonNoun !== 'Todas las clases'
              ? `en "${selectedCategory.commonNoun}"`
              : 'especies registradas'}
          </Text>
        </View>

        {filteredAnimals.length > 4 && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={onToggleShowAll}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={
              showAllAnimals ? 'Ver menos especies' : 'Ver todas las especies'
            }
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
      {selectedCategory && selectedCategory.commonNoun !== 'Todas las clases'
        ? 'Sin especies en esta clase'
        : 'Catálogo en construcción'}
    </Text>
    <Text style={styles.emptyStateText}>
      {selectedCategory && selectedCategory.commonNoun !== 'Todas las Clases'
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
      {[...Array(4)].map((_, index) => (
        <AnimalCardSkeleton key={index} />
      ))}
    </View>
  </View>
));

const HomeScreen: React.FC = React.memo(() => {
  const { theme, colors } = useTheme();
  const { user, signOut } = useAuth();
  const { push, navigateAndReset } = useNavigationActions();
  const { drafts } = useDraftContext();
  const viewPrefs = useCatalogViewPreferences();
  const styles = createStyles(theme);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const {
    state,
    actions,
    categories,
    filteredAnimals,
    animalsToShow,
    isLoading
  } = useHomeData();

  useDoubleBackExit({
    exitMessage: 'Presiona de nuevo para salir de la aplicación',
    timeout: 2000
  });

  const handleLogout = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const confirmLogout = useCallback(() => {
    setShowLogoutModal(false);
    signOut();
  }, [signOut]);

  const handleAddPublication = useCallback(() => {
    navigateAndReset('AddPublication' as never);
  }, [navigateAndReset]);

  const handleViewCatalog = useCallback(() => {
    push('Catalog');
  }, [push]);

  const handleDownloadedCards = useCallback(() => {
    push('DownloadedFiles');
  }, [push]);

  const handleDrafts = useCallback(() => {
    push('Drafts');
  }, [push]);

  const handleAnimalPress = useCallback(
    (animal: AnimalModelResponse) => {
      push('AnimalDetails', { animal });
    },
    [push]
  );

  const renderAnimalItem = useCallback(
    ({ item }: { item: AnimalModelResponse }) => (
      <AnimalCardVariant
        animal={item}
        onPress={() => handleAnimalPress(item)}
        layout={viewPrefs.layout}
        density={viewPrefs.density}
        showImages={viewPrefs.showImages}
        highlightStatus={viewPrefs.highlightStatus}
        showCategory={viewPrefs.showCategory}
        showSpecies={viewPrefs.showSpecies}
        showHabitat={viewPrefs.showHabitat}
        showDescription={viewPrefs.showDescription}
        reducedMotion={viewPrefs.reducedMotion}
      />
    ),
    [handleAnimalPress, viewPrefs]
  );

  const keyExtractor = useCallback(
    (item: AnimalModelResponse) => item.catalogId.toString(),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />
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
          onDrafts={handleDrafts}
          draftsCount={drafts.length}
          styles={styles}
          theme={theme}
        />

        <CatalogFilters
          categories={categories}
          selectedCategory={state.selectedCategory}
          onCategoryChange={actions.setSelectedCategory}
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
              numColumns={viewPrefs.layout === 'grid' ? 2 : 1}
              key={`home-${viewPrefs.layout}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.animalsContainer}
              columnWrapperStyle={
                viewPrefs.layout === 'grid' ? styles.animalsRow : undefined
              }
              initialNumToRender={6}
              maxToRenderPerBatch={4}
              windowSize={8}
              removeClippedSubviews={true}
            />
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <CustomModal
        isVisible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Cerrar Sesión"
        size="small"
        type="confirmation"
        icon={
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.error + '15',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons name="log-out-outline" size={32} color={colors.error} />
          </View>
        }
        description="¿Estás seguro de que quieres cerrar sesión?"
        centered
        showFooter
        footerAlignment="space-between"
        buttons={[
          {
            label: 'Cancelar',
            onPress: () => setShowLogoutModal(false),
            variant: 'outline'
          },
          {
            label: 'Cerrar sesión',
            onPress: confirmLogout,
            variant: 'danger'
          }
        ]}
      />
    </SafeAreaView>
  );
});

UserHeader.displayName = 'UserHeader';
StatsSection.displayName = 'StatsSection';
QuickActions.displayName = 'QuickActions';
CatalogFilters.displayName = 'CatalogFilters';
EmptyState.displayName = 'EmptyState';
LoadingState.displayName = 'LoadingState';
HomeScreen.displayName = 'HomeScreen';

export default HomeScreen;
