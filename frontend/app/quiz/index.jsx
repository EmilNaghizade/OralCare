import React, { useState, useEffect, useTransition } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import BackButton from "../../components/BackButton"; // Kendi BackButton'unuz
import { VideoCard } from "../../components/VideoCard"; // Kendi VideoCard'ınız
import Typo from "../../components/Typo"; // Kendi Typo'nuz
import { videoApi, quizApi } from "../../services/api";
import { useAuth } from "../_layout";
import { useTranslation } from "react-i18next";

const RelatedVideos = ({ quizId }) => {
  const { authToken } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { i18n,t } = useTranslation();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const data = await videoApi.getAllVideos(authToken, i18n.language);
      if (data && data.videos) {
        // In a real app, you might have a way to fetch videos related to the specific quiz
        // fetch videos that match quizzes category
        const quizData = await quizApi.getQuizById(
          quizId,
          authToken,
          i18n.language
        );
        const relatedVideos = data.videos.filter((video) =>
          video.category.includes(quizData.category)
        );
        console.log("Fetched related videos:", relatedVideos);

        // For now, we'll just take the first 2 videos
        setVideos(relatedVideos.slice(0, 2));
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#038565" />
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Typo style={styles.emptyText}>{t("quiz.noRelatedVideos")}</Typo>
      </View>
    );
  }

  // Adapt the backend video data format to match what VideoCard expects
  const adaptedVideos = videos.map((video) => ({
    _id: video._id,
    title: video.title,
    titleTranslations: video.titleTranslations,
    thumbnailUrl: {
      uri: `${process.env.EXPO_PUBLIC_API_BASE_URL}${video.thumbnailUrl}`,
    },
    duration: video.duration
      ? `${
          Math.floor(video.duration / 60) === 0
            ? ""
            : Math.floor(video.duration / 60) + " min"
        }  ${video.duration % 60} sec`
      : "0 min 00 sec",

    tag: video.category || "Video",
  }));

  return (
    <View style={styles.videoList}>
      {adaptedVideos.map((video) => (
        <VideoCard
          key={video._id}
          item={video}
          style={{ width: "100%" }}
          styleThumbnail={{ height: 200 }}
        />
      ))}
    </View>
  );
};

