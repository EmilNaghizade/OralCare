import { Image, Text,TouchableOpacity, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Typo from "../components/Typo";
import Badge from "./Badge";

export const ProceedArticleCard = ({ item, cardStyle }) => (
  <TouchableOpacity
    style={[styles.container, cardStyle]}
    onPress={() => {
      router.push({
        pathname: `/article/${item._id}`,
        params: { activeTab: "Articles" }, // Pass the activeTab parameter
      });
    }}
  >
    {/* Left side - Image */}
    <Image source={item.image} style={styles.image} />

    {/* Right side - Content */}
    <View style={styles.contentContainer}>
      {/* Read Time Badge */}
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{item.readTime}</Text>
      </View>

      {/* Title */}
      <Typo style={styles.title} numberOfLines={3}>
        {item.title}
      </Typo>

      {/* Date */}
      <Typo style={styles.date}>{item.createdAt}</Typo>
    </View>
  </TouchableOpacity>
);

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#F0F5F7",
    borderRadius: 24,
    overflow: "hidden",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  image: {
    width: "55%",
    height: "auto",
    aspectRatio: 1.5,
    padding: 16,
    // --- DEĞİŞİKLİK ---
    borderTopLeftRadius: 12,
    borderRadius: 12,
  },
  contentContainer: {
    width: "50%",
    padding: 16,
    justifyContent: "center",
  },
  badge: {
   gap: 8
  },
  title: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    color: "#038565",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  badgeContainer: {
    backgroundColor: "#DFEAEF",
    borderWidth: 1,
    borderColor: "#DFEAEF",
    // --- DEĞİŞİKLİK ---
    borderRadius: 24, // Yuvarlak köşeler 24 olarak güncellendi
    // --- DEĞİŞİKLİK ---
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  badgeText: {
    color: "#364762",
    fontSize: 11,
    fontWeight: "500",
  },
});

export default ProceedArticleCard;
