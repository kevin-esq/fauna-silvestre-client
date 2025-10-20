import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createStyles } from '../../screens/media/camera-gallery-screen.styles';
import { PermissionType as PermissionTypeHook } from '../../hooks/use-request-permissions.hook';

type PermissionType = 'camera' | 'photos' | 'all';

interface PermissionMessageProps {
  styles: ReturnType<typeof createStyles>;
  title?: string;
  message?: string;
  onRequestPermission: () => void;
  isLoading?: boolean;
  permissionType?: PermissionType;
  customButtonText?: string;
  missingPermissions?: PermissionTypeHook[];
  blockedPermissions?: PermissionTypeHook[];
  currentStep?: 'checking' | 'alert' | 'settings' | 'blocked';
}

const PERMISSION_CONFIG = {
  camera: {
    icon: 'camera-off' as const,
    title: 'Permiso de Cámara Requerido',
    message: 'Para tomar fotos necesitamos acceso a tu cámara',
    buttonText: 'Habilitar Cámara'
  },
  photos: {
    icon: 'images-outline' as const,
    title: 'Permiso de Galería Requerido',
    message:
      'Para acceder a todas tus fotos necesitamos permisos de almacenamiento',
    buttonText: 'Permitir Acceso a Fotos'
  },
  all: {
    icon: 'file-tray' as const,
    title: 'Permisos Necesarios',
    message:
      'Para una experiencia completa necesitamos los siguientes permisos:',
    buttonText: 'Habilitar Permisos'
  }
};

