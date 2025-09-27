import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createStyles } from '../../screens/media/camera-gallery-screen.styles';

interface PermissionMessageProps {
  styles: ReturnType<typeof createStyles>;
  title: string;
  message: string;
  onRequestPermission: () => void;
  isLoading?: boolean;
}

export const PermissionMessage = React.memo<PermissionMessageProps>(
  ({ styles, title, message, onRequestPermission, isLoading = false }) => (
    <View style={styles.loadingContainer}>
      <Ionicons
        name="camera-off"
        size={60}
        color="#fff"
        style={{ marginBottom: 20 }}
      />
      <Text style={styles.loadingText}>{title}</Text>
      <Text style={[styles.loadingText, { fontSize: 14, marginTop: 10 }]}>
        {message}
      </Text>
      <TouchableOpacity
        style={[styles.permissionButton, isLoading && { opacity: 0.7 }]}
        onPress={onRequestPermission}
        activeOpacity={0.7}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.permissionButtonText}>Habilitar Cámara</Text>
        )}
      </TouchableOpacity>
    </View>
  )
);
