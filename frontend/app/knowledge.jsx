import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { dummyArticles, dummyNews } from "./data"; // Make sure this path is correct
import { ArticleCard } from "../components/ArticleCard";
import BackButton from "../components/BackButton";

export default function KnowledgeHub() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Articles");

  const displayData = activeTab === "Articles" ? dummyArticles : dummyNews;

  const renderArticleItem = ({ item }) => (
    <ArticleCard item={item} cardWidth={"47%"} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerButtons}>
            <BackButton />
          </View>
          <Text style={styles.headerTitle}>Knowledge Hub</Text>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "Articles" && styles.activeTab]}
              onPress={() => setActiveTab("Articles")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Articles" && styles.activeTabText,
                ]}
              >
                Articles
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "News" && styles.activeTab]}
              onPress={() => setActiveTab("News")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "News" && styles.activeTabText,
                ]}
              >
                News
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Articles Grid */}

        <FlatList
          data={displayData}
          renderItem={renderArticleItem}
          keyExtractor={(item) => item._id.toString()}
          numColumns={2}
          contentContainerStyle={styles.articleGrid}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: { paddingBottom: 30, backgroundColor: "#f0f2f5" },
  header: {
    height: 200, // Header yüksekliği
    justifyContent: "flex-end", // Başlığı dikeyde ortala
    backgroundColor: "#fff", // Beyaz header arka planı
    paddingTop: 20, // Üst boşluk (statusBar'a göre)
    paddingBottom: 20, // Alt boşluk
    paddingHorizontal: 20, // Yan boşluklar
    // Alt köşeleri yuvarlatma
    borderBottomLeftRadius: 24, // <<< YUVARLAK KÖŞE
    borderBottomRightRadius: 24, // <<< YUVARLAK KÖŞE
  },
  headerButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    marginVertical: 16,
    fontWeight: "bold",
    marginHorizontal: 8,
    color: "#000",
  },
  shareButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: "row",
    paddingVertical: 12,
    marginHorizontal: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginRight: 8,
    borderRadius: 8,
  },
  activeTab: {
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
  articleGrid: {
    padding: 8,
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
});
