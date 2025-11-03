import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ActivityIndicator,
  TextInput,
  Linking,
  useWindowDimensions,
  RefreshControl
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Theme, themeVariables, useTheme } from '@/presentation/contexts/theme.context';
import LocationMap from '@/presentation/components/ui/location-map.component';
import { createStyles } from '@/presentation/screens/publication/publication-details-screen.styles';
import { useAuth } from '@/presentation/contexts/auth.context';
import type {
  PublicationModelResponse,
  PublicationStatus
} from '@/domain/models/publication.models';
import { useRoute } from '@react-navigation/native';
import PublicationImage from '@/presentation/components/publication/publication-image.component';
import CustomModal from '@/presentation/components/ui/custom-modal.component';
import Share from 'react-native-share';
import Modal from 'react-native-modal';
import {
  useBackHandler,
  useModalBackHandler
} from '@/presentation/hooks/common/use-back-handler.hook';
import ImageZoom from 'react-native-image-pan-zoom';
import { Image } from 'moti';
import { usePublications } from '@/presentation/contexts/publication.context';
import { PublicationStatus as PubStatus } from '@/services/publication/publication.service';
import {
  SUPPORT_CONTACT_METHODS,
  ContactMethod,
  createDeletePublicationMessage
} from '@/shared/constants/support.constants';
import RNFS from 'react-native-fs';

const { width, height } = Dimensions.get('window');

const REASON_TAG = '[MOTIVO MODIFICADO]:';
const STATUS_CHANGE_TAG = '[ESTADO MODIFICADO]:';

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
  | 'reason'
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
  iconColor?: string;
  iconLibrary?: 'ionicons' | 'material' | 'fontawesome';
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
  ({
    title,
    icon,
    content,
    showEdit = false,
    onEdit,
    theme,
    styles,
    iconColor,
    iconLibrary = 'ionicons'
  }) => {
    const IconComponent =
      iconLibrary === 'material'
        ? MaterialCommunityIcons
        : iconLibrary === 'fontawesome'
          ? FontAwesome5
          : Ionicons;

    const color = iconColor || theme.colors.primary;

    return (
      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <View
              style={[styles.iconContainer, { backgroundColor: color + '15' }]}
            >
              <IconComponent name={icon} size={20} color={color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          </View>
          {showEdit && onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.editButton}>
              <MaterialIcons
                name="edit"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.sectionContent}>{content}</Text>
      </View>
    );
  }
);

interface ReasonWithTagProps {
  reason: string;
  theme: Theme;
}

const ReasonWithTag = React.memo<ReasonWithTagProps>(({ reason, theme }) => {
  const hasReasonTag = reason.startsWith(REASON_TAG);
  const hasStatusTag = reason.startsWith(STATUS_CHANGE_TAG);

  if (!hasReasonTag && !hasStatusTag) {
    return (
      <Text
        style={{
          fontSize: 15,
          lineHeight: 24,
          color: theme.colors.text,
          fontWeight: '400',
          letterSpacing: 0.2
        }}
      >
        {reason}
      </Text>
    );
  }

  const tag = hasReasonTag ? REASON_TAG : STATUS_CHANGE_TAG;
  const cleanReason = reason.substring(tag.length).trim();
  const tagLabel = hasReasonTag ? 'Motivo modificado' : 'Estado modificado';
  const tagIcon = hasReasonTag ? 'create-outline' : 'swap-horizontal-outline';

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
          backgroundColor: '#FF9800',
          shadowColor: '#FF9800',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 3,
          gap: 6
        }}
      >
        <Ionicons name={tagIcon} size={14} color="#FFFFFF" />
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: '#FFFFFF',
            letterSpacing: 0.3,
            textTransform: 'capitalize'
          }}
        >
          {tagLabel}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 15,
          lineHeight: 24,
          color: theme.colors.text,
          fontWeight: '400',
          letterSpacing: 0.2
        }}
      >
        {cleanReason}
      </Text>
    </View>
  );
});

