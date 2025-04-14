import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../_layout"; // Adjust path if needed
import Typo from "../../components/Typo"; // Adjust path if needed
import { fetchWithAuth } from "../../services/fetchWithAuth";
import { dummyArticles, dummyNews, dummyQuizzes, dummyVideos } from "../data";
import { VideoCard } from "../../components/VideoCard";
import { ArticleCard } from "../../components/ArticleCard";
import { LinearGradient } from "expo-linear-gradient";

const getProfile = (token) => fetchWithAuth("/api/profile/profile", token);

export default function HomeScreen() {
  const { authToken } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [activeKnowledgeTab, setActiveKnowledgeTab] = useState("Articles");

  useEffect(() => {
    const loadProfile = async () => {
      console.log(authToken,"token")
      if (!authToken) {
        console.log("Home: No auth token, cannot fetch profile.");
        setIsLoadingProfile(false);
        return;
      }
      setIsLoadingProfile(true);
      try {
        const profileData = await getProfile(authToken);
        if (profileData?.user) {
          setFirstName(profileData.user.name.split(" ")[0]);
        } else {
          console.warn(
            "Home: Profile data received, but user.name is missing or structure unexpected:",
            profileData
          );
          setFirstName("");
        }
      } catch (error) {
        console.error("Home: Failed to fetch profile:", error);
        setFirstName("");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [authToken]);

  const knowledgeItemsToShow =
    activeKnowledgeTab === "Articles" ? dummyArticles : dummyNews;

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

  const QuizCard = ({ item }) => {
    const isPurple = item._id === 1;
    const gradientColors = isPurple ? ["#8A2BE2", "#fff"] : ["#2E8B57", "#fff"];

    const centerIconName = isPurple
      ? "git-network-outline"
      : "share-social-outline";

    return (
      <TouchableOpacity
        style={styles.quizCard}
        onPress={() =>
          router.push({ pathname: "/quiz", params: { id: item._id } })
        } // YENİ
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
              <Typo
                fontWeight={"600"}
                size={11}
                style={styles.quizQuestionsText}
              >
                {item.questionCount || 0} questions
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
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeHeader}>
          <Typo size={24} fontWeight="600">
            👋 Welcome,{" "}
            <Typo size={24} fontWeight="300">
              {firstName}
            </Typo>
          </Typo>
          <TouchableOpacity onPress={() => router.push("/notifications")}>
            <Ionicons name="notifications-outline" size={28} color="#333" />
          </TouchableOpacity>
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

        <View style={styles.sectionCard}>
          <SectionHeader
            title="Knowledge Hub"
            isOnSeeAll={true}
            onSeeAllPress={() => router.push("/knowledge")}
          />
          <Text style={styles.sectionSubtitle}>
            Articles and news on our industry.
          </Text>

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
    marginLeft: 5, // Space between icon and text
  },
  quizTitle: {
    lineHeight: 20, // Adjust line height
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
