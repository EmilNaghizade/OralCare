// app/(tabs)/home.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../_layout"; // Adjust path if needed
import Typo from "../../components/Typo"; // Adjust path if needed
import { LinearGradient } from "expo-linear-gradient";
// --- Configuration ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// --- API Fetch Function (Only for Profile) ---
// You should move this to a dedicated api service file
const fetchWithAuth = async (url, token, options = {}) => {
  // Ensure base URL is configured
  if (!API_BASE_URL) {
    console.error("API_BASE_URL not configured!");
    throw new Error("API Base URL is not configured.");
  }
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! Status: ${response.status}`
    );
  }
  return response.json();
};

const getProfile = (token) => fetchWithAuth("/api/auth/profile", token);

// --- Dummy Data ---
const dummyVideos = [
  {
    _id: "v1",
    title: "Guide for in-patient oral hygiene using OroClean complete",
    thumbnailUrl: require("../../assets/images/VideoThumbnail1.png"),
    duration: "2 min 16 sec",
    tag: "Oral Care",
  },
  {
    _id: "v2",
    title: "Guide for in-patient oral hygiene using OroClean complete",
    thumbnailUrl: require("../../assets/images/VideoThumbnail2.png"),
    duration: "3 min 05 sec",
    tag: "Oral Care",
  },
];

const dummyQuizzes = [
  {
    _id: "q1",
    title: "Breathing Filters, HMEs and HMEFs",
    imageUrl: "https://picsum.photos/seed/q1/220/120",
    questionCount: 12,
  },
  {
    _id: "q2",
    title: "Guide for in-patient oral hygiene using OroClean complete",
    imageUrl: "https://picsum.photos/seed/q2/220/120",
    questionCount: 10,
  },
];

const dummyArticles = [
  {
    _id: "a1",
    title: "New International Product Catalogue",
    image: require("../../assets/images/Article1.png"),
    readTime: "5min read",
    createdAt: new Date("2024-03-30").toISOString(),
  },
  {
    _id: "a2",
    title: "Benefits of Regular Checkups",
    image: require("../../assets/images/Article2.png"),
    readTime: "4min read",
    createdAt: new Date("2024-03-28").toISOString(),
  },
];

const dummyNews = [
  {
    _id: "n1",
    title: "DuoFlow™ bi-lumen breathing system",
    image: "https://picsum.photos/seed/n1/180/90",
    readTime: "3min read",
    createdAt: new Date("2024-03-30").toISOString(),
  },
  {
    _id: "n2",
    title: "Community Health Initiative Update",
    image: "https://picsum.photos/seed/n2/180/90",
    readTime: "2min read",
    createdAt: new Date("2024-03-29").toISOString(),
  },
  {
    _id: "n3",
    title: "Local Clinic Expansion Announced",
    image: "https://picsum.photos/seed/n3/180/90",
    readTime: "1min read",
    createdAt: new Date("2024-03-27").toISOString(),
  },
];

// --- Placeholder Card Components --- (Keep definitions from previous step)

const QuizCard = ({ item }) => {
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
          <Text style={styles.quizTitle} numberOfLines={3}>
            {item.title || "Quiz Title Placeholder"}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// --- Main Home Screen Component ---
export default function HomeScreen() {
  const { authToken } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // Loading state only for profile
  const [activeKnowledgeTab, setActiveKnowledgeTab] = useState("Articles"); // 'Articles' or 'News'

  const VideoCard = ({ item }) => (
    // Use TouchableOpacity for press handling
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => {
        router.push(`/(modal)/video/${item._id}`); // Use router to navigate
      }}
    >
      <Image source={item.thumbnailUrl} style={styles.videoThumbnail} />
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

  const ArticleCard = ({ item }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => router.push(`/(modal)/article/${item._id}`)}
    >
      <Image source={item.image} style={styles.articleImage} />
      <Text style={styles.articleReadTime}>{item.readTime}</Text>
      <Text style={styles.articleTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.articleDate}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
  // Fetch profile data on mount or when token changes
  useEffect(() => {
    const loadProfile = async () => {
      if (!authToken) {
        console.log("Home: No auth token, cannot fetch profile.");
        setIsLoadingProfile(false);
        return;
      }
      setIsLoadingProfile(true);
      try {
        const profileData = await getProfile(authToken);
        if (profileData?.name) {
          setFirstName(profileData.name.split(" ")[0]);
        }
      } catch (error) {
        // Don't necessarily alert here, maybe just show default name
        setFirstName("");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [authToken]); // Depend only on authToken

  // Determine which knowledge items to display based on the active tab
  const knowledgeItemsToShow =
    activeKnowledgeTab === "Articles" ? dummyArticles : dummyNews;

  // Section Header Component (Keep as before)
  const SectionHeader = ({ title, onSeeAllPress, isOnSeeAll }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {isOnSeeAll && (
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Can show loading just for profile if desired, or remove entirely
  // if (isLoadingProfile) {
  //     return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#038565" /></SafeAreaView>;
  // }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        // RefreshControl removed as data is static for now
      >
        {/* Welcome Header */}
        <View style={styles.welcomeHeader}>
          <Typo size={24} fontWeight="600">
            👋 Welcome,{" "}
            <Typo size={24} fontWeight="300">
              {firstName || "User"}
            </Typo>
          </Typo>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </View>

        {/* Watch & Learn Section */}
        <View style={styles.sectionCard}>
          <SectionHeader
            title="Watch & Learn"
            onSeeAllPress={() => router.push("/education")}
            isOnSeeAll={true}
          />
          <Text style={styles.sectionSubtitle}>
            Expert videos for step-by-step guidance
          </Text>
          <FlatList
            data={dummyVideos} // Use dummy data
            renderItem={({ item }) => <VideoCard item={item} />}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Test your knowledge Section */}
        <View style={styles.sectionCard}>
          <SectionHeader title="Test your knowledge" isOnSeeAll={false} />
          <Text style={styles.sectionSubtitle}>
            Take quizzes based on videos and articles
          </Text>
          <FlatList
            data={dummyQuizzes} // Use dummy data
            renderItem={({ item }) => <QuizCard item={item} />}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Knowledge Hub Section */}
        <View style={styles.sectionCard}>
          <SectionHeader
            title="Knowledge Hub"
            isOnSeeAll={true}
            onSeeAllPress={() => router.push("/knowledge")}
          />
          <Text style={styles.sectionSubtitle}>
            Articles and news on our industry.
          </Text>

          {/* Tabs for Articles/News */}
          <View style={styles.knowledgeTabs}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeKnowledgeTab === "Articles" && styles.activeTabButton,
              ]}
              onPress={() => setActiveKnowledgeTab("Articles")} // Simpler switch
            >
              <Text
                style={[
                  styles.tabText,
                  activeKnowledgeTab === "Articles" && styles.activeTabText,
                ]}
              >
                Articles
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeKnowledgeTab === "News" && styles.activeTabButton,
              ]}
              onPress={() => setActiveKnowledgeTab("News")} // Simpler switch
            >
              <Text
                style={[
                  styles.tabText,
                  activeKnowledgeTab === "News" && styles.activeTabText,
                ]}
              >
                News
              </Text>
            </TouchableOpacity>
          </View>

          {/* List for Articles/News */}
          <FlatList
            data={knowledgeItemsToShow} // Use filtered dummy data
            renderItem={({ item }) => <ArticleCard item={item} />}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles --- (Keep the detailed styles from the previous version)
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scrollContainer: { paddingBottom: 30, backgroundColor: "#f0f2f5" },
  welcomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // --- Apply Card Styles ---
    backgroundColor: "#ffffff", // White card background
    marginBottom: 10, // Space below welcome card before next section
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24, // Same rounding as section cards
    // Same rounding as section cards
    paddingTop: 40, // Internal padding
    paddingHorizontal: 20,
    paddingBottom: 24, // Internal padding (adjust as needed)
    // Add shadows/elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  section: { marginTop: 25 },
  sectionCard: {
    backgroundColor: "#ffffff", // White card background
    marginTop: 0, // Space between cards
    marginBottom: 15, // Space below card
    borderRadius: 12,
    paddingTop: 15, // Padding above section header
    paddingBottom: 20, // Padding below horizontal list
    // Add shadows/elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  seeAllText: { fontSize: 14, color: "#038565", fontWeight: "500" },
  sectionSubtitle: {
    fontSize: 14,
    color: "gray",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  horizontalList: { paddingHorizontal: 20, paddingVertical: 5 },
  // --- Card Styles (Keep from previous version or enhance) ---
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
    color: "#888", // Gray color for duration
  },
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
    color: "#000",
    fontWeight: "600",
    fontSize: 15, // Adjust size
    lineHeight: 20, // Adjust line height
  },
  quizOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 10,
    justifyContent: "space-between",
  },
  quizQuestions: {
    color: "#fff",
    fontSize: 12,
    alignSelf: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  quizTitle: { color: "#000", fontWeight: "bold", fontSize: 16 },
  articleCard: {
    width: 180,
    marginRight: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    overflow: "hidden",
  },
  articleImage: { width: "100%", height: 90 },
  articleReadTime: {
    fontSize: 10,
    color: "gray",
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  articleTitle: {
    fontWeight: "600",
    fontSize: 14,
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  articleDate: {
    fontSize: 10,
    color: "gray",
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 2,
  },
  // --- Knowledge Hub Tabs ---
  knowledgeTabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  activeTabButton: { backgroundColor: "#E0F2F7" },
  tabText: { fontSize: 14, fontWeight: "500", color: "#666" },
  activeTabText: { color: "#038565" },
});
