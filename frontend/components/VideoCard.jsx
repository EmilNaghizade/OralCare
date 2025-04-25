import React, { useState } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";


export const VideoCard = ({ item, style, styleThumbnail }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <TouchableOpacity
      style={[styles.videoCard, style]}
      onPress={() => {
        router.push(`/(modal)/video/${item._id}`);
      }}
    >
      <View style={[styles.thumbnailContainer, styleThumbnail]}>
        {isLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color="#038565" />
          </View>
        )}
        <Image
          style={[styles.videoThumbnail, styleThumbnail]}
          source={item?.thumbnailUrl}
          resizeMode={"cover"}
        />
      </View>

      <View style={styles.videoInfoContainer}>
        {item.tag && (
          <View style={styles.videoTagContainer}>
            <Ionicons name="leaf-outline" size={12} color="#038565" />
            <Text style={styles.videoTagText}>{item.tag}</Text>
          </View>
        )}
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title || "Video Title Placeholder"}
        </Text>
        <Text style={styles.videoDuration}>
          {item.duration || "0 min 00 sec"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  videoCard: {
    width: 210,
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  thumbnailContainer: {
    width: "90%",
    alignSelf: "center",
    height: 110,
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: "#eee",
    overflow: "hidden",
    position: "relative",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(238, 238, 238, 0.7)",
  },
  videoInfoContainer: {
    padding: 12,
  },
  videoTagContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2F7",
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  videoTagText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#038565",
    marginLeft: 4,
  },
  videoTitle: {
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    lineHeight: 18,
  },
  videoDuration: {
    fontSize: 12,
    color: "#038565",
  },
});
