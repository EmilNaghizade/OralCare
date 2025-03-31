import React, { useState, useEffect, useCallback } from "react";
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
import { QuizCard } from "../../components/QuizCard";
import { VideoCard } from "../../components/VideoCard";
import { ArticleCard } from "../../components/ArticleCard";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const getProfile = (token) => fetchWithAuth("/api/auth/profile", token);

// --- Placeholder Card Components --- (Keep definitions from previous step)

// --- Main Home Screen Component ---
export default function HomeScreen() {
  const { authToken } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // Loading state only for profile
  const [activeKnowledgeTab, setActiveKnowledgeTab] = useState("Articles"); // 'Articles' or 'News'

  // Fetch profile data on mount or when token changes
  useEffect(() => {
    const loadProfile = async () => {
      if (!authToken) {
        console.log("Home: No auth token, cannot fetch profile.");
        setIsLoadingProfile(false);
        return;
      }
      console.log("Home: Auth token found, attempting to fetch profile..."); // Ekstra log
      setIsLoadingProfile(true);
      try {
        const profileData = await getProfile(authToken);
        // Gelen veriyi loglayarak yapıyı kontrol edebilirsiniz:
        // console.log("Home: Received profile data:", JSON.stringify(profileData, null, 2));

        // ---- DÜZELTME BURADA ----
        // profileData.name yerine profileData.user.name kontrolü yapın
        if (profileData?.user?.name) {
          // İsmi boşluktan ayırıp ilk kısmı alın
          setFirstName(profileData.user.name.split(" ")[0]);
          console.log(
            "Home: First name set to:",
            profileData.user.name.split(" ")[0]
          ); // Ekstra log
        } else {
          // İsim alanı gelmediyse veya yapı farklıysa loglayın
          console.warn(
            "Home: Profile data received, but user.name is missing or structure unexpected:",
            profileData
          );
          setFirstName(""); // İsim yoksa boş kalsın
        }
        // ---- DÜZELTME SONU ----
      } catch (error) {
        console.error("Home: Failed to fetch profile:", error); // Hatayı detaylı loglayın
        setFirstName(""); // Hata durumunda ismi boşalt
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
              {firstName}
            </Typo>
          </Typo>
          <TouchableOpacity onPress={() => router.push("/notifications")}>
            {/* Bildirim sayısı varsa buraya bir badge eklenebilir */}
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