export const PermissionMessage = React.memo<PermissionMessageProps>(
  ({
    styles,
    title,
    message,
    onRequestPermission,
    isLoading = false,
    permissionType = 'all',
    customButtonText,
    missingPermissions = [],
    blockedPermissions = [],
    currentStep = 'checking'
  }) => {
    const config = PERMISSION_CONFIG[permissionType];
    const isBlocked =
      currentStep === 'blocked' || blockedPermissions.length > 0;
    const isSettingsStep = currentStep === 'settings';

    const displayTitle = isBlocked
      ? 'Permisos Bloqueados'
      : title || config.title;

    const displayMessage = isBlocked
      ? 'Algunos permisos fueron denegados permanentemente. Por favor, habilítalos manualmente en la configuración de tu dispositivo.'
      : message || config.message;

    const displayButtonText = customButtonText || config.buttonText;

    const showCameraPermission = missingPermissions.includes('camera');
    const showGalleryPermission = missingPermissions.includes('gallery');
    const showLocationPermission = missingPermissions.includes('location');
    const showAllFilesPermission = missingPermissions.includes('allFiles');

    const isPermissionBlocked = (perm: PermissionTypeHook) => {
      return blockedPermissions.includes(perm);
    };

    return (
      <View style={styles.loadingContainer}>
        <Ionicons
          name={isBlocked ? 'lock-closed' : config.icon}
          size={60}
          color={isBlocked ? '#FF6B6B' : '#fff'}
          style={{ marginBottom: 20 }}
        />

        <Text style={styles.loadingText}>{displayTitle}</Text>

        <Text
          style={[
            styles.loadingText,
            {
              fontSize: 14,
              marginTop: 10,
              textAlign: 'center',
              paddingHorizontal: 20,
              lineHeight: 20
            }
          ]}
        >
          {displayMessage}
        </Text>

        {(permissionType === 'all' || isSettingsStep || isBlocked) && (
          <View style={{ marginTop: 20, marginBottom: 10, width: '80%' }}>
            {showCameraPermission && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                  paddingHorizontal: 10,
                  opacity: isPermissionBlocked('camera') ? 0.7 : 1
                }}
              >
                <Ionicons
                  name={
                    isPermissionBlocked('camera') ? 'close-circle' : 'camera'
                  }
                  size={22}
                  color={isPermissionBlocked('camera') ? '#FF6B6B' : '#4CAF50'}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.loadingText,
                      { fontSize: 14, fontWeight: '600' }
                    ]}
                  >
                    Acceso a la cámara
                    {isPermissionBlocked('camera') && ' (Bloqueado)'}
                  </Text>
                  <Text
                    style={[styles.loadingText, { fontSize: 12, opacity: 0.8 }]}
                  >
                    Para tomar fotos directamente
                  </Text>
                </View>
              </View>
            )}

            {showGalleryPermission && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                  paddingHorizontal: 10,
                  opacity: isPermissionBlocked('gallery') ? 0.7 : 1
                }}
              >
                <Ionicons
                  name={
                    isPermissionBlocked('gallery') ? 'close-circle' : 'images'
                  }
                  size={22}
                  color={isPermissionBlocked('gallery') ? '#FF6B6B' : '#4CAF50'}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.loadingText,
                      { fontSize: 14, fontWeight: '600' }
                    ]}
                  >
                    Acceso a fotos y medios
                    {isPermissionBlocked('gallery') && ' (Bloqueado)'}
                  </Text>
                  <Text
                    style={[styles.loadingText, { fontSize: 12, opacity: 0.8 }]}
                  >
                    Para acceder a tu galería
                  </Text>
                </View>
              </View>
            )}

            {showLocationPermission && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                  paddingHorizontal: 10,
                  opacity: isPermissionBlocked('location') ? 0.7 : 1
                }}
              >
                <Ionicons
                  name={
                    isPermissionBlocked('location')
                      ? 'close-circle'
                      : 'location'
                  }
                  size={22}
                  color={
                    isPermissionBlocked('location') ? '#FF6B6B' : '#4CAF50'
                  }
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.loadingText,
                      { fontSize: 14, fontWeight: '600' }
                    ]}
                  >
                    Acceso a ubicación
                    {isPermissionBlocked('location') && ' (Bloqueado)'}
                  </Text>
                  <Text
                    style={[styles.loadingText, { fontSize: 12, opacity: 0.8 }]}
                  >
                    Para geolocalizar tus fotos
                  </Text>
                </View>
              </View>
            )}

            {showAllFilesPermission && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                  paddingHorizontal: 10
                }}
              >
                <Ionicons
                  name="folder-open"
                  size={22}
                  color="#4CAF50"
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.loadingText,
                      { fontSize: 14, fontWeight: '600' }
                    ]}
                  >
                    Gestión de todos los archivos
                  </Text>
                  <Text
                    style={[styles.loadingText, { fontSize: 12, opacity: 0.8 }]}
                  >
                    Para acceder a todos tus archivos multimedia
                  </Text>
                </View>
              </View>
            )}

            {isSettingsStep && !isBlocked && (
              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: '#FFA000'
                }}
              >
                <Text
                  style={[
                    styles.loadingText,
                    { fontSize: 12, fontStyle: 'italic' }
                  ]}
                >
                  ⚠️ Este permiso requiere configuración manual en Ajustes de
                  Android
                </Text>
              </View>
            )}

            {isBlocked && (
              <View
                style={{
                  backgroundColor: 'rgba(255, 107, 107, 0.2)',
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: '#FF6B6B'
                }}
              >
                <Text
                  style={[
                    styles.loadingText,
                    { fontSize: 12, fontStyle: 'italic', lineHeight: 18 }
                  ]}
                >
                  🔒 Los permisos marcados fueron denegados permanentemente.
                  {'\n\n'}
                  Para habilitarlos:
                  {'\n'}1. Toca el botón "Abrir Configuración"
                  {'\n'}2. Selecciona "Permisos"
                  {'\n'}3. Habilita los permisos necesarios
                </Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.permissionButton,
            isLoading && { opacity: 0.7 },
            { marginTop: 25 },
            isBlocked && { backgroundColor: '#FF6B6B' }
          ]}
          onPress={onRequestPermission}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={[styles.permissionButtonText, { marginLeft: 10 }]}>
                {isSettingsStep ? 'Redirigiendo...' : 'Solicitando permisos...'}
              </Text>
            </View>
          ) : (
            <>
              <Ionicons
                name={
                  isBlocked || isSettingsStep ? 'settings' : 'checkmark-circle'
                }
                size={20}
                color="#ffffff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.permissionButtonText}>
                {displayButtonText}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text
          style={[
            styles.loadingText,
            {
              fontSize: 11,
              marginTop: 20,
              opacity: 0.7,
              fontStyle: 'italic',
              paddingHorizontal: 30,
              textAlign: 'center',
              lineHeight: 16
            }
          ]}
        >
          {isBlocked
            ? 'Los permisos se gestionan desde la configuración de tu dispositivo por seguridad'
            : permissionType === 'camera'
              ? 'La cámara solo se usa cuando tomas fotos'
              : isSettingsStep
                ? 'Debes habilitar manualmente "Permitir la gestión de todos los archivos" en Ajustes'
                : 'Tus archivos y ubicación permanecen seguros en tu dispositivo'}
        </Text>
      </View>
    );
  }
);

PermissionMessage.displayName = 'PermissionMessage';
