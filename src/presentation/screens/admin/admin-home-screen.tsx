import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Location from 'react-native-get-location';
import { Platform } from 'react-native';
import Geocoding from 'react-native-geocoding';
import { request, PERMISSIONS } from 'react-native-permissions';
import moment from 'moment';
import 'moment/locale/es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAllUsers, UserModel } from '../../../shared/utils/fakeData';
import FloatingActionButton from '../../components/ui/floating-action-button.component';
import { useAuth } from '../../contexts/auth-context';
import { useTheme, themeVariables } from '../../contexts/theme-context';
import { RootStackParamList } from '../../navigation/navigation.types';
import { createStyles } from './admin-home-screen.styles';
import { usePublications } from '../../contexts/publication-context';

moment.locale('es');

// --- Types ---
type AdminNavigationProp = StackNavigationProp<RootStackParamList, 'AdminHome'>;

interface LocationInfo {
  city: string | null;
  country: string | null;
}

// --- Sub-components ---

const AdminHeader: React.FC = React.memo(() => {
  AdminHeader.displayName = 'AdminHeader';
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const { actions: { loadAll } } = usePublications();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  const [currentTime, setCurrentTime] = useState(moment().format('h:mm A'));
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({ city: null, country: null });
  const [loadingLocation, setLoadingLocation] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(moment().format('h:mm A')), 60000);
    loadAll();
    return () => clearInterval(timer);
  }, [loadAll]);

  useEffect(() => {
    const fetchLocation = async () => {
      setLoadingLocation(true);
      try {
        const permissionType = Platform.select({
          android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        });
        
        if (!permissionType) return;
        
        const permission = await request(permissionType);        

        if (permission !== 'granted') {
          throw new Error('Permiso de ubicación denegado');
        }

        const location = await Location.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
        });

        // --- IMPORTANTE ---
        // Reemplaza "YOUR_GOOGLE_MAPS_API_KEY" con tu clave de API de Google Maps.
        Geocoding.init('AIzaSyDP5t-v593J7Zwu68eO5CIrBzu_xV4b8VQ');

        const response = await Geocoding.from(location.latitude, location.longitude);
        if (!response.results?.length) throw new Error('No se encontraron resultados');
        const address = response.results[0];

        const city = address.address_components.find(c => c.types.includes('locality'))?.long_name;
        const country = address.address_components.find(c => c.types.includes('country'))?.long_name;

        setLocationInfo({ city: city || 'N/A', country: country || 'N/A' });

      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
        setLocationInfo({ city: 'Ubicación no disponible', country: '' });
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchLocation();
  }, []);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTopRow}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.name || 'Admin'}</Text>
          <Text style={styles.subGreeting}>Qué bueno verte de nuevo.</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" style={styles.logoutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={24} color={variables['--text-secondary']} />
          <Text accessibilityLabel="Salir" style={styles.logoutButtonText}>Salir</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.timeAndLocationContainer}>
        <Ionicons name="time-outline" size={16} color={variables['--text-secondary']} />
        <Text style={styles.timeAndLocationText}>{currentTime}</Text>
        <View style={styles.separator} />
        <Ionicons name="location-outline" size={16} color={variables['--text-secondary']} />
        {loadingLocation ? (
          <ActivityIndicator size="small" color={variables['--text-secondary']} style={styles.activityIndicator} />
        ) : (
          <Text style={styles.timeAndLocationText}>
            {locationInfo.city}, {locationInfo.country}
          </Text>
        )}
      </View>
    </View>
  );
});



const CardButton: React.FC<{ icon: string; label: string; onPress: () => void }> = React.memo(({ icon, label, onPress }) => {
  CardButton.displayName = 'CardButton';
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  return (
    <TouchableOpacity accessibilityRole="button" style={styles.cardButton} onPress={onPress}>
      <Ionicons name={icon} size={22} color={variables['--primary']} />
      <Text accessibilityLabel={label} style={styles.cardButtonText}>{label}</Text>
      <Ionicons name="arrow-forward" size={16} color={variables['--text-secondary']} style={styles.buttonIcon} />
    </TouchableOpacity>
  );
});

const UserItem: React.FC<{ item: UserModel }> = React.memo(({ item }) => {
  UserItem.displayName = 'UserItem';
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  return (
    <TouchableOpacity accessibilityRole="button" style={styles.userCard}>
      <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text accessibilityLabel={item.name} style={styles.userName}>{item.name}</Text>
        <Text accessibilityLabel={item.email} style={styles.userEmail}>{item.email}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={variables['--text-secondary']} />
    </TouchableOpacity>
  );
});

// --- Main Component ---

const AdminHomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<AdminNavigationProp>();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const fetchedUsers = await getAllUsers();
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
          onPress={() => navigation.navigate('ReviewPublication')}
        />
        <CardButton
          icon="shield-checkmark-outline"
          label="Ver Publicaciones Aceptadas"
          onPress={() => navigation.navigate('ViewPublications')}
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
      <MaterialCommunityIcons name="account-group-outline" size={80} color={variables['--text-secondary']} />
      <Text style={styles.emptyListText}>No hay usuarios para mostrar.</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={variables['--primary']} />
        <Text style={styles.loadingText}>Cargando panel de administración...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList<UserModel>
        data={users}
        renderItem={({ item }) => <UserItem item={item} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[variables['--primary']]} tintColor={variables['--primary']} />}
      />
      <FloatingActionButton
        icon={<Ionicons name="camera-outline" size={50} color={variables['--text-on-primary']} />}
        onPress={() => navigation.navigate('AddPublication')}
        accessibilityLabel="Agregar nueva publicación"
      />
    </SafeAreaView>
  );
};

export default AdminHomeScreen;
