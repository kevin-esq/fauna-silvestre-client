import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme, Theme } from '../../contexts/theme.context';
import { useDownloadedFiles } from '../../hooks/use-downloaded-files.hook';
import { DownloadedFile } from '../../../services/storage/local-file.service';
import { createStyles } from './downloaded-files-screen.styles';
import RNFetchBlob from 'react-native-blob-util';
import Share from 'react-native-share';
import { useBackHandler } from '@/presentation/hooks/use-back-handler.hook';

interface DownloadedFileCardProps {
  file: DownloadedFile;
  onOpen: (file: DownloadedFile) => void;
  onDelete: (fileId: string) => void;
  onShare: (file: DownloadedFile) => void;
  formatFileSize: (bytes: number) => string;
  formatDownloadDate: (date: Date) => string;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}

const DownloadedFileCard = React.memo<DownloadedFileCardProps>(
  ({
    file,
    onOpen,
    onDelete,
    onShare,
    formatFileSize,
    formatDownloadDate,
    styles,
    theme
  }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleOpen = useCallback(() => {
      onOpen(file);
    }, [file, onOpen]);

    const handleDelete = useCallback(() => {
      Alert.alert(
        '🗑️ Eliminar ficha',
        `¿Estás seguro de que deseas eliminar la ficha "${file.animalName}"?\n\nEsta acción no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => onDelete(file.id)
          }
        ]
      );
    }, [file.id, file.animalName, onDelete]);

    const handleShare = useCallback(() => {
      onShare(file);
    }, [file, onShare]);

    return (
      <TouchableOpacity
        style={[styles.fileCard, isPressed && styles.fileCardPressed]}
        onPress={handleOpen}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ficha de ${file.animalName}`}
      >
        <View style={styles.cardProgressContainer}>
          <View style={styles.cardProgressBackground} />
        </View>

        <View style={styles.fileIconContainer}>
          <Ionicons
            name="document-text"
            size={32}
            color={theme.colors.forest}
          />
          <View style={styles.fileTypeBadge}>
            <Text style={styles.fileTypeText}>{'PDF'}</Text>
          </View>
        </View>

        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={2}>
            {file.animalName}
          </Text>
          <View style={styles.fileMetaContainer}>
            <View style={styles.fileMetaItem}>
              <Ionicons
                name="barcode"
                size={12}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.fileMetaText}>{file.catalogId}</Text>
            </View>
            <View style={styles.fileMetaItem}>
              <Ionicons
                name="analytics"
                size={12}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.fileMetaText}>
                {formatFileSize(file.fileSize)}
              </Text>
            </View>
          </View>
          <View style={styles.fileDateContainer}>
            <Ionicons
              name="calendar"
              size={12}
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
              name="share-social"
              size={18}
              color={theme.colors.forest}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ficha de ${file.animalName}`}
          >
            <Ionicons name="trash" size={18} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }
);

// New Progress Bar Component
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

const DownloadedFilesScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);
  const {
    files,
    isLoading,
    error,
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

  const handleDeleteFile = useCallback(
    (fileId: string) => {
      deleteDownloadedFile(fileId);
    },
    [deleteDownloadedFile]
  );

  const handleDeleteAll = useCallback(() => {
    if (files.length === 0) return;

    Alert.alert(
      '🗑️ Eliminar todas las fichas',
      `¿Estás seguro de que deseas eliminar las ${files.length} fichas descargadas?\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar todas',
          style: 'destructive',
          onPress: deleteAllFiles
        }
      ]
    );
  }, [files.length, deleteAllFiles]);

  const handleShareFile = useCallback(async (file: DownloadedFile) => {
    try {
      const exists = await RNFetchBlob.fs.exists(file.filePath);
      if (!exists) {
        Alert.alert('Error', 'El archivo no existe o no se puede acceder');
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
      Alert.alert('Error', 'No se pudo compartir el archivo.');
    }
  }, []);

  const renderFileCard = useCallback(
    ({ item }: { item: DownloadedFile }) => (
      <DownloadedFileCard
        file={item}
        onOpen={handleOpenFile}
        onDelete={handleDeleteFile}
        onShare={handleShareFile}
        formatFileSize={formatFileSize}
        formatDownloadDate={formatDownloadDate}
        styles={styles}
        theme={theme}
      />
    ),
    [
      handleOpenFile,
      handleDeleteFile,
      handleShareFile,
      formatFileSize,
      formatDownloadDate,
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
            <Text style={styles.headerTitle}>📁 Fichas Descargadas</Text>
            <Text style={styles.headerSubtitle}>
              {files.length} {files.length === 1 ? 'ficha' : 'fichas'} •{' '}
              {formatFileSize(storageInfo.totalSize)}
            </Text>
          </View>

          {files.length > 0 && (
            <TouchableOpacity
              style={styles.deleteAllButton}
              onPress={handleDeleteAll}
              accessibilityRole="button"
              accessibilityLabel="Eliminar todas las fichas"
            >
              <Ionicons name="trash" size={16} color={theme.colors.error} />
              <Text style={styles.deleteAllText}>Eliminar todas</Text>
            </TouchableOpacity>
          )}

          {files.length === 0 && <View style={styles.headerPlaceholder} />}
        </View>

        {files.length > 0 && (
          <StorageProgressBar
            used={storageInfo.totalSize}
            total={storageInfo.totalCapacity}
            styles={styles}
            theme={theme}
            formatFileSize={formatFileSize}
          />
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle"
              size={20}
              color={theme.colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.clearErrorButton}
              onPress={clearError}
              accessibilityRole="button"
              accessibilityLabel="Limpiar error"
            >
              <Ionicons name="close" size={16} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    ),
    [
      files.length,
      storageInfo.totalSize,
      storageInfo.totalCapacity,
      error,
      handleDeleteAll,
      formatFileSize,
      styles,
      theme,
      clearError,
      handleBackPress
    ]
  );

  const renderFooter = useCallback(() => {
    if (isLoading && files.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.forest} />
          <Text style={styles.loadingText}>Cargando fichas...</Text>
        </View>
      );
    }

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
  }, [isLoading, files.length, styles, theme]);

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
          !isLoading ? (
            <EmptyState
              styles={styles}
              theme={theme}
              onRefresh={handleRefresh}
            />
          ) : null
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />
    </SafeAreaView>
  );
};

DownloadedFileCard.displayName = 'DownloadedFileCard';
StorageProgressBar.displayName = 'StorageProgressBar';
EmptyState.displayName = 'EmptyState';
DownloadedFilesScreen.displayName = 'DownloadedFilesScreen';

export default DownloadedFilesScreen;
