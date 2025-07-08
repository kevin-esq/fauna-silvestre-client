import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const SocialButton = ({ title, onPress, type }) => {
  const getIconName = () => {
    if (type === 'google') return 'google';
    if (type === 'facebook') return 'facebook';
    return 'user';
  };

  const backgroundColor = type === 'google' ? '#db4437' : type === 'facebook' ? '#3b5998' : '#000';

  return (
    <TouchableOpacity style={[styles.button, { backgroundColor }]} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Icon name={getIconName()} size={20} color="#fff" />
      </View>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140
  },
  iconContainer: {
    marginRight: 10
  },
  text: {
    color: '#fff',
    fontSize: 16
  }
});

export default SocialButton;
