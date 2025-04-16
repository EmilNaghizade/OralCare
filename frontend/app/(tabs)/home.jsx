import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../_layout"; // Adjust path if needed
import Typo from "../../components/Typo"; // Adjust path if needed
import { fetchWithAuth } from "../../services/fetchWithAuth";
import { dummyArticles, dummyNews, dummyQuizzes, dummyVideos } from "../data";
import { VideoCard } from "../../components/VideoCard";
import { ArticleCard } from "../../components/ArticleCard";
import { LinearGradient } from "expo-linear-gradient";
import ProceedArticleCard from "../../components/ProceedArticleCard";

const getUserLaunchedKey = (userId) =>
  `@OralCareApp:user_${userId}_hasLaunched`;
const getProfile = (token) => fetchWithAuth("/api/profile/profile", token);

export default function HomeScreen() {
  const { authToken } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [activeKnowledgeTab, setActiveKnowledgeTab] = useState("Articles");
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState(null);

  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      console.log(authToken, "token");
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

          if (profileData.user._id) {
            setUserId(profileData.user._id);
          }
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

    const checkFirstTimeUser = async () => {
      try {

        // First, load the profile to get the user ID
        const profileData = await getProfile(authToken);
        console.log("Profile data:", profileData);
        if (!profileData?.user?._id) {
          console.warn("Cannot get user ID from profile data");
          return;
        }

        const userId = profileData.user._id;
        console.log("Checking first-time status for user:", userId);

        // Now check if this specific user has launched the app before
        const userLaunchedKey = getUserLaunchedKey(userId);
        const hasLaunchedBefore = await AsyncStorage.getItem(userLaunchedKey);

        console.log(`First-time check for user ${userId}:`, hasLaunchedBefore);

        if (hasLaunchedBefore !== "true") {
          console.log(
            "This user hasn't seen the onboarding yet, showing modal"
          );
          setIsFirstTimeUser(true);
          setShowModal(true);
        } else {
          console.log("This user has seen the onboarding before");
          setIsFirstTimeUser(false);
          setShowModal(false);
        }
      } catch (error) {
        setShowModal(false);
      }
    };


    loadProfile();
    checkFirstTimeUser();

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
    <>
      {/* 1‑time “first login” modal */}
      <Modal
        visible={showModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Top Image */}
            <Image
              source={require("../../assets/images/ProceedImage.png")}
              style={styles.modalImage}
              resizeMode="cover"
            />

            {/* Headline */}
            <Text style={styles.modalTitle}>
              Oral Care: Why it Matters More Than You Think
            </Text>

            {/* Body text */}
            <Text style={styles.modalDescription}>
              Some people are religious about brushing, flossing, and using
              mouthwash. Others? Not so much. But the difference between those
              who invest in oral care and those who skip it goes way beyond
              fresh breath.
            </Text>

            {/* “Read more” link */}
            <TouchableOpacity>
              <Text style={styles.readMore}>Read more from this article</Text>
            </TouchableOpacity>

            {/* Secondary card preview */}
            <View style={styles.modalArticleWrapper}>
              <ProceedArticleCard item={dummyArticles[0]} />
            </View>

            {/* Proceed button */}
            <TouchableOpacity
              style={styles.proceedButton}
              onPress={() => {
                // First close the modal
                setShowModal(false);               
                  console.log("HEYY:", userId);
                  const userLaunchedKey = getUserLaunchedKey(userId);
                  AsyncStorage.setItem(userLaunchedKey, "true")
                    .then(() => {
                      console.log(
                        `User ${userId} marked as having launched the app`
                      );
                      setIsFirstTimeUser(false);
                    })
                    .catch((error) => {
                      console.error("Error saving launch status:", error);
                    });
                
              }}
            >
              <Text style={styles.proceedButtonText}>Proceed to app</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeHeader}>
            <Typo size={28} fontWeight="600">
              👋 Welcome,{" "}
              <Typo size={28} fontWeight="600" color="#92999C">
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
    </>
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
  modalArticleWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
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
  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end", // <-- slide up from bottom
    alignItems: "stretch",
  },
  // white card container
  modalCard: {
    width: "100%",
    maxHeight: "84%", // <-- limit height
    backgroundColor: "#fff",
    borderTopLeftRadius: 20, // <-- only top corners
    borderTopRightRadius: 20,
    overflow: "hidden",
    // shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // elevation for Android
    elevation: 6,
  },

  // top image stretches full width & keeps aspect
  modalImage: {
    width: "90%",
    alignSelf: "center",
    height: 200,
    margin: 20,
    borderRadius: 20,
  },

  // headline
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
    color: "#000",
    marginHorizontal: 16,
  },

  // body paragraph
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
    marginHorizontal: 16,
    marginTop: 8,
  },

  // “Read more” link
  readMore: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    color: "#000",
    marginHorizontal: 16,
    marginTop: 12,
  },

  // wrapper around your ArticleCard preview
  modalArticleWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
  },

  // big green button at bottom
  proceedButton: {
    backgroundColor: "#038565",
    height: 56,
    borderRadius: 28,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 40,
    paddingVertical: 16,
    alignItems: "center",
  },
  proceedButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    textAlign: "center",
  },
});
