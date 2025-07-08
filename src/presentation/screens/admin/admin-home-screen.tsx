import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
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
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const { all } = usePublications();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  const [currentTime, setCurrentTime] = useState(moment().format('h:mm A'));
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({ city: null, country: null });
  const [loadingLocation, setLoadingLocation] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(moment().format('h:mm A')), 60000);
    all.load();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationInfo({ city: 'Permiso denegado', country: '' });
        setLoadingLocation(false);
        return;
      }
      try {
        const location = await Location.getCurrentPositionAsync({});
        const reverseGeocode = await Location.reverseGeocodeAsync(location.coords);
        if (reverseGeocode[0]) {
          setLocationInfo({ city: reverseGeocode[0].city, country: reverseGeocode[0].country });
        }
      } catch (error) {
        setLocationInfo({ city: 'Ubicación no disponible', country: '' });
      } finally { 
        setLoadingLocation(false);
      }
    })();
  }, []);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTopRow}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.name || 'Admin'}</Text>
          <Text style={styles.subGreeting}>Qué bueno verte de nuevo.</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={24} color={variables['--text-secondary']} />
          <Text style={styles.logoutButtonText}>Salir</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.timeAndLocationContainer}>
        <Ionicons name="time-outline" size={16} color={variables['--text-secondary']} />
        <Text style={styles.timeAndLocationText}>{currentTime}</Text>
        <View style={styles.separator} />
        <Ionicons name="location-outline" size={16} color={variables['--text-secondary']} />
        {loadingLocation ? (
          <ActivityIndicator size="small" color={variables['--text-secondary']} style={{ marginLeft: 8 }} />
        ) : (
          <Text style={styles.timeAndLocationText}>
            {locationInfo.city}, {locationInfo.country}
          </Text>
        )}
      </View>
    </View>
  );
});

const StatsCard: React.FC = React.memo(() => {
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);
  const { all } = usePublications();

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        {
        all.isLoading ? 
        (<ActivityIndicator size="small" color={variables['--text-secondary']} style={{ marginLeft: 8 }} />) : 
        (<Text style={styles.statValue}>{all.publications.filter((p) => p.status === 'accepted').length}</Text>)
        }
        <Text style={styles.statLabel}>Publicados</Text>
      </View>
      <View style={styles.statBox}>
        {
        all.isLoading ? 
        (<ActivityIndicator size="small" color={variables['--text-secondary']} style={{ marginLeft: 8 }} />) : 
        (<Text style={styles.statValue}>{all.publications.filter((p) => p.status === 'pending').length}</Text>)
        }
        <Text style={styles.statLabel}>Pendientes</Text>
      </View>
      <View style={styles.statBox}>
        {
        all.isLoading ? 
        (<ActivityIndicator size="small" color={variables['--text-secondary']} style={{ marginLeft: 8 }} />) : 
        (<Text style={styles.statValue}>{all.publications.filter((p) => p.status === 'rejected').length}</Text>)
        }
        <Text style={styles.statLabel}>Rechazados</Text>
      </View>
    </View>
  );
});

const UserItem: React.FC<{ item: UserModel }> = React.memo(({ item }) => {
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  return (
    <TouchableOpacity style={styles.userCard}>
      <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
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
    } catch (error) {
      console.error('Error fetching users:', error);
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
      <StatsCard />
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
      <FlatList
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
