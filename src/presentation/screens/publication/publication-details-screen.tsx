import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigationActions } from "../../navigation/navigation-provider";
import { themeVariables, useTheme } from "../../contexts/theme-context";
import type { PublicationsModel } from '../../../domain/models/publication.models';
import LocationMap from "../../components/ui/location-map.component";
import { createStyles } from "./publication-details-screen.styles";

const { width, height } = Dimensions.get("window");

interface PublicationDetailsScreenProps {
  route: {
    params: {
      publication: PublicationsModel;
    };
  };
}

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
const PublicationDetailsScreen = ({ route }: PublicationDetailsScreenProps) => {
  const { goBack } = useNavigationActions();
  const { theme } = useTheme();
  const { publication } = route.params;
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables, width, height), [variables]);

  const statusConfig = STATUS_CONFIG[publication.status] || STATUS_CONFIG.pending;

  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const toggleImageExpand = useCallback(() => {
    setIsImageExpanded(!isImageExpanded);
  }, [isImageExpanded]);

  return (
      <ScrollView
          style={[styles.container, { backgroundColor: theme.colors.background }]}
          contentContainerStyle={styles.contentContainer}
      >
        <View style={[
          styles.header,
          { backgroundColor: statusConfig.color }
        ]}>
          <Text style={[styles.title, { color: theme.colors.textOnPrimary }]}>
            {publication.commonNoun}
          </Text>
        </View>

        {publication.img ? (
            <ImagePreview
            uri={publication.img}
            isExpanded={isImageExpanded}
            onToggleExpand={toggleImageExpand}
            styles={styles}
          />
        ) : (
            <View style={styles.imagePlaceholder}>
              <FontAwesome name="image" size={50} color={theme.colors.placeholder} />
              <Text style={{ color: theme.colors.placeholder }}>
                Imagen no disponible
              </Text>
            </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Descripción
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {publication.description}
          </Text>
        </View>

        {publication.location && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Ubicación
              </Text>
              <View style={styles.locationRow}>
                <FontAwesome
                    name="map-marker"
                    size={16}
                    color={theme.colors.primary}
                />
                <Text style={[styles.locationText, { color: theme.colors.text }]}>
                  {publication.location}
                </Text>
              </View>
            </View>
        )}

        <View style={[
          styles.statusContainer,
          { backgroundColor: statusConfig.color }
        ]}>
          <FontAwesome
              name={statusConfig.icon}
              size={16}
              color={theme.colors.textOnPrimary}
          />
          <Text style={[styles.status, { color: theme.colors.textOnPrimary }]}>
            {` ${statusConfig.label}`}
          </Text>
        </View>

        {publication.status === "rejected" && "publication.reason" && (
            <View style={[
              styles.rejectionContainer,
              { backgroundColor: theme.colors.error }
            ]}>
              <Text style={[
                styles.rejectionTitle,
                { color: theme.colors.error }
              ]}>
                Motivo de rechazo:
              </Text>
              <Text style={[
                styles.rejectionText,
                { color: theme.colors.error }
              ]}>
                {"publication.reason"}
              </Text>
            </View>
        )}

        {publication.location && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Ubicación en mapa
              </Text>
              <LocationMap
                  location={publication.location}
              />
            </View>
        )}

        <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={goBack}
            activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: theme.colors.textOnPrimary }]}>
            Volver
          </Text>
        </TouchableOpacity>
      </ScrollView>
  );
};

interface ImagePreviewProps {
  uri: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  styles: ReturnType<typeof createStyles>;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ uri, isExpanded, onToggleExpand, styles }) => (
  <>
    <TouchableOpacity onPress={onToggleExpand} activeOpacity={0.8}>
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      <View style={styles.expandIconContainer}>
        <MaterialIcons name="zoom-in" size={24} color="white" />
      </View>
    </TouchableOpacity>
    <Modal visible={isExpanded} transparent>
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.modalCloseButton}
          onPress={onToggleExpand}
          activeOpacity={0.7}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        <Image source={{ uri }} style={styles.expandedImage} resizeMode="contain" />
      </View>
    </Modal>
  </>
);

export default PublicationDetailsScreen;