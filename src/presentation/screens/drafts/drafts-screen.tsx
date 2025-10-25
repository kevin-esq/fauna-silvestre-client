import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDraftContext } from '../../contexts/draft.context';
import { useTheme } from '../../contexts/theme.context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/navigation.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSimpleBackHandler } from '../../hooks/use-back-handler.hook';
import { DraftCard } from '../../components/draft/draft-card.component';
import { OfflineBanner } from '../../components/ui/offline-banner.component';
import { createStyles } from './drafts-screen.styles';
import {
  DraftPublication,
  DraftStatus
} from '../../../domain/models/draft.models';
import CustomModal from '@/presentation/components/ui/custom-modal.component';

const DraftsScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useSimpleBackHandler(() => {
    navigation.goBack();
  });

  const {
    drafts,
    isLoading,
    error,
    isOnline,
    pendingCount,
    deleteDraft,
    submitDraft,
    retryFailedDrafts,
    clearAllDrafts,
    refreshDrafts
  } = useDraftContext();

  const [filterStatus, setFilterStatus] = useState<DraftStatus | 'all'>('all');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [selectedDraft, setSelectedDraft] = useState<DraftPublication | null>(
    null
  );

  const filteredDrafts = drafts.filter(draft => {
    if (filterStatus === 'all') return true;
    return draft.status === filterStatus;
  });

  const handleDraftPress = useCallback(
    (draft: DraftPublication) => {
      navigation.navigate('PublicationForm', {
        imageUri: draft.imageUri,
        location: draft.location,
        draftId: draft.id
      });
    },
    [navigation]
  );

  const handleDelete = useCallback((draft: DraftPublication) => {
    setSelectedDraft(draft);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedDraft) return;
    try {
      await deleteDraft(selectedDraft.id);
      setShowDeleteModal(false);
      setSelectedDraft(null);
    } catch {
      setShowDeleteModal(false);
      setModalMessage('No se pudo eliminar el borrador');
      setShowErrorModal(true);
    }
  }, [selectedDraft, deleteDraft]);

  const handleSubmit = useCallback(
    async (draft: DraftPublication) => {
      if (!isOnline) {
        setShowOfflineModal(true);
        return;
      }

      try {
        await submitDraft(draft.id);
        setModalMessage('Borrador enviado correctamente');
        setShowSuccessModal(true);
      } catch {
        setModalMessage('No se pudo enviar el borrador');
        setShowErrorModal(true);
      }
    },
    [isOnline, submitDraft]
  );

  const handleRetryFailed = useCallback(async () => {
    try {
      await retryFailedDrafts();
      setModalMessage('Reintentando borradores fallidos');
      setShowSuccessModal(true);
    } catch {
      setModalMessage('No se pudieron reintentar los borradores');
      setShowErrorModal(true);
    }
  }, [retryFailedDrafts]);

  const handleClearAll = useCallback(() => {
    setShowClearAllModal(true);
  }, []);

  const confirmClearAll = useCallback(async () => {
    try {
      await clearAllDrafts();
      setShowClearAllModal(false);
      setModalMessage('Todos los borradores han sido eliminados');
      setShowSuccessModal(true);
    } catch {
      setShowClearAllModal(false);
      setModalMessage('No se pudieron eliminar los borradores');
      setShowErrorModal(true);
    }
  }, [clearAllDrafts]);

  const renderFilterButton = useCallback(
    (status: DraftStatus | 'all', label: string, count: number) => {
      const isActive = filterStatus === status;

      return (
        <TouchableOpacity
          style={[styles.filterTab, isActive && styles.filterTabActive]}
          onPress={() => setFilterStatus(status)}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityLabel={`Filtrar por ${label}`}
          accessibilityState={{ selected: isActive }}
        >
          <Text
            style={[
              styles.filterTabText,
              isActive && styles.filterTabTextActive
            ]}
          >
            {label}
          </Text>
          {count > 0 && (
            <View
              style={[styles.filterBadge, isActive && styles.filterBadgeActive]}
            >
              <Text
                style={[
                  styles.filterBadgeText,
                  isActive && styles.filterBadgeTextActive
                ]}
              >
                {count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [filterStatus, styles]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Volver"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.forest} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerTitleRow}>
              <Ionicons
                name="documents"
                size={28}
                color={theme.colors.forest}
              />
              <Text style={styles.headerTitle}>Mis Borradores</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              {drafts.length} {drafts.length === 1 ? 'borrador' : 'borradores'}
            </Text>
          </View>

          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{drafts.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          {pendingCount > 0 && (
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                {pendingCount}
              </Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
          )}
        </View>

        {drafts.length > 0 && (
          <View style={styles.actionsContainer}>
            {pendingCount > 0 && isOnline && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleRetryFailed}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Reintentar borradores fallidos"
              >
                <Ionicons
                  name="refresh"
                  size={18}
                  color={theme.colors.forest}
                />
                <Text style={styles.actionButtonText}>Reintentar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleClearAll}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Limpiar todos los borradores"
            >
              <Ionicons name="trash" size={18} color={theme.colors.error} />
              <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                Limpiar todo
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.filterContainer}>
          {renderFilterButton('all', 'Todos', drafts.length)}
          {renderFilterButton(
            'draft',
            'Borradores',
            drafts.filter(d => d.status === 'draft').length
          )}
          {renderFilterButton(
            'pending_upload',
            'Pendientes',
            drafts.filter(d => d.status === 'pending_upload').length
          )}
          {renderFilterButton(
            'failed',
            'Fallidos',
            drafts.filter(d => d.status === 'failed').length
          )}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle"
              size={20}
              color={theme.colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    ),
    [
      drafts,
      pendingCount,
      isOnline,
      error,
      theme,
      styles,
      navigation,
      handleRetryFailed,
      handleClearAll,
      renderFilterButton
    ]
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="document-text-outline"
            size={80}
            color={theme.colors.forest + '80'}
          />
        </View>
        <Text style={styles.emptyTitle}>No hay borradores</Text>
        <Text style={styles.emptySubtitle}>
          Los borradores guardados aparecerán aquí para que puedas continuar
          editándolos
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={refreshDrafts}
          accessibilityRole="button"
          accessibilityLabel="Actualizar lista"
        >
          <Ionicons
            name="refresh"
            size={20}
            color={theme.colors.textOnPrimary}
          />
          <Text style={styles.emptyButtonText}>Actualizar</Text>
        </TouchableOpacity>
      </View>
    ),
    [styles, theme, refreshDrafts]
  );

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />

      <FlatList
        data={filteredDrafts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <DraftCard
            draft={item}
            onPress={() => handleDraftPress(item)}
            onDelete={() => handleDelete(item)}
            onSubmit={() => handleSubmit(item)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshDrafts}
            colors={[theme.colors.forest]}
            tintColor={theme.colors.forest}
            progressBackgroundColor={theme.colors.background}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />

      <CustomModal
        isVisible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar borrador"
        type="confirmation"
        size="small"
        icon={
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: theme.colors.error + '15',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons name="trash" size={32} color={theme.colors.error} />
          </View>
        }
        description="¿Estás seguro de que deseas eliminar este borrador?"
        centered
        showFooter
        footerAlignment="space-between"
        buttons={[
          {
            label: 'Cancelar',
            onPress: () => setShowDeleteModal(false),
            variant: 'outline'
          },
          {
            label: 'Eliminar',
            onPress: confirmDelete,
            variant: 'danger'
          }
        ]}
      />

      <CustomModal
        isVisible={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        title="Sin conexión"
        type="alert"
        size="small"
        icon={
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#FF9800' + '15',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons name="cloud-offline" size={32} color="#FF9800" />
          </View>
        }
        description="No hay conexión a internet. El borrador se enviará automáticamente cuando se restablezca la conexión."
        centered
        showFooter
        buttons={[
          {
            label: 'Entendido',
            onPress: () => setShowOfflineModal(false),
            variant: 'primary'
          }
        ]}
      />

      <CustomModal
        isVisible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Éxito"
        type="alert"
        size="small"
        icon={
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#4CAF50' + '15',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
          </View>
        }
        description={modalMessage}
        centered
        showFooter
        buttons={[
          {
            label: 'Aceptar',
            onPress: () => setShowSuccessModal(false),
            variant: 'primary'
          }
        ]}
      />

      <CustomModal
        isVisible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        type="alert"
        size="small"
        icon={
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: theme.colors.error + '15',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons
              name="close-circle"
              size={32}
              color={theme.colors.error}
            />
          </View>
        }
        description={modalMessage}
        centered
        showFooter
        buttons={[
          {
            label: 'Entendido',
            onPress: () => setShowErrorModal(false),
            variant: 'primary'
          }
        ]}
      />

      <CustomModal
        isVisible={showClearAllModal}
        onClose={() => setShowClearAllModal(false)}
        title="Limpiar todos los borradores"
        type="confirmation"
        size="small"
        icon={
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: theme.colors.error + '15',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons name="warning" size={32} color={theme.colors.error} />
          </View>
        }
        description="¿Estás seguro? Esta acción no se puede deshacer."
        centered
        showFooter
        footerAlignment="space-between"
        buttons={[
          {
            label: 'Cancelar',
            onPress: () => setShowClearAllModal(false),
            variant: 'outline'
          },
          {
            label: 'Limpiar',
            onPress: confirmClearAll,
            variant: 'danger'
          }
        ]}
      />
    </SafeAreaView>
  );
};

export default DraftsScreen;
