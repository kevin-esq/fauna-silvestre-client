import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  useTheme,
  themeVariables
} from '@/presentation/contexts/theme.context';
import PublicationImage from './publication-image.component';
import { PublicationModelResponse } from '@/domain/models/publication.models';
import { PublicationStatus } from '@/services/publication/publication.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const ITEM_HEIGHT = 380;

const STATUS_CONFIG: Record<
  PublicationStatus,
  {
    icon: string;
    colorKey: keyof ReturnType<typeof themeVariables>;
    label: string;
  }
> = {
  [PublicationStatus.REJECTED]: {
    icon: 'times-circle',
    colorKey: '--error',
    label: 'Rechazada'
  },
  [PublicationStatus.PENDING]: {
    icon: 'hourglass-half',
    colorKey: '--warning',
    label: 'Pendiente'
  },
  [PublicationStatus.ACCEPTED]: {
    icon: 'check-circle',
    colorKey: '--success',
    label: 'Aceptada'
  }
};

const ANIMAL_STATE_CONFIG = {
  ALIVE: { icon: 'heartbeat', colorKey: '--success', label: 'Vivo' },
  DEAD: { icon: 'ambulance', colorKey: '--error', label: 'Muerto' }
} as const;

const StatusRow = ({
  icon,
  color,
  label
}: {
  icon: string;
  color: string;
  label: string;
}) => (
  <View style={stylesStatus.container}>
    <FontAwesome name={icon} size={18} color={color} />
    <Text style={[stylesStatus.text, { color }]} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

const stylesStatus = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  text: { marginLeft: 8, fontWeight: '600', fontSize: 14 }
});

const PublicationContent = ({
  publication,
  status
}: {
  publication: PublicationModelResponse;
  status: PublicationStatus;
}) => {
  const { theme } = useTheme();
  const vars = themeVariables(theme);

  const { commonNoun, description, animalState, location, createdDate } =
    publication;
  const statusData = STATUS_CONFIG[status];
  const animalData =
    ANIMAL_STATE_CONFIG[animalState as keyof typeof ANIMAL_STATE_CONFIG] ??
    ANIMAL_STATE_CONFIG.ALIVE;

  // Formato de fecha legible
  const formattedDate = createdDate
    ? format(new Date(createdDate), "dd 'de' MMMM yyyy, HH:mm", { locale: es })
    : null;

  return (
    <View style={{ marginTop: 4 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: vars['--text'],
          marginBottom: 4
        }}
      >
        {commonNoun}
      </Text>

      {formattedDate && (
        <Text
          style={{
            fontSize: 12,
            color: vars['--text-secondary'],
            marginBottom: 8
          }}
        >
          Creado el {formattedDate}
        </Text>
      )}

      <Text
        style={{
          fontSize: 14,
          color: vars['--text-secondary'],
          marginBottom: 12
        }}
      >
        {description}
      </Text>

      <StatusRow
        icon={statusData.icon}
        color={vars[statusData.colorKey]}
        label={statusData.label}
      />
      <StatusRow
        icon={animalData.icon}
        color={vars[animalData.colorKey]}
        label={animalData.label}
      />
      {location && (
        <StatusRow icon="map-marker" color={vars['--info']} label={location} />
      )}
    </View>
  );
};

const ReviewButtons = ({
  actions,
  isLoading = false,
  disabled = false
}: {
  actions: { onApprove: () => void; onReject: () => void };
  isLoading?: boolean;
  disabled?: boolean;
}) => {
  const { theme } = useTheme();
  const vars = themeVariables(theme);

  console.log('[ReviewButtons] Rendering with actions:', !!actions);

  return (
    <View
      style={[
        stylesButtons.container,
        { borderTopColor: vars['--surface-variant'] }
      ]}
    >
      <TouchableOpacity
        style={[
          stylesButtons.button,
          { backgroundColor: '#dc3545' },
          (disabled || isLoading) && stylesButtons.disabled
        ]}
        onPress={() => {
          console.log('[ReviewButtons] Reject pressed');
          actions.onReject();
        }}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <FontAwesome
              name="times"
              size={18}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={stylesButtons.text}>Rechazar</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          stylesButtons.button,
          { backgroundColor: '#28a745' },
          (disabled || isLoading) && stylesButtons.disabled
        ]}
        onPress={() => {
          console.log('[ReviewButtons] Approve pressed');
          actions.onApprove();
        }}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <FontAwesome
              name="check"
              size={18}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={stylesButtons.text}>Aprobar</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const stylesButtons = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  disabled: { opacity: 0.6 },
  text: { color: 'white', fontWeight: '700', fontSize: 15 }
});

const PublicationCard = ({
  publication,
  status,
  onPress,
  reviewActions,
  viewMode = 'card',
  isProcessing = false
}: {
  publication: PublicationModelResponse;
  status: PublicationStatus;
  onPress?: () => void;
  reviewActions?: { onApprove: () => void; onReject: () => void };
  viewMode?: 'card' | 'presentation';
  isProcessing?: boolean;
}) => {
  const { theme } = useTheme();
  const vars = themeVariables(theme);

  // Debug: verificar que reviewActions se pasa correctamente
  console.log(
    '[PublicationCard] reviewActions:',
    !!reviewActions,
    'status:',
    status
  );

  return (
    <TouchableOpacity
      style={[
        stylesCard.card,
        isProcessing && { opacity: 0.7 },
        // Solo usar altura fija si no hay botones de revisión
        !reviewActions && { height: ITEM_HEIGHT }
      ]}
      onPress={onPress}
      disabled={isProcessing}
      activeOpacity={0.9}
    >
      <PublicationImage
        uri={publication.img}
        commonNoun={publication.commonNoun}
        viewMode={viewMode}
      />
      <View style={stylesCard.content}>
        <PublicationContent publication={publication} status={status} />
        {reviewActions && (
          <ReviewButtons
            actions={reviewActions}
            isLoading={isProcessing}
            disabled={isProcessing}
          />
        )}
      </View>
      {isProcessing && (
        <View style={stylesCard.overlay}>
          <ActivityIndicator size="large" color={vars['--primary']} />
          <Text
            style={{ marginTop: 8, color: vars['--text'], fontWeight: '600' }}
          >
            Procesando...
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const stylesCard = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    backgroundColor: 'white'
  },
  content: { padding: 16, flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default PublicationCard;
