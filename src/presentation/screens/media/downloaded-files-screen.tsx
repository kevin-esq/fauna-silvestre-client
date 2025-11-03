import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef
} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme, Theme } from '../../contexts/theme.context';
import { useDownloadedFiles } from '../../hooks/media/use-downloaded-files.hook';
import { DownloadedFile } from '../../../services/storage/local-file.service';
import { createStyles } from './downloaded-files-screen.styles';
import RNFetchBlob from 'react-native-blob-util';
import CustomModal from '../../components/ui/custom-modal.component';
import Share from 'react-native-share';
import { useBackHandler } from '@/presentation/hooks/common/use-back-handler.hook';
import { useRoute, RouteProp } from '@react-navigation/native';

interface DownloadedFileCardProps {
  file: DownloadedFile;
  onOpen: (file: DownloadedFile) => void;
  onShare: (file: DownloadedFile) => void;
  onConfirmDelete: (fileId: string, fileName: string) => void;
  formatFileSize: (bytes: number) => string;
  formatDownloadDate: (date: Date) => string;
  highlightOpacity?: Animated.Value;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}

const DownloadedFileCard = React.memo<DownloadedFileCardProps>(
  ({
    file,
    onOpen,
    onShare,
    formatFileSize,
    formatDownloadDate,
    onConfirmDelete,
    highlightOpacity,
    styles,
    theme
  }) => {
    const [isPressed, setIsPressed] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleOpen = useCallback(() => {
      onOpen(file);
    }, [file, onOpen]);

    const handleDelete = useCallback(() => {
      onConfirmDelete(file.id, file.animalName);
    }, [file, onConfirmDelete]);

    const handleShare = useCallback(() => {
      onShare(file);
    }, [file, onShare]);

    const handlePressIn = useCallback(() => {
      setIsPressed(true);
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        friction: 8
      }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
      setIsPressed(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8
      }).start();
    }, [scaleAnim]);

    const highlightStyle = highlightOpacity
      ? {
          backgroundColor: highlightOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: ['transparent', 'rgba(76, 175, 80, 0.08)']
          }),
          borderColor: highlightOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [theme.colors.border, theme.colors.leaf]
          }),
          borderWidth: highlightOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 2]
          }),
          shadowOpacity: highlightOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0.1, 0.25]
          }),
          elevation: highlightOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6]
          })
        }
      : {};

    const iconScale = highlightOpacity
      ? {
          transform: [
            {
              scale: highlightOpacity.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.1, 1]
              })
            }
          ]
        }
      : {};

    return (
      <Animated.View
        style={[highlightStyle, { transform: [{ scale: scaleAnim }] }]}
      >
        <TouchableOpacity
          style={[styles.fileCard, isPressed && styles.fileCardPressed]}
          onPress={handleOpen}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityLabel={`Abrir ficha de ${file.animalName}`}
        >
          <View style={styles.cardProgressContainer}>
            <View style={styles.cardProgressBackground} />
          </View>

          <Animated.View style={[styles.fileIconContainer, iconScale]}>
            <View style={styles.iconWrapper}>
              <Ionicons
                name="document-text"
                size={32}
                color={theme.colors.forest}
              />
            </View>
            <View style={styles.fileTypeBadge}>
              <Text style={styles.fileTypeText}>PDF</Text>
            </View>
          </Animated.View>

          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={2}>
              {file.animalName}
            </Text>

            <View style={styles.fileMetaContainer}>
              <View style={styles.fileMetaItem}>
                <Ionicons
                  name="barcode-outline"
                  size={14}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.fileMetaText}>{file.catalogId}</Text>
              </View>
              <View style={styles.fileMetaDivider} />
              <View style={styles.fileMetaItem}>
                <Ionicons
                  name="cube-outline"
                  size={14}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.fileMetaText}>
                  {formatFileSize(file.fileSize)}
                </Text>
              </View>
            </View>

            <View style={styles.fileDateContainer}>
              <Ionicons
                name="time-outline"
                size={13}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.fileDate}>
                {formatDownloadDate(file.downloadDate)}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel={`Compartir ficha de ${file.animalName}`}
            >
              <Ionicons
                name="share-social-outline"
                size={20}
                color={theme.colors.forest}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
              accessibilityRole="button"
              accessibilityLabel={`Eliminar ficha de ${file.animalName}`}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

