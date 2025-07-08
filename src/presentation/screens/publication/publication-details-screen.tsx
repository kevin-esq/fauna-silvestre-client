import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigationActions } from "../../navigation/navigation-provider";
import { useTheme } from "../../contexts/theme-context";
import * as Haptics from 'expo-haptics';
import type { PublicationsModel } from '../../../domain/models/publication.models';
import LocationMap from "../../components/ui/location-map.component";

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

  const statusConfig = STATUS_CONFIG[publication.status] || STATUS_CONFIG.pending;

  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const toggleImageExpand = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ uri, isExpanded, onToggleExpand }) => (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  expandIconContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 20,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  expandedImage: {
    width: width,
    height: height * 0.8,
  },
  header: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  rejectionContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  rejectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  rejectionText: {
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PublicationDetailsScreen;