// frontend/app/admin/ArticleManagement.jsx
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
import ArticleForm from "./components/ArticleForm";
import axios from "axios";

const Stack = createStackNavigator();

function ArticleListScreen({ navigation }) {
  const { authToken } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  useEffect(() => {
    // Add a listener to refresh the list when we navigate back to it
    const unsubscribe = navigation.addListener("focus", () => {
      fetchArticles();
    });

    // Clean up the listener
    return unsubscribe;
  }, [navigation]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/articles`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.data && response.data.articles) {
        setArticles(response.data.articles);
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      Alert.alert("Error", "Failed to load articles");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchArticles();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this article?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await axios.delete(`${API_URL}/api/articles/${id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
              });

              // Update local state to remove deleted article
              setArticles(articles.filter((article) => article._id !== id));
              Alert.alert("Success", "Article deleted successfully");
            } catch (error) {
              console.error("Error deleting article:", error);
              Alert.alert("Error", "Failed to delete article");
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
        onPress={() => navigation.navigate("AddArticle")}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.buttonText}>Add New Article</Text>
      </TouchableOpacity>

      {articles.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No articles found</Text>
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.articleItem}>
              <View style={styles.articleInfo}>
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
                  <Text style={styles.articleTitle} numberOfLines={3} ellipsizeMode="tail">{item.title}</Text>
                  <View style={styles.articleMeta}>
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
                    navigation.navigate("EditArticle", { articleId: item._id })
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
            articles.length === 0 ? styles.fullContainer : null
          }
        />
      )}
    </View>
  );
}

export default function ArticleManagement() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="ArticleList"
        component={ArticleListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddArticle"
        component={ArticleForm}
        options={{ title: "Add New Article", headerShown: false }}
        initialParams={{ isEditing: false }}
      />
      <Stack.Screen
        name="EditArticle"
        component={ArticleForm}
        options={{ title: "Edit Article", headerShown: false }}
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
  articleItem: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  articleInfo: {
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
  articleTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  articleMeta: {
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
