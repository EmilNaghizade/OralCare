import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import BackButton from "../../../components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import Badge from "../../../components/Badge";
import Typo from "../../../components/Typo";
import { articleApi, newsApi } from "../../../services/api";
import { useAuth } from "../../_layout";

const ArticleDetail = () => {
  const { id: contentId,  activeTab } = useLocalSearchParams(); // Get ID and type from route param
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken } = useAuth();
  const router = useRouter();

  // Determine if we're looking at an article or news item


  console.log(activeTab, "activeTab");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let result;
        if (activeTab === "Articles") {
          result = await articleApi.getArticleById(contentId, authToken);
        } else {
          result = await newsApi.getNewsById(contentId, authToken);
        }
        setData(result);
      } catch (err) {
        console.error(
          `Error fertching ${isArticle ? "article" : "news"}:`,
          err
        );
        setError(`Failed to load ${isArticle ? "article" : "news"}`);
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      fetchData();
    }
  }, [contentId, authToken]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.manualHeader}>
          <BackButton />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#038565" />
          <Typo style={styles.loadingText}>Loading...</Typo>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.manualHeader}>
          <BackButton />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Typo style={styles.errorText}>{error || "Content not found"}</Typo>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Typo color="#fff" fontWeight="600">
              Go Back
            </Typo>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Format date from ISO string
  const formattedDate = new Date(data.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.manualHeader}>
        {/* Back Button */}
        <BackButton />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainerContent}>
        <Typo fontWeight="600" size={24} style={styles.title}>
          {data.title}
        </Typo>
        <View style={styles.badgeRow}>
          <Badge>{formattedDate}</Badge>
          <Badge>{data.readingTime} min read</Badge>
        </View>

        <Image
          source={{
            uri: `${process.env.EXPO_PUBLIC_API_BASE_URL}${data.thumbnail}`,
          }}
          style={styles.coverImage}
      
        />

        <View style={styles.bodyTextContainer}>
          <Typo style={styles.bodyText}>{data.description}</Typo>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ArticleDetail;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  manualHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 0 : 10,
    height: 55,
    width: "100%",
    paddingHorizontal: 10,
  },
  headerButton: {
    padding: 10,
  },
  scrollContainerContent: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    color: "#1c1c1c",
    lineHeight: 36,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  coverImage: {
    width: "100%",
    height: 237,
    borderRadius: 16,
    marginBottom: 25,
    backgroundColor: "#f0f0f0", // Placeholder color while loading
  },
  bodyTextContainer: {
    // Container for body text
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#038565",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
