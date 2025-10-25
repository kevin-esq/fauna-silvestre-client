import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/theme.context';
import { UserData } from '@/domain/models/user.models';
import { useBackHandler } from '@/presentation/hooks/use-back-handler.hook';
import { useUsers } from '@/presentation/hooks/use-users.hook';
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

const UserDetailsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = route.params as { user: UserData };
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);
  const { handleBackPress } = useBackHandler({
    enableSafeMode: true
  });
  const { deactivateUser } = useUsers();

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

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

  const handleDeactivateUser = useCallback(() => {
    setShowDeactivateModal(true);
  }, []);

  const handleCloseDeactivateModal = useCallback(() => {
    setShowDeactivateModal(false);
  }, []);

  const handleConfirmDeactivate = useCallback(async () => {
    if (!user.userId) {
      console.error('No se puede desactivar: userId no disponible');
      return;
    }

    try {
      setIsDeactivating(true);
      await deactivateUser(user.userId);
      setShowDeactivateModal(false);

      navigation.goBack();
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      setIsDeactivating(false);

      setShowDeactivateModal(false);
    }
  }, [user.userId, deactivateUser, navigation]);

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
            style={[styles.actionButton, styles.deactivateButton]}
            onPress={handleDeactivateUser}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Desactivar usuario"
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={theme.colors.textOnPrimary}
            />
            <Text style={styles.actionButtonText}>Desactivar</Text>
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
        isVisible={showDeactivateModal}
        onClose={handleCloseDeactivateModal}
        title="Desactivar Usuario"
        type="confirmation"
        size="small"
        icon={
          isDeactivating ? (
            <ActivityIndicator size={50} color={theme.colors.warning} />
          ) : (
            <Ionicons
              name="close-circle"
              size={50}
              color={theme.colors.warning}
            />
          )
        }
        description={
          isDeactivating
            ? 'Desactivando usuario...'
            : `¿Estás seguro de que deseas desactivar a ${user.name} ${user.lastName}?`
        }
        buttons={[
          {
            label: 'Cancelar',
            onPress: handleCloseDeactivateModal,
            variant: 'outline',
            disabled: isDeactivating
          },
          {
            label: isDeactivating ? 'Desactivando...' : 'Desactivar',
            onPress: handleConfirmDeactivate,
            variant: 'danger',
            disabled: isDeactivating
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
