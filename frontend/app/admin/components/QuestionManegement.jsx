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
import BackButton from "../../../components/BackButton";
import { quizApi } from "../../../services/api";
import { useTranslation } from "react-i18next";

export default function QuestionsManagement({ route, navigation }) {
  const { quizId } = route.params;
  const { authToken } = useAuth();
  const { i18n } = useTranslation();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch quiz data on focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchQuizData();
    });
    return unsubscribe;
  }, [navigation, quizId]);

  const fetchQuizData = async () => {
    setLoading(true);
    try {
      const quizData = await quizApi.getQuizById(
        quizId,
        authToken,
        i18n.language.substring(0, 2)
      );
      setQuiz(quizData);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      Alert.alert("Error", "Failed to load quiz data");
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchQuizData();
  };

  const handleDeleteQuestion = (questionId) => {
    if (quiz.questions.length <= 1) {
      Alert.alert(
        "Cannot Delete",
        "A quiz must have at least one question. Add another question before deleting this one."
      );
      return;
    }

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this question?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await quizApi.deleteQuestion(quizId, questionId, authToken);
              await fetchQuizData();
              Alert.alert("Success", "Question deleted successfully");
            } catch (error) {
              console.error("Error deleting question:", error);
              Alert.alert("Error", "Failed to delete question");
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

  if (!quiz) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Quiz not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Determine locale (default to 'en')
  const lang = i18n.language.substring(0, 2) || "en";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Manage Questions</Text>
      </View>

      <View style={styles.quizInfoCard}>
        <Text style={styles.quizTitle}>{quiz.title}</Text>
        <Text style={styles.questionCount}>
          {quiz.questions?.length || 0} Questions
        </Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddQuestion", { quizId })}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.buttonText}>Add New Question</Text>
      </TouchableOpacity>

      {quiz.questions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="help-circle-outline" size={48} color="#8E8E93" />
          <Text style={styles.emptyText}>No questions yet</Text>
          <Text style={styles.emptySubtext}>
            Add questions to make this quiz available to users
          </Text>
        </View>
      ) : (
        <FlatList
          data={quiz.questions}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => {
            const questionText =
              item.question && typeof item.question === "object"
                ? item.question[lang] || item.question.en
                : String(item.question);
            const opts =
              item.options && typeof item.options === "object"
                ? item.options[lang] || item.options.en
                : Array.isArray(item.options)
                ? item.options
                : [];

            return (
              <View style={styles.questionItem}>
                <View style={styles.questionInfo}>
                  <View style={styles.questionNumberBadge}>
                    <Text style={styles.questionNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.questionText} numberOfLines={2}>
                      {questionText}
                    </Text>
                    <Text style={styles.optionCount}>
                      {opts.length} options
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      navigation.navigate("EditQuestion", {
                        quizId,
                        questionId: item._id,
                        isEditing: true,
                      })
                    }
                  >
                    <Ionicons name="create-outline" size={24} color="#007AFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteQuestion(item._id)}
                  >
                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={
            quiz.questions.length === 0
              ? styles.fullContainer
              : { paddingBottom: 20 }
          }
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
    paddingTop: 10,
    height: 55,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  quizInfoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  questionCount: {
    fontSize: 16,
    color: "#8E8E93",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
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
  fullContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  questionItem: {
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
  questionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  questionNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8E8E93",
  },
  textContainer: {
    flex: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 4,
  },
  optionCount: {
    fontSize: 14,
    color: "#8E8E93",
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontWeight: "500",
  },
});