export default function PublicationDetailsScreen() {
  const route = useRoute();
  const { publication, status, reason } = route.params as {
    publication: PublicationModelResponse;
    status: PublicationStatus;
    reason?: string | undefined;
  };

  const themeContext = useTheme();
  const { theme, spacing } = themeContext;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

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
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [imageModalMessage, setImageModalMessage] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });
  const [editModalVisible, setEditModalVisible] = useState<EditModalType>(null);
  const [actionModalVisible, setActionModalVisible] =
    useState<ActionModalType>(null);
  const [editValue, setEditValue] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [selectedStatus, setSelectedStatus] =
    useState<PublicationStatus>(status);
  // COMENTADO - No implementado
  // const [selectedAnimalState, setSelectedAnimalState] = useState<
  //   'ALIVE' | 'DEAD' | string
  // >(publication.animalState || 'ALIVE');

  const [isProcessing, setIsProcessing] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [editedReason, setEditedReason] = useState(
    publication.rejectedReason || ''
  );
  const [showDeleteSupportModal, setShowDeleteSupportModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const inputWidth = useMemo(() => {
    return screenWidth - spacing.medium * 5;
  }, [screenWidth, spacing.medium]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

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
    setStatusChangeReason('');
    setOperationError(null);
    setShowDeleteSupportModal(false);
  }, []);

  const removeReasonTag = useCallback((reason: string): string => {
    if (reason.startsWith(REASON_TAG)) {
      return reason.substring(REASON_TAG.length).trim();
    }
    if (reason.startsWith(STATUS_CHANGE_TAG)) {
      return reason.substring(STATUS_CHANGE_TAG.length).trim();
    }
    return reason;
  }, []);

  const addReasonTag = useCallback((reason: string): string => {
    const cleanReason = reason.trim();
    if (!cleanReason) return '';
    if (cleanReason.startsWith(REASON_TAG)) return cleanReason;
    return `${REASON_TAG} ${cleanReason}`;
  }, []);

  const toggleImageExpand = useCallback(() => {
    setIsImageExpanded(prev => !prev);
  }, []);

  const handleShareImage = useCallback(async () => {
    if (!publication.img) {
      setImageModalMessage({
        visible: true,
        title: 'Error',
        message: 'No hay imagen disponible para compartir'
      });
      return;
    }

    setIsDownloadingImage(true);
    let filePath;
    try {
      const fileName = `image_${Date.now()}.jpg`;
      filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      const downloadResult = await RNFS.downloadFile({
        fromUrl: publication.img,
        toFile: filePath
      }).promise;

      if (downloadResult.statusCode !== 200) {
        throw new Error(
          `Error al descargar la imagen: Código ${downloadResult.statusCode}`
        );
      }

      await Share.open({
        title: `Compartir ${publication.commonNoun}`,
        url: `file://${filePath}`,
        type: 'image/jpeg',
        failOnCancel: false
      });
    } catch (error) {
      console.error('Error compartiendo imagen:', error);
      const errorMessage = error instanceof Error ? error.message : '';
      if (!errorMessage.includes('User did not share')) {
        setImageModalMessage({
          visible: true,
          title: 'Error',
          message: `No se pudo compartir la imagen. Detalle: ${errorMessage}`
        });
      }
    } finally {
      if (filePath) {
        try {
          await RNFS.unlink(filePath);
        } catch (unlinkError) {
          console.error('Error al eliminar el archivo temporal:', unlinkError);
        }
      }
      setIsDownloadingImage(false);
    }
  }, [publication]);

  const handleSaveImage = useCallback(async () => {
    if (!publication.img) {
      setImageModalMessage({
        visible: true,
        title: 'Error',
        message: 'No hay imagen disponible para descargar'
      });
      return;
    }

    setIsSavingImage(true);
    try {
      const timestamp = Date.now();
      const animalName = publication.commonNoun.replace(/\s+/g, '_');
      const fileName = `FaunaSilvestre_${animalName}_${timestamp}.jpg`;
      const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const downloadResult = await RNFS.downloadFile({
        fromUrl: publication.img,
        toFile: filePath
      }).promise;

      if (downloadResult.statusCode !== 200) {
        throw new Error(
          `Error al descargar la imagen: Código ${downloadResult.statusCode}`
        );
      }

      setImageModalMessage({
        visible: true,
        title: '✅ Imagen descargada',
        message: `La imagen de ${publication.commonNoun} se guardó en Descargas.\n\n📁 ${fileName}`
      });

      console.log('✅ Imagen guardada en:', filePath);
    } catch (error) {
      console.error('Error guardando imagen:', error);
      const errorMessage = error instanceof Error ? error.message : '';
      setImageModalMessage({
        visible: true,
        title: 'Error',
        message: `No se pudo descargar la imagen. Detalle: ${errorMessage}`
      });
    } finally {
      setIsSavingImage(false);
    }
  }, [publication]);

  const openEditModal = useCallback(
    (type: EditModalType, currentValue: string) => {
      const valueToEdit =
        type === 'reason' ? removeReasonTag(currentValue) : currentValue;
      setEditValue(valueToEdit);
      setEditModalVisible(type);
    },
    [removeReasonTag]
  );

  const closeEditModal = useCallback(() => {
    setEditModalVisible(null);
    setEditValue('');
    setStatusChangeReason('');
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

  const handleSaveEdit = useCallback(async () => {
    if (editModalVisible === 'reason' && editValue.trim()) {
      const reasonWithTag = addReasonTag(editValue);

      try {
        setIsProcessing(true);
        setOperationError(null);

        await rejectPublication(
          publication.recordId.toString(),
          PubStatus.REJECTED,
          reasonWithTag
        );

        setEditedReason(reasonWithTag);
        closeEditModal();
      } catch (error) {
        setOperationError(
          error instanceof Error
            ? error.message
            : 'Error al actualizar el motivo de rechazo'
        );
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    closeEditModal();
  }, [
    editModalVisible,
    editValue,
    closeEditModal,
    addReasonTag,
    rejectPublication,
    publication.recordId
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

      closeActionModal();

      setTimeout(() => {
        handleBackPress();
      }, 500);
    } catch (error) {
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
        PubStatus.PENDING,
        rejectionReason
      );

      closeActionModal();

      setTimeout(() => {
        handleBackPress();
      }, 500);
    } catch (error) {
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
      } else {
        const finalReason = statusChangeReason.trim()
          ? `${STATUS_CHANGE_TAG} ${statusChangeReason.trim()}`
          : `${STATUS_CHANGE_TAG} Estado cambiado manualmente por administrador`;
        await rejectPublication(
          publication.recordId.toString(),
          fromStatus,
          finalReason
        );
      }

      closeEditModal();
      closeActionModal();

      setTimeout(() => {
        handleBackPress();
      }, 500);
    } catch (error) {
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
    statusChangeReason,
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

  const handleRequestDelete = useCallback(() => {
    setShowDeleteSupportModal(true);
  }, []);

  const handleCloseDeleteSupportModal = useCallback(() => {
    setShowDeleteSupportModal(false);
  }, []);

  const handleContactSupportForDelete = useCallback(
    async (method: ContactMethod) => {
      setShowDeleteSupportModal(false);

      const customMessage = createDeletePublicationMessage(
        {
          recordId: publication.recordId,
          commonNoun: publication.commonNoun,
          userName: publication.userName,
          createdDate: publication.createdDate,
          status: statusConfig.label
        },
        isAdmin,
        deleteReason.trim() || undefined
      );

      const url = method.url(method.value, customMessage);

      try {
        await Linking.openURL(url);

        setDeleteReason('');
      } catch {
        setShowDeleteSupportModal(false);
      }
    },
    [publication, statusConfig.label, isAdmin, deleteReason]
  );

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

        <TouchableOpacity
          onPress={handleRequestDelete}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.surfaceVariant,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8
          }}
          activeOpacity={0.7}
          disabled={isProcessing}
          accessibilityRole="button"
          accessibilityLabel="Más opciones"
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={toggleImageExpand}
          style={styles.heroImageContainer}
          disabled={!publication.img || isProcessing}
        >
          <View style={styles.imageCard}>
            <PublicationImage
              uri={publication.img}
              commonNoun={publication.commonNoun}
              viewMode="presentation"
              style={styles.image}
            />
          </View>

          <View style={styles.heroGradientOverlay}>
            <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
              <Defs>
                <SvgLinearGradient
                  id="heroGradient"
                  x1="0"
                  y1="1"
                  x2="0"
                  y2="0"
                >
                  <Stop offset="0" stopColor="#000000" stopOpacity="0.85" />
                  <Stop offset="0.4" stopColor="#000000" stopOpacity="0.6" />
                  <Stop offset="0.7" stopColor="#000000" stopOpacity="0.3" />
                  <Stop offset="1" stopColor="#000000" stopOpacity="0" />
                </SvgLinearGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#heroGradient)"
              />
            </Svg>
          </View>

          <View style={styles.heroContentOverlay}>
            <View style={styles.statusBadge}>
              <Ionicons
                name={statusConfig.icon}
                size={20}
                color={statusConfig.color}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>

            <View style={styles.heroTitleContainer}>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {publication.commonNoun}
              </Text>
              {publication.userName && (
                <Text style={styles.heroSubtitle}>
                  Publicado por @{publication.userName}
                </Text>
              )}
            </View>
          </View>

          {publication.img && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={toggleImageExpand}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="fullscreen"
                size={24}
                color={theme.colors.forest}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {publication.img && (
          <View style={styles.imageActionsRow}>
            <TouchableOpacity
              style={[styles.imageActionButton, styles.downloadImageButton]}
              onPress={handleSaveImage}
              disabled={isSavingImage}
              activeOpacity={0.8}
            >
              {isSavingImage ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="download-outline" size={20} color="white" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.imageActionButton, styles.shareImageButton]}
              onPress={handleShareImage}
              disabled={isDownloadingImage}
              activeOpacity={0.8}
            >
              {isDownloadingImage ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="share-social" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.contentSection}>
          {/* BOTÓN DE EDICIÓN COMENTADO TEMPORALMENTE - No implementado
              showEdit={isAdmin && !isProcessing}
              onEdit={() => openEditModal('description', publication.description || '')}
          */}
          <InfoSection
            title="Descripción"
            icon="document-text"
            content={publication.description || 'Sin descripción disponible'}
            theme={theme}
            styles={styles}
            iconColor="#3B82F6"
          />

          <InfoSection
            title="Ubicación del Avistamiento"
            icon="location"
            content={publication.location || 'Ubicación no especificada'}
            theme={theme}
            styles={styles}
            iconColor="#EF4444"
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
              {/* BOTÓN DE EDICIÓN COMENTADO - No implementado
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
              */}
            </View>
            <View
              style={[
                styles.stateBadge,
                {
                  backgroundColor: theme.colors.surface,
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
            iconColor="#F59E0B"
          />

          {publication.acceptedDate && (
            <InfoSection
              title="Fecha de Aceptación"
              icon="checkmark-circle"
              content={formatDate(publication.acceptedDate)}
              theme={theme}
              styles={styles}
              iconColor="#10B981"
            />
          )}

          {isAdmin && publication.userName && (
            <InfoSection
              title="Usuario"
              icon="person"
              content={'@' + publication.userName}
              theme={theme}
              styles={styles}
              iconColor="#8B5CF6"
            />
          )}

          {status === 'rejected' && publication.rejectedReason && (
            <View style={styles.infoSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: STATUS_CONFIG.rejected.color + '20' }
                    ]}
                  >
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color={STATUS_CONFIG.rejected.color}
                    />
                  </View>
                  <Text style={styles.sectionTitle}>Motivo de Rechazo</Text>
                </View>
                {isAdmin && !isProcessing && (
                  <TouchableOpacity
                    onPress={() =>
                      openEditModal(
                        'reason',
                        editedReason || publication.rejectedReason || ''
                      )
                    }
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
                  styles.rejectedReasonContainer,
                  {
                    backgroundColor: STATUS_CONFIG.rejected.bgColor,
                    borderColor: STATUS_CONFIG.rejected.color
                  }
                ]}
              >
                <ReasonWithTag
                  reason={editedReason || publication.rejectedReason || ''}
                  theme={theme}
                />
              </View>
            </View>
          )}

          {isAdmin && publication.location && (
            <InfoSection
              title="Coordenadas"
              icon="location"
              content={publication.location}
              theme={theme}
              styles={styles}
              iconColor="#EF4444"
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
                    <Ionicons
                      name="map"
                      size={20}
                      color={theme.colors.primary}
                    />
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
              iconColor="#EF4444"
            />
          )}

          {status === 'rejected' && reason && !publication.rejectedReason && (
            <View style={styles.rejectionSection}>
              <View style={styles.rejectionHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.colors.error + '20' }
                  ]}
                >
                  <Ionicons
                    name="warning"
                    size={20}
                    color={theme.colors.error}
                  />
                </View>
                <Text style={styles.rejectionTitle}>Motivo de Rechazo</Text>
                {isAdmin && !isProcessing && (
                  <TouchableOpacity
                    onPress={() =>
                      openEditModal('reason', editedReason || reason)
                    }
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
              <ReasonWithTag reason={editedReason || reason} theme={theme} />
            </View>
          )}
        </View>
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

      {/* MODAL COMENTADO - No implementado
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
      */}

      {/* MODAL COMENTADO - No implementado
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
      */}

      {/* MODAL COMENTADO - No implementado
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
      */}

      <CustomModal
        isVisible={editModalVisible === 'status'}
        onClose={closeEditModal}
        disableClose={isProcessing}
        title="Cambiar Estado de Publicación"
        description={
          selectedStatus === 'rejected' && status === 'accepted'
            ? 'Escriba el motivo del cambio'
            : 'Seleccione el nuevo estado para esta publicación'
        }
        scrollable={true}
        avoidKeyboard={true}
        showFooter
        buttons={[
          {
            label: 'Cancelar',
            onPress: closeEditModal,
            variant: 'outline',
            disabled: isProcessing
          },
          {
            label: isProcessing ? 'Cambiando...' : 'Continuar',
            onPress: handleSaveStatusChange,
            variant: 'primary',
            disabled:
              isProcessing ||
              selectedStatus === status ||
              (selectedStatus === 'rejected' &&
                status === 'accepted' &&
                !statusChangeReason.trim())
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
          {selectedStatus === 'rejected' && status === 'accepted' && (
            <View style={{ marginTop: 12, marginBottom: 40 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: 8
                }}
              >
                Motivo del cambio
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: theme.colors.surface
                }}
              >
                <TextInput
                  value={statusChangeReason}
                  onChangeText={setStatusChangeReason}
                  placeholder="Escriba el motivo del cambio..."
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                  editable={!isProcessing}
                  autoFocus={false}
                  style={{
                    fontSize: 14,
                    color: theme.colors.text,
                    minHeight: 80,
                    textAlignVertical: 'top',
                    opacity: isProcessing ? 0.6 : 1
                  }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    marginTop: 4,
                    textAlign: 'right'
                  }}
                >
                  {statusChangeReason.length}/200
                </Text>
              </View>
            </View>
          )}
        </View>
      </CustomModal>

      <CustomModal
        isVisible={editModalVisible === 'reason'}
        onClose={closeEditModal}
        disableClose={isProcessing}
        title="Editar Motivo de Rechazo"
        type="input"
        inputValue={editValue}
        onInputChange={setEditValue}
        inputPlaceholder="Ingrese el motivo de rechazo"
        inputMultiline
        inputMaxLength={300}
        inputEditable={!isProcessing}
        description={`${editValue.length}/300 caracteres`}
        showFooter
        buttons={[
          {
            label: 'Cancelar',
            onPress: closeEditModal,
            variant: 'outline',
            disabled: isProcessing
          },
          {
            label: isProcessing ? 'Guardando...' : 'Guardar',
            onPress: handleSaveEdit,
            variant: 'primary',
            disabled: isProcessing || !editValue.trim()
          }
        ]}
        animationIn="fadeInUp"
        animationOut="fadeOutDown"
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
        isVisible={actionModalVisible === 'approve'}
        onClose={closeActionModal}
        disableClose={isProcessing}
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
        disableClose={isProcessing}
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
        inputEditable={!isProcessing}
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
        disableClose={isProcessing}
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

      <CustomModal
        isVisible={showDeleteSupportModal}
        onClose={handleCloseDeleteSupportModal}
        title={isAdmin ? 'Solicitar Eliminación' : 'Ayuda con Publicación'}
        description={
          isAdmin
            ? 'Contacta a soporte para solicitar la eliminación de esta publicación'
            : 'Explica tu situación y selecciona cómo contactar a soporte'
        }
        type="default"
        size="medium"
        centered
        scrollable
        showFooter={false}
      >
        <View style={{ gap: 16, width: '100%', flexShrink: 0 }}>
          <View style={{ gap: 8, width: '100%', flexShrink: 0 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.text
              }}
            >
              {isAdmin ? 'Motivo (opcional):' : 'Motivo de la solicitud:'}
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 8,
                backgroundColor: theme.colors.background,
                height: 100,
                width: inputWidth
              }}
            >
              <TextInput
                style={{
                  padding: 12,
                  fontSize: 15,
                  color: theme.colors.text,
                  height: 100,
                  width: inputWidth - 24,
                  textAlignVertical: 'top'
                }}
                placeholder={
                  isAdmin
                    ? 'Ej: Contenido inapropiado, duplicado, etc.'
                    : 'Explica por qué deseas eliminar esta publicación...'
                }
                placeholderTextColor={theme.colors.placeholder}
                value={deleteReason}
                onChangeText={setDeleteReason}
                multiline={true}
                numberOfLines={4}
                maxLength={300}
              />
            </View>
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.textSecondary,
                textAlign: 'right'
              }}
            >
              {deleteReason.length}/300
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.text
              }}
            >
              Selecciona método de contacto:
            </Text>
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
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: method.color,
                    shadowColor: method.color,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4
                  }}
                  onPress={() => handleContactSupportForDelete(method)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Contactar por ${method.label}`}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <IconComponent
                      name={method.icon}
                      size={28}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#FFFFFF',
                        marginBottom: 4
                      }}
                    >
                      {method.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: 'rgba(255, 255, 255, 0.9)'
                      }}
                    >
                      {method.value}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color="rgba(255, 255, 255, 0.8)"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={{
            marginTop: 16,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            backgroundColor: theme.colors.surfaceVariant,
            alignItems: 'center'
          }}
          onPress={handleCloseDeleteSupportModal}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: theme.colors.text
            }}
          >
            Cancelar
          </Text>
        </TouchableOpacity>
      </CustomModal>

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

      <CustomModal
        isVisible={imageModalMessage.visible}
        onClose={() =>
          setImageModalMessage({ visible: false, title: '', message: '' })
        }
        title={imageModalMessage.title}
        type="alert"
        maxWidth={width - 40}
        size="small"
      >
        <Text
          style={{
            fontSize: 15,
            color: theme.colors.text,
            textAlign: 'center',
            lineHeight: 22
          }}
        >
          {imageModalMessage.message}
        </Text>
      </CustomModal>
    </View>
  );
}
