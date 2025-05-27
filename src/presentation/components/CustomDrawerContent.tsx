import React, { useContext } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import {useAuth} from "../contexts/AuthContext"; // Puedes usar otro set de íconos si prefieres

const CustomDrawerContent = (props: any) => {
  const { navigation } = props;
  const {signOut, user} = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    signOut().then(r => console.log(r));
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      {/* Perfil */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileWrapper}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image source={{ uri: "https://avatars.githubusercontent.com/u/39220825?v=4" }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>{user.name}</Text>
            <Text style={styles.viewProfileText}>Ver perfil</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPublication')}
        >
          <FontAwesome name="camera" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Navegación */}
      <View style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerBtn} onPress={handleSettings}>
          <FontAwesome name="gear" size={20} color="#555" />
          <Text style={styles.footerBtnText}>Configuración</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerBtn} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#555" />
          <Text style={styles.footerBtnText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f7f7f7',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderRadius: 20,
  },
  profileWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
  },
  username: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
  viewProfileText: {
    fontSize: 13,
    color: '#888',
  },
  addButton: {
    backgroundColor: '#FF5733',
    borderRadius: 20,
    padding: 10,
  },
  drawerItems: {
    flex: 1,
    paddingTop: 10,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerBtnText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default CustomDrawerContent;