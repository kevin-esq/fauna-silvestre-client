import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, Button } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AnimatedPressable from '../ui/animated-pressable.component';
import { PublicationsModel } from '../../../domain/models/publication.models';
import { useTheme, themeVariables } from "../../contexts/theme-context";

// --- CONFIG ---
const STATUS_CONFIG = {
  rejected: { icon: 'times-circle', colorKey: '--error', label: 'Rechazada' },
  pending: { icon: 'hourglass-half', colorKey: '--warning', label: 'Pendiente' },
  accepted: { icon: 'check-circle', colorKey: '--success', label: 'Aceptada' },
} as const;

const ANIMAL_STATE_CONFIG = {
  ALIVE: { icon: 'heartbeat', colorKey: '--success', label: 'Vivo' },
  DEAD: { icon: 'ambulance', colorKey: '--error', label: 'Muerto' },
} as const;

// --- SUB-COMPONENTES ---

interface StatusRowProps {
  icon: string;
  color: string;
  label: string;
}

const StatusRow = React.memo(({ icon, color, label }: StatusRowProps) => {
  const styles = useStatusRowStyles(color);
  return (
    <View style={styles.container}>
      <FontAwesome name={icon as any} size={16} color={color} />
      <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </Text>
    </View>
  );
});

const useStatusRowStyles = (color: string) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    text: {
      color,
      marginLeft: 8,
      fontWeight: '600',
      fontSize: 14,
    },
  });

interface PublicationImageProps {
  uri?: string;
  commonNoun: string;
  viewMode: 'card' | 'presentation';
}

const PublicationImage: React.FC<PublicationImageProps> = React.memo(({ uri, commonNoun, viewMode }) => {
  const { theme } = useTheme();
  const variables = themeVariables(theme);
  const styles = useImageStyles(variables, viewMode);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={styles.image}
        accessibilityLabel={`Imagen de ${commonNoun}`}
        resizeMode={viewMode === 'card' ? 'cover' : 'contain'}
      />
    );
  }

  return (
    <View style={styles.placeholder}>
      <FontAwesome name="image" size={50} color={variables["--text-secondary"]} />
      <Text style={[styles.placeholderText, { color: variables["--text-secondary"] }]}>
        Imagen no disponible
      </Text>
    </View>
  );
});

const useImageStyles = (vars: Record<string, string>, viewMode: 'card' | 'presentation') =>
  StyleSheet.create({
    image: {
      width: '100%',
      height: viewMode === 'card' ? 180 : 300,
      backgroundColor: vars["--surface-variant"],
    },
    placeholder: {
      width: '100%',
      height: viewMode === 'card' ? 180 : 300,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: vars["--surface-variant"],
    },
    placeholderText: {
      marginTop: 8,
      fontSize: 14,
    },
  });

interface PublicationContentProps {
  publication: PublicationsModel;
}

const PublicationContent: React.FC<PublicationContentProps> = React.memo(({ publication }) => {
  const { theme } = useTheme();
  const variables = themeVariables(theme);
  const styles = useContentStyles(variables);
  const { commonNoun, description, status, animalState, location } = publication;

  const statusConfig = useMemo(() => STATUS_CONFIG[status] || STATUS_CONFIG.pending, [status]);
  const animalConfig = useMemo(
    () => ANIMAL_STATE_CONFIG[animalState as keyof typeof ANIMAL_STATE_CONFIG] || ANIMAL_STATE_CONFIG.ALIVE,
    [animalState]
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: variables["--text"] }]} numberOfLines={2}>
        {commonNoun}
      </Text>
      <Text style={[styles.description, { color: variables["--text-secondary"] }]} numberOfLines={3}>
        {description}
      </Text>

      <StatusRow icon={statusConfig.icon} color={variables[statusConfig.colorKey as keyof typeof variables]} label={statusConfig.label} />
      <StatusRow icon={animalConfig.icon} color={variables[animalConfig.colorKey as keyof typeof variables]} label={animalConfig.label} />
      {location && (
        <StatusRow icon="map-marker" color={variables["--info"]} label={location} />
      )}
    </View>
  );
});

const useContentStyles = (vars: Record<string, string>) =>
  StyleSheet.create({
    container: {
      marginTop: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      marginBottom: 12,
    },
  });

interface ReviewButtonsProps {
  actions: {
    onApprove: () => void;
    onReject: () => void;
  };
}

const ReviewButtons: React.FC<ReviewButtonsProps> = React.memo(({ actions }) => {
  const { theme } = useTheme();
  const variables = themeVariables(theme);
  const styles = useReviewButtonsStyles();

  return (
    <View style={styles.container}>
      <Button title="Rechazar" onPress={actions.onReject} color={variables["--error"]} />
      <Button title="Aprobar" onPress={actions.onApprove} color={variables["--success"]} />
    </View>
  );
});

const useReviewButtonsStyles = () =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#eee',
      paddingTop: 12,
    },
  });

// --- MAIN COMPONENT ---

interface PublicationCardProps {
  publication: PublicationsModel;
  onPress?: () => void;
  reviewActions?: {
    onApprove: () => void;
    onReject: () => void;
  };
  viewMode?: 'card' | 'presentation';
}

const PublicationCard: React.FC<PublicationCardProps> = React.memo(({
  publication,
  onPress,
  reviewActions,
  viewMode = 'card',
}) => {
  const { theme } = useTheme();
  const variables = themeVariables(theme);
  const styles = useMainStyles(variables);

  return (
    <AnimatedPressable style={styles.card} onPress={onPress}>
      <PublicationImage
        uri={publication.img}
        commonNoun={publication.commonNoun}
        viewMode={viewMode}
      />
      <View style={styles.contentWrapper}>
        <PublicationContent publication={publication} />
        {reviewActions && <ReviewButtons actions={reviewActions} />}
      </View>
    </AnimatedPressable>
  );
});

const useMainStyles = (vars: Record<string, string>) =>
  StyleSheet.create({
    card: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      elevation: 4,
      shadowColor: vars["--surface-variant"],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      backgroundColor: vars["--surface"],
    },
    contentWrapper: {
      padding: 16,
    },
  });

export default PublicationCard;
