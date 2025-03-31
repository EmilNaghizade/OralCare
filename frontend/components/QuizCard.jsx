import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const QuizCard = ({ item }) => {
  // Define gradient colors based on item or index (customize these colors)
  const isPurple = item._id === "q1"; // Example condition from previous code
  const gradientColors = isPurple
    ? ["#8A2BE2", "#fff"] // Purple to lighter purple/lilac
    : ["#2E8B57", "#fff"]; // SeaGreen to LightGreen
  // Adjust end colors for a more "whitish" look if needed: e.g., '#E9D8FD' or '#D4EFDF'

  // Choose a faint center icon
  const centerIconName = isPurple
    ? "git-network-outline"
    : "share-social-outline";

  return (
    <TouchableOpacity
      style={styles.quizCard}
      onPress={() => console.log("Navigate to quiz:", item._id)}
    >
      {/* Use LinearGradient for the background */}
      <LinearGradient
        colors={gradientColors}
        style={styles.quizGradient} // Apply styles to the gradient itself
        start={{ x: 0.5, y: 0 }} // Gradient starts at top center
        end={{ x: 0.5, y: 1 }} // Gradient ends at bottom center
      >
        {/* Faint Center Icon (inside Gradient) */}
        <Ionicons
          name={centerIconName}
          size={80}
          color="#fff" // White icon
          style={styles.quizCenterIcon} // Use existing style
        />

        {/* Content Container (inside Gradient, on top of center icon) */}
        <View style={styles.quizContentContainer}>
          {/* Top Tag */}
          <View style={styles.quizTagContainer}>
            <Ionicons name="help-circle-outline" size={16} color="#fff" />
            <Text style={styles.quizQuestionsText}>
              {item.questionCount || 0} questions
            </Text>
          </View>

          {/* Bottom Title */}
          <Text style={[styles.quizTitle, { color: '#000' }]} numberOfLines={3}>
            {item.title }
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

styles = StyleSheet.create({
  quizCard: {
    width: 200,
    height: 258,
    marginRight: 16,
    borderRadius: 20,
    elevation: 3,
    overflow: "hidden",
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
    fontSize: 11,
    fontWeight: "600", // Slightly bolder
    marginLeft: 5, // Space between icon and text
  },
  quizTitle: {
    fontWeight: "600",
    fontSize: 15, // Adjust size
    lineHeight: 20, // Adjust line height
  },
});
