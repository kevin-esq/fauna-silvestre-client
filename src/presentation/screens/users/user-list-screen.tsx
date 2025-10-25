import React, { useCallback, useMemo, useState } from 'react';
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
import { useUsers } from '../../hooks/use-users.hook';
import { UserData } from '@/domain/models/user.models';
import { SkeletonLoader } from '../../components/ui/skeleton-loader.component';
import { createStyles } from './user-list-screen.styles.ts';
import { useBackHandler } from '@/presentation/hooks/use-back-handler.hook';

type UserFilter = 'active' | 'deactivated';

interface UserListItemProps {
  user: UserData;
  onPress: (user: UserData) => void;
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useTheme>['theme'];
  isDeactivated?: boolean;
}

const UserListItem = React.memo<UserListItemProps>(
  ({ user, onPress, styles, theme, isDeactivated = false }) => {
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
          <View
            style={[
              styles.userAvatar,
              isDeactivated && styles.userAvatarDeactivated
            ]}
          >
            <Ionicons
              name="person"
              size={28}
              color={theme.colors.textOnPrimary}
            />
          </View>
          <View
            style={[
              styles.userRoleBadge,
              isDeactivated && styles.userRoleBadgeDeactivated
            ]}
          >
            <Ionicons
              name={isDeactivated ? 'close-circle' : 'shield-checkmark'}
              size={12}
              color={isDeactivated ? theme.colors.warning : theme.colors.leaf}
            />
          </View>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {user.name} {user.lastName}
          </Text>
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
          <View style={styles.userLocationContainer}>
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.colors.earth}
            />
            <Text style={styles.userLocationText}>{user.locality}</Text>
          </View>
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
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);
  const { push } = useNavigationActions();
  const [selectedFilter, setSelectedFilter] = useState<UserFilter>('active');

  const {
    users,
    isLoading,
    isRefreshing,
    error,
    pagination,
    loadUsers,
    refreshUsers
  } = useUsers(1, 20);

  const filteredUsers = useMemo(() => {
    return users;
  }, [users]);

  const userCounts = useMemo(
    () => ({
      active: users.length,
      deactivated: 0
    }),
    [users]
  );

  const handleUserPress = useCallback(
    (user: UserData) => {
      push('UserDetails', { user });
    },
    [push]
  );

  const handleLoadMore = useCallback(() => {
    if (pagination?.hasNext && !isLoading) {
      loadUsers(pagination.page + 1, pagination.size);
    }
  }, [pagination, isLoading, loadUsers]);

  const renderItem = useCallback(
    ({ item }: { item: UserData }) => (
      <UserListItem
        user={item}
        onPress={handleUserPress}
        styles={styles}
        theme={theme}
        isDeactivated={false}
      />
    ),
    [handleUserPress, styles, theme]
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
  }

  const EmptyState = React.memo<EmptyStateProps>(
    ({ styles, theme, onRefresh }) => (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="people-outline"
            size={80}
            color={theme.colors.forest + '80'}
          />
        </View>
        <Text style={styles.emptyTitle}>No hay usuarios registrados</Text>
        <Text style={styles.emptySubtitle}>
          Los usuarios que se registren en la aplicación aparecerán aquí
        </Text>
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
      </View>
    )
  );

  const handleFilterChange = useCallback((filter: UserFilter) => {
    setSelectedFilter(filter);
  }, []);

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
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === 'active' && styles.filterTabActive
            ]}
            onPress={() => handleFilterChange('active')}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel="Ver usuarios activos"
            accessibilityState={{ selected: selectedFilter === 'active' }}
          >
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={
                selectedFilter === 'active'
                  ? theme.colors.textOnPrimary
                  : theme.colors.leaf
              }
            />
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === 'active' && styles.filterTabTextActive
              ]}
            >
              Activos
            </Text>
            <View
              style={[
                styles.filterBadge,
                selectedFilter === 'active' && styles.filterBadgeActive
              ]}
            >
              <Text
                style={[
                  styles.filterBadgeText,
                  selectedFilter === 'active' && styles.filterBadgeTextActive
                ]}
              >
                {userCounts.active}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === 'deactivated' && styles.filterTabActive
            ]}
            onPress={() => handleFilterChange('deactivated')}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel="Ver usuarios desactivados"
            accessibilityState={{ selected: selectedFilter === 'deactivated' }}
            disabled={true}
          >
            <Ionicons
              name="close-circle-outline"
              size={18}
              color={
                selectedFilter === 'deactivated'
                  ? theme.colors.textOnPrimary
                  : theme.colors.warning
              }
            />
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === 'deactivated' && styles.filterTabTextActive
              ]}
            >
              Desactivados
            </Text>
            <View
              style={[
                styles.filterBadge,
                selectedFilter === 'deactivated' && styles.filterBadgeActive
              ]}
            >
              <Text
                style={[
                  styles.filterBadgeText,
                  selectedFilter === 'deactivated' &&
                    styles.filterBadgeTextActive
                ]}
              >
                {userCounts.deactivated}
              </Text>
            </View>
          </TouchableOpacity>
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
      handleFilterChange
    ]
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredUsers}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.userName}-${index}`}
        style={styles.container}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshUsers}
            colors={[theme.colors.forest]}
            tintColor={theme.colors.forest}
            progressBackgroundColor={theme.colors.background}
          />
        }
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.skeletonContainer}>{renderSkeletons()}</View>
          ) : (
            <EmptyState
              styles={styles}
              theme={theme}
              onRefresh={refreshUsers}
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
