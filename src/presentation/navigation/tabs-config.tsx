import type {
  MaterialTopTabNavigationOptions,
  MaterialTopTabScreenProps
} from '@react-navigation/material-top-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import type { RootStackParamList } from './navigation.types';
import AdminHomeScreen from '../screens/admin/admin-home-screen/admin-home-screen';
import HomeScreen from '../screens/home/home-screen';
import PublicationScreen from '../screens/publication/publication-screen';
import ReviewPublicationsScreen from '../screens/admin/review-publications-screen';
import CatalogManagementScreen from '../screens/admin/catalog-management-screen';
//import NotificationsScreen from '../screens/notifications/notifications-screen';
import { ParamListBase } from '@react-navigation/native';

type TabConfig<ParamList extends ParamListBase> = {
  name: keyof ParamList;
  component: React.ComponentType<
    MaterialTopTabScreenProps<ParamList, keyof ParamList>
  >;
  title: string;
  hideInBar?: boolean;
  tabBarIcon?: MaterialTopTabNavigationOptions['tabBarIcon'];
};

export const adminTabs: TabConfig<RootStackParamList>[] = [
  {
    name: 'Home',
    component: AdminHomeScreen,
    title: 'Inicio',
    tabBarIcon: ({ focused, color }) => (
      <FontAwesome5 name="home" solid={focused} size={24} color={color} />
    )
  },
  {
    name: 'Publications',
    component: PublicationScreen,
    title: 'Todas las Publicaciones',
    tabBarIcon: ({ focused, color }) => (
      <FontAwesome5 name="book-open" solid={focused} size={24} color={color} />
    )
  },
  {
    name: 'ReviewPublication',
    component: ReviewPublicationsScreen,
    title: 'Revisión de Publicaciones',
    tabBarIcon: ({ focused, color }) => (
      <FontAwesome5
        name="clipboard-check"
        solid={focused}
        size={24}
        color={color}
      />
    )
  },
  // {
  //   name: 'Notifications',
  //   component: NotificationsScreen,
  //   title: 'Notificaciones',
  //   tabBarIcon: ({ focused, color }) => (
  //     <FontAwesome5 name="bell" solid={focused} size={24} color={color} />
  //   )
  // },
  {
    name: 'CatalogManagement',
    component: CatalogManagementScreen,
    title: 'Gestión de Catálogos',
    tabBarIcon: ({ focused, color }) => (
      <FontAwesome5 name="paw" solid={focused} size={24} color={color} />
    )
  }
];

export const userTabs: TabConfig<RootStackParamList>[] = [
  {
    name: 'Home',
    component: HomeScreen,
    title: 'Inicio',
    tabBarIcon: ({ focused, color }) => (
      <FontAwesome5 name="home" solid={focused} size={24} color={color} />
    )
  },
  {
    name: 'Publications',
    component: PublicationScreen,
    title: 'Mis Publicaciones',
    tabBarIcon: ({ focused, color }) => (
      <FontAwesome5 name="book-open" solid={focused} size={24} color={color} />
    )
  }
];
