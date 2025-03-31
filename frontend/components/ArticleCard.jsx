import { Image, Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Typo from "../components/Typo";

export const ArticleCard = ({ item }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => router.push(`/(modal)/article/${item._id}`)}
  >
    <Image source={item.image} style={styles.image} />
    <View style={styles.content}>
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{item.readTime}</Text>
      </View>
      {/* Başlık */}
      <Typo style={styles.title} numberOfLines={3}>
        {item.title}
      </Typo>


      {/* Yayın Tarihi */}
      <Typo style={styles.date}>{item.createdAt}</Typo>
      {/* <Text style={styles.date}> // Alternatif: Standart Text kullanımı
          {date}
        </Text> */}
    </View>
  </TouchableOpacity>
);

// --- Styles ---
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    // --- DEĞİŞİKLİK ---
    borderRadius: 24,         // Yuvarlak köşeler 24 olarak güncellendi
    // --- DEĞİŞİKLİK ---
    marginRight: 16,          // Kartlar arası boşluk (gap) 16 olarak kaldı
    width: 230,
    overflow: 'hidden',
    // Gölge (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    // Gölge (Android)
    elevation: 3,
    marginBottom: 5,
  },
  image: {
    width: 216,
    height: 130,
    // --- DEĞİŞİKLİK (İsteğe Bağlı ama Önerilir) ---
    // Ana kartın yuvarlaklığına uyması için (overflow:hidden olsa bile)
    borderRadius: 24,
    // --- DEĞİŞİKLİK SONU ---
  },
  content: {
    paddingVertical: 15,
    
  },
  badgeContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: "#DFEAEF",
    // --- DEĞİŞİKLİK ---
    borderRadius: 24,          // Yuvarlak köşeler 24 olarak güncellendi
    // --- DEĞİŞİKLİK ---
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    color: '#4a4a4a',
    fontSize: 11,
    fontWeight: '500',
  },
  title: {
    color: '#1c1c1c',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 8,
  },
  date: {
    color: '#038565',
    fontSize: 13,
    fontWeight: '500',
  },
});