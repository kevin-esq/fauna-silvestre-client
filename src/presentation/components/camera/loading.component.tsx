import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createStyles } from '../../screens/media/camera-gallery-screen.styles';

interface LoadingProps {
  styles: ReturnType<typeof createStyles>;
}

export const Loading = React.memo<LoadingProps>(({ styles }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#ffffff" />
    <Text style={styles.loadingText}>Preparando cámara...</Text>
  </View>
));
