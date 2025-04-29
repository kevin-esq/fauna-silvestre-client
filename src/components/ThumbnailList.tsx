import React from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

type ThumbnailListProps = {
  uris: string[];
  onSelect: (uri: string) => void;
};

export const ThumbnailList: React.FC<ThumbnailListProps> = ({
  uris,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={uris}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
        snapToInterval={width * 0.2 + 10} // Ancho del thumbnail + margen
        decelerationRate="fast"
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(item);
            }}
            style={styles.thumbnail}
            activeOpacity={0.7}>
            <Image source={{ uri: item }} style={styles.image} />
            <MaterialIcons
              name="zoom-in"
              size={20}
              color="white"
              style={styles.zoomIcon}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: width * 0.2 + 30,
  },
  listContent: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
  thumbnail: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  zoomIcon: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    padding: 2,
  },
});
