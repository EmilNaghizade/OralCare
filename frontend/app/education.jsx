import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../components/BackButton";
import { VideoCard } from "../components/VideoCard";
import { videoApi } from "../services/api";
import "../i18n";
import { useTranslation } from "react-i18next";

import Typo from "../components/Typo";
import { useAuth } from "./_layout";

export default function Education() {
  const { authToken } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await videoApi.getAllVideos(authToken);
      if (data && data.videos) {
        setVideos(data.videos);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

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

  const renderVideos = ({ item }) => (
    <VideoCard item={item} style={{ width: "47%" }} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerButtons}>
            <BackButton />
          </View>
          <Text style={styles.headerTitle}>{t("home.watchSection.title")}</Text>
        </View>

        {/* Articles Grid */}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#038565" />
          </View>
        ) : videos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Typo style={styles.emptyText}>{t("home.watchSection.empty")}</Typo>
          </View>
        ) : (
          <FlatList
            data={adaptedVideos}
            renderItem={renderVideos}
            keyExtractor={(item) => item._id.toString()}
            numColumns={2}
            contentContainerStyle={styles.videoGrid}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.columnWrapper}
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
  scrollContainer: { paddingBottom: 30, backgroundColor: "#f0f2f5" },
  header: {
    height: 140, // Header yüksekliği
    justifyContent: "flex-end", // Başlığı dikeyde ortala
    backgroundColor: "#fff", // Beyaz header arka planı
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
  videoGrid: {
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
  },
});
