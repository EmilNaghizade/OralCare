// app/(tabs)/products.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  Linking,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useAuth } from "../_layout";
import Typo from "../../components/Typo";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";

const PADDING = 16; // Yeni padding/gap değeri
const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - PADDING * 3) / 2;

// --- Ürün Kartı Bileşeni ---
const ProductCard = ({ item }) => {
  // Fix the image source handling
  let imageSource;

  if (item.image) {
    imageSource = item.image;
  } else if (item.imageUrl) {
    // Case 2: If it's a URL from the API (needs to be converted to an object with uri)
    if (typeof item.imageUrl === "string") {
      // If imageUrl is already a string, make it an object with uri property
      if (item.imageUrl.startsWith("http")) {
        // If it's a full URL
        imageSource = { uri: item.imageUrl };
      } else {
        // If it's a relative path from the API
        imageSource = {
          uri: `${process.env.EXPO_PUBLIC_API_BASE_URL}${item.imageUrl}`,
        };
      }
    } else {
      // If it's already an object with uri
      imageSource = item.imageUrl;
    }
  } else {
    // Fallback to default image if no image is provided
  
  }

  // Get the product link based on available properties
  const productLink =
    item.productLink || item.link || "https://www.intersurgical.com/products";

  return (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={() => {
        if (productLink) {
          Linking.openURL(productLink);
        }
      }}
    >
      {/* Image Area */}
      <View style={styles.productImageContainer}>
        <Image
          source={imageSource}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 16,
          }}
          resizeMode="cover"
        />
      </View>
      {/* Product Name */}
      <Typo style={styles.productName} numberOfLines={2}>
        {item.name}
      </Typo>
    </TouchableOpacity>
  );
};

// --- Ana Ürünler Ekranı Bileşeni ---
export default function ProductsScreen() {
  const { authToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch products from API
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/products`,
        {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        }
      );

      if (response.data && response.data.products) {
        setProducts(response.data.products);
      } else {
      }
    } catch (err) {
      console.error("Error fetching products:", err);

      setError(
        "Could not load products from server. Showing sample products instead."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // Yalnızca üst boşluğu yakalayıp arka planı boyayan SafeAreaView
    <SafeAreaView edges={["top"]} style={{ backgroundColor: "white", flex: 1 }}>
      <StatusBar
        translucent={false}
        backgroundColor="white"
        barStyle="dark-content"
      />
      <View
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Custom Header */}
        <View style={styles.header}>
          <Typo fontWeight="600" size={20} style={styles.headerTitle}>
            Oral Care Products
          </Typo>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#038565" />
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={({ item }) => <ProductCard item={item} />}
            keyExtractor={(item) =>
              item.id || item._id || Math.random().toString()
            }
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Typo style={styles.emptyText}>No products available</Typo>
              </View>
            }
          />
        )}
        {/* Error message if any */}
        {error && (
          <View style={styles.errorContainer}>
            <Typo style={styles.errorText}>{error}</Typo>
          </View>
        )}
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
    paddingTop: 40, // Internal padding
    paddingHorizontal: 20,
    paddingBottom: 24, // Internal padding (adjust as needed)
    // Alt köşeleri yuvarlatma
    borderBottomLeftRadius: 24, // <<< YUVARLAK KÖŞE
    borderBottomRightRadius: 24, // <<< YUVARLAK KÖŞE
  },
  headerTitle: {
    fontSize: 24, // Başlık boyutu
    fontWeight: "600", // Başlık kalınlığı
    lineHeight: 32, // Başlık satır yüksekliği
    color: "#1c1c1c", // Koyu başlık rengi
    textAlign: "left", // Başlığı ortala
  },
  listContainer: {
    // Kartlar marginHorizontal kullandığı için padding'i yarıya indiriyoruz
    paddingHorizontal: PADDING / 2,
    paddingTop: 20, // Header ile liste arası boşluk
    paddingBottom: 20, // Listenin altındaki boşluk
    backgroundColor: "#fff",
    marginTop: 10,
    borderRadius: 20,
    minHeight: 200, // Ensure container has minimum height
  },
  productCard: {
    width: ITEM_WIDTH, // Hesaplanan genişlik
    backgroundColor: "#fff", // Kart arka planı
    borderRadius: 30, // <<< KÖŞE YUVARLAKLIĞI ARTIRILDI
    marginBottom: PADDING, // Dikey boşluk (satırlar arası)
    marginHorizontal: PADDING / 2, // Yatay boşluk (sütunlar arası - toplam PADDING olur)
    padding: 12, // Kart içi boşluk (biraz azaltıldı)
    // Gölge
    borderWidth: 1,
    borderColor: "#F0F5F7",
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
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
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
    color: "#999",
  },
});
