import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/theme.context';
import { UserData } from '@/domain/models/user.models';
import { useBackHandler } from '@/presentation/hooks/use-back-handler.hook';
import { createStyles } from './user-details.styles';
import CustomModal from '../../components/ui/custom-modal.component';

interface InfoCardProps {
  icon: string;
  iconType?: 'ionicons' | 'material';
  label: string;
  value: string | number;
  color?: string;
  styles: ReturnType<typeof createStyles>;
}

const InfoCard = React.memo<InfoCardProps>(
  ({ icon, iconType = 'ionicons', label, value, color, styles }) => {
    const { theme } = useTheme();
    const iconColor = color || theme.colors.primary;
    const IconComponent =
      iconType === 'material' ? MaterialCommunityIcons : Ionicons;

    return (
      <View style={styles.infoCard}>
        <View
          style={[
            styles.infoIconContainer,
            { backgroundColor: iconColor + '15' }
          ]}
        >
          <IconComponent name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
    );
  }
);

interface SectionHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
  styles: ReturnType<typeof createStyles>;
}

const SectionHeader = React.memo<SectionHeaderProps>(
  ({ icon, title, subtitle, styles }) => {
    const { theme } = useTheme();

    return (
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name={icon} size={24} color={theme.colors.forest} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
    );
  }
);

interface ComingSoonCardProps {
  message: string;
  styles: ReturnType<typeof createStyles>;
}

const ComingSoonCard = React.memo<ComingSoonCardProps>(
  ({ message, styles }) => {
    const { theme } = useTheme();

    return (
      <View style={styles.comingSoonCard}>
        <View
          style={[
            styles.comingSoonIconContainer,
            { backgroundColor: theme.colors.warning + '15' }
          ]}
        >
          <Ionicons
            name="time-outline"
            size={30}
            color={theme.colors.warning}
          />
        </View>
        <Text style={styles.comingSoonTitle}>Próximamente</Text>
        <Text style={styles.comingSoonMessage}>{message}</Text>
      </View>
    );
  }
);

type PublicationStatus = 'Accepted' | 'Rejected' | 'Pending';

interface UserPublication {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  status: PublicationStatus;
}

