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
import FeedbackToast from "../../components/QuizFeedback"; // Import the FeedbackToast component
import { quizApi } from "../../services/api";
import { useAuth } from "../_layout";

export default function QuizQuestionScreen() {
  const router = useRouter();
  const { authToken } = useAuth();
  const params = useLocalSearchParams();
  const quizId = params.quizId;
  const initialQuestionIndex = parseInt(
    params.questionIndex?.toString() || "0",
    10
  );

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(initialQuestionIndex);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for feedback toast
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  // Timer reference
  const timerIntervalRef = useRef(null);
  // Progress bar animation
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Load quiz data
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const quizData = await quizApi.getQuizById(quizId, authToken);
        setQuiz(quizData);
        setTimeLeft(quizData.time);
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

  // Update progress bar animation
  useEffect(() => {
    if (quiz?.questions?.length) {
      const newProgress = (currentQuestionIndex + 1) / quiz.questions.length;
      Animated.timing(progressAnim, {
        toValue: newProgress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentQuestionIndex, quiz, progressAnim]);

  // Start/stop timer
  useEffect(() => {
    if (quiz) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerIntervalRef.current);
            navigateToResults();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [quiz]);

  const navigateToResults = (finalScore) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    router.replace({
      pathname: "/quiz/result",
      params: {
        quizId: quizId,
        score: finalScore !== undefined ? finalScore : score,
        totalQuestions: quiz?.questions?.length || 0,
      },
    });
  };

  const handleAnswerSelect = (option, index) => {
    if (isAnswered) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const correct = index === currentQuestion.correctAnswer;

    setSelectedAnswer(index);
    setIsAnswered(true);

    // Show the feedback toast
    setIsCorrectAnswer(correct);
    setShowFeedback(true);

    // Update score if correct
    if (correct) {
      setScore((prevScore) => {
        const newScore = prevScore + 1;

        // Store the new score for later use
        setTimeout(() => {
          const nextIndex = currentQuestionIndex + 1;
          if (nextIndex < quiz?.questions?.length) {
            // Move to next question
            setCurrentQuestionIndex(nextIndex);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setShowFeedback(false);
          } else {
            // Quiz is finished, navigate to results with the UPDATED score
            navigateToResults(newScore);
          }
        }, 2000);

        return newScore;
      });
    } else {
      // If the answer is incorrect, we don't update the score but still need to continue
      setTimeout(() => {
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < quiz?.questions?.length) {
          // Move to next question
          setCurrentQuestionIndex(nextIndex);
          setSelectedAnswer(null);
          setIsAnswered(false);
          setShowFeedback(false);
        } else {
          // Quiz is finished, navigate to results
          navigateToResults(score); // Use current score
        }
      }, 2000);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Handle back button press
  const handleBackPress = () => {
    Alert.alert(
      "Quit Quiz?",
      "Are you sure you want to quit? Your progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Quit",
          style: "destructive",
          onPress: () => {
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
            }
            router.back();
          },
        },
      ]
    );
    return true;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#038565" />
          <Text style={styles.loadingText}>Loading quiz questions...</Text>
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

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const totalQuestions = quiz?.questions?.length;

  // Calculate progress bar width
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

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

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>
      <Typo style={styles.questionCounter}>
        Question {currentQuestionIndex + 1} of {totalQuestions}
      </Typo>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Typo size={22} fontWeight="600" style={styles.questionText}>
          {currentQuestion.question}
        </Typo>
      </View>

      {/* Answer Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = currentQuestion.correctAnswer === index;

          // Dynamic styles for feedback
          let optionStyle = [styles.optionButton];
          let textStyle = [styles.optionText];

          if (isAnswered && isSelected) {
            optionStyle.push(
              isCorrect ? styles.correctOption : styles.incorrectOption
            );
            textStyle.push(styles.selectedOptionText);
          } else if (isAnswered && isCorrect) {
          }

          return (
            <TouchableOpacity
              key={index}
              style={optionStyle}
              onPress={() => handleAnswerSelect(option, index)}
              disabled={isAnswered}
            >
              <Typo style={textStyle}>{option}</Typo>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feedback Toast */}
      <FeedbackToast
        isVisible={showFeedback}
        isCorrect={isCorrectAnswer}
        onAnimationEnd={() => {}}
      />
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  timerText: {
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#e9ecef",
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#038565",
    borderRadius: 4,
  },
  questionCounter: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
    color: "#6c757d",
  },
  questionContainer: {
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 35,
    alignItems: "center",
  },
  questionText: {
    lineHeight: 30,
    color: "#212529",
    textAlign: "center",
  },
  optionsContainer: {
    paddingHorizontal: 20,
    gap: 15,
  },
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E4E9EB",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#343a40",
  },
  correctOption: {
    borderWidth: 1,
    borderColor: "#28a745",
  },
  incorrectOption: {
    borderWidth: 1,
    borderColor: "#dc3545",
  },
  selectedOptionText: {
    fontWeight: "600",
  },
  feedbackIcon: {
    marginLeft: 10,
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
});
