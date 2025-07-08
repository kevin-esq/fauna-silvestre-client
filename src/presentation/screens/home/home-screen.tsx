import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useTheme, themeVariables } from '../../contexts/theme-context';
import { useAuth } from '../../contexts/auth-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createStyles } from './home-screen.styles';
import FloatingActionButton from '../../components/ui/floating-action-button.component';
import { usePublications } from '../../contexts/publication-context';
import AnimalCard from '../../components/animal/animal-card.component';
import { useNavigationActions } from '../../navigation/navigation-provider';

const HomeScreen = () => {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const { navigate } = useNavigationActions();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);
  const { all } = usePublications();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, cerrar', onPress: signOut, style: 'destructive' },
      ],
      { cancelable: true }
    );
  };

  const handleAddPublication = () => {
    navigate('AddPublication' as never);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={variables['--text-secondary']} />
        <Text style={styles.logoutButtonText}>Salir</Text>
      </TouchableOpacity>
      <Text style={styles.greeting}>¡Hola, {user?.name || 'Usuario'}!</Text>
      <Text style={styles.description}>
        Explora y comparte información sobre la increíble fauna silvestre.
      </Text>
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{all.publications.length}</Text>
            <Text style={styles.statLabel}>Publicaciones</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Especies</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.sectionTitle, { alignSelf: 'flex-start', paddingHorizontal: 16, fontSize: 22, marginTop: 8 }]}>Publicaciones Recientes</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={all.publications}
        renderItem={({ item }) => <AnimalCard animal={item} onPress={() => navigate('PublicationDetails', { publication: item })} />}
        keyExtractor={(item) => item.recordId.toString()}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
      />
      <FloatingActionButton onPress={handleAddPublication} icon={<Ionicons name="camera" size={24} color={variables['--text-on-primary']} />} />
    </View>
  );
};

export default HomeScreen;
