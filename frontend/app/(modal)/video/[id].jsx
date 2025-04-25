// app/(modal)/video/[id].jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Share,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import BackButton from "../../../components/BackButton";
import Typo from "../../../components/Typo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { videoApi } from "../../../services/api";
import { useAuth } from "../../_layout";
import * as Linking from "expo-linking";
import slugify from "slugify";

const BASE_URL = "https://oralcare.fly.dev";

const greenFeatureIcon = require("../../../assets/images/JasmineCircle.png");
const localFallbackVideo = require("../../../assets/videos/Video1.mp4");

export default function VideoDetailScreen() {
  const { authToken } = useAuth();
  const { id: videoId } = useLocalSearchParams();
  const [isWatched, setIsWatched] = useState(false);
  const [watchTrackingComplete, setWatchTrackingComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videoData, setVideoData] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoSource, setVideoSource] = useState(null);
  const [error, setError] = useState(null);
  const playerRef = useRef(null);
  const router = useRouter();

  // Initialize the player at the top level with a temporary source
  // We'll update the source when videoData is loaded

  // Fetch video data from the backend
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the video details from the backend
        const response = await videoApi.getVideoById(videoId, authToken);

        setVideoData(response);

        // Update video source when data is fetched
        if (response && response.videoUrl) {
          const fullUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}${response.videoUrl}`;
          setVideoSource({ uri: fullUrl });

          // Reset video loaded state for the new video
          setVideoLoaded(false);
        }
      } catch (err) {
        console.error("Error fetching video:", err);
        setError("Failed to load video details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoData();
    }

    // Reset states when videoId changes
    return () => {
      setVideoLoaded(false);
      setWatchTrackingComplete(false);
      setIsWatched(false);
    };
  }, [videoId, authToken]);

  const player = useVideoPlayer(videoSource || localFallbackVideo, (player) => {
    player.loop = false;
    player.staysActiveInBackground = true;
  });

  const markVideoAsWatched = async () => {
    if (watchTrackingComplete || !videoData) return;

    try {
      const response = await videoApi.markVideoAsWatched(videoId);
      setIsWatched(true);
      setWatchTrackingComplete(true);
    } catch (error) {
      console.error("Error marking video as watched:", error);
    }
  };

  // Mark video as watched when video data is loaded
  useEffect(() => {
    if (videoData && !watchTrackingComplete) {
      markVideoAsWatched();
    }
  }, [videoData]);

  const handlePlaybackStatusUpdate = (status) => {
    // Update video loaded state
    if (status.isLoaded && !videoLoaded) {
      setVideoLoaded(true);
    }

    // Option 2: Mark as watched after watching 30% of the video
    if (
      status.isLoaded &&
      !watchTrackingComplete &&
      status.positionMillis &&
      status.durationMillis
    ) {
      const watchedPercentage = status.positionMillis / status.durationMillis;
      if (watchedPercentage >= 0.3) {
        markVideoAsWatched();
      }
    }
  };

  const handleShare = async () => {
    if (!videoData) return;

    try {
      // Create a slug from the video title
      const slug = slugify(videoData.title, {
        lower: true,
        strict: true,
      });

      // Build the share URL - use /api/videos/shared/ path to match our backend route
      const sharePath = `/api/videos/shared/${videoId}-${slug}`;

      // Deep link for mobile app (if opened in the app)
      const deepLink = Linking.createURL(`video/${videoId}`);

      // Web link for browsers and sharing outside the app
      const webLink = `${BASE_URL}${sharePath}`;

      // Create a share message that includes appropriate link based on platform
      const shareMessage = `Check out this video: ${videoData.title}!\n\n${webLink}`;



      await Share.share({
        message: shareMessage,
        title: videoData.title,
        url: webLink, // iOS specific - may be used instead of message in some cases
      });
    } catch (error) {
      Alert.alert("Error", "Could not share this video.");
      console.error("Share error:", error);
    }
  };

  // If loading, show loading indicator
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.manualHeader}>
          <BackButton />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#038565" />
          <Typo style={styles.loadingText}>Loading video...</Typo>
        </View>
      </SafeAreaView>
    );
  }

    // If no video data
    if (!videoData) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.manualHeader}>
            <BackButton />
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="videocam-off-outline" size={48} color="#999" />
            <Typo style={styles.errorText}>Video not found</Typo>
          </View>
        </SafeAreaView>
      );
    }

  // If error, show error message
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.manualHeader}>
          <BackButton />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Typo style={styles.errorText}>{error}</Typo>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.replace(`/(modal)/video/${videoId}`)}
          >
            <Typo color="#fff" fontWeight="600">
              Try Again
            </Typo>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }



  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {/* Custom Header */}
      <View style={styles.manualHeader}>
        {/* Back Button */}
        <BackButton />
        {/* Share Button */}
        <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View
          style={{
            backgroundColor: "#fff",
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            marginBottom: 15,
            paddingHorizontal: 20,
          }}
        >
          <Image source={greenFeatureIcon} style={styles.featureIcon} />
          {/* Video Title */}
          <Typo fontWeight="600" size={24} style={styles.title}>
            {videoData.title}
          </Typo>

          {/* Tag if available */}
          {videoData.category && (
            <View style={styles.tagContainer}>
              <Typo size={12} style={styles.tagText}>
                {videoData.category}
              </Typo>
            </View>
          )}
        </View>

        {/* Video Player */}
        <View style={styles.videoPlayerContainer}>
          <VideoView
            key={videoSource?.uri}
            player={player}
            style={styles.videoPlayer}
            allowsFullscreen
            allowsPictureInPicture
            staysActiveInBackground
            ref={playerRef}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />
        </View>

        {/* Video Description */}
        <View style={styles.contentContainer}>
          <Text style={styles.description}>
            <Typo fontWeight="500" size={16}>
              {videoData.description ||
                "No description available for this video."}
            </Typo>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  manualHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 0 : 10,
    height: 55,
    width: "100%",
    paddingHorizontal: 10,
  },
  headerButton: {
    padding: 10,
  },
  scrollContainer: {
    paddingBottom: 40,
    backgroundColor: "#f0f2f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  retryButton: {
    backgroundColor: "#038565",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  featureIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginTop: 10,
    marginBottom: 12,
  },
  title: {
    color: "#000",
    lineHeight: 32,
    letterSpacing: 0,
    marginBottom: 15,
  },
  tagContainer: {
    backgroundColor: "#E0F2F7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  tagText: {
    color: "#038565",
    fontWeight: "500",
  },
  watchedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e7f5ec",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  watchedText: {
    color: "#038565",
    marginLeft: 4,
    fontWeight: "500",
  },
  videoPlayerContainer: {
    position: "relative",
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 15,
    paddingVertical: 15,
    minHeight: 200,
  },
  videoPlayer: {
    width: "90%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    alignSelf: "center",
  },
  videoLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  videoOverlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 10,
    borderRadius: 16,
    width: "90%",
    alignSelf: "center",
    aspectRatio: 16 / 9,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: "#fff",
    marginHorizontal: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
});
