import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { quizApi } from "../services/api";
import SectionHeader from "./SectionHeader";
import QuizCard from "./QuizCard";
import Typo from "./Typo";

export default function QuizSection({ authToken }) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizApi.getAllQuizzes(authToken);
      if (data && data.quizzes) {
        // Filter to only published quizzes and limit to 4 for display
        const publishedQuizzes = data.quizzes
          .filter((quiz) => quiz.isPublished)
          .slice(0, 4);
        setQuizzes(publishedQuizzes);
      } else {
        setQuizzes([]);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.sectionCard}>
        <SectionHeader title="Test your knowledge" isOnSeeAll={false} />
        <Text style={styles.sectionSubtitle}>
          Take quizzes based on videos and articles
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#038565" />
        </View>
      </View>
    );
  }

  if (quizzes.length === 0) {
    return (
      <View style={styles.sectionCard}>
        <SectionHeader title="Test your knowledge" isOnSeeAll={false} />
        <Text style={styles.sectionSubtitle}>
          Take quizzes based on videos and articles
        </Text>
        <View style={styles.emptyContainer}>
          <Typo style={styles.emptyText}>No quizzes available</Typo>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.sectionCard}>
      <SectionHeader
        title="Test your knowledge"
        isOnSeeAll={true}
        onSeeAllPress={() => router.push("/quizzes")}
      />
      <Text style={styles.sectionSubtitle}>
        Take quizzes based on videos and articles
      </Text>
      <FlatList
        data={quizzes}
        renderItem={({ item }) => <QuizCard item={item} />}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: "#ffffff", // White card background
    marginTop: 0, // Space between cards
    marginBottom: 15, // Space below card
    borderRadius: 12,
    paddingTop: 15, // Padding above section header
    paddingBottom: 20, // Padding below horizontal list
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666666", // Subtitle color
    marginBottom: 10, // Space below subtitle
    paddingHorizontal: 20, // Padding on left and right
  },
  horizontalList: {
    paddingLeft: 20, // Padding on left
    paddingRight: 10, // Padding on right
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 200, // Height of the loading container
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 200, // Height of the empty container
  },
  emptyText: {
    fontSize: 16,
    color: "#666666", // Empty state text color
  },
  horizontalList: { paddingHorizontal: 20, paddingVertical: 5 },
});
