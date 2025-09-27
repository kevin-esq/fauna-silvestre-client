import React, { useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  Pressable
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const THUMBNAIL_SIZE = width * 0.18;
const THUMBNAIL_MARGIN = 8;

type ThumbnailListProps = {
  uris: string[];
  onSelect: (uri: string) => void;
  activeUri?: string | null;
  maxItems?: number;
};

interface ThumbnailItemProps {
  uri: string;
  isActive: boolean;
  onPress: (uri: string) => void;
}

const ThumbnailItem = React.memo<ThumbnailItemProps>(
  ({ uri, isActive, onPress }) => {
    const handleImageError = useCallback(
      (error: NativeSyntheticEvent<{ error: string }>) => {
        console.warn('Failed to load thumbnail:', uri, error.nativeEvent.error);
      },
      [uri]
    );

    return (
      <Pressable onPress={() => onPress(uri)}>
        <View style={[styles.thumbnail, isActive && styles.thumbnailActive]}>
          <Image
            source={{ uri }}
            style={[styles.image, isActive && styles.imageActive]}
            resizeMode="cover"
            onError={handleImageError}
          />
          <View style={styles.overlay}>
            <MaterialIcons
              name="zoom-in"
              size={18}
              color="white"
              style={styles.zoomIcon}
            />
          </View>
        </View>
      </Pressable>
    );
  }
);

ThumbnailItem.displayName = 'ThumbnailItem';

export const ThumbnailList: React.FC<ThumbnailListProps> = ({
  uris,
  onSelect,
  activeUri = null,
  maxItems = 10
}) => {
  const displayUris = useMemo(() => uris.slice(0, maxItems), [uris, maxItems]);

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <ThumbnailItem
        uri={item}
        isActive={activeUri === item}
        onPress={onSelect}
      />
    ),
    [activeUri, onSelect]
  );

  const keyExtractor = useCallback(
    (item: string, index: number) => `${item}-${index}`,
    []
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<string> | null | undefined, index: number) => ({
      length: THUMBNAIL_SIZE + THUMBNAIL_MARGIN * 2,
      offset: (THUMBNAIL_SIZE + THUMBNAIL_MARGIN * 2) * index,
      index
    }),
    []
  );

  if (!displayUris.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={displayUris}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        getItemLayout={getItemLayout}
        removeClippedSubviews={false}
        maxToRenderPerBatch={8}
        windowSize={15}
        initialNumToRender={5}
        scrollEventThrottle={16}
        bounces
        alwaysBounceHorizontal
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: THUMBNAIL_SIZE + 20,
    justifyContent: 'center'
  },
  listContent: {
    paddingHorizontal: 12,
    alignItems: 'center'
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 12,
    marginHorizontal: THUMBNAIL_MARGIN,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22
  },
  thumbnailActive: {
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
    transform: [{ scale: 1.05 }]
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  imageActive: {
    opacity: 0.9
  },
  overlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  zoomIcon: {
    backgroundColor: 'transparent'
  }
});
