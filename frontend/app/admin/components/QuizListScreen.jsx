// frontend/app/admin/components/QuizListScreen.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../_layout";
import { quizApi } from "../../../services/api";

export default function QuizListScreen({ navigation }) {
  const { authToken } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Add a listener to refresh the list when we navigate back to it
    const unsubscribe = navigation.addListener("focus", () => {
      fetchQuizzes();
    });

    // Clean up the listener
    return unsubscribe;
  }, [navigation]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await quizApi.getAllQuizzes(authToken);
      if (data && data.quizzes) {
        setQuizzes(data.quizzes);
      } else {
        setQuizzes([]);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      Alert.alert("Error", "Failed to load quizzes");
      setQuizzes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQuizzes();
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this quiz? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await quizApi.deleteQuiz(id, authToken);

              // Update local state to remove deleted quiz
              setQuizzes(quizzes.filter((quiz) => quiz._id !== id));
              Alert.alert("Success", "Quiz deleted successfully");
            } catch (error) {
              console.error("Error deleting quiz:", error);
              Alert.alert("Error", "Failed to delete quiz");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Helper function to get color based on scheme
  const getColorForScheme = (scheme) => {
    switch (scheme) {
      case 'purple': return '#8A2BE2';
      case 'blue': return '#1E90FF';
      case 'orange': return '#FF8C00';
      case 'green':
      default: return '#2E8B57';
    }
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
        onPress={() => navigation.navigate("AddQuiz")}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.buttonText}>Add New Quiz</Text>
      </TouchableOpacity>

      {quizzes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color="#8E8E93" />
          <Text style={styles.emptyText}>No quizzes found</Text>
          <Text style={styles.emptySubtext}>
            Create your first quiz by tapping the button above
          </Text>
        </View>
      ) : (
        <FlatList
          data={quizzes}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={[
              styles.quizItem, 
              !item.isPublished && styles.unpublishedQuiz
            ]}>
              <View style={styles.quizInfo}>
                <View 
                  style={[
                    styles.colorIndicator, 
                    { backgroundColor: getColorForScheme(item.colorScheme) }
                  ]} 
                />
                <View style={styles.textContainer}>
                  <Text style={styles.quizTitle}>{item.title}</Text>
                  <Text style={styles.quizCategory}>
                    {item.category || "Uncategorized"} • {item.questions?.length || 0} questions
                  </Text>
                  {!item.isPublished && (
                    <View style={styles.draftBadge}>
                      <Text style={styles.draftBadgeText}>Draft</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate("ManageQuestions", { quizId: item._id })
                  }
                >
                  <Ionicons name="list-outline" size={24} color="#007AFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate("EditQuiz", { quizId: item._id })
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
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F5F7",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  homeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#038565",
    marginLeft: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#8E8E93",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 8,
  },
  quizItem: {
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unpublishedQuiz: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
  },
  quizInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  colorIndicator: {
    width: 12,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  quizCategory: {
    fontSize: 14,
    color: "#8E8E93",
  },
  draftBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  draftBadgeText: {
    fontSize: 12,
    color: "#F5A623",
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});