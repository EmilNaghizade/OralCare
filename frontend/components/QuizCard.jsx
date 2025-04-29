import React from "react";
import { useRouter } from "expo-router";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import Typo from "./Typo";

const QuizCard = ({ item, cardWidth = 240 }) => {
  const cardStyle = {
    width: cardWidth,
  };
  const router = useRouter();
  // Determine color scheme based on the quiz's colorScheme property
  let gradientColors;
  let centerIconName;

  switch (item.colorScheme) {
    case "purple":
      gradientColors = ["#8A2BE2", "#fff"];
      centerIconName = "git-network-outline";
      break;
    case "blue":
      gradientColors = ["#1E90FF", "#fff"];
      centerIconName = "cloud-outline";
      break;
    case "orange":
      gradientColors = ["#FF8C00", "#fff"];
      centerIconName = "flame-outline";
      break;
    case "green":
    default:
      gradientColors = ["#2E8B57", "#fff"];
      centerIconName = "leaf-outline";
      break;
  }

  return (
    <TouchableOpacity
      style={[styles.quizCard, cardStyle]}
      onPress={() =>
        router.push({ pathname: "/quiz", params: { id: item._id } })
      }
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.quizGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <Ionicons
          name={centerIconName}
          size={80}
          color="#fff"
          style={styles.quizCenterIcon}
        />

        <View style={styles.quizContentContainer}>
          {/* Top Tag */}
          <View style={styles.quizTagContainer}>
            <Ionicons name="help-circle-outline" size={16} color="#fff" />
            <Typo fontWeight={"600"} size={11} style={styles.quizQuestionsText}>
              {item?.__v || 0} questions
            </Typo>
          </View>

          <Typo
            fontWeight={"600"}
            size={15}
            style={styles.quizTitle}
            numberOfLines={3}
          >
            {item.title}
          </Typo>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default QuizCard;

const styles = StyleSheet.create({
  // --- Card Styles (Keep from previous version or enhance) ---
  quizCard: {
    width: 240,
    height: 258,
    marginRight: 16,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F5F7",
    backgroundColor: "#eee", // White background
  },
  quizGradient: {
    flex: 1,
    position: "relative",
  },
  quizBackground: { flex: 1, resizeMode: "cover" },
  quizCenterIcon: {
    // Style for the faint icon in the middle
    position: "absolute",
    // Center it approximately - adjust top/left based on icon size/card size
    top: "25%",
    alignSelf: "center",
    opacity: 0.15, // Make it faint
    zIndex: 1, // Behind content
  },
  quizContentContainer: {
    // Container for tag and title
    flex: 1,
    padding: 12, // Padding inside the card
    justifyContent: "space-between", // Push tag top, title bottom
    // Add overlay if needed (e.g., if background image is too busy)
    // backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 2, // Above center icon
  },
  quizTagContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)", // Semi-transparent white tag background
    borderRadius: 15, // Pill shape
    paddingVertical: 5, // Adjust padding
    paddingHorizontal: 10, // Adjust padding
    alignSelf: "flex-start", // Position top-left within padding
  },
  quizQuestionsText: {
    color: "#fff",
    marginLeft: 5, // Space between icon and text
  },
  quizTitle: {
    lineHeight: 20, // Adjust line height
    marginBottom: 5, // Space below title
  },
});
