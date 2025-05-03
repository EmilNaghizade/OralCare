import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const FeedbackToast = ({ isVisible, isCorrect, onAnimationEnd }) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const { i18n, t } = useTranslation();

  useEffect(() => {
    if (isVisible) {
      // Show the toast
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after 1.5 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onAnimationEnd) onAnimationEnd();
        });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isVisible, translateY, opacity, onAnimationEnd]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          isCorrect ? styles.correctToast : styles.incorrectToast,
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={isCorrect ? "checkmark" : "close"}
            size={24}
            color="#000"
          />
        </View>
        <Text style={styles.text}>
          {isCorrect ? t("quizResult.correct") : t("quizResult.incorrect")}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 24,
    width: "90%",
  },
  correctToast: {
    backgroundColor: "#00AE83", // Green color for correct answer
  },
  incorrectToast: {
    backgroundColor: "#FB0A0A", // Red color for incorrect answer
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default FeedbackToast;
