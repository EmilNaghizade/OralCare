import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArticleCard } from "../components/ArticleCard";
import BackButton from "../components/BackButton";
import Typo from "../components/Typo";
import { articleApi, newsApi } from "../services/api";
import { useAuth } from "./_layout";
import { LogBox } from "react-native";
import "../i18n";
import { useTranslation } from "react-i18next";

LogBox.ignoreLogs([
  "VirtualizedLists should never be nested", // disable specific warning
]);

export default function KnowledgeHub() {
  const router = useRouter();
  const { authToken } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("Articles");
  const [articles, setArticles] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab, authToken]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "Articles") {
        const data = await articleApi.getAllArticles(authToken);
        if (data && data.articles) {
          // Map the backend data to match the expected format for ArticleCard
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
      } else {
        const data = await newsApi.getAllNews(authToken);
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
      console.error(`Error fetching ${activeTab.toLowerCase()}:`, error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const displayData = activeTab === "Articles" ? articles : news;

  const renderArticleItem = ({ item }) => (
    <ArticleCard
      item={item}
      cardWidth={"47%"}
      params={{ activeTab: activeTab }}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerButtons}>
            <BackButton />
          </View>
          <Text style={styles.headerTitle}>
            {t("home.knowledgeSection.title")}
          </Text>

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
                {t("home.knowledgeSection.tabArticles")}
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
                {t("home.knowledgeSection.tabNews")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Articles/News Grid */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#038565" />
          </View>
        ) : displayData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Typo style={styles.emptyText}>
              {activeKnowledgeTab === "Articles"
                ? t("home.knowledgeSection.emptyArticles")
                : t("home.knowledgeSection.emptyNews")}
            </Typo>
          </View>
        ) : (
          <FlatList
            data={displayData}
            renderItem={renderArticleItem}
            keyExtractor={(item) => item._id.toString()}
            numColumns={2}
            contentContainerStyle={styles.articleGrid}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.columnWrapper}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    paddingBottom: 30,
    backgroundColor: "#f0f2f5",
  },
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
  headerTitle: {
    fontSize: 24,
    marginVertical: 16,
    fontWeight: "bold",
    marginHorizontal: 8,
    color: "#000",
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
    marginBottom: 16,
  },
  loadingContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 20,
    borderRadius: 20,
  },
  emptyContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 20,
    borderRadius: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
  },
});
