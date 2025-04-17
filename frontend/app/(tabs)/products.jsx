// app/(tabs)/products.jsx
import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView, // <-- SafeAreaView EKLENDİ
  Platform,
  Linking,
} from "react-native";
// import { useRouter } from "expo-router"; // Şimdilik kullanılmıyor, gerekirse ekleyin
import Typo from "../../components/Typo"; // Typo bileşeni varsayılıyor
import { dummyProducts } from "../data";

const PADDING = 16; // Yeni padding/gap değeri
const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - PADDING * 3) / 2;

// --- Ürün Kartı Bileşeni ---
const ProductCard = ({ item }) => {
  return (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={() => {
        Linking.openURL(item.productLink);
      }}
      // onPress={() => router.push(`/product-detail/${item.id}`)} // Örnek yönlendirme
    >
      {/* Resim Alanı */}
      <View style={styles.productImageContainer}>
        <Image
          source={item.image} // item'dan gelen resmi kullan
          style={styles.productImage}
          resizeMode="contain" // Resmin tamamı görünsün, oran korunsun
        />
      </View>
      {/* Ürün Adı */}
      <Typo style={styles.productName} numberOfLines={2}>
        {item.name}
      </Typo>
    </TouchableOpacity>
  );
};

// --- Ana Ürünler Ekranı Bileşeni ---
export default function ProductsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Özel Başlık Alanı */}
        <View style={styles.header}>
          <Typo fontWeight="600" size={20} style={styles.headerTitle}>
            Oral Care Products
          </Typo>
        </View>

        {/* Ürün Listesi (Grid) */}
        <FlatList
          data={dummyProducts}
          renderItem={({ item }) => <ProductCard item={item} />}
          keyExtractor={(item) => item.id}
          numColumns={2} // 2 Sütunlu Grid
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false} // Scroll bar'ı gizle
          // columnWrapperStyle={styles.columnWrapper} // Gerekirse sütunlar arası boşluk için
        />
      </View>
    </SafeAreaView>
  );
}

// --- Stiller ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff ", // Header altındaki alanın arka planı
  },
  scrollContainer: { paddingBottom: 30, backgroundColor: "#f0f2f5" },

  header: {
    height: 100, // Header yüksekliği
    justifyContent: "flex-end", // Başlığı dikeyde ortala
    backgroundColor: "#fff", // Beyaz header arka planı
    paddingTop: Platform.OS === "android" ? 20 : 15, // Üst boşluk (statusBar'a göre)
    paddingBottom: 20, // Alt boşluk
    paddingHorizontal: PADDING, // Yan boşluklar
    // Alt köşeleri yuvarlatma
    borderBottomLeftRadius: 24, // <<< YUVARLAK KÖŞE
    borderBottomRightRadius: 24, // <<< YUVARLAK KÖŞE
    // Header'ı listeden ayırmak için gölge (opsiyonel)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 5, // Android için gölge
    zIndex: 1, // Header'ın listenin üzerinde görünmesini sağla
  },
  headerTitle: {
    color: "#1c1c1c", // Koyu başlık rengi
    textAlign: "left", // Başlığı ortala
  },
  listContainer: {
    // Kartlar marginHorizontal kullandığı için padding'i yarıya indiriyoruz
    paddingHorizontal: PADDING / 2,
    paddingTop: 20, // Header ile liste arası boşluk
    paddingBottom: 20, // Listenin altındaki boşluk
  },

  productCard: {
    width: ITEM_WIDTH, // Hesaplanan genişlik
    backgroundColor: "#fff", // Kart arka planı
    borderRadius: 24, // <<< KÖŞE YUVARLAKLIĞI ARTIRILDI
    marginBottom: PADDING, // Dikey boşluk (satırlar arası)
    marginHorizontal: PADDING / 2, // Yatay boşluk (sütunlar arası - toplam PADDING olur)
    padding: 12, // Kart içi boşluk (biraz azaltıldı)
    alignItems: "center", // İçeriği ortala
    // Gölge
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    width: "100%", // Kart genişliğini doldur
    aspectRatio: 1, // Kare oranını koru
    borderRadius: 16, // <<< İÇ KÖŞE YUVARLAKLIĞI (Karttan biraz az)
    marginBottom: 12, // Resim ile yazı arası boşluk
    justifyContent: "center", // İçeriği (resmi) dikeyde ortala
    alignItems: "center", // İçeriği (resmi) yatayda ortala
    overflow: "hidden", // İçerideki resmin taşmasını engelle
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "left",
    // marginTop kaldırıldı, padding yeterli
  },
});