export default function QuizDetailScreen() {
  const router = useRouter();
  const { id: quizId } = useLocalSearchParams(); // Gelen quiz ID'sini al
  const { authToken } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finishedQuizzes, setFinishedQuizzes] = useState([]);
  const { i18n, t } = useTranslation();
  // Fetch quiz data
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the specific quiz
        const quizData = await quizApi.getQuizById(
          quizId,
          authToken,
          i18n.language
        );
        setQuiz(quizData);
        console.log("Fetched quiz data:", quizData);

        // Also fetch completed quizzes to check if this one is completed
        const completedData = await quizApi.getCompletedQuizzes(authToken);
        if (completedData && completedData.finishedQuizIds) {
          setFinishedQuizzes(completedData.finishedQuizIds);
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setError("Failed to load quiz. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizData();
    }
  }, [quizId, authToken]);

  const isQuizCompleted = () => {
    return finishedQuizzes.includes(quizId);
  };

  const getGradientColors = () => {
    if (!quiz) return ["#2E8B57", "#69b58a"];

    switch (quiz?.colorScheme) {
      case "purple":
        return ["#663399", "#8A2BE2"];
      case "blue":
        return ["#1E5799", "#3498db"];
      case "orange":
        return ["#FF8C00", "#FFA500"];
      case "green":
      default:
        return ["#2E8B57", "#69b58a"];
    }
  };

  const handleStartQuiz = () => {
    // Burada quiz'i başlatan sayfaya yönlendirme yapılabilir
    // router.push(`/quiz/${quizDetails.id}/question/1`);
    router.push({
      pathname: `/quiz/question`,
      params: { quizId: quizId, questionIndex: 0 },
    });

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#038565" />
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      );
    }

    if (error || !quiz) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
          <Text style={styles.errorText}>{error || "Quiz not found"}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
        <Typo style={styles.errorText}>{error}</Typo>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Typo style={styles.retryButtonText}>Go Back</Typo>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.safeArea} edges={["bottom", "left", "right"]}>
      {/* Üstteki gradient koyu olduğu için status bar'ı light yapalım */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Üst Gradient Alan */}
        <LinearGradient
          colors={getGradientColors()}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Geri Butonu - Kendi BackButton'unuzu kullanın */}
          <View style={styles.backButtonContainer}>
            <BackButton iconColor="#fff" />
          </View>

          {/* Rozetler (Badges) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeRowContainer}
            style={styles.badgeScrollView}
          >
            <View style={styles.badge}>
              <Ionicons name="help-circle-outline" size={14} color="#fff" />
              <Typo style={styles.badgeText}>{t("quiz.quiz")}</Typo>
            </View>

            <View style={styles.badge}>
              <Typo style={styles.badgeText}>
                {quiz?.questions?.length || 0} {t}
              </Typo>
            </View>

            {quiz?.category && (
              <View style={styles.badge}>
                <Typo style={styles.badgeText}>{quiz?.category}</Typo>
              </View>
            )}

            {isQuizCompleted() && (
              <View style={[styles.badge, styles.completedBadge]}>
                <Ionicons name="checkmark-circle" size={14} color="#fff" />
                <Typo style={styles.badgeText}>{t("quiz.completed")}</Typo>
              </View>
            )}

            {/* Add more badges as needed */}
          </ScrollView>

          {/* Quiz Başlık ve Altbaşlık */}
          <Typo fontWeight="600" size={28} style={styles.quizTitle}>
            {quiz?.title}
          </Typo>
          <Typo size={16} style={styles.quizSubtitle}>
            {quiz?.description}
          </Typo>

          {/* Quiz Başlat Butonu */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartQuiz}
          >
            <Typo fontWeight="600" size={16} style={styles.startButtonText}>
              {isQuizCompleted() ? t("quiz.retakeQuiz"): t("quiz.startQuiz")}
            </Typo>
          </TouchableOpacity>
        </LinearGradient>

        {/* Alt Beyaz Alan - İlgili Videolar */}
        <View style={styles.contentContainer}>
          <Typo style={styles.relatedVideosTitle}>
            {t("quiz.before")}
          </Typo>

          {/* Video Kartları */}
          <RelatedVideos quizId={quizId} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  gradientContainer: {
    paddingTop: 80, // Status bar + back button için boşluk
    paddingBottom: 40, // Buton için altta boşluk
    paddingHorizontal: 20,
  },
  backButtonContainer: {
    position: "absolute", // Mutlak konumlandırma
    top: Platform.OS === "ios" ? 20 : 35, // Status bar'a göre ayarla
    left: 10,
    zIndex: 1, // Diğer içeriklerin üzerinde
    paddingTop: 25,
  },
  badgeScrollView: {
    // This allows the scroll view to take the full width while clipping content
    width: "100%",
    // Optional settings for better UX
    flexGrow: 0,
    marginVertical: 10,
  },

  badgeRowContainer: {
    // This will make your badges space out correctly inside the ScrollView
    flexDirection: "row",
    paddingLeft: 10,
    paddingRight: 20, // Add extra padding at the end for better UX
    alignItems: "center",
    // Don't use 'justifyContent: space-between' here as it would break scrolling
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8, // Space between badges
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },

  completedBadge: {
    backgroundColor: "rgba(46, 204, 113, 0.3)",
  },
  quizTitle: {
    color: "#fff",
    marginTop: 20,
    lineHeight: 36,
  },
  quizSubtitle: {
    color: "rgba(255, 255, 255, 0.85)", // Biraz daha soluk beyaz
    marginTop: 8,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: "#fff",
    borderRadius: 25, // Tam yuvarlak köşeler
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 30, // Üstteki içerikle arası boşluk
  },
  startButtonText: {
    color: "#333", // Koyu renk buton yazısı
  },
  contentContainer: {
    padding: 20, // Beyaz alanın iç boşluğu
    backgroundColor: "#fff", // Arka planı beyaz yap (gradient sonrası için)
    marginTop: -20, // Gradient'in yuvarlak köşesinin üzerine hafifçe binsin
    paddingTop: 30, // Üstteki yazı için boşluk
    borderTopLeftRadius: 20, // ScrollView'da olmasa da görsel bütünlük için
    borderTopRightRadius: 20,
  },
  relatedVideosTitle: {
    textAlign: "left",
    fontWeight: "600",
    color: "#000",
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 20,
  },
  videoList: {
    gap: 15, // Video kartları arası dikey boşluk
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
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
    backgroundColor: "#fff",
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  completedBadge: {
    backgroundColor: "rgba(46, 204, 113, 0.3)",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
  },
  videoList: {
    gap: 15, // Video kartları arası dikey boşluk
  },
});
