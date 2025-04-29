import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./_layout";
import BackButton from "../components/BackButton";
import Typo from "../components/Typo";
import { quizApi } from "../services/api";
import { LogBox } from "react-native";
import QuizCard from "../components/QuizCard";

export default function Quizzes() {
  // Ignore specific warning

  const router = useRouter();
  const { authToken } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [authToken]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await quizApi.getAllQuizzes(authToken);
      if (data && data.quizzes) {
        console.log("Fetched quizzes:", );
        // Map the backend data to match the expected format for QuizCard
        const mappedQuizzes = data.quizzes.map((quiz) => ({
          _id: quiz._id,
          title: quiz.title,
          colorScheme: quiz.colorScheme,
          __v: quiz.__v
        }));
        setQuizzes(mappedQuizzes);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderQuizItem = ({ item }) => (
    <QuizCard item={item} cardWidth={"47%"} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerButtons}>
            <BackButton />
          </View>
          <Text style={styles.headerTitle}>Test your knowledge</Text>
        </View>

        {/* Articles/News Grid */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#038565" />
          </View>
        ) : quizzes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Typo style={styles.emptyText}>No available Quizzes</Typo>
          </View>
        ) : (
          <FlatList
            data={quizzes}
            renderItem={renderQuizItem}
            keyExtractor={(item) => item._id.toString()}
            numColumns={2}
            contentContainerStyle={styles.articleGrid}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.columnWrapper}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    paddingBottom: 30,
    backgroundColor: "#f0f2f5",
  },
  header: {
    justifyContent: "flex-end", // Başlığı dikeyde ortala
    backgroundColor: "#fff", // Beyaz header arka planı
    paddingTop: 20, // Üst boşluk (statusBar'a göre)
    paddingBottom: 20, // Alt boşluk
    paddingHorizontal: 20, // Yan boşluklar
    // Alt köşeleri yuvarlatma
    borderBottomLeftRadius: 24, // <<< YUVARLAK KÖŞE
    borderBottomRightRadius: 24, // <<< YUVARLAK KÖŞE
  },
  headerButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 24,
    marginVertical: 16,
    fontWeight: "600",
    lineHeight: 32,
    marginHorizontal: 8,
    color: "#000",
  },
  tabContainer: {
    flexDirection: "row",
    paddingVertical: 12,
    marginHorizontal: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginRight: 8,
    borderRadius: 24,
  },
  activeTab: {
    backgroundColor: "#E3ECF0",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748B",
  },
  activeTabText: {
    color: "#000",
  },
  articleGrid: {
    padding: 8,
    marginTop: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  loadingContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 20,
    borderRadius: 20,
  },
  emptyContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 20,
    borderRadius: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
  },
});
