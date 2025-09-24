import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  BackHandler
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useNavigationActions } from '../../navigation/navigation-provider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme, Theme } from '../../contexts/theme.context';
import { useDownloadedFiles } from '../../hooks/use-downloaded-files.hook';
import { DownloadedFile } from '../../../services/storage/local-file.service';
import { createStyles } from './downloaded-files-screen.styles';
import RNFetchBlob from 'react-native-blob-util';
import Share from 'react-native-share';

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
        style={styles.fileCard}
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ficha de ${file.animalName}`}
      >
        <View style={styles.fileIconContainer}>
          <Ionicons
            name="document-text"
            size={32}
            color={theme.colors.forest}
          />
        </View>

        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={2}>
            {file.animalName}
          </Text>
          <Text style={styles.fileDetails}>
            {file.catalogId} • {formatFileSize(file.fileSize)}
          </Text>
          <Text style={styles.fileDate}>
            {formatDownloadDate(file.downloadDate)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ficha de ${file.animalName}`}
        >
          <Ionicons name="trash" size={20} color={theme.colors.error} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel={`Compartir ficha de ${file.animalName}`}
        >
          <Ionicons name="share-social" size={20} color={theme.colors.forest} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
);

const EmptyState = React.memo<{
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
  onRefresh: () => void;
}>(({ styles, theme, onRefresh }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIcon}>
      <Ionicons name="folder-open" size={60} color={theme.colors.forest} />
    </View>
    <Text style={styles.emptyTitle}>No hay fichas descargadas</Text>
    <Text style={styles.emptySubtitle}>
      Las fichas de animales que descargues aparecerán aquí
    </Text>
    <TouchableOpacity
      style={styles.emptyButton}
      onPress={onRefresh}
      accessibilityRole="button"
      accessibilityLabel="Actualizar lista"
    >
      <Text style={styles.emptyButtonText}>Actualizar</Text>
    </TouchableOpacity>
  </View>
));

const DownloadedFilesScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);
  const navigation = useNavigation();
  const { goBack } = useNavigationActions();

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
      `¿Estás seguro de que deseas eliminar todas las ${files.length} fichas descargadas?\n\nEsta acción no se puede deshacer.`,
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
        // Copia el archivo a cache si no está ahí
        const cachePath = `${RNFetchBlob.fs.dirs.CacheDir}/${file.fileName}`;
        await RNFetchBlob.fs.cp(file.filePath, cachePath);

        // URL para compartir usando FileProvider
        shareUrl = `file://${cachePath}`;
      } else {
        // iOS usa file://
        shareUrl = `file://${file.filePath}`;
      }

      const response = await Share.open({
        title: `Compartir ${file.animalName}`,
        url: shareUrl,
        type: file.mimeType || 'application/pdf',
        failOnCancel: false
      });

      console.log('✅ Share dialog opened successfully', response);
    } catch (err) {
      console.log('❌ Unexpected error:', err);
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

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (navigation.canGoBack() ? goBack() : null)}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.forest} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>📁 Fichas Descargadas</Text>
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

        <View style={styles.storageInfo}>
          <Text style={styles.storageText}>
            📊 {files.length} fichas • {formatFileSize(storageInfo.totalSize)}
          </Text>
        </View>

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
      error,
      handleDeleteAll,
      formatFileSize,
      styles,
      theme,
      clearError,
      navigation,
      goBack
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
          <Text style={styles.footerText}>
            ✨ Has visto todas tus fichas descargadas ✨
          </Text>
        </View>
      );
    }

    return null;
  }, [isLoading, files.length, styles, theme]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isLoading}
        onRefresh={refreshFiles}
        colors={[theme.colors.forest]}
        tintColor={theme.colors.forest}
      />
    ),
    [isLoading, refreshFiles, theme.colors.forest]
  );

  const handleBackPress = useCallback(() => {
    try {
      if (navigation.canGoBack()) {
        goBack();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error in handleBackPress:', error);
      return false;
    }
  }, [goBack, navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress
      );
      return () => backHandler.remove();
    }, [handleBackPress])
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
              onRefresh={refreshFiles}
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

// Display names for debugging
DownloadedFileCard.displayName = 'DownloadedFileCard';
EmptyState.displayName = 'EmptyState';
DownloadedFilesScreen.displayName = 'DownloadedFilesScreen';

export default DownloadedFilesScreen;
