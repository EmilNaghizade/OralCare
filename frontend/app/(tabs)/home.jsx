import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
  Image,
  BackHandler,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../_layout"; // Adjust path if needed
import Typo from "../../components/Typo"; // Adjust path if needed
import { fetchWithAuth } from "../../services/fetchWithAuth";
import { dummyQuizzes } from "../data";
import { VideoCard } from "../../components/VideoCard";
import { ArticleCard } from "../../components/ArticleCard";
import { LinearGradient } from "expo-linear-gradient";
import ProceedArticleCard from "../../components/ProceedArticleCard";
import {
  videoApi,
  articleApi,
  newsApi,
  notificationApi,
} from "../../services/api";

const getUserLaunchedKey = (userId) =>
  `@OralCareApp:user_${userId}_hasLaunched`;
const getProfile = (token) => fetchWithAuth("/api/profile/profile", token);

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

const WatchAndLearnSection = ({ authToken }) => {
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const data = await videoApi.getAllVideos(authToken);

      if (data && data.videos) {
        setVideos(data.videos.slice(0, 4)); // Take only the first 4 videos
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <View style={styles.sectionCard}>
        <SectionHeader
          title="Watch & Learn"
          onSeeAllPress={() => router.push("/education")}
          isOnSeeAll={true}
        />
        <Text style={styles.sectionSubtitle}>
          Expert videos for step-by-step guidance
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#038565" />
        </View>
      </View>
    );
  }

  // If no videos, show placeholder
  if (videos.length === 0) {
    return (
      <View style={styles.sectionCard}>
        <SectionHeader
          title="Watch & Learn"
          onSeeAllPress={() => router.push("/education")}
          isOnSeeAll={true}
        />
        <Text style={styles.sectionSubtitle}>
          Expert videos for step-by-step guidance
        </Text>
        <View style={styles.emptyContainer}>
          <Typo style={styles.emptyText}>No videos available</Typo>
        </View>
      </View>
    );
  }

  // Adapt the backend video data format to match what VideoCard expects
  const adaptedVideos = videos.map((video) => ({
    _id: video._id,
    title: video.title,
    thumbnailUrl: {
      uri: `${process.env.EXPO_PUBLIC_API_BASE_URL}${video.thumbnailUrl}`,
    },
    duration: video.duration
      ? `${
          Math.floor(video.duration / 60) === 0
            ? ""
            : Math.floor(video.duration / 60) + " min"
        }  ${video.duration % 60} sec`
      : "0 min 00 sec",
    tag: video.category || "Video",
  }));

  return (
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
        data={adaptedVideos}
        renderItem={({ item }) => <VideoCard item={item} />}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );
};

