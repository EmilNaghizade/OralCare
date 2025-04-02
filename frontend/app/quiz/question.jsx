import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated, // Animasyon için
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../../components/BackButton"; // Kendi BackButton'unuz
import Typo from "../../components/Typo"; // Kendi Typo'nuz
import { getQuizDataById } from "../data"; // Quiz verisini import et

const TOTAL_TIME = 120; // Saniye cinsinden (2 dakika)

export default function QuizQuestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const quizId = params.quizId;
  // questionIndex parametresini al, yoksa 0 varsay (string'den number'a çevir)
  const initialQuestionIndex = parseInt(
    params.questionIndex?.toString() || "0",
    10
  );

  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(initialQuestionIndex);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // Seçilen cevap
  const [isAnswered, setIsAnswered] = useState(false); // Cevap verildi mi?
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME); // Kalan süre
  const [score, setScore] = useState(0); // Doğru cevap sayısı

  // Zamanlayıcı için referans
  const timerIntervalRef = useRef(null);
  // İlerleme çubuğu animasyonu için
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Quiz verisini yükle
  useEffect(() => {
    const data = getQuizDataById(quizId?.toString());
    if (data?.questions?.length) {
      setQuizData(data);
    } else {
      console.error("Quiz verisi bulunamadı veya boş:", quizId);
      // Hata durumunda geri dön
      if (router.canGoBack()) router.back();
    }
  }, [quizId, router]);

  // İlerleme çubuğu animasyonunu güncelle
  useEffect(() => {
    if (quizData?.questions?.length) {
      const newProgress =
        (currentQuestionIndex + 1) / quizData.questions.length;
      Animated.timing(progressAnim, {
        toValue: newProgress,
        duration: 300, // Animasyon süresi
        useNativeDriver: false, // width animasyonu için false olmalı
      }).start();
    }
  }, [currentQuestionIndex, quizData, progressAnim]);

  // Zamanlayıcıyı başlat/durdur
  useEffect(() => {
    if (quizData) {
      // Sadece quiz verisi yüklendiğinde başlat
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerIntervalRef.current);
            // Süre bitti, sonuçlara git
            console.log("Süre bitti!");
            navigateToResults();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    // Component unmount olduğunda interval'ı temizle
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [quizData]); // quizData yüklendiğinde başlasın

  // --- Fonksiyonlar ---
  const navigateToResults = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current); // Zamanlayıcıyı durdur
    }
    router.replace({
      // Geri dönülememesi için replace kullan
      pathname: "/quiz/result", // Sonuçlar sayfasının rotası
      params: {
        quizId: quizId,
        score: score, // Güncel skoru gönder
        totalQuestions: quizData?.questions?.length || 0, // Toplam soru sayısını gönder
      },
    });
  };

  const handleAnswerSelect = (option) => {
    if (isAnswered) return; // Zaten cevaplandıysa tekrar seçtirme

    const correct = option === currentQuestion?.correctAnswer;
    setSelectedAnswer(option); // Seçimi state'e kaydet
    setIsAnswered(true); // Cevaplandı olarak işaretle
    let currentScore = score;
    if (correct) {
        currentScore+=10
      setScore((prevScore) => prevScore + 1); // Doğruysa skoru artır
    }

    // Geri bildirim için kısa bir süre bekle
    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < quizData.questions.length) {
        // Sonraki soruya geç
        setCurrentQuestionIndex(nextIndex);
        setSelectedAnswer(null); // Seçimi sıfırla
        setIsAnswered(false); // Cevaplandı durumunu sıfırla
      } else {
        // Quiz bitti, sonuçlara git
        navigateToResults();
      }
    }, 1000); // 1 saniye bekleme süresi
  };

  // Zamanı MM:SS formatına çevir
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // --- Render ---
  const currentQuestion = quizData?.questions?.[currentQuestionIndex];
  const totalQuestions = quizData?.questions?.length || 0;

  // Veri yüklenirken veya hata durumunda gösterilecek ekran
  if (!quizData || !currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Stack header'ı gizleyebilir veya basit bir başlık gösterebilir */}
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <Typo>Quiz Yükleniyor...</Typo>
        </View>
      </SafeAreaView>
    );
  }

  // İlerleme çubuğunun genişliğini hesapla
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <View style={styles.timerContainer}>
          <Ionicons name="timer-outline" size={20} color="#555" />
          <Typo style={styles.timerText}>{formatTime(timeLeft)}</Typo>
        </View>
      </View>

      {/* İlerleme Çubuğu */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>
      <Typo style={styles.questionCounter}>
        Question {currentQuestionIndex + 1} of {totalQuestions}
      </Typo>

      {/* Soru */}
      <View style={styles.questionContainer}>
        <Typo size={22} fontWeight="600" style={styles.questionText}>
          {currentQuestion.text}
        </Typo>
      </View>

      {/* Cevap Seçenekleri */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = currentQuestion.correctAnswer === option;

          // Geri bildirim için dinamik stiller
          let optionStyle = [styles.optionButton];
          let textStyle = [styles.optionText];

          if (isAnswered && isSelected) {
            optionStyle.push(
              isCorrect ? styles.correctOption : styles.incorrectOption
            );
            textStyle.push(styles.selectedOptionText);
          } else if (isAnswered && isCorrect) {
            // Seçilmese bile doğru cevabı göster (isteğe bağlı)
            // optionStyle.push(styles.correctOption);
            // textStyle.push(styles.selectedOptionText);
          }

          return (
            <TouchableOpacity
              key={index}
              style={optionStyle}
              onPress={() => handleAnswerSelect(option)}
              disabled={isAnswered} // Cevaplandıysa butonu pasif yap
            >
              <Typo style={textStyle}>{option}</Typo>
              {/* Doğru/Yanlış ikonu ekleme (isteğe bağlı) */}
              {isAnswered && isSelected && (
                <Ionicons
                  name={isCorrect ? "checkmark-circle" : "close-circle"}
                  size={24}
                  color={
                    isCorrect
                      ? styles.correctOption.borderColor
                      : styles.incorrectOption.borderColor
                  }
                  style={styles.feedbackIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// --- Stiller ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa", // Biraz daha açık gri arka plan
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "android" ? 15 : 10,
    paddingBottom: 10,
    backgroundColor: "#f0f2f5", // Beyaz header arka planı
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5", // Zamanlayıcı arka planı
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  timerText: {
    marginLeft: 6,
    fontWeight: "600", // Biraz daha kalın
    fontSize: 14,
    color: "#333",
  },
  progressTrack: {
    // İlerleme çubuğunun arka planı
    height: 8, // Biraz daha kalın
    backgroundColor: "#e9ecef",
    marginHorizontal: 20,
    marginTop: 15, // Header'dan sonra boşluk
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    // İlerleyen kısım
    height: "100%",
    backgroundColor: "#038565", // Ana tema rengi
    borderRadius: 4,
  },
  questionCounter: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
    color: "#6c757d", // Daha soluk gri
  },
  questionContainer: {
    paddingHorizontal: 20,
    marginTop: 25, // Soru ile sayaç arası boşluk
    marginBottom: 35, // Soru ile cevaplar arası boşluk
    alignItems: "center", // Soruyu ortala
  },
  questionText: {
    lineHeight: 30, // Satır yüksekliği
    color: "#212529", // Koyu renk soru metni
    textAlign: "center",
  },
  optionsContainer: {
    paddingHorizontal: 20,
    gap: 15, // Seçenekler arası boşluk
  },
  optionButton: {
    flexDirection: "row", // İkonu sağa almak için
    justifyContent: "space-between", // İkonu sağa almak için
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 18,
    paddingHorizontal: 20, // İç boşluk artırıldı
    borderRadius: 16, // Daha yuvarlak köşeler
    borderWidth: 1,
    borderColor: "#dee2e6", // Daha belirgin sınır
    // Gölge
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    flex: 1, // Metnin ikon gelince kaymasını engelle
    fontSize: 16,
    fontWeight: "500",
    color: "#343a40",
  },
  // Seçim sonrası stiller
  correctOption: {
    backgroundColor: "#e7f5ec", // Açık yeşil
    borderColor: "#28a745", // Yeşil sınır
  },
  incorrectOption: {
    backgroundColor: "#fdecef", // Açık kırmızı
    borderColor: "#dc3545", // Kırmızı sınır
  },
  selectedOptionText: {
    fontWeight: "600", // Seçili/sonuç metnini biraz kalın yap
  },
  feedbackIcon: {
    marginLeft: 10, // İkon ile metin arası boşluk
  },
});
