// PublicationCard.tsx

import React from 'react';
import { View, Text, Image, StyleSheet, Button } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AnimatedPressable from '../ui/animated-pressable.component';
import { PublicationResponse, PublicationStatus } from '../../../domain/models/publication.models';
import { useTheme, themeVariables } from '../../contexts/theme-context';

// --- CONSTANTES DE CONFIGURACIÓN ---

const STATUS_CONFIG = {
  rejected: { icon: 'times-circle', colorKey: '--error', label: 'Rechazada' },
  pending: { icon: 'hourglass-half', colorKey: '--warning', label: 'Pendiente' },
  accepted: { icon: 'check-circle', colorKey: '--success', label: 'Aceptada' },
} as const;

const ANIMAL_STATE_CONFIG = {
  ALIVE: { icon: 'heartbeat', colorKey: '--success', label: 'Vivo' },
  DEAD: { icon: 'ambulance', colorKey: '--error', label: 'Muerto' },
} as const;

// --- COMPONENTE StatusRow ---

interface StatusRowProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  label: string;
}

const StatusRow = React.memo(({ icon, color, label }: StatusRowProps) => {
  const styles = getStatusRowStyles(color);

  return (
    <View style={styles.container}>
      <FontAwesome name={icon} size={16} color={color} />
      <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </Text>
    </View>
  );
});
StatusRow.displayName = 'StatusRow';

const getStatusRowStyles = (color: string) =>
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

// --- COMPONENTE PublicationImage ---

interface PublicationImageProps {
  uri?: string;
  commonNoun: string;
  viewMode: 'card' | 'presentation';
}

const PublicationImage = React.memo(({ uri, commonNoun, viewMode }: PublicationImageProps) => {
  const { theme } = useTheme();
  const vars = themeVariables(theme);
  const styles = getImageStyles(vars, viewMode);

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
      <FontAwesome name="image" size={50} color={vars['--text-secondary']} />
      <Text style={[styles.placeholderText, { color: vars['--text-secondary'] }]}>
        Imagen no disponible
      </Text>
    </View>
  );
});
PublicationImage.displayName = 'PublicationImage';

const getImageStyles = (vars: Record<string, string>, viewMode: 'card' | 'presentation') =>
  StyleSheet.create({
    image: {
      width: '100%',
      height: viewMode === 'card' ? 180 : 300,
      backgroundColor: vars['--surface-variant'],
    },
    placeholder: {
      width: '100%',
      height: viewMode === 'card' ? 180 : 300,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: vars['--surface-variant'],
    },
    placeholderText: {
      marginTop: 8,
      fontSize: 14,
    },
  });

// --- COMPONENTE PublicationContent ---

interface PublicationContentProps {
  publication: PublicationResponse;
  status: PublicationStatus;
}

const PublicationContent = React.memo(({ publication, status }: PublicationContentProps) => {
  const { theme } = useTheme();
  const vars = themeVariables(theme);
  const styles = getContentStyles();

  const { commonNoun, description, animalState, location } = publication;

  const statusData = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const animalData = ANIMAL_STATE_CONFIG[animalState as keyof typeof ANIMAL_STATE_CONFIG] ?? ANIMAL_STATE_CONFIG.ALIVE;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: vars['--text'] }]} numberOfLines={2}>
        {commonNoun}
      </Text>
      <Text style={[styles.description, { color: vars['--text-secondary'] }]} numberOfLines={3}>
        {description}
      </Text>

      <StatusRow icon={statusData.icon} color={vars[statusData.colorKey]} label={statusData.label} />
      <StatusRow icon={animalData.icon} color={vars[animalData.colorKey]} label={animalData.label} />
      {location && <StatusRow icon="map-marker" color={vars['--info']} label={location} />}
    </View>
  );
});
PublicationContent.displayName = 'PublicationContent';

const getContentStyles = () =>
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

// --- COMPONENTE ReviewButtons ---

interface ReviewButtonsProps {
  actions: {
    onApprove: () => void;
    onReject: () => void;
  };
}

const ReviewButtons = React.memo(({ actions }: ReviewButtonsProps) => {
  const { theme } = useTheme();
  const vars = themeVariables(theme);
  const styles = getReviewButtonStyles();

  return (
    <View style={styles.container}>
      <Button title="Rechazar" onPress={actions.onReject} color={vars['--error']} />
      <Button title="Aprobar" onPress={actions.onApprove} color={vars['--success']} />
    </View>
  );
});
ReviewButtons.displayName = 'ReviewButtons';

const getReviewButtonStyles = () =>
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

// --- COMPONENTE PRINCIPAL ---

interface PublicationCardProps {
  publication: PublicationResponse;
  status: PublicationStatus;
  onPress?: () => void;
  reviewActions?: {
    onApprove: () => void;
    onReject: () => void;
  };
  viewMode?: 'card' | 'presentation';
}

const PublicationCard = React.memo(
  ({ publication, onPress, reviewActions, viewMode = 'card', status }: PublicationCardProps) => {
    const { theme } = useTheme();
    const vars = themeVariables(theme);
    const styles = getMainCardStyles(vars);

    return (
      <AnimatedPressable style={styles.card} onPress={onPress}>
        <PublicationImage
          uri={publication.img}
          commonNoun={publication.commonNoun}
          viewMode={viewMode}
        />
        <View style={styles.contentWrapper}>
          <PublicationContent publication={publication} status={status} />
          {reviewActions && <ReviewButtons actions={reviewActions} />}
        </View>
      </AnimatedPressable>
    );
  }
);
PublicationCard.displayName = 'PublicationCard';

const getMainCardStyles = (vars: Record<string, string>) =>
  StyleSheet.create({
    card: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      elevation: 4,
      shadowColor: vars['--surface-variant'],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      backgroundColor: vars['--surface'],
    },
    contentWrapper: {
      padding: 16,
    },
  });

export default PublicationCard;
