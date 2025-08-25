import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions
} from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { themeVariables, useTheme } from '../../contexts/theme.context';
import LocationMap from '../../components/ui/location-map.component';
import { createStyles } from './publication-details-screen.styles';
import { useAuth } from '../../contexts/auth.context';
import type {
  PublicationResponse,
  PublicationStatus
} from '../../../domain/models/publication.models';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const STATUS_CONFIG = {
  rejected: {
    icon: 'times-circle',
    color: '#F44336',
    label: 'Rechazada'
  },
  pending: {
    icon: 'hourglass-half',
    color: '#FFC107',
    label: 'Pendiente'
  },
  accepted: {
    icon: 'check-circle',
    color: '#4CAF50',
    label: 'Publicada'
  }
} as const;

export default function PublicationDetailsScreen() {
  const route = useRoute();
  const { publication, status, reason } = route.params as {
    publication: PublicationResponse;
    status: PublicationStatus;
    reason?: string | undefined;
  };
  const { goBack } = useNavigationActions();
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(
    () => createStyles(variables, width, height, insets),
    [variables, insets]
  );

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const toggleImageExpand = useCallback(() => setIsImageExpanded(p => !p), []);

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          goBack();
          return true;
        }
      );

      return () => {
        backHandler.remove();
      };
    }, [goBack])
  );

  const handleModify = useCallback((section: string) => {
    console.log(`Modificar sección: ${section}`);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      accessibilityLabel="Detalles de publicación"
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => goBack()}
          style={styles.backButton}
          accessibilityLabel="Volver"
          accessibilityRole="button"
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={22} color="white" />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <FontAwesome
            name={statusConfig.icon}
            size={20}
            color={statusConfig.color}
            accessibilityLabel={`Estado: ${statusConfig.label}`}
          />
          <Text style={styles.headerTitle} accessibilityRole="header">
            {publication.commonNoun}
          </Text>
        </View>
      </View>

      {/* Imagen */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleImageExpand}
        style={styles.imageCard}
        accessibilityLabel={
          publication.img
            ? 'Ver imagen en tamaño completo'
            : 'Imagen no disponible'
        }
      >
        {publication.img ? (
          <>
            <Image
              source={{ uri: publication.img }}
              style={styles.image}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
            <View style={styles.zoomIcon}>
              <MaterialIcons name="zoom-in" size={24} color="white" />
            </View>
          </>
        ) : (
          <View style={styles.imagePlaceholder}>
            <FontAwesome
              name="image"
              size={40}
              color={theme.colors.placeholder}
            />
            <Text style={styles.placeholderText}>Imagen no disponible</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={isImageExpanded} transparent={true} animationType="fade">
        <ImageViewer
          imageUrls={[{ url: publication.img }]}
          enableImageZoom={true}
          enableSwipeDown={true}
          onSwipeDown={toggleImageExpand}
          onCancel={toggleImageExpand}
          renderHeader={() => (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={toggleImageExpand}
              accessibilityLabel="Cerrar vista de imagen"
            >
              <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
          )}
          backgroundColor="rgba(0,0,0,0.9)"
        />
      </Modal>

      {/* Componentes de información */}
      <InfoCard
        title="Descripción"
        content={publication.description}
        isAdmin={user?.role === 'Admin'}
        onModify={() => handleModify('Descripción')}
        insets={insets}
      />

      <InfoCard
        title="Estado"
        content={statusConfig.label}
        titleColor={statusConfig.color}
        borderColor={statusConfig.color}
        isAdmin={user?.role === 'Admin'}
        onModify={() => handleModify('Estado')}
        insets={insets}
      />

      <InfoCard
        title="Estado del Animal"
        content={publication.animalState === 'ALIVE' ? 'Vivo' : 'Muerto'}
        icon={
          publication.animalState === 'ALIVE' ? (
            <MaterialIcons name="pets" size={16} color={theme.colors.success} />
          ) : (
            <FontAwesome name="ambulance" size={16} color="#D32F2F" />
          )
        }
        titleColor={
          publication.animalState === 'ALIVE' ? theme.colors.success : '#D32F2F'
        }
        borderColor={
          publication.animalState === 'ALIVE' ? theme.colors.success : '#D32F2F'
        }
        isAdmin={user?.role === 'Admin'}
        onModify={() => handleModify('Estado del Animal')}
        insets={insets}
      />

      {/* Usuario (solo admin) */}
      {user?.role === 'Admin' && (
        <View
          style={[
            styles.card,
            {
              flexDirection: 'row',
              alignItems: 'center',
              borderLeftColor: statusConfig.color,
              borderLeftWidth: 5
            }
          ]}
        >
          <View style={styles.userProfilePicture}>
            <FontAwesome name="user" size={16} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Usuario</Text>
            </View>
            <Text style={styles.cardText}>{'Sin información'}</Text>
          </View>
        </View>
      )}

      {/* Motivo de rechazo */}
      {status === 'rejected' && reason && (
        <View style={[styles.card, styles.rejectionCard]}>
          <Text style={styles.rejectionTitle}>Motivo de rechazo</Text>
          <Text style={styles.cardText}>{reason}</Text>
        </View>
      )}

      {/* Ubicación textual */}
      {publication.location && user?.role === 'Admin' && (
        <InfoCard
          title="Ubicación"
          icon={
            <FontAwesome
              name="map-marker"
              size={16}
              color={theme.colors.primary}
            />
          }
          content={publication.location}
          isAdmin={user?.role === 'Admin'}
          insets={insets}
        />
      )}

      {/* Mapa */}
      {publication.location && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Ubicación en Mapa</Text>
          </View>
          <LocationMap location={publication.location} />
        </View>
      )}
    </ScrollView>
  );
}

type InfoCardProps = {
  title: string;
  content: string;
  icon?: React.ReactNode;
  isAdmin?: boolean;
  titleColor?: string;
  borderColor?: string;
  onModify?: () => void;
  insets: EdgeInsets;
};

const InfoCard = React.memo(
  ({
    title,
    content,
    icon,
    isAdmin = false,
    titleColor,
    borderColor,
    onModify,
    insets
  }: InfoCardProps) => {
    const { theme } = useTheme();
    const styles = useMemo(
      () => createStyles(themeVariables(theme), width, height, insets),
      [theme, insets]
    );

    return (
      <View
        style={[
          styles.card,
          borderColor
            ? {
                borderLeftColor: borderColor,
                borderLeftWidth: 5
              }
            : {}
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            {icon}
            <Text
              style={[
                styles.cardTitle,
                titleColor ? { color: titleColor } : {}
              ]}
              accessibilityRole="header"
            >
              {title}
            </Text>
          </View>

          {isAdmin && onModify && (
            <TouchableOpacity
              onPress={onModify}
              accessibilityLabel={`Modificar ${title.toLowerCase()}`}
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name="edit"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.cardText}>{content}</Text>
      </View>
    );
  }
);
