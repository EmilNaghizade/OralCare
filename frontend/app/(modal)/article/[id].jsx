import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import BackButton from "../../../components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import Badge from "../../../components/Badge";
import Typo from "../../../components/Typo";

const ArticleDetailImg = require("../../../assets/images/ArticleDetail1.png");

const ArticleDetail = () => {
  const { id: articleId } = useLocalSearchParams(); // Get ID from route param

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
      <View style={styles.manualHeader}>
        {/* Back Button */}
        <BackButton />
        {/* Share Button */}
        <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View>
          <Typo fontWeight="600" size={24} style={styles.title}>
            New Neonatal and Paediatric Product Catalogue
          </Typo>
          <Badge>18 March, 2024</Badge>
          <Badge>5 min read</Badge>

          <Image source={ArticleDetailImg} style={styles.coverImage} />
        </View>

        <View>
          <Typo>
            We are pleased to announce that Edition 10 of our Neonatal and
            Paediatric Product Catalogue is now available. {"\n\n"}
            The new catalogue has been updated to include new products, helpful
            feature pages highlighting the benefits of our key products, links
            to useful product training and guidance videos plus much more.
          </Typo>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ArticleDetail;

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
  coverImage: {
    width: '100%',
    height: 220, // Adjust height to match the visual
    borderRadius: 10, // If the image has rounded corners
  },
});
