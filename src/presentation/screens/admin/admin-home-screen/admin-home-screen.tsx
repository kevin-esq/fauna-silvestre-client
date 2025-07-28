import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import 'moment/locale/es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAllUsers, UserModel } from '../../../../shared/utils/fakeData';
import FloatingActionButton from '../../../components/ui/floating-action-button.component';
import { useAuth } from '../../../contexts/auth-context';
import { useTheme, themeVariables } from '../../../contexts/theme-context';
import { createStyles } from './admin-home-screen.styles';
import { useLocationInfo } from '../../../hooks/use-location-info';
import { useCurrentTime } from '../../../hooks/use-current-time.hook';
import { useLoadData } from '../../../hooks/use-load-data.hook';
import { useNavigationActions } from '../../../navigation/navigation-provider';
import Config from 'react-native-config';

moment.locale('es');

// --- Sub-components ---

const AdminHeader: React.FC = React.memo(() => {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  const {
    city,
    country,
    loading: locLoading,
  } = useLocationInfo(Config.GOOGLE_MAPS_API_KEY);

  const time = useCurrentTime();
  useLoadData();

  const handleSignOut = () => {
    Alert.alert('Confirmar salida', '¿Estás seguro que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTopRow}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.name || 'Admin'}</Text>
          <Text style={styles.subGreeting}>Qué bueno verte de nuevo.</Text>
        </View>
        <TouchableOpacity
          onPress={handleSignOut}
          accessibilityLabel="Cerrar sesión"
          accessibilityHint="Cierra sesión de la aplicación"
          accessibilityRole="button"
          style={styles.logoutButton}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          <Ionicons
            name="log-out-outline"
            size={24}
            color={variables['--text-secondary']}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.timeAndLocationContainer}>
        <Ionicons
          name="time-outline"
          size={16}
          color={variables['--text-secondary']}
        />
        <Text style={styles.timeAndLocationText}>{time}</Text>
        <View style={styles.separator} />
        <Ionicons
          name="location-outline"
          size={16}
          color={variables['--text-secondary']}
        />
        {locLoading ? (
          <ActivityIndicator
            size="small"
            color={variables['--text-secondary']}
            style={styles.activityIndicator}
          />
        ) : (
          <Text style={styles.timeAndLocationText}>
            {city}, {country}
          </Text>
        )}
      </View>
    </View>
  );
});

const CardButton: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
}> = React.memo(({ icon, label, onPress }) => {
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={styles.cardButton}
      onPress={onPress}
    >
      <Ionicons name={icon} size={22} color={variables['--primary']} />
      <Text accessibilityLabel={label} style={styles.cardButtonText}>
        {label}
      </Text>
      <Ionicons
        name="arrow-forward"
        size={16}
        color={variables['--text-secondary']}
        style={styles.buttonIcon}
      />
    </TouchableOpacity>
  );
});

const UserItem: React.FC<{ item: UserModel }> = React.memo(({ item }) => {
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  return (
    <TouchableOpacity accessibilityRole="button" style={styles.userCard}>
      <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text accessibilityLabel={item.name} style={styles.userName}>
          {item.name}
        </Text>
        <Text accessibilityLabel={item.email} style={styles.userEmail}>
          {item.email}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={24}
        color={variables['--text-secondary']}
      />
    </TouchableOpacity>
  );
});

// --- Main Component ---

const AdminHomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { navigateAndReset } = useNavigationActions();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  //const progress = useDrawerProgress();
  //const animatedStyle = useAnimatedStyle(() => ({
  //  transform: [{ scale: progress.value * 0.1 + 0.9 }],
  //}));

  const fetchUsers = useCallback(async () => {
    try {
      const fetchedUsers = getAllUsers();
      setUsers(fetchedUsers);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  const ListHeader = (
    <>
      <AdminHeader />
      <View style={styles.cardButtonContainer}>
        <CardButton
          icon="newspaper-outline"
          label="Revisar Publicaciones"
          onPress={() => navigateAndReset('ReviewPublication')}
        />
        <CardButton
          icon="shield-checkmark-outline"
          label="Ver Publicaciones Aceptadas"
          onPress={() => navigateAndReset('ViewPublications')}
        />
        <CardButton
          icon="people-outline"
          label="Gestionar Usuarios"
          onPress={() => {
            // TODO: implementar navegación a Gestión de Usuarios
          }}
        />
      </View>
      <Text style={styles.listHeader}>Usuarios Recientes</Text>
    </>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyListContainer}>
      <MaterialCommunityIcons
        name="account-group-outline"
        size={80}
        color={variables['--text-secondary']}
      />
      <Text style={styles.emptyListText}>No hay usuarios para mostrar.</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={variables['--primary']} />
        <Text style={styles.loadingText}>
          Cargando panel de administración...
        </Text>
      </View>
    );
  }

  return (
    <Animated.View style={[{ flex: 1 }]}>
      <SafeAreaView style={styles.container}>
        <FlatList<UserModel>
          data={users}
          renderItem={({ item }) => <UserItem item={item} />}
          keyExtractor={item => item.id}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[variables['--primary']]}
              tintColor={variables['--primary']}
            />
          }
        />
        <FloatingActionButton
          icon={
            <Ionicons
              name="camera-outline"
              size={50}
              color={variables['--text-on-primary']}
            />
          }
          onPress={() => navigateAndReset('AddPublication')}
          accessibilityLabel="Agregar nueva publicación"
        />
      </SafeAreaView>
    </Animated.View>
  );
};

export default AdminHomeScreen;
