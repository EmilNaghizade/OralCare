// app/(modal)/video/[id].jsx
import React, { useEffect, useRef, useState } from "react";
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
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video"; // Use ex// po-video
import BackButton from "../../../components/BackButton";
import Typo from "../../../components/Typo";
import Ionicons from "@expo/vector-icons/Ionicons"; // Icon library
import { dummyVideos } from "../../data";
import { videoApi } from "../../../services/api"; // Import videoApi

const LocalVideoSource = require("../../../assets/videos/Video1.mp4"); // Adjust path as needed
const greenFeatureIcon = require("../../../assets/images/JasmineCircle.png");

// --- Component ---
export default function VideoDetailScreen() {
  const { id: videoId } = useLocalSearchParams(); // Get ID from route param
  const numericVideoId = parseInt(videoId, 10); // Convert to number since IDs in data.js are numbers
  const [isWatched, setIsWatched] = useState(false);
  const [watchTrackingComplete, setWatchTrackingComplete] = useState(false);
  const playerRef = useRef(null);

  const getVideoDataById = (videoId) => {
    return dummyVideos[videoId - 1] || null; // Quiz'i bulamazsa null döndür
  };

  console.log(numericVideoId)

  const videoData = getVideoDataById(numericVideoId);

  const videoDetails = {
    // ID'ye göre farklı veri döndürmek için genişletilebilir
    id: videoId,
    title: videoData ? videoData.title : "Quiz Title",
    subtitle: videoData ? videoData.subtitle : "Quiz Subtitle",
    tag: videoData ? videoData.tag : "Quiz Tag",
  };
  console.log(videoDetails);

  const player = useVideoPlayer(LocalVideoSource, (player) => {
    player.loop = false; // Set looping to false
    player.staysActiveInBackground = true; // Keep video active in background
  });

  // Call API to mark video as watched
  const markVideoAsWatched = async () => {
    try {
      console.log(`Marking video ${numericVideoId} as watched`);
      await videoApi.markVideoAsWatched(numericVideoId);
      setIsWatched(true);
      setWatchTrackingComplete(true);
    } catch (error) {
      console.error("Error marking video as watched:", error);
      // Don't show error to user, just log it
    }
  };

  // Mark video as watched on mount - as soon as they open the video screen
  useEffect(() => {
    // You can choose to either:
    // 1. Mark as watched immediately when screen opens:
    markVideoAsWatched();
  }, [numericVideoId]);

  const handlePlaybackStatusUpdate = (status) => {
    // Check if video is playing and has been watched for at least 30% of its duration
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
    try {
      await Share.share({
        message: `Check out this video! (ID: ${videoId})`, // Placeholder message
        title: `Video ${videoId}`, // Placeholder title
      });
    } catch (error) {
      Alert.alert("Error", "Could not share this video.");
      console.error("Share error:", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
      {/* Configure Header using Stack.Screen */}
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
            backgroundColor: "#fff", // Optional background color
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            marginBottom: 15,
            paddingHorizontal: 20,
          }}
        >
          <Image source={greenFeatureIcon} style={styles.featureIcon} />
          {/* Placeholder Title */}
          <Typo fontWeight="600" size={24} style={styles.title}>
            {videoDetails.title}
          </Typo>
        </View>

        {/* Video Player using expo-video */}
        <View style={styles.videoPlayerContainer}>
          <VideoView
            player={player}
            style={styles.videoPlayer}
            allowsFullscreen
            allowsPictureInPicture
            staysActiveInBackground
            ref={playerRef}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />
        </View>

        {/* Placeholder Description */}
        <View style={styles.contentContainer}>
          <Text style={styles.description}>
            <Typo fontWeight="600" size={18}>
              1. Daily Oral Hygiene Brushing:
            </Typo>
            {"\n"}
            <Typo fontWeight="500" size={16}>
              Using fluoride toothpaste to brush twice daily removes plaque, a
              sticky film of bacteria that leads to tooth decay. Flossing:
              Cleaning between teeth helps remove food particles and plaque in
              areas a toothbrush can’t reach. Mouthwash: An antiseptic or
              fluoride rinse can help reduce bacteria, freshen breath, and
              protect enamel.
            </Typo>
            {/* Adding example text from image */}
            {"\n\n"}
            <Typo fontWeight="600" size={18}>
              2. Professional Preventive Care
            </Typo>
            {"\n"}
            <Typo fontWeight="500" size={16}>
              Regular Check-ups: Dentists can detect early signs of problems
              like decay or gum disease, often during routine check-ups.
              Cleanings: Professional cleanings remove tartar buildup and
              deep-seated plaque, supporting overall oral health. Sealants and
              Fluoride Treatments: Preventative treatments like sealants and
              fluoride strengthen enamel and protect against decay.
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
    // Styles for the manually created header row
    flexDirection: "row",
    justifyContent: "space-between", // Pushes buttons to edges
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 0 : 10, // Adjust for status bar on Android
    height: 55, // Give the header a fixed height (adjust as needed),
    width: "100%",
    paddingHorizontal: 10, // Space from sides
  },
  headerButton: {
    // Simple padding for the touchable area of header icons
    padding: 10,
  },
  scrollContainer: {
    paddingBottom: 40, // Space from bottom
    backgroundColor: "#f0f2f5",
  },
  featureIcon: {
    // Style for your green icon image
    width: 32, // Adjust size as needed
    height: 32, // Adjust size as needed
    resizeMode: "contain",
    marginTop: 10, // Space below manual header
    marginBottom: 12, // Space above title
  },
  title: {
    color: "#000",
    // marginTop: 10, // Margin now handled by icon container
    lineHeight: 32,
    letterSpacing: 0,
    marginBottom: 15, // Space below title
  },
  videoPlayerContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 15,
  },
  videoPlayer: {
    width: "90%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    alignSelf: "center",
    marginVertical: 15,
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 16,

    backgroundColor: "#fff",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
});
