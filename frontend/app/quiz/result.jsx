import React, { useEffect, useRef,useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  Text,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon"; // <-- Konfeti kütüphanesi import edildi
import Typo from "../../components/Typo"; // Kendi Typo bileşeniniz
import { useAuth } from "../_layout"; // Auth context'inizi import edin
import { quizApi } from "../../services/api";

const POINTS_PER_QUESTION = 10; // Her doğru cevap için puan
const resultImage = require("../../assets/images/Result.png");

export default function QuizResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { updateUserPoints } = useAuth(); // Context'ten puan güncelleme fonksiyonunu alın

  // Parametreleri al ve number'a çevir (string gelebilirler)
  const score = parseInt(params.score?.toString() || "0", 10);
  const totalQuestions = parseInt(params.totalQuestions?.toString() || "1", 10); // 0'a bölme hatası için 1 varsay
  const quizId = params.quizId;

  const earnedPoints = score * POINTS_PER_QUESTION;
  const confettiRef = useRef(null); // Konfeti için ref (opsiyonel, manuel tetikleme için)
  const [loading, setLoading] = useState(false);

  // Call API to mark video as watched
  useEffect(() => {
    const markQuizCompleted = async () => {
      try {
        setLoading(true);
        await quizApi.markQuizCompleted(quizId);

 
      } catch (error) {
        console.error("Error marking quiz as completed:", error);
      } finally {
        setLoading(false);
      }
    };

    markQuizCompleted();
  }, [quizId]);

  const handleGoHome = () => {
    router.replace("/(tabs)/home"); // replace kullanarak geri tuşuyla buraya dönülmesini engelle
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#038565" />
          <Text style={styles.loadingText}>Saving your results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Bu ekran için header'ı gizle */}
      <Stack.Screen options={{ headerShown: false }} />
      <ConfettiCannon
        ref={confettiRef} // ref'i ata
        count={200} // Konfeti parçacık sayısı (isteğe bağlı ayarlayın)
        origin={{ x: Dimensions.get("window").width / 2, y: -20 }} // Başlangıç noktası (ekranın üst ortası, biraz dışı)
        autoStart={true} // Ekran açıldığında otomatik başlasın
        fadeOut={true} // Parçacıklar kaybolsun
        fallSpeed={3000} // Düşme hızı (daha yüksek = daha yavaş)
        explosionSpeed={400} // Patlama hızı (yayılma)
        colors={["#038565", "#28a745", "#90ee90", "#3cb371"]} // Yeşil tonları
        // duration={3000} // Animasyon süresi (opsiyonel)
        zIndex={1000} // Diğer elemanların üzerinde olmasını sağla
      />

      {/* Onay İkonu */}
      <View style={styles.iconContainer}>
        {/* İkonun tam eşleşmesi için gerekirse SVG kullanın */}
        <Image source={resultImage} style={{ width: 100, height: 100 }} />
      </View>

      {/* Başlık */}
      <Typo size={26} fontWeight="600" style={styles.title}>
        Congratulations on{"\n"}completing quiz!
      </Typo>

      {/* Skor */}
      <View style={styles.scoreContainer}>
        <Typo style={styles.scoreAchieved}>{score}</Typo>
        <Typo style={styles.scoreTotal}>/{totalQuestions}</Typo>
      </View>
      <Typo style={styles.scoreLabel}>Answered Correctly</Typo>

      {/* Ödüller Bölümü */}
      <View style={styles.rewardsSection}>
        <Typo style={styles.rewardsLabel}>Rewards</Typo>
        <View style={styles.rewardBar}>
          {/* Ödül ikonu */}
          <View style={styles.rewardIconContainer}>
            {/* Basit bir daire ikonu veya özel bir ikon */}
            <Ionicons name="ellipse" size={28} color="#038565" />
            {/* Veya <Ionicons name="star" size={20} color="#FFD700" /> */}
          </View>
          {/* Ödül Metni */}
          <Typo style={styles.rewardText}>{earnedPoints} Reward</Typo>
        </View>
      </View>

      {/* Anasayfaya Dön Butonu */}
      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <Typo fontWeight="600" size={16} style={styles.homeButtonText}>
          Go to home
        </Typo>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// --- Stiller ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Beyaz arka plan
    alignItems: "center",
    justifyContent: "center", // İçeriği dikeyde ortala
    paddingHorizontal: 30, // Yanlardan boşluk
    paddingBottom: 50, // Buton için altta yer
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
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45, // Tam daire
    backgroundColor: "#e7f5ec", // Çok açık yeşil arka plan
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    // Fotoğraftaki gibi dalgalı kenar için SVG veya özel çizim gerekir.
    // Basit bir kenarlık eklenebilir:
    // borderWidth: 2,
    // borderColor: '#d4edda',
  },
  title: {
    textAlign: "center",
    color: "#1c1c1c",
    marginBottom: 15,
    lineHeight: 34, // Satır yüksekliği
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "baseline", // "/" karakterini hizala
    marginBottom: 8,
  },
  scoreAchieved: {
    fontSize: 48, // Büyük skor
    fontWeight: "bold",
    color: "#038565", // Tema rengi
  },
  scoreTotal: {
    fontSize: 24, // Daha küçük toplam sayısı
    fontWeight: "500",
    color: "#6c757d", // Gri renk
    marginLeft: 4,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 24,
    color: "#64748B",
    marginBottom: 50, // Ödüller bölümüne kadar boşluk
  },
  rewardsSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 60, // Butona kadar boşluk
  },
  rewardsLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
    marginBottom: 15,
  },
  rewardBar: {
    flexDirection: "row",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    backgroundColor: "#F0F5F7", // Çok çok açık yeşil/gri
    borderRadius: 16, // Pill shape
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "85%", // Genişliği ayarla
  },
  rewardIconContainer: {
    marginRight: 15,
    // İkonun tam görünümü için ek stiller eklenebilir
  },
  rewardText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000", // Koyu renk
    lineHeight: 24,
  },
  homeButton: {
    backgroundColor: "#038565", // Tema rengi arka plan
    borderRadius: 30, // Daha yuvarlak buton
    paddingVertical: 18,
    paddingHorizontal: 20,
    width: "90%", // Daha geniş buton
    alignItems: "center",
    position: "absolute", // Veya absolute ile en alta sabitle
    bottom: 50,
  },
  homeButtonText: {
    color: "#fff", // Beyaz yazı
  },
});
