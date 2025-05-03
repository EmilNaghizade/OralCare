import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../../components/BackButton";
import Typo from "../../components/Typo";
import FeedbackToast from "../../components/QuizFeedback";
import { quizApi } from "../../services/api";
import { useAuth } from "../_layout";
import { useTranslation } from "react-i18next";

export default function QuizQuestionScreen() {
  const router = useRouter();
  const { authToken } = useAuth();
  const params = useLocalSearchParams();
  const quizId = params.quizId;
  const initialIdx = parseInt(params.questionIndex?.toString() || "0", 10);

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialIdx);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { i18n,t } = useTranslation();
  const lang = i18n.language.substring(0, 2) || "en";

  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  const timerIntervalRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Fetch quiz data
  useEffect(() => {
    async function fetchQuiz() {
      try {
        setLoading(true);
        const data = await quizApi.getQuizById(quizId, authToken, lang);
        setQuiz(data);
        const seconds = (data.time || 2) * 60;
        setTimeLeft(seconds);
      } catch (e) {
        console.error(e);
        setError("Failed to load quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    if (quizId) fetchQuiz();
  }, [quizId, authToken, lang]);

  // Progress bar
  useEffect(() => {
    if (quiz?.questions?.length) {
      const progress = (currentQuestionIndex + 1) / quiz.questions.length;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentQuestionIndex, quiz, progressAnim]);

  // Timer
  useEffect(() => {
    if (quiz && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            navigateToResults();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [quiz, timeLeft]);

  // Navigate to results
  const navigateToResults = (finalScore) => {
    clearInterval(timerIntervalRef.current);
    router.replace({
      pathname: "/quiz/result",
      params: {
        quizId,
        score: finalScore !== undefined ? finalScore : score,
        totalQuestions: quiz?.questions?.length || 0,
      },
    });
  };

  // Answer selection
  const handleAnswerSelect = (opt, idx) => {
    if (isAnswered) return;
    const q = quiz.questions[currentQuestionIndex];
    const correct = idx === q.correctAnswer;
    setSelectedAnswer(idx);
    setIsAnswered(true);
    setIsCorrectAnswer(correct);
    setShowFeedback(true);
    if (correct) setScore((prev) => prev + 1);

    setTimeout(() => {
      const next = currentQuestionIndex + 1;
      if (next < quiz.questions.length) {
        setCurrentQuestionIndex(next);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setShowFeedback(false);
      } else {
        navigateToResults(correct ? score + 1 : score);
      }
    }, 2000);
  };

  // Format time MM:SS
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#038565" />
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (error || !quiz) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error || "Quiz not found"}</Text>
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

  const currentQuestion = quiz.questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Ionicons name="help-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>Question not found</Text>
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

  // Localize question and options
  const questionText =
    typeof currentQuestion.question === "object"
      ? currentQuestion.question[lang] || currentQuestion.question.en
      : String(currentQuestion.question);

  const opts = Array.isArray(currentQuestion.options)
    ? currentQuestion.options
    : currentQuestion.options && typeof currentQuestion.options === "object"
    ? currentQuestion.options[lang] || currentQuestion.options.en
    : [];

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const current = currentQuestionIndex + 1;
  const total = quiz.questions.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <BackButton />
        <View style={styles.timerContainer}>
          <Ionicons name="timer-outline" size={20} color="#555" />
          <Typo style={styles.timerText}>{formatTime(timeLeft)}</Typo>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>
      <Typo style={styles.questionCounter}>

        {t("questionCount", { current, total })}
      </Typo>
      <View style={styles.questionContainer}>
        <Typo size={22} fontWeight="600" style={styles.questionText}>
          {questionText}
        </Typo>
      </View>
      <View style={styles.optionsContainer}>
        {opts.map((opt, idx) => {
          const text =
            typeof opt === "object" ? opt[lang] || opt.en : String(opt);
          const isSelected = selectedAnswer === idx;
          const isCorrect = currentQuestion.correctAnswer === idx;
          const optStyle = [styles.optionButton];
          const textStyle = [styles.optionText];
          if (isAnswered && isSelected) {
            optStyle.push(
              isCorrect ? styles.correctOption : styles.incorrectOption
            );
            textStyle.push(styles.selectedOptionText);
          }
          return (
            <TouchableOpacity
              key={idx}
              style={optStyle}
              onPress={() => handleAnswerSelect(opt, idx)}
              disabled={isAnswered}
            >
              <Typo style={textStyle}>{text}</Typo>
            </TouchableOpacity>
          );
        })}
      </View>
      <FeedbackToast
        isVisible={showFeedback}
        isCorrect={isCorrectAnswer}
        onAnimationEnd={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "android" ? 15 : 10,
    paddingBottom: 10,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  timerText: { marginLeft: 6, fontWeight: "600", fontSize: 14, color: "#333" },
  progressTrack: {
    height: 8,
    backgroundColor: "#e9ecef",
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: { height: "100%", backgroundColor: "#038565", borderRadius: 4 },
  questionCounter: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
    color: "#6c757d",
  },
  questionContainer: {
    paddingHorizontal: 20,
    marginVertical: 30,
    alignItems: "center",
  },
  questionText: { lineHeight: 30, color: "#212529", textAlign: "center" },
  optionsContainer: { paddingHorizontal: 20, gap: 15 },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E4E9EB",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  optionText: { flex: 1, fontSize: 16, fontWeight: "500", color: "#343a40" },
  correctOption: { borderWidth: 1, borderColor: "#28a745" },
  incorrectOption: { borderWidth: 1, borderColor: "#dc3545" },
  selectedOptionText: { fontWeight: "600" },
});
