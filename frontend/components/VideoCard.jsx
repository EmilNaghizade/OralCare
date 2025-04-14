import { Image, Text, TouchableOpacity, View,StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export const VideoCard = ({ item, style,styleThumbnail }) => (
  // Use TouchableOpacity for press handling
  <TouchableOpacity
    style={[styles.videoCard, style]}
    onPress={() => {
      router.push(`/(modal)/video/${item._id}`); // Use router to navigate
    }}
  >
    <Image source={item.thumbnailUrl} style={[styles.videoThumbnail,styleThumbnail]} />
    {/* Container View for content below image */}
    <View style={styles.videoInfoContainer}>
      {item.tag && ( // Only show tag if item.tag exists
        <View style={styles.videoTagContainer}>
          <Ionicons name="leaf-outline" size={12} color="#038565" />
          <Text style={styles.videoTagText}>{item.tag}</Text>
        </View>
      )}
      {/* Title */}
      <Text style={styles.videoTitle} numberOfLines={2}>
        {item.title || "Video Title Placeholder"}
      </Text>
      {/* Duration */}
      <Text style={styles.videoDuration}>
        {item.duration || "0 min 00 sec"}
      </Text>
    </View>
  </TouchableOpacity>
  
);

const styles = StyleSheet.create({
  videoCard: {
    width: 210, // Adjust width as needed to fit design/screen
    marginRight: 16,
    backgroundColor: "#fff", // White background
    borderRadius: 12, // Rounded corners
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1, // Softer shadow
    shadowRadius: 3.84,
    // Shadow for Android
    elevation: 5,
    marginBottom: 5, // Add margin to bottom if needed for shadow
  },
  videoThumbnail: {
    width: "100%",
    height: 110, // Adjust height as needed
    borderTopLeftRadius: 12, // Match card's border radius
    borderTopRightRadius: 12, // Match card's border radius
    backgroundColor: "#eee", // Background color while image loads
  },
  videoInfoContainer: {
    // Container for text elements below image
    padding: 12, // Padding inside the card below the image
  },
  videoTagContainer: {
    // Pill shape tag container
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2F7", // Light green/cyan background - ADJUST COLOR
    borderRadius: 15, // High value for pill shape
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: "flex-start", // Don't stretch full width
    marginBottom: 8, // Space below tag
  },
  videoTagText: {
    // Renamed from videoTag
    fontSize: 11,
    fontWeight: "500",
    color: "#038565", // Darker green text - ADJUST COLOR
    marginLeft: 4, // Space between icon and text
  },
  videoTitle: {
    fontWeight: "600",
    fontSize: 14, // Slightly smaller maybe
    color: "#333",
    marginBottom: 4, // Space below title
    lineHeight: 18, // Adjust line height for multi-line titles
  },
  videoDuration: {
    fontSize: 12,
    color: "#038565", // Gray color for duration
  },
});
