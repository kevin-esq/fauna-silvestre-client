import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

// Contextos y Hooks
import { useAuth } from '../../../contexts/auth.context';
import { useTheme } from '../../../contexts/theme.context';
import { useNavigationActions } from '../../../navigation/navigation-provider';
import { usePublications } from '@/presentation/contexts/publication.context';
import { useLocationInfo } from '../../../hooks/use-location-info';
import { useCurrentTime } from '../../../hooks/use-current-time.hook';
import { useLoadData } from '../../../hooks/use-load-data.hook';

// Componentes y Modelos
import FloatingActionButton from '../../../components/ui/floating-action-button.component';
import { getAllUsers, UserModel } from '../../../../shared/utils/fakeData';
import { useStyles } from './admin-home-screen.styles';

moment.locale('es');

/**
 * Componente de cabecera para el administrador
 */
const AdminHeader = React.memo(
  ({ styles }: { styles: ReturnType<typeof useStyles> }) => {
    const { user, signOut } = useAuth();

    const { state: statePub } = usePublications();
    const { city, state, loading: locLoading } = useLocationInfo();
    const time = useCurrentTime();
    useLoadData();

    const handleSignOut = () => {
      Alert.alert(
        'Confirmar salida',
        '¿Estás seguro que deseas cerrar sesión?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salir', onPress: () => signOut() }
        ]
      );
    };

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

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons
              name="newspaper-outline"
              size={24}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>Publicaciones: </Text>
            {statePub.counts.isLoading ? (
              <ActivityIndicator
                size="small"
                style={styles.activityIndicator}
              />
            ) : (
              <Text style={styles.infoValue}>
                {statePub.counts.data?.records || 0}
              </Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={24} style={styles.infoIcon} />
            <Text style={styles.infoText}>Usuarios: </Text>
            {statePub.counts.isLoading ? (
              <ActivityIndicator
                size="small"
                style={styles.activityIndicator}
              />
            ) : (
              <Text style={styles.infoValue}>
                {statePub.counts.data?.users || 0}
              </Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={24} style={styles.infoIcon} />
            <Text style={styles.infoText}>{time}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={24}
              style={styles.infoIcon}
            />
            {locLoading ? (
              <ActivityIndicator
                size="small"
                style={styles.activityIndicator}
              />
            ) : (
              <Text style={styles.infoText}>
                {city}, {state}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }
);

/**
 * Botón de acción rápida
 */
const QuickActionButton = React.memo(
  ({
    icon,
    label,
    onPress,
    styles
  }: {
    icon: string;
    label: string;
    onPress: () => void;
    styles: ReturnType<typeof useStyles>;
  }) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.quickActionButton,
          isPressed && styles.quickActionButtonPressed
        ]}
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        activeOpacity={0.8}
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
  }
);

/**
 * Componente de usuario para la lista
 */
const UserListItem = React.memo(
  ({
    user,
    styles
  }: {
    user: UserModel;
    styles: ReturnType<typeof useStyles>;
  }) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Usuario: ${user.name}. Email: ${user.email}`}
        style={[styles.userListItem, isPressed && styles.userListItemPressed]}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
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
  }
);

/**
 * Componente para lista vacía
 */
const EmptyList = React.memo(
  ({ styles }: { styles: ReturnType<typeof useStyles> }) => {
    return (
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
    );
  }
);

/**
 * Componente de carga
 */
const LoadingIndicator = React.memo(
  ({ styles }: { styles: ReturnType<typeof useStyles> }) => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={styles.loadingIndicator.color} />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }
);

/**
 * Componente de error
 */
const ErrorMessage = React.memo(
  ({
    error,
    onRetry,
    styles
  }: {
    error: string;
    onRetry: () => void;
    styles: ReturnType<typeof useStyles>;
  }) => {
    return (
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
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }
);

// ==================== Pantalla Principal ====================

const AdminHomeScreen: React.FC = () => {
  const { navigateAndReset } = useNavigationActions();
  const { theme, isDark } = useTheme();
  const styles = useStyles(theme, isDark);

  // Estado de la pantalla
  const [state, setState] = useState<{
    users: UserModel[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
  }>({
    users: [],
    loading: true,
    refreshing: false,
    error: null
  });

  // Cargar usuarios
  const loadUsers = useCallback(async (isRefreshing = false) => {
    try {
      setState(prev => ({
        ...prev,
        loading: !isRefreshing,
        refreshing: isRefreshing,
        error: null
      }));

      const users = getAllUsers();
      setState(prev => ({
        ...prev,
        users,
        loading: false,
        refreshing: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error:
          error instanceof Error ? error.message : 'Error al cargar usuarios'
      }));
    }
  }, []);

  // Efecto inicial
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Manejar refresh
  const handleRefresh = useCallback(() => {
    loadUsers(true);
  }, [loadUsers]);

  // Cabecera de la lista
  const ListHeader = useMemo(
    () => (
      <>
        <AdminHeader styles={styles} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <Text style={styles.sectionSubtitle}>
            Gestiona el contenido de la aplicación
          </Text>

          <View style={styles.quickActions}>
            <QuickActionButton
              icon="newspaper-outline"
              label="Revisar publicaciones"
              onPress={() => navigateAndReset('ReviewPublication')}
              styles={styles}
            />
            <QuickActionButton
              icon="shield-checkmark-outline"
              label="Publicaciones aceptadas"
              onPress={() => navigateAndReset('Publications')}
              styles={styles}
            />
            <QuickActionButton
              icon="people-outline"
              label="Gestionar usuarios"
              onPress={() => console.log('Gestionar usuarios')}
              styles={styles}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Usuarios recientes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>
            Últimos 5 usuarios registrados
          </Text>
        </View>
      </>
    ),
    [navigateAndReset, styles]
  );

  // Mostrar estado de carga
  if (state.loading) {
    return <LoadingIndicator styles={styles} />;
  }

  // Mostrar error
  if (state.error) {
    return (
      <ErrorMessage error={state.error} onRetry={loadUsers} styles={styles} />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.FlatList
        data={state.users.slice(0, 5)}
        renderItem={({ item }) => <UserListItem user={item} styles={styles} />}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={<EmptyList styles={styles} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={state.refreshing}
            onRefresh={handleRefresh}
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
        onPress={() => navigateAndReset('AddPublication')}
        accessibilityLabel="Crear nueva publicación"
        style={styles.fab}
      />
    </SafeAreaView>
  );
};

export default AdminHomeScreen;
