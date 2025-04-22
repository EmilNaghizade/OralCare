import React, {useState,useEffect} from "react";
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
import { dummyVideos, quizzes } from "../data"; // Örnek videoları alalım
import { videoApi } from "../../services/api";
import { useAuth } from "../_layout";

const RelatedVideos = ({ quizId }) => {
  const { authToken } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const data = await videoApi.getAllVideos(authToken);
      if (data && data.videos) {
        // In a real app, you might have a way to fetch videos related to the specific quiz
        // For now, we'll just take the first 2 videos
        setVideos(data.videos.slice(0, 2));
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
        <Typo style={styles.emptyText}>No related videos available</Typo>
      </View>
    );
  }

  // Adapt the backend video data format to match what VideoCard expects
  const adaptedVideos = videos.map((video) => ({
    _id: video._id,
    title: video.title,
    thumbnailUrl: {
      uri: `${process.env.EXPO_PUBLIC_API_BASE_URL}${video.thumbnailUrl}`,
    },
    duration: video.duration
      ? `${Math.floor(video.duration / 60)} min ${
          (video.duration * 60) % 60
        } sec`
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
  const numericQuizId = parseInt(quizId, 10); // Convert to number since IDs in data.js are numbers
  const getQuizDataById = (quizId) => {
    return quizzes[quizId] || null; // Quiz'i bulamazsa null döndür
  };
  // Get quiz data from data.js using the imported function
  const quizData = getQuizDataById(numericQuizId);

  // Örnek Quiz Verisi (Normalde ID'ye göre API'den veya önceki ekrandan gelir)
  const quizDetails = {
    // ID'ye göre farklı veri döndürmek için genişletilebilir
    id: quizId,
    title: quizData ? quizData.title : "Quiz Title",
    subtitle: quizData ? quizData.subtitle : "Quiz Subtitle",
    questionCount: quizData ? quizData.questions.length : 0,
    gradientColors:
      quizId == 1 ? ["#663399", "#8A2BE2"] : ["#2E8B57", "#69b58a"], // Mor tonları (ayarlayabilirsiniz)
    relatedVideos: dummyVideos.slice(0, 2), // İlgili videolar (ilk 2'sini alalım)
  };

  const handleStartQuiz = () => {
    console.log("Starting quiz:", quizDetails.id);
    // Burada quiz'i başlatan sayfaya yönlendirme yapılabilir
    // router.push(`/quiz/${quizDetails.id}/question/1`);
    router.push({
      // Rota adının doğru olduğundan emin olun (app/quiz/question.jsx ise /quiz/question)
      pathname: `/quiz/question`,
      params: { quizId: quizId, questionIndex: 0 }, // İlk soru için index 0
    });
  };

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
          colors={quizDetails.gradientColors}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Geri Butonu - Kendi BackButton'unuzu kullanın */}
          <View style={styles.backButtonContainer}>
            <BackButton iconColor="#fff" />
          </View>

          {/* Rozetler (Badges) */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="help-circle-outline" size={14} color="#fff" />
              <Typo style={styles.badgeText}>Quiz</Typo>
            </View>
            <View style={styles.badge}>
              <Typo style={styles.badgeText}>
                {quizDetails.questionCount} questions
              </Typo>
            </View>
          </View>

          {/* Quiz Başlık ve Altbaşlık */}
          <Typo fontWeight="600" size={28} style={styles.quizTitle}>
            {quizDetails.title}
          </Typo>
          <Typo size={16} style={styles.quizSubtitle}>
            {quizDetails.subtitle}
          </Typo>

          {/* Quiz Başlat Butonu */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartQuiz}
          >
            <Typo fontWeight="600" size={16} style={styles.startButtonText}>
              Start quiz
            </Typo>
          </TouchableOpacity>
        </LinearGradient>

        {/* Alt Beyaz Alan - İlgili Videolar */}
        <View style={styles.contentContainer}>
          <Typo style={styles.relatedVideosTitle}>
            Before starting the quiz you can watch related videos below:
          </Typo>

          {/* Video Kartları */}
          <RelatedVideos quizId={numericQuizId} />
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
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30, // Geri butonuna göre boşluk
    gap: 8, // Rozetler arası boşluk
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Yarı saydam beyaz
    borderRadius: 15, // Pill shape
    paddingVertical: 6,
    marginTop: Platform.OS === "android" ? 8 : 0,
    paddingHorizontal: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4, // İkon varsa boşluk
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
});
