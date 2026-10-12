import { Image, Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Typo from "../components/Typo";
import { useTranslation } from "react-i18next";
import Badge from "./Badge";

export const ArticleCard = ({ item, cardWidth = 230, params }) => {
  const { i18n } = useTranslation();
  const cardStyle = {
    width: cardWidth,
  };
  
  const title = item.titleTranslations
    ? item.titleTranslations[i18n.language] ||
      item.titleTranslations.en ||
      item.title
    : item.title;

    console.log(title,"articleCard")
  return (
    <TouchableOpacity
      style={[styles.card, cardStyle]}
      onPress={() =>
        router.push({
          pathname: `/(modal)/article/${item._id}`,
          params: params,
        })
      }
    >
      <Image source={item.image} style={styles.image} />
      <View style={styles.content}>
        <Badge>{item.readTime}</Badge>
        {/* Başlık */}
        <Typo style={styles.title} numberOfLines={3}>
           {title}
        </Typo>

        {/* Yayın Tarihi */}
        <Typo style={styles.date}>{item.createdAt}</Typo>
        {/* <Text style={styles.date}> // Alternatif: Standart Text kullanımı
          {date}
        </Text> */}
      </View>
    </TouchableOpacity>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    // --- DEĞİŞİKLİK ---
    borderRadius: 24, // Yuvarlak köşeler 24 olarak güncellendi
    // --- DEĞİŞİKLİK ---
    marginRight: 16, // Kartlar arası boşluk (gap) 16 olarak kaldı
    width: 230,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F5F7",
    padding: 10,
    marginBottom: 5,
  },
  image: {
    width: "100%",
    height: 130,
    borderRadius: 24,
  },
  content: {
    paddingVertical: 15,
  },

  title: {
    color: "#1c1c1c",
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 24,
    marginBottom: 8,
    marginLeft: 5,
  },
  date: {
    color: "#038565",
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 5,
  },
});
