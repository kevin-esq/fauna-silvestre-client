import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '@/presentation/contexts/auth.context';
import { useTheme } from '@/presentation/contexts/theme.context';
import { useDraftContext } from '@/presentation/contexts/draft.context';
import { useNavigationActions } from '@/presentation/navigation/navigation-provider';
import { useLocationInfo } from '@/presentation/hooks/catalog/use-location-info';
import { useCurrentTime } from '@/presentation/hooks/common/use-current-time.hook';
import { useAdminData } from '@/presentation/hooks/admin/use-admin-data.hook';
import { useDoubleBackExit } from '@/presentation/hooks/common/use-double-back-exit.hook';

import {
  SkeletonLoader,
  UserListSkeleton,
  QuickActionSkeleton
} from '@/presentation/components/ui/skeleton-loader.component';

import CustomModal from '@/presentation/components/ui/custom-modal.component';
import { OfflineBanner } from '@/presentation/components/ui/offline-banner.component';

import { UserData } from '@/domain/models/user.models';
import { useStyles } from '@/presentation/screens/admin/admin-home-screen.styles';
import { RootStackParamList } from '@/presentation/navigation/navigation.types';

const AdminHeader = React.memo<{
  styles: ReturnType<typeof useStyles>;
}>(({ styles }) => {
  const { user, signOut } = useAuth();
  const { city, state, loading: locLoading } = useLocationInfo();
  const time = useCurrentTime();
  const { publicationCounts } = useAdminData();
  const { colors } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSignOut = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const confirmSignOut = useCallback(() => {
    setShowLogoutModal(false);
    signOut();
  }, [signOut]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <>
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTextContainer}>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>
                {getGreeting()}, {user?.name || 'Administrador'}
              </Text>
            </View>
            <View style={styles.subGreetingRow}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.subGreeting}>Panel de administración</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            accessibilityHint="Cierra la sesión actual"
            style={styles.logoutButton}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        <Animated.View style={styles.infoCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.primary + '20' }
                ]}
              >
                <Ionicons name="newspaper" size={22} color={colors.primary} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Publicaciones</Text>
                {publicationCounts.isLoading ? (
                  <SkeletonLoader width={30} height={18} borderRadius={4} />
                ) : (
                  <Text style={styles.statValue}>
                    {publicationCounts.total}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.info + '20' }
                ]}
              >
                <Ionicons name="people" size={22} color={colors.info} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Usuarios</Text>
                {publicationCounts.isLoading ? (
                  <SkeletonLoader width={30} height={18} borderRadius={4} />
                ) : (
                  <Text style={styles.statValue}>
                    {publicationCounts.totalUsers}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.dividerLine} />

          <View style={styles.statsRowCompact}>
            <View style={styles.statItemCompact}>
              <View
                style={[
                  styles.statIconContainerCompact,
                  { backgroundColor: colors.warning + '20' }
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={colors.warning}
                />
              </View>
              <View style={styles.statTextContainerCompact}>
                <Text style={styles.statLabelCompact}>Pendiente</Text>
                {publicationCounts.isLoading ? (
                  <SkeletonLoader width={22} height={14} borderRadius={4} />
                ) : (
                  <Text style={styles.statValueCompact}>
                    {publicationCounts.pending}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.statDividerCompact} />

            <View style={styles.statItemCompact}>
              <View
                style={[
                  styles.statIconContainerCompact,
                  { backgroundColor: colors.success + '20' }
                ]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={colors.success}
                />
              </View>
              <View style={styles.statTextContainerCompact}>
                <Text style={styles.statLabelCompact}>Aceptada</Text>
                {publicationCounts.isLoading ? (
                  <SkeletonLoader width={22} height={14} borderRadius={4} />
                ) : (
                  <Text style={styles.statValueCompact}>
                    {publicationCounts.accepted}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.statDividerCompact} />

            <View style={styles.statItemCompact}>
              <View
                style={[
                  styles.statIconContainerCompact,
                  { backgroundColor: colors.error + '20' }
                ]}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={colors.error}
                />
              </View>
              <View style={styles.statTextContainerCompact}>
                <Text style={styles.statLabelCompact}>Rechazada</Text>
                {publicationCounts.isLoading ? (
                  <SkeletonLoader width={22} height={14} borderRadius={4} />
                ) : (
                  <Text style={styles.statValueCompact}>
                    {publicationCounts.rejected}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.dividerLine} />

          <View style={styles.infoRow}>
            <Ionicons name="time" size={18} color={colors.textSecondary} />
            <Text style={styles.infoText}>{time}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location" size={18} color={colors.textSecondary} />
            {locLoading ? (
              <SkeletonLoader width={100} height={14} borderRadius={4} />
            ) : (
              <Text style={styles.infoText}>
                {city}, {state}
              </Text>
            )}
          </View>
        </Animated.View>
      </View>

      <CustomModal
        isVisible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirmar salida"
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
        description="¿Estás seguro que deseas cerrar sesión?"
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
            label: 'Salir',
            onPress: confirmSignOut,
            variant: 'danger'
          }
        ]}
      />
    </>
  );
});

const QuickActionButton = React.memo<{
  icon: string;
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof useStyles>;
  disabled?: boolean;
  color?: string;
  iconType?: 'ionicons' | 'material';
}>(
  ({
    icon,
    label,
    onPress,
    styles,
    disabled = false,
    color,
    iconType = 'ionicons'
  }) => {
    const [isPressed, setIsPressed] = React.useState(false);
    const { colors } = useTheme();
    const iconColor = color || colors.primary;

    const IconComponent =
      iconType === 'material' ? MaterialCommunityIcons : Ionicons;

    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        style={[
          styles.quickActionButton,
          isPressed && styles.quickActionButtonPressed,
          disabled && styles.quickActionButtonDisabled
        ]}
        onPress={disabled ? undefined : onPress}
        onPressIn={() => !disabled && setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <View style={styles.quickActionContent}>
          <View
            style={[
              styles.quickActionIconContainer,
              { backgroundColor: iconColor + '15' }
            ]}
          >
            <IconComponent name={icon} size={24} color={iconColor} />
          </View>
          <Text style={styles.quickActionText} numberOfLines={2}>
            {label}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    );
  }
);

const QuickActionsSection = React.memo<{
  onNavigate: (route: keyof RootStackParamList) => void;
  styles: ReturnType<typeof useStyles>;
  isLoading?: boolean;
  draftsCount?: number;
}>(({ onNavigate, styles, isLoading = false, draftsCount = 0 }) => {
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <SkeletonLoader width={24} height={24} borderRadius={12} />
          <SkeletonLoader
            width={140}
            height={20}
            borderRadius={4}
            style={{ marginLeft: 8 }}
          />
        </View>
        <SkeletonLoader
          width="60%"
          height={14}
          borderRadius={4}
          style={{ marginBottom: 16 }}
        />
        <View style={styles.quickActions}>
          {[...Array(4)].map((_, i) => (
            <QuickActionSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name="flash" size={24} color={colors.warning} />
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      </View>
      <Text style={styles.sectionSubtitle}>
        Gestiona el contenido de la aplicación
      </Text>

      <View style={styles.quickActions}>
        <QuickActionButton
          icon="account-group"
          iconType="material"
          label="Gestionar usuarios"
          onPress={() => onNavigate('UserList')}
          styles={styles}
          color={colors.info}
        />
        <QuickActionButton
          icon="file-tray-full"
          label="Fichas descargadas"
          onPress={() => onNavigate('DownloadedFiles')}
          styles={styles}
          color={colors.secondary}
        />
        <QuickActionButton
          icon="documents"
          label={`Mis borradores${draftsCount > 0 ? ` (${draftsCount})` : ''}`}
          onPress={() => onNavigate('Drafts')}
          styles={styles}
          color={colors.water}
        />
      </View>
    </View>
  );
});

const UserListItem = React.memo<{
  user: UserData;
  styles: ReturnType<typeof useStyles>;
  onPress?: (user: UserData) => void;
}>(({ user, styles, onPress }) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const { colors } = useTheme();

  const handlePress = useCallback(() => {
    onPress?.(user);
  }, [onPress, user]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Usuario: ${user.name}. Email: ${user.email}`}
      style={[styles.userListItem, isPressed && styles.userListItemPressed]}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.avatarContainer}>
        <View
          style={[
            styles.userAvatar,
            {
              backgroundColor: colors.primaryLight,
              justifyContent: 'center',
              alignItems: 'center'
            }
          ]}
        >
          <Ionicons name="person" size={28} color={colors.textOnPrimary} />
        </View>
        <View
          style={[styles.statusIndicator, { backgroundColor: colors.success }]}
        />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {user.name} {user.lastName}
        </Text>
        <View style={styles.userEmailRow}>
          <Ionicons
            name="mail-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={styles.userEmail} numberOfLines={1}>
            {user.email}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
});

const UsersSection = React.memo<{
  users: UserData[];
  isLoading: boolean;
  onSeeAll: () => void;
  onUserPress: (user: UserData) => void;
  styles: ReturnType<typeof useStyles>;
}>(({ users, isLoading, onSeeAll, onUserPress, styles }) => {
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <SkeletonLoader width={24} height={24} borderRadius={12} />
            <SkeletonLoader
              width={140}
              height={20}
              borderRadius={4}
              style={{ marginLeft: 8 }}
            />
          </View>
          <SkeletonLoader width={80} height={14} borderRadius={4} />
        </View>
        <SkeletonLoader
          width="70%"
          height={14}
          borderRadius={4}
          style={{ marginBottom: 16 }}
        />
        {[...Array(3)].map((_, i) => (
          <UserListSkeleton key={i} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="people-circle" size={24} color={colors.info} />
          <Text style={styles.sectionTitle}>Usuarios recientes</Text>
        </View>
        <TouchableOpacity
          onPress={onSeeAll}
          activeOpacity={0.7}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAll}>Ver todos</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.sectionSubtitleRow}>
        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.sectionSubtitle}>
          Últimos 4 usuarios registrados
        </Text>
      </View>

      {users.length === 0 ? (
        <EmptyUsersList styles={styles} />
      ) : (
        users
          .slice(0, 4)
          .map((user, index) => (
            <UserListItem
              key={`${user.userName}-${index}`}
              user={user}
              styles={styles}
              onPress={onUserPress}
            />
          ))
      )}
    </View>
  );
});

const EmptyUsersList = React.memo<{
  styles: ReturnType<typeof useStyles>;
}>(({ styles }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons
          name="account-group-outline"
          size={60}
          color={colors.textSecondary}
        />
      </View>
      <Text style={styles.emptyTitle}>No hay usuarios registrados</Text>
      <Text style={styles.emptySubtitle}>
        Cuando se registren nuevos usuarios aparecerán aquí
      </Text>
    </View>
  );
});

const LoadingIndicator = React.memo<{
  styles: ReturnType<typeof useStyles>;
}>(({ styles }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Cargando datos...</Text>
    </View>
  );
});

const ErrorMessage = React.memo<{
  error: string;
  onRetry: () => void;
  styles: ReturnType<typeof useStyles>;
}>(({ error, onRetry, styles }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={60}
          color={colors.error}
        />
      </View>
      <Text style={styles.errorTitle}>Error al cargar datos</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        onPress={onRetry}
        style={styles.retryButton}
        accessibilityLabel="Reintentar"
        accessibilityHint="Intenta cargar los datos nuevamente"
        activeOpacity={0.8}
      >
        <Ionicons name="refresh" size={20} color={colors.textOnPrimary} />
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );
});

const AdminHomeScreen: React.FC = React.memo(() => {
  const { push } = useNavigationActions();
  const { drafts } = useDraftContext();
  const { theme, isDark, colors } = useTheme();
  const styles = useStyles(theme, isDark);

  const { state, actions } = useAdminData();

  useDoubleBackExit();

  const handleNavigation = useCallback(
    (route: keyof RootStackParamList) => {
      push(route);
    },
    [push]
  );

  const handleUserPress = useCallback(
    (user: UserData) => {
      push('UserDetails', { user });
    },
    [push]
  );

  const ListHeader = useMemo(
    () => (
      <>
        <AdminHeader styles={styles} />
        <QuickActionsSection
          onNavigate={handleNavigation}
          styles={styles}
          isLoading={state.loading}
          draftsCount={drafts.length}
        />
        <UsersSection
          users={state.users}
          isLoading={state.loading}
          onSeeAll={() => handleNavigation('UserList')}
          onUserPress={handleUserPress}
          styles={styles}
        />
      </>
    ),
    [
      styles,
      handleNavigation,
      state.loading,
      state.users,
      handleUserPress,
      drafts.length
    ]
  );

  if (state.loading && state.users.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingIndicator styles={styles} />
      </SafeAreaView>
    );
  }

  if (state.error && state.users.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage
          error={state.error}
          onRetry={actions.retryLoad}
          styles={styles}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />
      <Animated.FlatList
        data={[]}
        renderItem={() => null}
        keyExtractor={() => 'header'}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={state.refreshing}
            onRefresh={actions.handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
});

AdminHeader.displayName = 'AdminHeader';
QuickActionButton.displayName = 'QuickActionButton';
QuickActionsSection.displayName = 'QuickActionsSection';
UserListItem.displayName = 'UserListItem';
UsersSection.displayName = 'UsersSection';
EmptyUsersList.displayName = 'EmptyUsersList';
LoadingIndicator.displayName = 'LoadingIndicator';
ErrorMessage.displayName = 'ErrorMessage';
AdminHomeScreen.displayName = 'AdminHomeScreen';

export default AdminHomeScreen;
