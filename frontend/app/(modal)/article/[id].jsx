import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  StatusBar
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
            <StatusBar barStyle="dark-content" />
      <View style={styles.manualHeader}>
        {/* Back Button */}
        <BackButton />
        {/* Share Button */}
        <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainerContent}>
        <Typo fontWeight="600" size={24} style={styles.title}>
          New Neonatal and Paediatric Product Catalogue
        </Typo>
        <View style={styles.badgeRow}>
          <Badge>18 March, 2024</Badge>
          <Badge>5 min read</Badge>
        </View>

        <Image source={ArticleDetailImg} style={styles.coverImage} />

        <View style={styles.bodyTextContainer}>
          <Typo style={styles.bodyText}>
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
  scrollContainerContent: {
    backgroundColor: "#fff", // Arka plan rengi
    // ScrollView içeriği için padding
    paddingHorizontal: 20, // Yanlardan boşluk
    paddingBottom: 40, // Alttan boşluk
  },
  title: {
    color: "#1c1c1c", // Koyu başlık rengi
    lineHeight: 36, // Satır yüksekliği
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row", // Rozetleri yan yana dizer
    alignItems: "center", // Dikeyde ortalar
    gap: 10, // Rozetler arası boşluk (React Native 0.71+ gerektirir)
    // Eğer RN < 0.71 ise: ilk Badge'e marginRight: 10 verin
    marginBottom: 20, // Rozet sırasının altındaki boşluk (resme kadar)
  },
  coverImage: {
    width: 353, // Tam genişlik
    height: 237, // Sabit yükseklik
    borderRadius: 16, // Resim köşelerini yuvarlatma (Tasarima göre ayarlayın)
    marginBottom: 25, // Resmin altındaki boşluk (metne kadar)
  },
  bodyTextContainer: {
    // Metin için ek sarmalayıcı (gerekirse margin vb. için)
  },
  bodyText: {
    fontSize: 16, // Metin boyutu
    lineHeight: 26, // Okunabilirlik için satır yüksekliği
    color: "#333", // Metin rengi
  },
});
