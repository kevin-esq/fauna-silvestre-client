import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import 'moment/locale/es';

import { useAuth } from '../../../contexts/auth.context';
import { useTheme } from '../../../contexts/theme.context';
import { useNavigationActions } from '../../../navigation/navigation-provider';
import { useLocationInfo } from '../../../hooks/use-location-info';
import { useCurrentTime } from '../../../hooks/use-current-time.hook';
import { useAdminData } from '../../../hooks/use-admin-data.hook';

import FloatingActionButton from '../../../components/ui/floating-action-button.component';
import {
  SkeletonLoader,
  UserListSkeleton,
  QuickActionSkeleton
} from '../../../components/ui/skeleton-loader.component';

import { UserModel } from '@/shared/utils/fakeData';
import { useStyles } from './admin-home-screen.styles';
import { RootStackParamList } from '@/presentation/navigation/navigation.types';

moment.locale('es');

const AdminHeader = React.memo<{
  styles: ReturnType<typeof useStyles>;
}>(({ styles }) => {
  const { user, signOut } = useAuth();
  const { city, state, loading: locLoading } = useLocationInfo();
  const time = useCurrentTime();
  const { publicationCounts } = useAdminData();

  const handleSignOut = useCallback(() => {
    Alert.alert('Confirmar salida', '¿Estás seguro que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', onPress: signOut }
    ]);
  }, [signOut]);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTopRow}>
        <View>
          <Text style={styles.greeting}>
            Hola, {user?.name || 'Administrador'}
          </Text>
          <Text style={styles.subGreeting}>Panel de control</Text>
        </View>
        <TouchableOpacity
          onPress={handleSignOut}
          accessibilityLabel="Cerrar sesión"
          accessibilityHint="Cierra la sesión actual"
          style={styles.logoutButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color={styles.logoutButtonText.color}
          />
        </TouchableOpacity>
      </View>

      <Animated.View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons
            name="newspaper-outline"
            size={24}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>Publicaciones: </Text>
          {publicationCounts.isLoading ? (
            <SkeletonLoader width={40} height={16} borderRadius={4} />
          ) : (
            <Text style={styles.infoValue}>{publicationCounts.total}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={24} style={styles.infoIcon} />
          <Text style={styles.infoText}>Usuarios: </Text>
          {publicationCounts.isLoading ? (
            <SkeletonLoader width={40} height={16} borderRadius={4} />
          ) : (
            <Text style={styles.infoValue}>{publicationCounts.users}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={24} style={styles.infoIcon} />
          <Text style={styles.infoText}>{time}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={24} style={styles.infoIcon} />
          {locLoading ? (
            <SkeletonLoader width={100} height={16} borderRadius={4} />
          ) : (
            <Text style={styles.infoText}>
              {city}, {state}
            </Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
});

const QuickActionButton = React.memo<{
  icon: string;
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof useStyles>;
  disabled?: boolean;
}>(({ icon, label, onPress, styles, disabled = false }) => {
  const [isPressed, setIsPressed] = React.useState(false);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[
        styles.quickActionButton,
        isPressed && styles.quickActionButtonPressed,
        disabled && { opacity: 0.5 }
      ]}
      onPress={disabled ? undefined : onPress}
      onPressIn={() => !disabled && setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={styles.quickActionContent}>
        <View style={styles.quickActionIconContainer}>
          <Ionicons
            name={icon}
            size={24}
            color={styles.quickActionIcon.color}
          />
        </View>
        <Text style={styles.quickActionText}>{label}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={styles.quickActionChevron.color}
      />
    </TouchableOpacity>
  );
});

const QuickActionsSection = React.memo<{
  onNavigate: (route: keyof RootStackParamList) => void;
  styles: ReturnType<typeof useStyles>;
  isLoading?: boolean;
}>(({ onNavigate, styles, isLoading = false }) => {
  if (isLoading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <SkeletonLoader
          width="60%"
          height={14}
          borderRadius={4}
          style={{ marginBottom: 12 }}
        />
        <View style={styles.quickActions}>
          <QuickActionSkeleton />
          <QuickActionSkeleton />
          <QuickActionSkeleton />
          <QuickActionSkeleton />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      <Text style={styles.sectionSubtitle}>
        Gestiona el contenido de la aplicación
      </Text>

      <View style={styles.quickActions}>
        <QuickActionButton
          icon="newspaper-outline"
          label="Revisar publicaciones"
          onPress={() => onNavigate('ReviewPublication')}
          styles={styles}
        />
        <QuickActionButton
          icon="shield-checkmark-outline"
          label="Publicaciones aceptadas"
          onPress={() => onNavigate('Publications')}
          styles={styles}
        />
        <QuickActionButton
          icon="people-outline"
          label="Gestionar usuarios"
          onPress={() => console.log('UserManagement')}
          styles={styles}
        />
        <QuickActionButton
          icon="file-tray-full-outline"
          label="Fichas Descargadas"
          onPress={() => onNavigate('DownloadedFiles')}
          styles={styles}
        />
      </View>
    </View>
  );
});

const UserListItem = React.memo<{
  user: UserModel;
  styles: ReturnType<typeof useStyles>;
  onPress?: (user: UserModel) => void;
}>(({ user, styles, onPress }) => {
  const [isPressed, setIsPressed] = React.useState(false);

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
      <Image
        source={{ uri: user.avatarUrl }}
        style={styles.userAvatar}
        accessibilityIgnoresInvertColors
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={styles.userEmail} numberOfLines={1}>
          {user.email}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={styles.userChevron.color}
      />
    </TouchableOpacity>
  );
});

const UsersSection = React.memo<{
  users: UserModel[];
  isLoading: boolean;
  onSeeAll: () => void;
  onUserPress: (user: UserModel) => void;
  styles: ReturnType<typeof useStyles>;
}>(({ users, isLoading, onSeeAll, onUserPress, styles }) => {
  if (isLoading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonLoader width={120} height={20} borderRadius={4} />
          <SkeletonLoader width={60} height={14} borderRadius={4} />
        </View>
        <SkeletonLoader
          width="70%"
          height={14}
          borderRadius={4}
          style={{ marginBottom: 12 }}
        />
        {Array.from({ length: 3 }).map((_, index) => (
          <UserListSkeleton key={index} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Usuarios recientes</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>Ver todos</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionSubtitle}>Últimos 5 usuarios registrados</Text>

      {users.length === 0 ? (
        <EmptyUsersList styles={styles} />
      ) : (
        users
          .slice(0, 5)
          .map(user => (
            <UserListItem
              key={user.id}
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
}>(({ styles }) => (
  <View style={styles.emptyContainer}>
    <MaterialCommunityIcons
      name="account-group-outline"
      size={80}
      color={styles.emptyIcon.color}
    />
    <Text style={styles.emptyTitle}>No hay usuarios</Text>
    <Text style={styles.emptySubtitle}>
      Cuando se registren nuevos usuarios aparecerán aquí
    </Text>
  </View>
));

const LoadingIndicator = React.memo<{
  styles: ReturnType<typeof useStyles>;
}>(({ styles }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={styles.loadingIndicator.color} />
    <Text style={styles.loadingText}>Cargando datos...</Text>
  </View>
));

const ErrorMessage = React.memo<{
  error: string;
  onRetry: () => void;
  styles: ReturnType<typeof useStyles>;
}>(({ error, onRetry, styles }) => (
  <View style={styles.errorContainer}>
    <MaterialCommunityIcons
      name="alert-circle-outline"
      size={50}
      color={styles.errorIcon.color}
    />
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity
      onPress={onRetry}
      style={styles.retryButton}
      accessibilityLabel="Reintentar"
      accessibilityHint="Intenta cargar los datos nuevamente"
    >
      <Text style={styles.retryButtonText}>Reintentar</Text>
    </TouchableOpacity>
  </View>
));

const AdminHomeScreen: React.FC = React.memo(() => {
  const { navigateAndReset, push } = useNavigationActions();
  const { theme, isDark } = useTheme();
  const styles = useStyles(theme, isDark);

  const { state, actions } = useAdminData();

  const handleNavigation = useCallback(
    (route: keyof RootStackParamList) => {
      if (route === 'DownloadedFiles') {
        push(route);
      } else {
        navigateAndReset(route);
      }
    },
    [navigateAndReset, push]
  );

  const handleSeeAllUsers = useCallback(() => {
    navigateAndReset('UserList');
  }, [navigateAndReset]);

  const handleUserPress = useCallback((user: UserModel) => {
    //('UserProfileDetail', { userId: user.id });
    console.log(user);
  }, []);

  const handleAddPublication = useCallback(() => {
    navigateAndReset('AddPublication');
  }, [navigateAndReset]);

  const ListHeader = useMemo(
    () => (
      <>
        <AdminHeader styles={styles} />
        <QuickActionsSection
          onNavigate={handleNavigation}
          styles={styles}
          isLoading={state.loading}
        />
        <UsersSection
          users={state.users}
          isLoading={state.loading}
          onSeeAll={handleSeeAllUsers}
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
      handleSeeAllUsers,
      handleUserPress
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
            colors={[styles.refreshControl.color]}
            tintColor={styles.refreshControl.color}
          />
        }
      />

      <FloatingActionButton
        icon={
          <Ionicons
            name="camera-outline"
            size={24}
            color={styles.fabIcon.color}
          />
        }
        onPress={handleAddPublication}
        accessibilityLabel="Crear nueva publicación"
        style={styles.fab}
      />
    </SafeAreaView>
  );
});

// Display names para debugging
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
