
// frontend/admin/VideoManagement.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../_layout";
import VideoForm from "./components/VideoForm";

const Stack = createStackNavigator();

function VideoListScreen({ navigation }) {
  const { authToken } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch videos from your API
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      // Replace with your actual API call
      // const response = await fetch('your-api-endpoint', {
      //   headers: { Authorization: `Bearer ${authToken}` }
      // });
      // const data = await response.json();

      // Dummy data for now
      const dummyData = [
        {
          id: "1",
          title: "Brushing Techniques",
          thumbnail: "url",
          tags: ["education"],
        },
        {
          id: "2",
          title: "Flossing Guide",
          thumbnail: "url",
          tags: ["tutorial"],
        },
      ];

      setVideos(dummyData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setLoading(false);
    }
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
              // Replace with your actual API call
              // await fetch(`your-api-endpoint/${id}`, {
              //   method: 'DELETE',
              //   headers: { Authorization: `Bearer ${authToken}` }
              // });

              // Update local state
              setVideos(videos.filter((video) => video.id !== id));
            } catch (error) {
              console.error("Error deleting video:", error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.videoItem}>
              <View style={styles.videoInfo}>
                <View style={styles.thumbnailPlaceholder} />
                <View style={styles.textContainer}>
                  <Text style={styles.videoTitle}>{item.title}</Text>
                  <View style={styles.tagsContainer}>
                    {item.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate("EditVideo", { videoId: item.id })
                  }
                >
                  <Ionicons name="create-outline" size={24} color="#007AFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

export default function VideoManagement() {
    return (
      <Stack.Navigator>
        <Stack.Screen 
          name="VideoList" 
          component={VideoListScreen}
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="AddVideo" 
          component={VideoForm}
          options={{ title: 'Add New Video' }}
          initialParams={{ isEditing: false }}
        />
        <Stack.Screen 
          name="EditVideo" 
          component={VideoForm}
          options={{ title: 'Edit Video' }}
          initialParams={{ isEditing: true }}
        />
      </Stack.Navigator>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#F2F2F7',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#007AFF',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
      marginLeft: 8,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: '#8E8E93',
    },
    videoItem: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    videoInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    thumbnailPlaceholder: {
      width: 60,
      height: 40,
      backgroundColor: '#E5E5EA',
      borderRadius: 6,
    },
    textContainer: {
      marginLeft: 12,
      flex: 1,
    },
    videoTitle: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 6,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    tag: {
      backgroundColor: '#E5E5EA',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 6,
    },
    tagText: {
      fontSize: 12,
      color: '#8E8E93',
    },
    actions: {
      flexDirection: 'row',
    },
    actionButton: {
      padding: 6,
      marginLeft: 8,
    },
  });