const StorageProgressBar = React.memo<{
  used: number;
  total: number;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
  formatFileSize: (bytes: number) => string;
}>(({ used, total, styles, theme, formatFileSize }) => {
  const percentage = total > 0 ? (used / total) * 100 : 0;

  const getProgressColor = () => {
    if (percentage < 70) return theme.colors.success;
    if (percentage < 90) return theme.colors.warning;
    return theme.colors.error;
  };

  return (
    <View style={styles.storageProgressContainer}>
      <View style={styles.storageProgressHeader}>
        <Text style={styles.storageProgressTitle}>
          Almacenamiento utilizado
        </Text>
        <Text style={styles.storageProgressPercentage}>
          {Math.round(percentage)}%
        </Text>
      </View>

      <View style={styles.storageProgressBarContainer}>
        <View
          style={[
            styles.storageProgressBar,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: getProgressColor()
            }
          ]}
        />
      </View>

      <View style={styles.storageProgressFooter}>
        <Text style={styles.storageProgressText}>
          {formatFileSize(used)} de {formatFileSize(total)} utilizados
        </Text>
      </View>
    </View>
  );
});

const EmptyState = React.memo<{
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
  onRefresh: () => void;
}>(({ styles, theme, onRefresh }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconContainer}>
      <Ionicons
        name="folder-open"
        size={80}
        color={theme.colors.forest + '80'}
      />
      <View style={styles.emptyIconOverlay}>
        <Ionicons name="download" size={40} color={theme.colors.forest} />
      </View>
    </View>
    <Text style={styles.emptyTitle}>No hay fichas descargadas</Text>
    <Text style={styles.emptySubtitle}>
      Las fichas técnicas que descargues aparecerán aquí para acceso offline
    </Text>
    <TouchableOpacity
      style={styles.emptyButton}
      onPress={onRefresh}
      accessibilityRole="button"
      accessibilityLabel="Actualizar lista"
    >
      <Ionicons name="refresh" size={20} color={theme.colors.textOnPrimary} />
      <Text style={styles.emptyButtonText}>Actualizar</Text>
    </TouchableOpacity>
  </View>
));

type RouteParams = {
  justDownloadedId?: string;
};

const DownloadedFilesScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);
  const {
    files,
    error,
    successMessage,
    infoMessage,
    storageInfo,
    openDownloadedFile,
    deleteDownloadedFile,
    deleteAllFiles,
    refreshFiles,
    clearError,
    formatFileSize,
    formatDownloadDate
  } = useDownloadedFiles();

  const [refreshing, setRefreshing] = useState(false);
  const highlightOpacity = useRef(new Animated.Value(0)).current;
  const justDownloadedId = route.params?.justDownloadedId;
  const [modalMessage, setModalMessage] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  useEffect(() => {
    if (error) {
      setModalMessage({ visible: true, title: 'Error', message: error });
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      setModalMessage({
        visible: true,
        title: 'Éxito',
        message: successMessage
      });
    }
  }, [successMessage]);

  useEffect(() => {
    if (infoMessage) {
      setModalMessage({ visible: true, title: 'Info', message: infoMessage });
    }
  }, [infoMessage]);

  useEffect(() => {
    if (justDownloadedId && files.length > 0) {
      highlightOpacity.setValue(1);

      Animated.timing(highlightOpacity, {
        toValue: 0,
        duration: 3000,
        useNativeDriver: false
      }).start();
    }
  }, [justDownloadedId, files.length, highlightOpacity]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshFiles();
    setRefreshing(false);
  }, [refreshFiles]);

  const handleOpenFile = useCallback(
    (file: DownloadedFile) => {
      openDownloadedFile(file);
    },
    [openDownloadedFile]
  );

  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [confirmDeleteOne, setConfirmDeleteOne] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteAll = useCallback(() => {
    if (files.length === 0) return;
    setConfirmDeleteAll(true);
  }, [files.length]);

  const handleConfirmDeleteOne = useCallback(
    (fileId: string, fileName: string) => {
      setConfirmDeleteOne({ id: fileId, name: fileName });
    },
    []
  );

  const handleShareFile = useCallback(async (file: DownloadedFile) => {
    try {
      const exists = await RNFetchBlob.fs.exists(file.filePath);
      if (!exists) {
        setModalMessage({
          visible: true,
          title: 'Error',
          message: 'El archivo no existe o no se puede acceder'
        });
        return;
      }

      let shareUrl = file.filePath;

      if (Platform.OS === 'android') {
        const cachePath = `${RNFetchBlob.fs.dirs.CacheDir}/${file.fileName}`;
        await RNFetchBlob.fs.cp(file.filePath, cachePath);
        shareUrl = `file://${cachePath}`;
      } else {
        shareUrl = `file://${file.filePath}`;
      }

      await Share.open({
        title: `Compartir ${file.animalName}`,
        url: shareUrl,
        type: file.mimeType || 'application/pdf',
        failOnCancel: false
      });
    } catch (err) {
      console.log('❌ Error compartiendo archivo:', err);
      setModalMessage({
        visible: true,
        title: 'Error',
        message: 'No se pudo compartir el archivo.'
      });
    }
  }, []);

  const renderFileCard = useCallback(
    ({ item }: { item: DownloadedFile }) => (
      <DownloadedFileCard
        file={item}
        onOpen={handleOpenFile}
        onShare={handleShareFile}
        onConfirmDelete={handleConfirmDeleteOne}
        formatFileSize={formatFileSize}
        formatDownloadDate={formatDownloadDate}
        highlightOpacity={
          item.id === justDownloadedId ? highlightOpacity : undefined
        }
        styles={styles}
        theme={theme}
      />
    ),
    [
      handleOpenFile,
      handleShareFile,
      handleConfirmDeleteOne,
      formatFileSize,
      formatDownloadDate,
      justDownloadedId,
      highlightOpacity,
      styles,
      theme
    ]
  );

  const { handleBackPress } = useBackHandler({
    enableSafeMode: true
  });

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.forest} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerTitleRow}>
              <Ionicons
                name="folder-open"
                size={28}
                color={theme.colors.forest}
              />
              <Text style={styles.headerTitle}>Fichas Descargadas</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              {files.length} {files.length === 1 ? 'ficha' : 'fichas'} •{' '}
              {formatFileSize(storageInfo.totalSize)}
            </Text>
          </View>
        </View>

        {files.length > 0 && (
          <>
            <StorageProgressBar
              used={storageInfo.totalSize}
              total={storageInfo.totalCapacity}
              styles={styles}
              theme={theme}
              formatFileSize={formatFileSize}
            />

            <TouchableOpacity
              style={styles.deleteAllButton}
              onPress={handleDeleteAll}
              accessibilityRole="button"
              accessibilityLabel="Eliminar todas las fichas"
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={theme.colors.error}
              />
              <Text style={styles.deleteAllText}>
                Eliminar todas las fichas
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    ),
    [
      files.length,
      storageInfo.totalSize,
      storageInfo.totalCapacity,
      formatFileSize,
      handleDeleteAll,
      handleBackPress,
      styles,
      theme
    ]
  );

  const renderFooter = useCallback(() => {
    if (files.length > 0) {
      return (
        <View style={styles.footer}>
          <Ionicons
            name="checkmark-done"
            size={24}
            color={theme.colors.success}
          />
          <Text style={styles.footerText}>
            Has visto todas tus {files.length} fichas descargadas
          </Text>
        </View>
      );
    }

    return null;
  }, [files.length, styles, theme]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        colors={[theme.colors.forest]}
        tintColor={theme.colors.forest}
        progressBackgroundColor={theme.colors.background}
      />
    ),
    [refreshing, handleRefresh, theme]
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={files}
        keyExtractor={item => item.id}
        renderItem={renderFileCard}
        style={styles.container}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <EmptyState styles={styles} theme={theme} onRefresh={handleRefresh} />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />

      <CustomModal
        isVisible={modalMessage.visible}
        onClose={() => {
          setModalMessage({ visible: false, title: '', message: '' });
          clearError();
        }}
        title={modalMessage.title}
        description={modalMessage.message}
        buttons={[
          {
            label: 'OK',
            onPress: () => {
              setModalMessage({ visible: false, title: '', message: '' });
              clearError();
            }
          }
        ]}
      />

      <CustomModal
        isVisible={!!confirmDeleteOne}
        onClose={() => setConfirmDeleteOne(null)}
        title="🗑️ Eliminar ficha"
        description={`¿Estás seguro de que deseas eliminar la ficha "${confirmDeleteOne?.name}"?\n\nEsta acción no se puede deshacer.`}
        buttons={[
          {
            label: 'Cancelar',
            onPress: () => setConfirmDeleteOne(null),
            variant: 'outline' as const
          },
          {
            label: 'Eliminar',
            onPress: () => {
              if (confirmDeleteOne) {
                deleteDownloadedFile(confirmDeleteOne.id);
                setConfirmDeleteOne(null);
              }
            },
            variant: 'danger' as const
          }
        ]}
      />

      <CustomModal
        isVisible={confirmDeleteAll}
        onClose={() => setConfirmDeleteAll(false)}
        title="🗑️ Eliminar todas las fichas"
        description={`¿Estás seguro de que deseas eliminar las ${files.length} fichas descargadas?\n\nEsta acción no se puede deshacer.`}
        buttons={[
          {
            label: 'Cancelar',
            onPress: () => setConfirmDeleteAll(false),
            variant: 'outline' as const
          },
          {
            label: 'Eliminar todas',
            onPress: () => {
              deleteAllFiles();
              setConfirmDeleteAll(false);
            },
            variant: 'danger' as const
          }
        ]}
      />
    </SafeAreaView>
  );
};

DownloadedFileCard.displayName = 'DownloadedFileCard';
StorageProgressBar.displayName = 'StorageProgressBar';
EmptyState.displayName = 'EmptyState';
DownloadedFilesScreen.displayName = 'DownloadedFilesScreen';

export default DownloadedFilesScreen;
