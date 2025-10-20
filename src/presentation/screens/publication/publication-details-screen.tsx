import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Theme, themeVariables, useTheme } from '../../contexts/theme.context';
import LocationMap from '../../components/ui/location-map.component';
import { createStyles } from './publication-details-screen.styles';
import { useAuth } from '../../contexts/auth.context';
import type {
  PublicationModelResponse,
  PublicationStatus
} from '../../../domain/models/publication.models';
import { useRoute } from '@react-navigation/native';
import PublicationImage from '@/presentation/components/publication/publication-image.component';
import CustomModal from '@/presentation/components/ui/custom-modal.component';
import Modal from 'react-native-modal';
import {
  useBackHandler,
  useModalBackHandler
} from '../../hooks/use-back-handler.hook';
import ImageZoom from 'react-native-image-pan-zoom';
import { Image } from 'moti';
import { usePublications } from '../../contexts/publication.context';
import { PublicationStatus as PubStatus } from '@/services/publication/publication.service';

const { width, height } = Dimensions.get('window');

const STATUS_CONFIG = {
  rejected: {
    icon: 'close-circle',
    color: '#EF5350',
    label: 'Rechazada',
    bgColor: '#FFEBEE'
  },
  pending: {
    icon: 'time',
    color: '#FFA726',
    label: 'Pendiente de Revisión',
    bgColor: '#FFF3E0'
  },
  accepted: {
    icon: 'checkmark-circle',
    color: '#66BB6A',
    label: 'Publicada',
    bgColor: '#E8F5E9'
  }
} as const;

type EditModalType =
  | 'description'
  | 'commonNoun'
  | 'animalState'
  | 'status'
  | null;
type ActionModalType = 'approve' | 'reject' | 'changeStatus' | null;

interface InfoSectionProps {
  title: string;
  icon: string;
  content: string;
  showEdit?: boolean;
  onEdit?: () => void;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Fecha no disponible';

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

const InfoSection = React.memo<InfoSectionProps>(
  ({ title, icon, content, showEdit = false, onEdit, theme, styles }) => (
    <View style={styles.infoSection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.primary + '20' }
            ]}
          >
            <Ionicons name={icon} size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {showEdit && onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  )
);

