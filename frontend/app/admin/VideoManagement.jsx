// frontend/admin/VideoManagement.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../_layout";
import VideoForm from "./components/VideoForm";
import axios from "axios";
import { videoApi } from "../../services/api";

const Stack = createStackNavigator();

function VideoListScreen({ navigation }) {
  const { authToken } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  useEffect(() => {
    // Add a listener to refresh the list when we navigate back to it
    const unsubscribe = navigation.addListener("focus", () => {
      fetchVideos();
    });

    // Clean up the listener
    return unsubscribe;
  }, [navigation]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/videos`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.data && response.data.videos) {
        setVideos(response.data.videos);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      Alert.alert("Error", "Failed to load videos");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVideos();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this video?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await videoApi.deleteVideo(id, authToken);

              // Update local state to remove deleted video
              setVideos(videos.filter((video) => video._id !== id));
              Alert.alert("Success", "Video deleted successfully");
            } catch (error) {
              console.error("Error deleting video:", error);
              Alert.alert("Error", "Failed to delete video");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (videos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ marginBottom: 16 }}>No videos found</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddVideo")}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.buttonText}>Add New Video</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddVideo")}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.buttonText}>Add New Video</Text>
      </TouchableOpacity>

      {videos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No videos found</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.videoItem}>
              <View style={styles.videoInfo}>
                {item.thumbnailUrl ? (
                  <Image
                    source={{ uri: `${API_URL}${item.thumbnailUrl}` }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.thumbnailPlaceholder} />
                )}
                <View style={styles.textContainer}>
                  <Text style={styles.videoTitle} numberOfLines={3} ellipsizeMode="tail">{item.title}</Text>
                  <Text style={styles.videoCategory}>{item.category}</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate("EditVideo", { videoId: item._id })
                  }
                >
                  <Ionicons name="create-outline" size={24} color="#007AFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(item._id)}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={
            videos.length === 0 ? styles.fullContainer : null
          }
        />
      )}
    </View>
  );
}

export default function VideoManagement() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="VideoList"
        component={VideoListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddVideo"
        component={VideoForm}
        options={{ title: "Add New Video", headerShown: false }}
        initialParams={{ isEditing: false }}
      />
      <Stack.Screen
        name="EditVideo"
        component={VideoForm}
        options={{ title: "Edit Video" }}
        initialParams={{ isEditing: true }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F2F2F7",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
  },
  videoItem: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  videoInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  thumbnailPlaceholder: {
    width: 80,
    height: 60,
    backgroundColor: "#E5E5EA",
    borderRadius: 6,
  },
  thumbnailImage: {
    width: 80,
    height: 60,
    borderRadius: 6,
    backgroundColor: "#E5E5EA",
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  videoTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  videoCategory: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#8E8E93",
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
});