const KnowledgeHubSection = ({ authToken }) => {
  const router = useRouter();
  const [activeKnowledgeTab, setActiveKnowledgeTab] = useState("Articles");
  const [articles, setArticles] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKnowledgeData = async () => {
      setLoading(true);
      try {
        if (activeKnowledgeTab === "Articles") {
          const data = await articleApi.getAllArticles(authToken, 1, 4);
          if (data && data.articles) {
            // Map the backend data to match the expected format for ArticleCard
            const mappedArticles = data.articles.map((article) => ({
              _id: article._id,
              title: article.title,
              image: {
                uri: `${process.env.EXPO_PUBLIC_API_BASE_URL}${article.thumbnail}`,
              },
              readTime: `${article.readingTime}min read`,
              createdAt: new Date(article.createdAt).toLocaleDateString(
                "en-US",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              ),
            }));
            setArticles(mappedArticles);
          }
        } else {
          const data = await newsApi.getAllNews(authToken, 1, 4);
          if (data && data.news) {
            // Map the backend data to match the expected format for ArticleCard
            const mappedNews = data.news.map((item) => ({
              _id: item._id,
              title: item.title,
              image: {
                uri: `${process.env.EXPO_PUBLIC_API_BASE_URL}${item.thumbnail}`,
              },
              readTime: `${item.readingTime}min read`,
              createdAt: new Date(item.createdAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            }));
            setNews(mappedNews);
          }
        }
      } catch (error) {
        console.error(
          `Error fetching ${activeKnowledgeTab.toLowerCase()}:`,
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledgeData();
  }, [activeKnowledgeTab, authToken]);

  const knowledgeItemsToShow =
    activeKnowledgeTab === "Articles" ? articles : news;

  if (loading) {
    return (
      <View style={styles.sectionCard}>
        <SectionHeader
          title="Knowledge Hub"
          onSeeAllPress={() => router.push("/knowledge")}
          isOnSeeAll={true}
        />
        <Text style={styles.sectionSubtitle}>
          Articles and news on our industry.
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#038565" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.sectionCard}>
      <SectionHeader
        title="Knowledge Hub"
        onSeeAllPress={() => router.push("/knowledge")}
        isOnSeeAll={true}
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
          onPress={() => setActiveKnowledgeTab("Articles")}
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
          onPress={() => setActiveKnowledgeTab("News")}
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

      {knowledgeItemsToShow.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Typo style={styles.emptyText}>
            No {activeKnowledgeTab.toLowerCase()} available
          </Typo>
        </View>
      ) : (
        <FlatList
          data={knowledgeItemsToShow}
          renderItem={({ item }) => (
            <ArticleCard
              item={item}
              params={{
                type: activeKnowledgeTab === "news" ? "news" : "article",
                activeTab: activeKnowledgeTab,
              }}
            />
          )}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      )}
    </View>
  );
};

export default function HomeScreen() {
  const { authToken } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [articles, setArticles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === "android") {
          BackHandler.exitApp(); // exits the app
          return true; // prevent default behavior
        }
        return false;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

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
          setFirstName(profileData?.user?.name?.split(" ")[0]);
          console.log("Profile data: 354", profileData.user.name);
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

    const getArticles = async () => {
      try {
        const data = await articleApi.getAllArticles(authToken, 1, 4);
        if (data && data.articles) {
          const mappedArticles = data.articles.map((article) => ({
            _id: article._id,
            title: article.title,
            image: {
              uri: `${process.env.EXPO_PUBLIC_API_BASE_URL}${article.thumbnail}`,
            },
            readTime: `${article.readingTime}min read`,
            createdAt: new Date(article.createdAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          }));
          setArticles(mappedArticles);
        
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };

    const fetchUnreadNotifications = async () => {
      if (!authToken) return;

      try {
        const data = await notificationApi.getNotifications(authToken, 1, 1);
        setUnreadNotifications(data.unreadCount || 0);
      } catch (error) {
        console.error("Error fetching notification count:", error);
        setUnreadNotifications(0);
      }
    };
    fetchUnreadNotifications();
    getArticles();
    loadProfile();
    checkFirstTimeUser();

    // Optional: Set up interval to refresh notification count
    const interval = setInterval(fetchUnreadNotifications, 60000); // Every minute

    return () => clearInterval(interval);
  }, [authToken]);

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
              <ProceedArticleCard
                item={articles.length > 0 ? articles[0] : {}}
              />
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
        <StatusBar barStyle="dark-content" />

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
              {unreadNotifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Watch & Learn Section */}
          <WatchAndLearnSection authToken={authToken} />

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

          <KnowledgeHubSection authToken={authToken} />
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
  },
  section: { marginTop: 25 },
  sectionCard: {
    backgroundColor: "#ffffff", // White card background
    marginTop: 0, // Space between cards
    marginBottom: 15, // Space below card
    borderRadius: 12,
    paddingTop: 15, // Padding above section header
    paddingBottom: 20, // Padding below horizontal list
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
  notificationButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  notificationCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
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
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: "#E3ECF0",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748B",
  },
  activeTabText: {
    color: "#000",
  },
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
    maxHeight: "95%", // <-- limit height
    backgroundColor: "#fff",
    borderTopLeftRadius: 20, // <-- only top corners
    borderTopRightRadius: 20,
    overflow: "hidden",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