const UserDetailsScreen: React.FC = () => {
  const route = useRoute();
  const { user } = route.params as { user: UserData };
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);
  const { handleBackPress } = useBackHandler({
    enableSafeMode: true
  });

  const [selectedStatus, setSelectedStatus] =
    useState<PublicationStatus>('Accepted');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const mockPublications: UserPublication[] = useMemo(() => [], []);

  const publicationCounts = useMemo(
    () => ({
      Accepted: mockPublications.filter(p => p.status === 'Accepted').length,
      Rejected: mockPublications.filter(p => p.status === 'Rejected').length,
      Pending: mockPublications.filter(p => p.status === 'Pending').length
    }),
    [mockPublications]
  );

  const filteredPublications = useMemo(
    () => mockPublications.filter(p => p.status === selectedStatus),
    [mockPublications, selectedStatus]
  );

  const getGenderIcon = useCallback((gender: string) => {
    if (
      gender.toLowerCase() === 'male' ||
      gender.toLowerCase() === 'masculino'
    ) {
      return 'male';
    }
    if (
      gender.toLowerCase() === 'female' ||
      gender.toLowerCase() === 'femenino'
    ) {
      return 'female';
    }
    return 'male-female';
  }, []);

  const getGenderLabel = useCallback((gender: string) => {
    if (gender.toLowerCase() === 'male') return 'Masculino';
    if (gender.toLowerCase() === 'female') return 'Femenino';
    return gender;
  }, []);

  const handleEditUser = useCallback(() => {
    setShowEditModal(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

  const handleBlockUser = useCallback(() => {
    setShowBlockModal(true);
  }, []);

  const handleCloseBlockModal = useCallback(() => {
    setShowBlockModal(false);
  }, []);

  const handleConfirmBlock = useCallback(() => {
    // TODO: Implementar bloqueo de usuario cuando el backend lo soporte
    setShowBlockModal(false);
  }, []);

  const handleStatusChange = useCallback((status: PublicationStatus) => {
    setSelectedStatus(status);
  }, []);

  const getStatusIcon = useCallback((status: PublicationStatus) => {
    switch (status) {
      case 'Accepted':
        return 'checkmark-circle';
      case 'Rejected':
        return 'close-circle';
      case 'Pending':
        return 'time';
    }
  }, []);

  const getStatusLabel = useCallback((status: PublicationStatus) => {
    switch (status) {
      case 'Accepted':
        return 'Aceptadas';
      case 'Rejected':
        return 'Rechazadas';
      case 'Pending':
        return 'Pendientes';
    }
  }, []);

  const renderPublicationItem = useCallback(
    ({ item }: { item: UserPublication }) => (
      <View style={styles.publicationCard}>
        <View style={styles.publicationHeader}>
          <Text style={styles.publicationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.publicationDate}>{item.date}</Text>
        </View>
        <Text style={styles.publicationDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.publicationFooter}>
          <View style={styles.publicationLocation}>
            <Ionicons name="location" size={14} color={theme.colors.earth} />
            <Text style={styles.publicationLocationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <View
            style={[
              styles.publicationStatusBadge,
              item.status === 'Accepted' && styles.statusAccepted,
              item.status === 'Rejected' && styles.statusRejected,
              item.status === 'Pending' && styles.statusPending
            ]}
          >
            <Ionicons
              name={getStatusIcon(item.status)}
              size={12}
              color={
                item.status === 'Accepted'
                  ? theme.colors.leaf
                  : item.status === 'Rejected'
                    ? theme.colors.error
                    : theme.colors.warning
              }
            />
            <Text
              style={[
                styles.publicationStatusText,
                item.status === 'Accepted' && styles.statusTextAccepted,
                item.status === 'Rejected' && styles.statusTextRejected,
                item.status === 'Pending' && styles.statusTextPending
              ]}
            >
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
      </View>
    ),
    [styles, theme, getStatusIcon, getStatusLabel]
  );

  const renderEmptyPublications = useCallback(
    () => (
      <View style={styles.emptyPublicationsContainer}>
        <Text style={styles.emptyPublicationsIcon}>📭</Text>
        <Text style={styles.emptyPublicationsTitle}>
          Sin publicaciones {getStatusLabel(selectedStatus).toLowerCase()}
        </Text>
        <Text style={styles.emptyPublicationsMessage}>
          Este usuario no tiene publicaciones en estado{' '}
          {getStatusLabel(selectedStatus).toLowerCase()} por el momento.
        </Text>
      </View>
    ),
    [styles, selectedStatus, getStatusLabel]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.forest} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del Usuario</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userHeaderSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={50}
                color={theme.colors.textOnPrimary}
              />
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{'Usuario'}</Text>
            </View>
          </View>
          <Text style={styles.userName}>
            {user.name} {user.lastName}
          </Text>
          <Text style={styles.userEmail}>@{user.userName}</Text>
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEditUser}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Editar usuario"
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={theme.colors.textOnPrimary}
            />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.blockButton]}
            onPress={handleBlockUser}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Bloquear usuario"
          >
            <Ionicons
              name="ban-outline"
              size={20}
              color={theme.colors.textOnPrimary}
            />
            <Text style={styles.actionButtonText}>Bloquear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentSection}>
          <SectionHeader
            icon="person-circle-outline"
            title="Información Personal"
            subtitle="Datos básicos del usuario"
            styles={styles}
          />

          <InfoCard
            icon="mail"
            label="Correo Electrónico"
            value={user.email}
            color={theme.colors.water}
            styles={styles}
          />

          <InfoCard
            icon="location"
            label="Localidad"
            value={user.locality}
            color={theme.colors.earth}
            styles={styles}
          />

          <InfoCard
            icon={getGenderIcon(user.gender)}
            label="Género"
            value={getGenderLabel(user.gender)}
            color={theme.colors.forest}
            styles={styles}
          />

          <InfoCard
            icon="calendar"
            label="Edad"
            value={`${user.age} años`}
            color={theme.colors.leaf}
            styles={styles}
          />

          <SectionHeader
            icon="newspaper-outline"
            title="Publicaciones"
            subtitle="Historial de registros del usuario por estado"
            styles={styles}
          />
        </View>

        <View style={styles.statusTabsContainer}>
          {(['Accepted', 'Rejected', 'Pending'] as PublicationStatus[]).map(
            status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusTab,
                  selectedStatus === status
                    ? styles.statusTabActive
                    : styles.statusTabInactive
                ]}
                onPress={() => handleStatusChange(status)}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityLabel={`Ver publicaciones ${getStatusLabel(status).toLowerCase()}`}
                accessibilityState={{ selected: selectedStatus === status }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={[
                      styles.statusTabText,
                      selectedStatus === status
                        ? styles.statusTabTextActive
                        : styles.statusTabTextInactive
                    ]}
                  >
                    {getStatusLabel(status)}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      selectedStatus === status
                        ? styles.statusBadgeActive
                        : styles.statusBadgeInactive
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        selectedStatus === status
                          ? styles.statusBadgeTextActive
                          : styles.statusBadgeTextInactive
                      ]}
                    >
                      {publicationCounts[status]}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          )}
        </View>

        <View style={styles.publicationsContainer}>
          <FlatList
            data={filteredPublications}
            renderItem={renderPublicationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.publicationsListContainer}
            ListEmptyComponent={renderEmptyPublications}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
          />
        </View>

        <View style={styles.contentSection}>
          <SectionHeader
            icon="stats-chart-outline"
            title="Estadísticas"
            subtitle="Actividad y métricas del usuario"
            styles={styles}
          />

          <ComingSoonCard
            message="Las estadísticas del usuario estarán disponibles cuando se implemente el backend correspondiente."
            styles={styles}
          />
        </View>
      </ScrollView>

      <CustomModal
        isVisible={showEditModal}
        onClose={handleCloseEditModal}
        title="Editar Usuario"
        type="alert"
        size="small"
        icon={
          <Ionicons
            name="information-circle"
            size={50}
            color={theme.colors.water}
          />
        }
        description="Esta funcionalidad estará disponible próximamente."
        buttons={[
          {
            label: 'Entendido',
            onPress: handleCloseEditModal,
            variant: 'primary'
          }
        ]}
      />

      <CustomModal
        isVisible={showBlockModal}
        onClose={handleCloseBlockModal}
        title="Bloquear Usuario"
        type="confirmation"
        size="small"
        icon={<Ionicons name="ban" size={50} color={theme.colors.error} />}
        description={`¿Estás seguro de que deseas bloquear a ${user.name} ${user.lastName}? \n Esta acción estará disponible próximamente.`}
        buttons={[
          {
            label: 'Cancelar',
            onPress: handleCloseBlockModal,
            variant: 'outline'
          },
          {
            label: 'Bloquear',
            onPress: handleConfirmBlock,
            variant: 'danger'
          }
        ]}
        footerAlignment="space-between"
      />
    </SafeAreaView>
  );
};

InfoCard.displayName = 'InfoCard';
SectionHeader.displayName = 'SectionHeader';
ComingSoonCard.displayName = 'ComingSoonCard';
UserDetailsScreen.displayName = 'UserDetailsScreen';

export default UserDetailsScreen;
