import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Linking,
  TextInput,
  useWindowDimensions
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '@/presentation/contexts/theme.context';
import { UserData } from '@/domain/models/user.models';
import { useBackHandler } from '@/presentation/hooks/common/use-back-handler.hook';
import { useUsers } from '@/presentation/hooks/users/use-users.hook';
import { createStyles } from '@/presentation/screens/users/user-details.styles';
import CustomModal from '@/presentation/components/ui/custom-modal.component';
import {
  SUPPORT_CONTACT_METHODS,
  ContactMethod,
  createUnblockRequestMessage
} from '@/shared/constants/support.constants';
import { emitEvent, AppEvents } from '@/shared/utils/event-emitter';

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
  const { user, isBlocked } = route.params as {
    user: UserData;
    isBlocked?: boolean;
  };
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);
  const { handleBackPress } = useBackHandler({
    enableSafeMode: true
  });
  const { deactivateUser } = useUsers();

  const inputWidth = useMemo(() => {
    return screenWidth * 0.7;
  }, [screenWidth]);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showConfirmBlockModal, setShowConfirmBlockModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockConfirmText, setBlockConfirmText] = useState('');

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

  const handleBlockUser = useCallback(() => {
    setShowBlockModal(true);
  }, []);

  const handleCloseBlockModal = useCallback(() => {
    setShowBlockModal(false);
  }, []);

  const handleProceedToConfirm = useCallback(() => {
    setShowBlockModal(false);
    setShowConfirmBlockModal(true);
    setBlockConfirmText('');
  }, []);

  const handleCloseConfirmBlockModal = useCallback(() => {
    setShowConfirmBlockModal(false);
    setBlockConfirmText('');
  }, []);

  const handleConfirmBlock = useCallback(async () => {
    if (!user.userId || blockConfirmText.toUpperCase() !== 'BLOQUEAR') {
      return;
    }

    try {
      setIsBlocking(true);
      await deactivateUser(user.userId);
      setShowConfirmBlockModal(false);
      setBlockConfirmText('');

      emitEvent(AppEvents.USER_BLOCKED, { userId: user.userId });

      navigation.goBack();
    } catch {
      setIsBlocking(false);
      setShowConfirmBlockModal(false);
      setBlockConfirmText('');
    }
  }, [user.userId, deactivateUser, navigation, blockConfirmText]);

  const isConfirmTextValid = blockConfirmText.toUpperCase() === 'BLOQUEAR';

  const handleRequestUnblock = useCallback(() => {
    setShowSupportModal(true);
  }, []);

  const handleCloseSupportModal = useCallback(() => {
    setShowSupportModal(false);
  }, []);

  const handleContactSupport = useCallback(
    async (method: ContactMethod) => {
      setShowSupportModal(false);

      const customMessage = createUnblockRequestMessage({
        userName: user.userName,
        name: user.name,
        lastName: user.lastName,
        email: user.email
      });

      const url = method.url(method.value, customMessage);

      try {
        await Linking.openURL(url);
      } catch {
        setShowSupportModal(false);
      }
    },
    [user]
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
          {isBlocked ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.unblockRequestButton]}
              onPress={handleRequestUnblock}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Solicitar desbloqueo"
            >
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={theme.colors.textOnPrimary}
              />
              <Text style={styles.actionButtonText}>Solicitar Desbloqueo</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.deactivateButton]}
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
          )}
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
        isVisible={showBlockModal}
        onClose={handleCloseBlockModal}
        title="⚠️ Bloquear Usuario"
        type="confirmation"
        size="small"
        icon={
          <Ionicons name="warning" size={50} color={theme.colors.warning} />
        }
        description={`¿Estás seguro de que deseas bloquear a ${user.name} ${user.lastName}?\n\n⚠️ Esta acción NO puede ser revertida por un administrador. Para desbloquear al usuario, será necesario contactar a soporte técnico.`}
        buttons={[
          {
            label: 'Cancelar',
            onPress: handleCloseBlockModal,
            variant: 'outline'
          },
          {
            label: 'Continuar',
            onPress: handleProceedToConfirm,
            variant: 'primary'
          }
        ]}
        footerAlignment="space-between"
      />

      <CustomModal
        isVisible={showConfirmBlockModal}
        onClose={handleCloseConfirmBlockModal}
        title="🚨 Confirmación Final"
        type="confirmation"
        size="large"
        centered
        icon={
          isBlocking ? (
            <ActivityIndicator size={50} color={theme.colors.error} />
          ) : (
            <Ionicons name="ban" size={50} color={theme.colors.error} />
          )
        }
        buttons={[
          {
            label: 'Cancelar',
            onPress: handleCloseConfirmBlockModal,
            variant: 'outline',
            disabled: isBlocking
          },
          {
            label: isBlocking ? 'Bloqueando...' : 'Bloquear Usuario',
            onPress: handleConfirmBlock,
            variant: 'danger',
            disabled: isBlocking || !isConfirmTextValid
          }
        ]}
        footerAlignment="space-between"
      >
        {isBlocking ? (
          <Text
            style={{
              fontSize: theme.typography.fontSize.medium,
              color: theme.colors.text,
              textAlign: 'center',
              marginVertical: theme.spacing.large
            }}
          >
            Bloqueando usuario...
          </Text>
        ) : (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.fontSize.medium,
                color: theme.colors.text,
                textAlign: 'center',
                marginBottom: theme.spacing.large,
                lineHeight: theme.typography.lineHeight.large
              }}
            >
              Si estás completamente seguro de que deseas bloquear a{' '}
              <Text style={{ fontWeight: theme.typography.fontWeight.bold }}>
                {user.name} {user.lastName}
              </Text>
              , escribe en el siguiente recuadro la palabra:
            </Text>
            <Text
              style={{
                fontSize: theme.typography.fontSize.xlarge,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                marginBottom: theme.spacing.small,
                textAlign: 'center'
              }}
            >
              BLOQUEAR
            </Text>
            <View style={{ width: inputWidth }}>
              <TextInput
                style={[
                  styles.confirmInput,
                  {
                    borderColor: isConfirmTextValid
                      ? theme.colors.success
                      : theme.colors.border,
                    borderWidth: 2
                  }
                ]}
                value={blockConfirmText}
                onChangeText={setBlockConfirmText}
                placeholder=""
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={8}
              />
            </View>
            {blockConfirmText.length > 0 && !isConfirmTextValid && (
              <Text
                style={{
                  color: theme.colors.error,
                  fontSize: theme.typography.fontSize.small,
                  marginTop: theme.spacing.small,
                  textAlign: 'center'
                }}
              >
                ❌ Debe escribir exactamente: BLOQUEAR
              </Text>
            )}
            {isConfirmTextValid && (
              <Text
                style={{
                  color: theme.colors.success,
                  fontSize: theme.typography.fontSize.small,
                  marginTop: theme.spacing.small,
                  textAlign: 'center',
                  fontWeight: theme.typography.fontWeight.bold
                }}
              >
                ✓ Confirmación correcta
              </Text>
            )}
          </View>
        )}
      </CustomModal>

      <CustomModal
        isVisible={showSupportModal}
        onClose={handleCloseSupportModal}
        title="Solicitar Desbloqueo"
        description={`Selecciona cómo contactar a soporte para desbloquear a ${user.name} ${user.lastName}`}
        type="default"
        size="medium"
        centered
        showFooter={false}
      >
        <View style={styles.supportMethodsContainer}>
          {SUPPORT_CONTACT_METHODS.map(method => {
            const IconComponent =
              method.iconLibrary === 'material'
                ? MaterialCommunityIcons
                : method.iconLibrary === 'fontawesome5'
                  ? FontAwesome5
                  : Ionicons;

            return (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.supportMethodButton,
                  { backgroundColor: method.color }
                ]}
                onPress={() => handleContactSupport(method)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Contactar por ${method.label}`}
              >
                <View style={styles.supportMethodIconContainer}>
                  <IconComponent name={method.icon} size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.supportMethodLabel}>{method.label}</Text>
                <Text style={styles.supportMethodValue}>{method.value}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCloseSupportModal}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </CustomModal>
    </SafeAreaView>
  );
};

InfoCard.displayName = 'InfoCard';
SectionHeader.displayName = 'SectionHeader';
ComingSoonCard.displayName = 'ComingSoonCard';
UserDetailsScreen.displayName = 'UserDetailsScreen';

export default UserDetailsScreen;
