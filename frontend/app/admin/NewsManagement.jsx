// frontend/app/admin/NewsManagement.jsx
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
import NewsForm from "./components/NewsForm";
import axios from "axios";

const Stack = createStackNavigator();

function NewsListScreen({ navigation }) {
  const { authToken } = useAuth();
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  useEffect(() => {
    // Add a listener to refresh the list when we navigate back to it
    const unsubscribe = navigation.addListener("focus", () => {
      fetchNews();
    });

    // Clean up the listener
    return unsubscribe;
  }, [navigation]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/news`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.data && response.data.news) {
        setNewsItems(response.data.news);
      } else {
        setNewsItems([]);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      Alert.alert("Error", "Failed to load news");
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this news item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await axios.delete(`${API_URL}/api/news/${id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
              });

              // Update local state to remove deleted news item
              setNewsItems(newsItems.filter((item) => item._id !== id));
              Alert.alert("Success", "News item deleted successfully");
            } catch (error) {
              console.error("Error deleting news item:", error);
              Alert.alert("Error", "Failed to delete news item");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

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
        onPress={() => navigation.navigate("AddNews")}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.buttonText}>Add New News</Text>
      </TouchableOpacity>

      {newsItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No news items found</Text>
        </View>
      ) : (
        <FlatList
          data={newsItems}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.newsItem}>
              <View style={styles.newsInfo}>
                {item.thumbnail ? (
                  <Image
                    source={{ uri: `${API_URL}${item.thumbnail}` }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.thumbnailPlaceholder} />
                )}
                <View style={styles.textContainer}>
                  <Text style={styles.newsTitle}>{item.title}</Text>
                  <View style={styles.newsMeta}>
                    <Text style={styles.readingTime}>
                      {item.readingTime} min read
                    </Text>
                    
                  </View>
                  <Text style={styles.createdAt}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate("EditNews", { newsId: item._id })
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
            newsItems.length === 0 ? styles.fullContainer : null
          }
        />
      )}
    </View>
  );
}

export default function NewsManagement() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="NewsList"
        component={NewsListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddNews"
        component={NewsForm}
        options={{ title: "Add New News", headerShown: false }}
        initialParams={{ isEditing: false }}
      />
      <Stack.Screen
        name="EditNews"
        component={NewsForm}
        options={{ title: "Edit News", headerShown: false }}
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
  newsItem: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  newsInfo: {
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
  newsTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  newsMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  readingTime: {
    fontSize: 14,
    color: "#007AFF",
  },
  createdAt: {
    fontSize: 14,
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