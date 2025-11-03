import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import OfflineHomeScreen from '../screens/offline/offline-home-screen';
import DraftsScreen from '../screens/drafts/drafts-screen';
import DownloadedFilesScreen from '../screens/media/downloaded-files-screen';
import type { TabConfig } from '@/presentation/navigation/app.navigator';

export const offlineTabs: TabConfig[] = [
  {
    name: 'OfflineHome',
    component: OfflineHomeScreen,
    title: 'Inicio',
    tabBarIcon: ({ color, size }: { color: string; size?: number }) => (
      <Ionicons name="home" color={color} size={size || 24} />
    )
  },
  {
    name: 'Drafts',
    component: DraftsScreen,
    title: 'Borradores',
    tabBarIcon: ({ color, size }: { color: string; size?: number }) => (
      <Ionicons name="document-text" color={color} size={size || 24} />
    )
  },
  {
    name: 'DownloadedFiles',
    component: DownloadedFilesScreen,
    title: 'Descargas',
    tabBarIcon: ({ color, size }: { color: string; size?: number }) => (
      <Ionicons name="download" color={color} size={size || 24} />
    )
  }
];
