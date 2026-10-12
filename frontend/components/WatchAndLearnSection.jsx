// components/WatchAndLearnSection.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text, // ← add Text here
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { SectionHeader } from "./SectionHeader";
import VideoCard from "./VideoCard";
import Typo from "./Typo";
import { videoApi } from "../services/api";

export default function WatchAndLearnSection({ authToken }) {
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await videoApi.getAllVideos(authToken);
        if (data?.videos) setVideos(data.videos.slice(0, 4));
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [authToken]);

  if (loading) {
    return (
      <View style={styles.sectionCard}>
        <SectionHeader
          title="Watch & Learn"
          onSeeAllPress={() => router.push("/education")}
          isOnSeeAll
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

  if (!videos.length) {
    return (
      <View style={styles.sectionCard}>
        <SectionHeader
          title="Watch & Learn"
          onSeeAllPress={() => router.push("/education")}
          isOnSeeAll
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

  const adaptedVideos = videos.map((video) => ({
    _id: video._id,
    title: video.title,
    thumbnailUrl: {
      uri: `${process.env.EXPO_PUBLIC_API_BASE_URL}${video.thumbnailUrl}`,
    },
    duration: video.duration
      ? `${Math.floor(video.duration / 60)} min ${video.duration % 60} sec`
      : "0 min 00 sec",
    tag: video.category || "Video",
  }));

  return (
    <View style={styles.sectionCard}>
      <SectionHeader
        title="Watch & Learn"
        onSeeAllPress={() => router.push("/education")}
        isOnSeeAll
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
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  horizontalList: {
    paddingVertical: 5,
  },
});
