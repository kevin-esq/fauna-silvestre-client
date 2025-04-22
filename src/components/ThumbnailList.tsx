import React from 'react';
import { FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';

type Props = { uris: string[]; onSelect: (uri: string) => void; };
export const ThumbnailList: React.FC<Props> = ({ uris, onSelect }) => (
  <FlatList
    data={uris}
    keyExtractor={item => item}
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.list}
    renderItem={({ item }) => (
      <TouchableOpacity onPress={() => onSelect(item)}>
        <Image source={{ uri: item }} style={styles.image} />
      </TouchableOpacity>
    )}
  />
);

const styles = StyleSheet.create({
    list: { position: 'absolute', bottom: 20, paddingHorizontal: 10 },
    image: { width: 70, height: 70, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#fff' },
  });