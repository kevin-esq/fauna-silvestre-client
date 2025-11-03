import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/theme.context';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { useUsers } from '../../hooks/users/use-users.hook';
import { UserData } from '@/domain/models/user.models';
import { SkeletonLoader } from '../../components/ui/skeleton-loader.component';
import SearchBar from '../../components/ui/search-bar.component';
import { UserViewSelector } from '../../components/ui/user-view-selector.component';
import { UserAvatar } from '../../components/ui/user-avatar.component';
import { useUserViewPreferences } from '../../contexts/user-view-preferences.context';
import { createStyles } from './user-list-screen.styles.ts';
import { useBackHandler } from '@/presentation/hooks/common/use-back-handler.hook';
import { addEventListener, AppEvents } from '@/shared/utils/event-emitter';

type UserFilter = 'active' | 'blocked';

interface UserListItemProps {
  user: UserData;
  onPress: (user: UserData) => void;
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useTheme>['theme'];
  isDeactivated?: boolean;
  showInitials?: boolean;
  showUserName?: boolean;
  showEmail?: boolean;
  showLocation?: boolean;
}

const UserListItem = React.memo<UserListItemProps>(
  ({
    user,
    onPress,
    styles,
    theme,
    isDeactivated = false,
    showInitials = true,
    showUserName = true,
    showEmail = true,
    showLocation = true
  }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handlePress = useCallback(() => {
      onPress(user);
    }, [user, onPress]);

    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        activeOpacity={0.9}
        style={[
          styles.userCard,
          isPressed && styles.userCardPressed,
          isDeactivated && styles.userCardDeactivated
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Ver detalles de ${user.name} ${user.lastName}`}
      >
        <View style={styles.userAvatarContainer}>
          <UserAvatar
            name={user.name}
            lastName={user.lastName}
            size={56}
            showInitials={showInitials}
            isDeactivated={isDeactivated}
            theme={theme}
          />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {user.name} {user.lastName}
          </Text>
          {showUserName && (
            <View style={styles.userMetaContainer}>
              <View style={styles.userMetaItem}>
                <Ionicons
                  name="at-outline"
                  size={14}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.userMetaText} numberOfLines={1}>
                  {user.userName}
                </Text>
              </View>
            </View>
          )}
          {showEmail && (
            <View style={styles.userMetaContainer}>
              <View style={styles.userMetaItem}>
                <Ionicons
                  name="mail-outline"
                  size={14}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.userMetaText} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
            </View>
          )}
          {showLocation && (
            <View style={styles.userLocationContainer}>
              <Ionicons
                name="location-outline"
                size={14}
                color={theme.colors.earth}
              />
              <Text style={styles.userLocationText}>{user.locality}</Text>
            </View>
          )}
        </View>

        <View style={styles.userActionContainer}>
          <Ionicons
            name="chevron-forward"
            size={22}
            color={theme.colors.forest}
          />
        </View>
      </TouchableOpacity>
    );
  }
);

interface UserListSkeletonProps {
  styles: ReturnType<typeof createStyles>;
}

const UserListSkeleton = React.memo<UserListSkeletonProps>(({ styles }) => {
  return (
    <View style={styles.skeletonCard}>
      <SkeletonLoader width={56} height={56} borderRadius={28} />
      <View style={styles.skeletonInfo}>
        <SkeletonLoader width="70%" height={18} borderRadius={4} />
        <SkeletonLoader
          width="50%"
          height={14}
          borderRadius={4}
          style={{ marginTop: 8 }}
        />
        <SkeletonLoader
          width="40%"
          height={12}
          borderRadius={4}
          style={{ marginTop: 6 }}
        />
      </View>
    </View>
  );
});

const UserListScreen: React.FC = () => {
  const { theme, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);
  const { push } = useNavigationActions();
  const [selectedFilter, setSelectedFilter] = useState<UserFilter>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const preferences = useUserViewPreferences();

  const {
    users,
    isLoading,
    isRefreshing,
    error,
    pagination,
    loadUsers,
    refreshUsers,
    setActiveFilter,
    activeFilter
  } = useUsers(1, 20, selectedFilter === 'active');

  useEffect(() => {
    const subscription = addEventListener(AppEvents.USER_BLOCKED, () => {
      console.log('🔄 Usuario bloqueado, recargando lista...');
      refreshUsers();
    });

    return () => {
      subscription.remove();
    };
  }, [refreshUsers]);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      if (query.startsWith('@')) {
        const userNameQuery = query.substring(1);
        filtered = filtered.filter(user => {
          const userName = user.userName.toLowerCase();
          return userName.includes(userNameQuery);
        });
      } else {
        filtered = filtered.filter(user => {
          const fullName = `${user.name} ${user.lastName}`.toLowerCase();
          const userName = user.userName.toLowerCase();
          const email = user.email.toLowerCase();
          const locality = user.locality?.toLowerCase() || '';

          return (
            fullName.includes(query) ||
            userName.includes(query) ||
            email.includes(query) ||
            locality.includes(query)
          );
        });
      }
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (preferences.sortBy) {
        case 'name-asc':
          return `${a.name} ${a.lastName}`.localeCompare(
            `${b.name} ${b.lastName}`,
            'es'
          );
        case 'name-desc':
          return `${b.name} ${b.lastName}`.localeCompare(
            `${a.name} ${a.lastName}`,
            'es'
          );
        case 'email-asc':
          return a.email.localeCompare(b.email, 'es');
        case 'email-desc':
          return b.email.localeCompare(a.email, 'es');
        case 'location-asc':
          return (a.locality || '').localeCompare(b.locality || '', 'es');
        case 'location-desc':
          return (b.locality || '').localeCompare(a.locality || '', 'es');
        case 'date-asc':
        case 'date-desc':
          return 0;
        default:
          return 0;
      }
    });

    return sorted;
  }, [users, searchQuery, preferences.sortBy]);

  const userCounts = useMemo(
    () => ({
      active: activeFilter ? pagination?.total || users.length : 0,
      blocked: !activeFilter ? pagination?.total || users.length : 0
    }),
    [users.length, pagination?.total, activeFilter]
  );

  const handleUserPress = useCallback(
    (user: UserData) => {
      push('UserDetails', { user, isBlocked: selectedFilter === 'blocked' });
    },
    [push, selectedFilter]
  );

  const handleLoadMore = useCallback(() => {
    if (pagination?.hasNext && !isLoading) {
      loadUsers(pagination.page + 1, pagination.size);
    }
  }, [pagination, isLoading, loadUsers]);

  const renderItem = useCallback(
    ({ item }: { item: UserData }) => {
      if (preferences.layout === 'list') {
        return (
          <TouchableOpacity
            onPress={() => handleUserPress(item)}
            style={[styles.userCard, { paddingVertical: spacing.small }]}
            activeOpacity={0.7}
          >
            <UserAvatar
              name={item.name}
              lastName={item.lastName}
              size={40}
              showInitials={preferences.showInitials}
              isDeactivated={selectedFilter === 'blocked'}
              theme={theme}
            />
            <View style={{ flex: 1, marginLeft: spacing.medium }}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.name} {item.lastName}
              </Text>
              {preferences.showEmail && (
                <Text style={styles.userMetaText} numberOfLines={1}>
                  {item.email}
                </Text>
              )}
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.forest}
            />
          </TouchableOpacity>
        );
      }

      if (preferences.layout === 'grid') {
        return (
          <TouchableOpacity
            onPress={() => handleUserPress(item)}
            style={[
              styles.userCard,
              {
                width: '48%',
                marginHorizontal: '1%',
                flexDirection: 'column',
                alignItems: 'center',
                paddingVertical: spacing.large
              }
            ]}
            activeOpacity={0.7}
          >
            <UserAvatar
              name={item.name}
              lastName={item.lastName}
              size={64}
              showInitials={preferences.showInitials}
              isDeactivated={selectedFilter === 'blocked'}
              theme={theme}
            />
            <Text
              style={[
                styles.userName,
                { marginTop: spacing.small, textAlign: 'center' }
              ]}
              numberOfLines={2}
            >
              {item.name} {item.lastName}
            </Text>
            {preferences.showEmail && (
              <Text
                style={[
                  styles.userMetaText,
                  { textAlign: 'center', marginTop: spacing.tiny }
                ]}
                numberOfLines={1}
              >
                {item.email}
              </Text>
            )}
          </TouchableOpacity>
        );
      }

      return (
        <UserListItem
          user={item}
          onPress={handleUserPress}
          styles={styles}
          theme={theme}
          isDeactivated={selectedFilter === 'blocked'}
          showInitials={preferences.showInitials}
          showUserName={preferences.showUserName}
          showEmail={preferences.showEmail}
          showLocation={preferences.showLocation}
        />
      );
    },
    [handleUserPress, styles, theme, selectedFilter, preferences, spacing]
  );

  const renderSkeletons = useCallback(() => {
    if (!isLoading) return null;
    return (
      <>
        {[...Array(5)].map((_, i) => (
          <UserListSkeleton key={i} styles={styles} />
        ))}
      </>
    );
  }, [isLoading, styles]);

  const { handleBackPress } = useBackHandler({
    enableSafeMode: true
  });

  const renderFooter = useCallback(() => {
    if (!isLoading || users.length === 0) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.colors.forest} />
        <Text style={styles.loadingText}>Cargando más usuarios...</Text>
      </View>
    );
  }, [isLoading, users.length, theme.colors.forest, styles]);

  interface EmptyStateProps {
    styles: ReturnType<typeof createStyles>;
    theme: ReturnType<typeof useTheme>['theme'];
    onRefresh: () => void;
    hasSearch: boolean;
  }

  const EmptyState = React.memo<EmptyStateProps>(
    ({ styles, theme, onRefresh, hasSearch }) => (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name={hasSearch ? 'search-outline' : 'people-outline'}
            size={80}
            color={theme.colors.forest + '80'}
          />
        </View>
        <Text style={styles.emptyTitle}>
          {hasSearch ? 'Sin resultados' : 'No hay usuarios registrados'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {hasSearch
            ? 'No encontramos usuarios con ese criterio de búsqueda'
            : 'Los usuarios que se registren en la aplicación aparecerán aquí'}
        </Text>
        {!hasSearch && (
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={onRefresh}
            accessibilityRole="button"
            accessibilityLabel="Actualizar lista"
          >
            <Ionicons
              name="refresh"
              size={20}
              color={theme.colors.textOnPrimary}
            />
            <Text style={styles.emptyButtonText}>Actualizar</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  );

  const handleFilterChange = useCallback(
    (filter: UserFilter) => {
      setSelectedFilter(filter);
      const isActive = filter === 'active';
      setActiveFilter(isActive);
      loadUsers(1, 20, isActive);
    },
    [setActiveFilter, loadUsers]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.forest} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons
                name="account-group"
                size={28}
                color={theme.colors.forest}
              />
              <Text style={styles.headerTitle}>Usuarios Registrados</Text>
            </View>
            {pagination && (
              <Text style={styles.headerSubtitle}>
                {pagination.total}{' '}
                {pagination.total === 1 ? 'usuario' : 'usuarios'} • Página{' '}
                {pagination.page} de{' '}
                {Math.ceil(pagination.total / pagination.size)}
              </Text>
            )}
          </View>

          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.filterContainer}>
          {selectedFilter === 'active' ? (
            <TouchableOpacity
              style={[styles.filterTab, styles.filterTabActiveGreen]}
              onPress={() => handleFilterChange('blocked')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Cambiar a usuarios bloqueados"
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={theme.colors.textOnPrimary}
              />
              <Text style={[styles.filterTabText, styles.filterTabTextActive]}>
                Activos
              </Text>
              <View style={[styles.filterBadge, styles.filterBadgeActive]}>
                <Text
                  style={[styles.filterBadgeText, styles.filterBadgeTextActive]}
                >
                  {userCounts.active}
                </Text>
              </View>
              <Ionicons
                name="swap-horizontal"
                size={16}
                color={theme.colors.textOnPrimary}
                style={{ marginLeft: spacing.tiny }}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.filterTab, styles.filterTabActiveRed]}
              onPress={() => handleFilterChange('active')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Cambiar a usuarios activos"
            >
              <Ionicons
                name="ban"
                size={18}
                color={theme.colors.textOnPrimary}
              />
              <Text style={[styles.filterTabText, styles.filterTabTextActive]}>
                Bloqueados
              </Text>
              <View style={[styles.filterBadge, styles.filterBadgeActive]}>
                <Text
                  style={[styles.filterBadgeText, styles.filterBadgeTextActive]}
                >
                  {userCounts.blocked}
                </Text>
              </View>
              <Ionicons
                name="swap-horizontal"
                size={16}
                color={theme.colors.textOnPrimary}
                style={{ marginLeft: spacing.tiny }}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBarWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar usuarios..."
              onClear={() => setSearchQuery('')}
              theme={theme}
            />
          </View>
          <UserViewSelector minimal />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle"
              size={20}
              color={theme.colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    ),
    [
      pagination,
      error,
      theme,
      styles,
      handleBackPress,
      selectedFilter,
      userCounts,
      handleFilterChange,
      searchQuery,
      spacing
    ]
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <FlatList
        data={filteredUsers}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.userName}-${index}`}
        style={styles.container}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        numColumns={preferences.layout === 'grid' ? 2 : 1}
        key={preferences.layout}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshUsers}
            colors={[theme.colors.forest]}
            tintColor={theme.colors.forest}
            progressBackgroundColor={theme.colors.background}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.skeletonContainer}>{renderSkeletons()}</View>
          ) : (
            <EmptyState
              styles={styles}
              theme={theme}
              onRefresh={refreshUsers}
              hasSearch={searchQuery.trim().length > 0}
            />
          )
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        extraData={selectedFilter}
      />
    </SafeAreaView>
  );
};

UserListItem.displayName = 'UserListItem';
UserListSkeleton.displayName = 'UserListSkeleton';
UserListScreen.displayName = 'UserListScreen';

export default UserListScreen;
