import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/theme.context';
import { useDraftContext } from '../../contexts/draft.context';
import { useNetworkStatus } from '../../hooks/common/use-network-status.hook';
import { useNavigation } from '@react-navigation/native';
import { styles } from './offline-home-screen.styles';

const OfflineHomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { drafts, isLoading, refreshDrafts } = useDraftContext();
  const { isOffline, isInternetReachable } = useNetworkStatus();
  const navigation = useNavigation();

  const handleRefresh = useCallback(() => {
    refreshDrafts();
  }, [refreshDrafts]);

  const handleNavigateToDrafts = useCallback(() => {
    navigation.navigate('Drafts' as never);
  }, [navigation]);

  const handleNavigateToDownloads = useCallback(() => {
    navigation.navigate('DownloadedFiles' as never);
  }, [navigation]);

  const handleNavigateToCamera = useCallback(() => {
    navigation.navigate('AddPublication' as never);
  }, [navigation]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      <View
        style={[styles.offlineHeader, { backgroundColor: theme.colors.error }]}
      >
        <Ionicons name="cloud-offline" size={48} color="#FFFFFF" />
        <Text style={styles.offlineTitle}>Modo Sin Conexión</Text>
        <Text style={styles.offlineSubtitle}>
          {isInternetReachable === false
            ? 'Sin acceso a Internet'
            : 'Conectividad limitada'}
        </Text>
      </View>

      <View
        style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}
      >
        <Ionicons
          name="information-circle"
          size={24}
          color={theme.colors.primary}
        />
        <Text style={[styles.infoText, { color: theme.colors.text }]}>
          Puedes seguir trabajando offline. Tus cambios se sincronizarán cuando
          recuperes la conexión.
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Acciones Disponibles
        </Text>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.primary }
          ]}
          onPress={handleNavigateToCamera}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>
            Nueva Publicación (Borrador)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.secondary }
          ]}
          onPress={handleNavigateToDrafts}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text" size={24} color="#000000" />
          <View style={styles.actionButtonContent}>
            <Text style={[styles.actionButtonText, { color: '#000000' }]}>
              Mis Borradores
            </Text>
            {drafts.length > 0 && (
              <View
                style={[styles.badge, { backgroundColor: theme.colors.error }]}
              >
                <Text style={styles.badgeText}>{drafts.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.surface }
          ]}
          onPress={handleNavigateToDownloads}
          activeOpacity={0.8}
        >
          <Ionicons name="download" size={24} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
            Fichas Descargadas
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}
      >
        <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
          Estado de Conexión
        </Text>
        <View style={styles.statusRow}>
          <Ionicons
            name={isOffline ? 'close-circle' : 'checkmark-circle'}
            size={20}
            color={isOffline ? theme.colors.error : theme.colors.primary}
          />
          <Text
            style={[styles.statusText, { color: theme.colors.textSecondary }]}
          >
            {isOffline ? 'Sin conexión a Internet' : 'Conectado'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default OfflineHomeScreen;