export default function PublicationDetailsScreen() {
  const route = useRoute();
  const { publication, status, reason } = route.params as {
    publication: PublicationModelResponse;
    status: PublicationStatus;
    reason?: string | undefined;
  };

  const themeContext = useTheme();
  const { theme } = themeContext;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const { acceptPublication, rejectPublication } = usePublications();

  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(
    () => createStyles(variables, width, height, insets, themeContext),
    [variables, insets, themeContext]
  );

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const isPending = status === 'pending';
  const isAdmin = user?.role === 'Admin';

  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState<EditModalType>(null);
  const [actionModalVisible, setActionModalVisible] =
    useState<ActionModalType>(null);
  const [editValue, setEditValue] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedStatus, setSelectedStatus] =
    useState<PublicationStatus>(status);
  const [selectedAnimalState, setSelectedAnimalState] = useState<
    'ALIVE' | 'DEAD' | string
  >(publication.animalState || 'ALIVE');

  const [isProcessing, setIsProcessing] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  const hasAnyModalOpen = useMemo(
    () =>
      isImageExpanded ||
      editModalVisible !== null ||
      actionModalVisible !== null,
    [isImageExpanded, editModalVisible, actionModalVisible]
  );

  const closeAllModals = useCallback(() => {
    setIsImageExpanded(false);
    setEditModalVisible(null);
    setActionModalVisible(null);
    setEditValue('');
    setRejectionReason('');
    setOperationError(null);
  }, []);

  const toggleImageExpand = useCallback(
    () => setIsImageExpanded(prev => !prev),
    []
  );

  const openEditModal = useCallback(
    (type: EditModalType, currentValue: string) => {
      setEditValue(currentValue);
      setEditModalVisible(type);
    },
    []
  );

  const closeEditModal = useCallback(() => {
    setEditModalVisible(null);
    setEditValue('');
    setOperationError(null);
  }, []);

  const openActionModal = useCallback((type: ActionModalType) => {
    setRejectionReason('');
    setOperationError(null);
    setActionModalVisible(type);
  }, []);

  const closeActionModal = useCallback(() => {
    setActionModalVisible(null);
    setRejectionReason('');
    setOperationError(null);
  }, []);

  const { handleBackPress } = useBackHandler();

  useModalBackHandler(hasAnyModalOpen, closeAllModals, {
    enableHardwareBack: true,
    closeOnBack: true
  });

  const handleSaveEdit = useCallback(() => {
    console.log('Guardar cambios:', {
      type: editModalVisible,
      value:
        editModalVisible === 'status'
          ? selectedStatus
          : editModalVisible === 'animalState'
            ? selectedAnimalState
            : editValue
    });

    closeEditModal();
  }, [
    editModalVisible,
    editValue,
    selectedAnimalState,
    selectedStatus,
    closeEditModal
  ]);

  const handleApprove = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setOperationError(null);

    try {
      await acceptPublication(
        publication.recordId.toString(),
        PubStatus.PENDING
      );

      console.log('Publicación aprobada exitosamente');
      closeActionModal();

      setTimeout(() => {
        handleBackPress();
      }, 500);
    } catch (error) {
      console.error('Error al aprobar publicación:', error);
      setOperationError(
        error instanceof Error
          ? error.message
          : 'Error al aprobar la publicación'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [
    isProcessing,
    publication.recordId,
    acceptPublication,
    closeActionModal,
    handleBackPress
  ]);

  const handleReject = useCallback(async () => {
    if (isProcessing || !rejectionReason.trim()) return;

    setIsProcessing(true);
    setOperationError(null);

    try {
      await rejectPublication(
        publication.recordId.toString(),
        PubStatus.PENDING
      );

      console.log('Publicación rechazada exitosamente');
      closeActionModal();

      setTimeout(() => {
        handleBackPress();
      }, 500);
    } catch (error) {
      console.error('Error al rechazar publicación:', error);
      setOperationError(
        error instanceof Error
          ? error.message
          : 'Error al rechazar la publicación'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [
    isProcessing,
    rejectionReason,
    publication.recordId,
    rejectPublication,
    closeActionModal,
    handleBackPress
  ]);

  const handleChangeStatus = useCallback(async () => {
    if (isProcessing || selectedStatus === status) return;

    setIsProcessing(true);
    setOperationError(null);

    try {
      const fromStatus =
        status === 'accepted' ? PubStatus.ACCEPTED : PubStatus.REJECTED;

      if (selectedStatus === 'accepted') {
        await acceptPublication(publication.recordId.toString(), fromStatus);
        console.log('Publicación cambiada a ACCEPTED');
      } else {
        await rejectPublication(publication.recordId.toString(), fromStatus);
        console.log('Publicación cambiada a REJECTED');
      }

      console.log(`Estado cambiado de ${status} a ${selectedStatus}`);
      closeEditModal();
      closeActionModal();

      setTimeout(() => {
        handleBackPress();
      }, 500);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setOperationError(
        error instanceof Error
          ? error.message
          : 'Error al cambiar el estado de la publicación'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [
    isProcessing,
    selectedStatus,
    status,
    publication.recordId,
    acceptPublication,
    rejectPublication,
    closeEditModal,
    closeActionModal,
    handleBackPress
  ]);

  const handleSaveStatusChange = useCallback(() => {
    if (selectedStatus === status) {
      closeEditModal();
      return;
    }

    setEditModalVisible(null);
    openActionModal('changeStatus');
  }, [selectedStatus, status, closeEditModal, openActionModal]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
          accessibilityLabel="Volver"
          accessibilityRole="button"
          disabled={isProcessing}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {publication.commonNoun}
          </Text>
        </View>

        <View style={styles.headerStatusBadge}>
          <Ionicons
            name={statusConfig.icon}
            size={18}
            color={statusConfig.color}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isProcessing}
      >
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.bgColor }
          ]}
        >
          <Ionicons
            name={statusConfig.icon}
            size={22}
            color={statusConfig.color}
          />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={toggleImageExpand}
          style={styles.imageCard}
          disabled={!publication.img || isProcessing}
        >
          <PublicationImage
            uri={publication.img}
            commonNoun={publication.commonNoun}
            viewMode="presentation"
            style={styles.image}
          />
          {publication.img && (
            <View style={styles.expandButton}>
              <MaterialIcons name="fullscreen" size={24} color="white" />
            </View>
          )}
        </TouchableOpacity>

        <InfoSection
          title="Descripción"
          icon="document-text"
          content={publication.description || 'Sin descripción disponible'}
          showEdit={isAdmin && !isProcessing}
          onEdit={() =>
            openEditModal('description', publication.description || '')
          }
          theme={theme}
          styles={styles}
        />

        <InfoSection
          title="Nombre Común"
          icon="pricetag"
          content={publication.commonNoun || 'No especificado'}
          showEdit={isAdmin && !isProcessing}
          onEdit={() =>
            openEditModal('commonNoun', publication.commonNoun || '')
          }
          theme={theme}
          styles={styles}
        />

        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      publication.animalState === 'ALIVE'
                        ? theme.colors.success + '20'
                        : theme.colors.error + '20'
                  }
                ]}
              >
                <MaterialIcons
                  name={
                    publication.animalState === 'ALIVE' ? 'pets' : 'healing'
                  }
                  size={20}
                  color={
                    publication.animalState === 'ALIVE'
                      ? theme.colors.success
                      : theme.colors.error
                  }
                />
              </View>
              <Text style={styles.sectionTitle}>Estado del Animal</Text>
            </View>
            {isAdmin && !isProcessing && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedAnimalState(publication.animalState || 'ALIVE');
                  setEditModalVisible('animalState');
                }}
                style={styles.editButton}
              >
                <MaterialIcons
                  name="edit"
                  size={20}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
          <View
            style={[
              styles.stateBadge,
              {
                backgroundColor:
                  publication.animalState === 'ALIVE'
                    ? theme.colors.success + '15'
                    : theme.colors.error + '15',
                borderColor:
                  publication.animalState === 'ALIVE'
                    ? theme.colors.success
                    : theme.colors.error
              }
            ]}
          >
            <Text
              style={[
                styles.stateBadgeText,
                {
                  color:
                    publication.animalState === 'ALIVE'
                      ? theme.colors.success
                      : theme.colors.error
                }
              ]}
            >
              {publication.animalState === 'ALIVE' ? 'Vivo' : 'Muerto'}
            </Text>
          </View>
        </View>

        {isAdmin && !isPending && (
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: statusConfig.color + '20' }
                  ]}
                >
                  <Ionicons
                    name={statusConfig.icon}
                    size={20}
                    color={statusConfig.color}
                  />
                </View>
                <Text style={styles.sectionTitle}>Estado de Publicación</Text>
              </View>
              {!isProcessing && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedStatus(status);
                    setEditModalVisible('status');
                  }}
                  style={styles.editButton}
                >
                  <MaterialIcons
                    name="edit"
                    size={20}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
            <View
              style={[
                styles.stateBadge,
                {
                  backgroundColor: statusConfig.bgColor,
                  borderColor: statusConfig.color
                }
              ]}
            >
              <Text
                style={[styles.stateBadgeText, { color: statusConfig.color }]}
              >
                {statusConfig.label}
              </Text>
            </View>
          </View>
        )}

        <InfoSection
          title="Fecha de Creación"
          icon="calendar"
          content={formatDate(publication.createdDate)}
          theme={theme}
          styles={styles}
        />

        {isAdmin && publication.author && (
          <InfoSection
            title="Usuario"
            icon="person"
            content={publication.author}
            theme={theme}
            styles={styles}
          />
        )}

        {isAdmin && publication.location && (
          <InfoSection
            title="Coordenadas"
            icon="location"
            content={publication.location}
            theme={theme}
            styles={styles}
          />
        )}

        {publication.location ? (
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.colors.primary + '20' }
                  ]}
                >
                  <Ionicons name="map" size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>Ubicación en Mapa</Text>
              </View>
            </View>
            <View style={styles.mapContainer}>
              <LocationMap
                location={publication.location}
                showCoordinates={true}
                showControls={true}
                markerTitle="Ubicación Reportada"
                markerDescription="Esta es la ubicación donde se reportó al animal."
              />
            </View>
          </View>
        ) : (
          <InfoSection
            title="Ubicación"
            icon="map"
            content="Ubicación no disponible"
            theme={theme}
            styles={styles}
          />
        )}

        {status === 'rejected' && reason && (
          <View style={styles.rejectionSection}>
            <View style={styles.rejectionHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.error + '20' }
                ]}
              >
                <Ionicons name="warning" size={20} color={theme.colors.error} />
              </View>
              <Text style={styles.rejectionTitle}>Motivo de Rechazo</Text>
            </View>
            <Text style={styles.rejectionText}>{reason}</Text>
          </View>
        )}
      </ScrollView>

      {isAdmin && isPending && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.rejectButton, isProcessing && { opacity: 0.5 }]}
            onPress={() => openActionModal('reject')}
            activeOpacity={0.8}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="close-circle" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Rechazar</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.approveButton, isProcessing && { opacity: 0.5 }]}
            onPress={() => openActionModal('approve')}
            activeOpacity={0.8}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Aprobar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Modales de edición */}
      <CustomModal
        isVisible={editModalVisible === 'description'}
        onClose={closeEditModal}
        title="Editar Descripción"
        type="input"
        inputValue={editValue}
        onInputChange={setEditValue}
        inputPlaceholder="Ingrese la descripción"
        inputMultiline
        inputMaxLength={500}
        description={`${editValue.length}/500 caracteres`}
        showFooter
        buttons={[
          {
            label: 'Cancelar',
            onPress: closeEditModal,
            variant: 'outline',
            disabled: isProcessing
          },
          {
            label: 'Guardar',
            onPress: handleSaveEdit,
            variant: 'primary',
            disabled: isProcessing
          }
        ]}
        animationIn="fadeInUp"
        animationOut="fadeOutDown"
        animationInTiming={200}
        animationOutTiming={200}
        maxWidth={width - 40}
        size="full"
      />

      <CustomModal
        isVisible={editModalVisible === 'commonNoun'}
        onClose={closeEditModal}
        title="Editar Nombre Común"
        type="input"
        inputValue={editValue}
        onInputChange={setEditValue}
        inputPlaceholder="Ingrese el nombre común"
        inputMaxLength={100}
        showFooter
        buttons={[
          {
            label: 'Cancelar',
            onPress: closeEditModal,
            variant: 'outline',
            disabled: isProcessing
          },
          {
            label: 'Guardar',
            onPress: handleSaveEdit,
            variant: 'primary',
            disabled: isProcessing
          }
        ]}
        animationInTiming={200}
        animationOutTiming={200}
        maxWidth={width - 40}
        size="full"
      />

      <CustomModal
        isVisible={editModalVisible === 'animalState'}
        onClose={closeEditModal}
        title="Cambiar Estado del Animal"
        showFooter
        buttons={[
          {
            label: 'Cancelar',
            onPress: closeEditModal,
            variant: 'outline',
            disabled: isProcessing
          },
          {
            label: 'Guardar',
            onPress: handleSaveEdit,
            variant: 'primary',
            disabled: isProcessing
          }
        ]}
        animationInTiming={200}
        animationOutTiming={200}
        maxWidth={width - 40}
        size="full"
      >
        <View style={{ gap: 12 }}>
          <Pressable
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: 12,
                padding: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor:
                  selectedAnimalState === 'ALIVE'
                    ? theme.colors.success
                    : theme.colors.border,
                backgroundColor:
                  selectedAnimalState === 'ALIVE'
                    ? theme.colors.success + '10'
                    : theme.colors.background,
                opacity: pressed ? 0.7 : 1
              }
            ]}
            onPress={() => setSelectedAnimalState('ALIVE')}
            disabled={isProcessing}
          >
            <MaterialIcons name="pets" size={24} color={theme.colors.success} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.success,
                flex: 1
              }}
            >
              Vivo
            </Text>
            {selectedAnimalState === 'ALIVE' && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={theme.colors.success}
              />
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor:
                  selectedAnimalState === 'DEAD'
                    ? theme.colors.error
                    : theme.colors.border,
                backgroundColor:
                  selectedAnimalState === 'DEAD'
                    ? theme.colors.error + '10'
                    : theme.colors.background,
                opacity: pressed ? 0.7 : 1
              }
            ]}
            onPress={() => setSelectedAnimalState('DEAD')}
            disabled={isProcessing}
          >
            <MaterialIcons
              name="healing"
              size={24}
              color={theme.colors.error}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.error,
                flex: 1
              }}
            >
              Muerto
            </Text>
            {selectedAnimalState === 'DEAD' && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={theme.colors.error}
              />
            )}
          </Pressable>
        </View>
      </CustomModal>

      <CustomModal
        isVisible={editModalVisible === 'status'}
        onClose={closeEditModal}
        title="Cambiar Estado de Publicación"
        description="Seleccione el nuevo estado para esta publicación"
        showFooter
        buttons={[
          {
            label: 'Cancelar',
            onPress: closeEditModal,
            variant: 'outline',
            disabled: isProcessing
          },
          {
            label: 'Continuar',
            onPress: handleSaveStatusChange,
            variant: 'primary',
            disabled: isProcessing || selectedStatus === status
          }
        ]}
        animationInTiming={200}
        animationOutTiming={200}
        maxWidth={width - 40}
        size="full"
      >
        <View style={{ gap: 12 }}>
          {(['accepted', 'rejected'] as const).map(statusOption => {
            const config = STATUS_CONFIG[statusOption];
            return (
              <Pressable
                key={statusOption}
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    gap: 12,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      selectedStatus === statusOption
                        ? config.color
                        : theme.colors.border,
                    backgroundColor:
                      selectedStatus === statusOption
                        ? config.bgColor
                        : theme.colors.background,
                    opacity: pressed ? 0.7 : 1
                  }
                ]}
                onPress={() => setSelectedStatus(statusOption)}
                disabled={isProcessing}
              >
                <Ionicons name={config.icon} size={24} color={config.color} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: config.color,
                    flex: 1
                  }}
                >
                  {config.label}
                </Text>
                {selectedStatus === statusOption && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={config.color}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </CustomModal>

      {/* Modales de acción */}
      <CustomModal
        isVisible={actionModalVisible === 'approve'}
        onClose={closeActionModal}
        title="Aprobar Publicación"
        centered
        icon={
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: theme.colors.success + '20',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons
              name="checkmark-circle"
              size={32}
              color={theme.colors.success}
            />
          </View>
        }
        description="¿Está seguro que desea aprobar esta publicación? Será visible para todos los usuarios."
        showFooter
        footerAlignment="end"
        buttons={[
          {
            label: 'Cancelar',
            onPress: closeActionModal,
            variant: 'outline',
            disabled: isProcessing
          },
          {
            label: isProcessing ? 'Aprobando...' : 'Aprobar',
            onPress: handleApprove,
            variant: 'primary',
            disabled: isProcessing
          }
        ]}
        animationInTiming={200}
        animationOutTiming={200}
        maxWidth={width - 40}
        size="full"
      >
        {operationError && (
          <View
            style={{
              padding: 12,
              backgroundColor: theme.colors.error + '15',
              borderRadius: 8,
              marginTop: 12
            }}
          >
            <Text
              style={{
                color: theme.colors.error,
                fontSize: 14,
                textAlign: 'center'
              }}
            >
              {operationError}
            </Text>
          </View>
        )}
      </CustomModal>

      <CustomModal
        isVisible={actionModalVisible === 'reject'}
        onClose={closeActionModal}
        title="Rechazar Publicación"
        centered
        icon={
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: theme.colors.error + '20',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons
              name="close-circle"
              size={32}
              color={theme.colors.error}
            />
          </View>
        }
        type="input"
        inputValue={rejectionReason}
        onInputChange={setRejectionReason}
        inputPlaceholder="Motivo del rechazo..."
        inputLabel="Motivo"
        inputMultiline
        inputMaxLength={300}
        showCharacterCount
        description="Esta información será enviada al usuario"
        showFooter
        footerAlignment="end"
        buttons={[
          {
            label: 'Cancelar',
            onPress: closeActionModal,
            variant: 'outline',
            disabled: isProcessing
          },
          {
            label: isProcessing ? 'Rechazando...' : 'Rechazar',
            onPress: handleReject,
            variant: 'danger',
            disabled: !rejectionReason.trim() || isProcessing
          }
        ]}
        animationInTiming={200}
        animationOutTiming={200}
        maxWidth={width - 40}
        size="full"
      >
        {operationError && (
          <View
            style={{
              padding: 12,
              backgroundColor: theme.colors.error + '15',
              borderRadius: 8,
              marginTop: 12
            }}
          >
            <Text
              style={{
                color: theme.colors.error,
                fontSize: 14,
                textAlign: 'center'
              }}
            >
              {operationError}
            </Text>
          </View>
        )}
      </CustomModal>

      <CustomModal
        isVisible={actionModalVisible === 'changeStatus'}
        onClose={closeActionModal}
        title="Confirmar Cambio de Estado"
        centered
        icon={
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: STATUS_CONFIG[selectedStatus].color + '20',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons
              name={STATUS_CONFIG[selectedStatus].icon}
              size={32}
              color={STATUS_CONFIG[selectedStatus].color}
            />
          </View>
        }
        showFooter
        footerAlignment="end"
        buttons={[
          {
            label: 'Cancelar',
            onPress: closeActionModal,
            variant: 'outline',
            disabled: isProcessing
          },
          {
            label: isProcessing ? 'Cambiando...' : 'Confirmar',
            onPress: handleChangeStatus,
            variant: 'primary',
            disabled: isProcessing
          }
        ]}
        animationInTiming={200}
        animationOutTiming={200}
        maxWidth={width - 40}
        size="full"
      >
        <Text
          style={{
            fontSize: 15,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 8
          }}
        >
          ¿Está seguro que desea cambiar el estado de esta publicación?
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginVertical: 16
          }}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: STATUS_CONFIG[status].bgColor,
              borderWidth: 1,
              borderColor: STATUS_CONFIG[status].color
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: STATUS_CONFIG[status].color
              }}
            >
              {STATUS_CONFIG[status].label}
            </Text>
          </View>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={theme.colors.textSecondary}
          />
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: STATUS_CONFIG[selectedStatus].bgColor,
              borderWidth: 1,
              borderColor: STATUS_CONFIG[selectedStatus].color
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: STATUS_CONFIG[selectedStatus].color
              }}
            >
              {STATUS_CONFIG[selectedStatus].label}
            </Text>
          </View>
        </View>
        <Text
          style={{
            fontSize: 13,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            fontStyle: 'italic'
          }}
        >
          Este cambio actualizará el estado de la publicación inmediatamente.
        </Text>
        {operationError && (
          <View
            style={{
              padding: 12,
              backgroundColor: theme.colors.error + '15',
              borderRadius: 8,
              marginTop: 12
            }}
          >
            <Text
              style={{
                color: theme.colors.error,
                fontSize: 14,
                textAlign: 'center'
              }}
            >
              {operationError}
            </Text>
          </View>
        )}
      </CustomModal>

      {/* Modal de imagen expandida */}
      <Modal
        isVisible={isImageExpanded}
        onBackdropPress={toggleImageExpand}
        onBackButtonPress={toggleImageExpand}
        animationInTiming={250}
        animationOutTiming={250}
        backdropTransitionInTiming={250}
        backdropTransitionOutTiming={250}
        useNativeDriverForBackdrop
        useNativeDriver
        hideModalContentWhileAnimating
        style={{ margin: 0 }}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={toggleImageExpand}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={toggleImageExpand}
              >
                <Ionicons name="close" size={30} color="#FFFFFF" />
              </TouchableOpacity>

              {/* @ts-expect-error - TypeScript definitions for react-native-image-pan-zoom don't include children prop */}
              <ImageZoom
                cropWidth={Dimensions.get('window').width}
                cropHeight={Dimensions.get('window').height}
                imageWidth={Dimensions.get('window').width}
                imageHeight={Dimensions.get('window').height}
                enableSwipeDown={true}
                onSwipeDown={toggleImageExpand}
              >
                <Image
                  source={{ uri: publication.img }}
                  style={{
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').height,
                    resizeMode: 'contain'
                  }}
                />
              </ImageZoom>

              <View style={styles.modalInfo}>
                <Text style={styles.modalTitle}>{publication.commonNoun}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
