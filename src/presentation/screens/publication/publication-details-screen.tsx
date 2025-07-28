// PublicationDetailsScreen.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { themeVariables, useTheme } from '../../contexts/theme-context';
import LocationMap from '../../components/ui/location-map.component';
import { createStyles } from './publication-details-screen.styles';
import { useAuth } from '../../contexts/auth-context';
import type {
  PublicationResponse,
  PublicationStatus,
} from '../../../domain/models/publication.models';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const STATUS_CONFIG = {
  rejected: {
    icon: 'times-circle',
    color: '#F44336',
    label: 'Rechazada',
  },
  pending: {
    icon: 'hourglass-half',
    color: '#FFC107',
    label: 'Pendiente',
  },
  accepted: {
    icon: 'check-circle',
    color: '#4CAF50',
    label: 'Publicada',
  },
} as const;

export default function PublicationDetailsScreen({
  route: {
    params: { publication, status, reason },
  },
}: {
  route: {
    params: {
      publication: PublicationResponse;
      status: PublicationStatus;
      reason?: string;
    };
  };
}) {
  const { navigate } = useNavigationActions();
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(
    () => createStyles(variables, width, height, insets),
    [variables, insets],
  );

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const toggleImageExpand = useCallback(() => setIsImageExpanded(p => !p), []);

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          navigate('HomeTabs');
          return true;
        },
      );

      return () => {
        backHandler.remove();
      };
    }, [navigate]),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigate('HomeTabs')}
          style={styles.backButton}
          accessibilityLabel="Volver"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={22} color="white" />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <FontAwesome
            name={statusConfig.icon}
            size={20}
            color={statusConfig.color}
          />
          <Text style={styles.headerTitle}>{publication.commonNoun}</Text>
        </View>
      </View>

      {/* Imagen */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleImageExpand}
        style={styles.imageCard}
      >
        {publication.img ? (
          <>
            <Image
              source={{ uri: publication.img }}
              style={styles.image}
              resizeMode="cover"
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

      <Modal visible={isImageExpanded} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={toggleImageExpand}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: publication.img }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      {/* Descripción */}
      <InfoCard
        title="Descripción"
        content={publication.description}
        isAdmin={user?.role === 'Admin'}
        insets={insets}
      />

      {/* Estado */}
      <InfoCard
        title="Estado"
        content={statusConfig.label}
        titleColor={statusConfig.color}
        borderColor={statusConfig.color}
        isAdmin={user?.role === 'Admin'}
        insets={insets}
      />

      {/* Estado del animal */}
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
        insets={insets}
      />

      {/* Usuario */}
      {user?.role === 'Admin' && (
        <TouchableOpacity
          style={[
            styles.card,
            {
              flexDirection: 'row',
              alignItems: 'center',
              borderLeftColor: statusConfig.color,
              borderLeftWidth: 5,
            },
          ]}
        >
          <View style={styles.userProfilePicture}>
            <FontAwesome name="user" size={16} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Usuario</Text>
            <Text style={styles.cardText}>{'Sin información'}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Rechazo */}
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
          insets={insets}
        />
      )}

      {/* Mapa */}
      {publication.location && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ubicación en Mapa</Text>
          <LocationMap location={publication.location} />
        </View>
      )}
    </ScrollView>
  );
}

function InfoCard({
  title,
  content,
  icon,
  isAdmin = false,
  titleColor,
  borderColor,
  insets,
}: {
  title: string;
  content: string;
  icon?: React.ReactNode;
  isAdmin?: boolean;
  titleColor?: string;
  borderColor?: string;
  insets: EdgeInsets;
}) {
  const { theme } = useTheme();
  const styles = useMemo(
    () => createStyles(themeVariables(theme), width, height, insets),
    [theme, insets],
  );

  return (
    <View
      style={[
        styles.card,
        borderColor ? { borderLeftColor: borderColor, borderLeftWidth: 5 } : {},
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon}
        <Text
          style={[styles.cardTitle, titleColor ? { color: titleColor } : {}]}
        >
          {title}
        </Text>
      </View>
      <Text style={styles.cardText}>{content}</Text>
      {isAdmin && (
        <TouchableOpacity
          style={styles.modifyButton}
          onPress={() => console.log('Modificar')}
        >
          <Text style={styles.modifyButtonText}>Modificar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
