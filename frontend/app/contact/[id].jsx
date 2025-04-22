// app/contact/[id].jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Linking, // <-- URL açmak için import et
  ScrollView, // <-- İçerik ekrandan taşarsa kaydırma için
  ActivityIndicator, // <-- Yükleniyor göstergesi
  Platform,
  Alert,
  Share,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { dummyContacts } from "../data";
import Typo from "../../components/Typo";
import BackButton from "../../components/BackButton";

const defaultProfilePic = require("../../assets/images/pp.png");

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams(); // Contact id'sini al
  const router = useRouter();
  const [contact, setContact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ID'ye göre kişiyi bul (gerçek uygulamada burada API isteği olur)
    const foundContact = dummyContacts.find((c) => c.id === id);
    if (foundContact) {
      // Gerçekçi bir "About" metni ekleyelim (dummy data'da yoksa)
      const contactWithDetails = {
        ...foundContact,
        phone: foundContact.phone || "+994501234567", // Örnek telefon no ekle
        whatsappPhone: foundContact.whatsappPhone || "994501234567", // Whatsapp için '+' olmadan
        about:
          foundContact.about ||
          `Information about ${foundContact.name}. This manager works in ${
            foundContact.title?.split(",")[1]?.trim() || "their region"
          } and has valuable experience. Contact them for more details regarding business operations.`,
      };
      setContact(contactWithDetails);
    } else {
      // Kişi bulunamazsa bir önceki sayfaya dönülebilir veya hata gösterilebilir
      console.error("Kişi bulunamadı, ID:", id);
      // router.back(); // Opsiyonel: Geri dön
    }
    setIsLoading(false);
  }, [id]); // ID değiştiğinde çalışır

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this person! ${contact.name}`, // Placeholder message
        title: `{id}`, // Placeholder title
      });
    } catch (error) {
      Alert.alert("Error", "Could not share this video.");
      console.error("Share error:", error.message);
    }
  };

  // WhatsApp sohbetini açma fonksiyonu
  const handleWhatsAppPress = () => {
    let phoneNumber = contact.phone;
    if (!phoneNumber) {
      console.error("Phone number is missing for this contact.");
      return;
    }
    // Telefon numarasını temizle ve uluslararası formata getir
    phoneNumber = phoneNumber.replace(/\D/g, ""); // Tüm sayısal olmayan karakterleri kaldır
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+" + phoneNumber; // "+" işareti ekle
    }
    const message = "Hello, I'm contacting you from the OralCare app."; // İsteğe bağlı mesaj
    let url = "";

    if (Platform.OS === "android") {
      url = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
    } else {
      url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
    }
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          console.error("Can't handle url: " + url);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  // Telefon arama ekranını açma fonksiyonu
  const handleCallPress = () => {
    if (contact?.phone) {
      let phoneNumber = contact.phone;
      // Telefon numarasını temizle ve sadece rakamları al
      phoneNumber = phoneNumber.replace(/\D/g, "");

      // Telefon numarasının başında '+' yoksa ekle (isteğe bağlı)
      if (!phoneNumber.startsWith("+")) {
        phoneNumber = "+" + phoneNumber;
      }

      const url = `tel:${phoneNumber}`;

      Linking.canOpenURL(url)
        .then((supported) => {
          if (!supported) {
            console.error("Telefon araması desteklenmiyor: " + url);
            Alert.alert(
              "Error",
              "Bu cihazda telefon araması desteklenmiyor."
            );
          } else {
            return Linking.openURL(url);
          }
        })
        .catch((err) => {
          console.error("Arama yapılamadı:", err);
          Alert.alert(
            "Error",
            "Arama yapılamadı. Lütfen telefon numarasını kontrol edin."
          );
        });
    } else {
      console.error("Phone number is missing for this contact.");
      Alert.alert("Error", "Telefon numarası bulunamadı.");
    }
  };

  const handleFacebookPress = () => {
    if (contact?.facebookUrl) {
      Linking.openURL(contact.facebookUrl).catch((err) =>
        console.error("Facebook açılamadı:", err)
      );
    } else {
      console.error("Facebook link is missing for this contact.");
    }
  };

  // Yükleniyor durumu
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  // Kişi bulundu, detayları göster
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.manualHeader}>
        {/* Back Button */}
        <BackButton route={"/contact"} />
        {/* Share Button */}
        <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      {/* Sayfa başlığını kişinin ismi yap veya boş bırak */}
      <Stack.Screen options={{ title: "", headerBackTitle: "Contacts" }} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profil Resmi */}
        <View style={styles.profileHeader}>
          <Image
            source={contact.image || defaultProfilePic}
            style={styles.profileImage}
          />
          <Typo size={22} fontWeight="600" style={styles.name}>
            {contact.name}
          </Typo>
          <Typo style={styles.titleDetail}>{contact.title}</Typo>
        </View>

        {/* About Bölümü */}
        <View style={styles.section}>
          <Typo size={18} fontWeight="600" style={styles.sectionTitle}>
            About
          </Typo>
          <Typo style={styles.aboutText}>{contact.about}</Typo>
        </View>

        {/* İletişim Butonları */}
        <View style={styles.actionSection}>
          {/* WhatsApp Butonu */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleWhatsAppPress}
          >
            <Ionicons
              name="logo-whatsapp"
              size={24}
              color="#25D366"
              style={styles.actionIcon}
            />
            <Typo style={styles.actionText}>Chat on WhatsApp</Typo>
            <Ionicons
              name="chevron-forward-outline"
              size={22}
              color="#cccccc"
            />
          </TouchableOpacity>

          {/* Ayırıcı Çizgi */}
          <View style={styles.actionSeparator} />

          {/* Arama Butonu */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCallPress}
          >
            <Ionicons
              name="call-outline"
              size={24}
              color="#007AFF"
              style={styles.actionIcon}
            />
            <Typo style={styles.actionText}>Call Mobile number</Typo>
            <Ionicons
              name="chevron-forward-outline"
              size={22}
              color="#cccccc"
            />
          </TouchableOpacity>
          <View style={styles.actionSeparator} />

          {/* Facebook Butonu */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFacebookPress}
          >
            <Ionicons
              name="logo-facebook"
              size={24}
              color="#1877F2"
              style={styles.actionIcon}
            />
            <Typo style={styles.actionText}>Contact on Facebook</Typo>
            <Ionicons
              name="chevron-forward-outline"
              size={22}
              color="#cccccc"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stiller ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // Beyaz arka plan
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  centeredMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContainer: {
    paddingBottom: 40, // En altta boşluk
  },
  profileHeader: {
    alignItems: "left", // İçeriği ortala
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff", // Arka plan beyaz (zaten container'da var ama emin olalım)
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0", // Hafif alt çizgi
  },
  profileImage: {
    width: 120, // Daha büyük profil resmi
    height: 120,
    borderRadius: 60, // Tam daire
    marginBottom: 15,
    backgroundColor: "#e0e0e0", // Yüklenemezse arka plan
  },
  name: {
    color: "#1c1c1c",
    marginBottom: 5,
  },
  titleDetail: {
    fontSize: 15,
    color: "#6c757d",
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 25, // Bölümler arası boşluk
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    color: "#1c1c1c",
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 22, // Okunabilirlik için satır yüksekliği
    color: "#333333",
  },
  actionSection: {
    marginTop: 10, // About bölümüyle arasında hafif boşluk
    backgroundColor: "#ffffff", // Beyaz zemin
    // Kenarlıklar veya gölge eklenebilir
    // Örneğin:
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    marginHorizontal: 0, // Veya paddingHorizontal yerine marginle ayarla
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18, // Dikey boşluk
    paddingHorizontal: 20, // Yatay boşluk
    backgroundColor: "transparent", // Zaten section beyaz
  },
  actionIcon: {
    marginRight: 15,
  },
  actionText: {
    flex: 1, // Metnin kalan alanı kaplamasını sağla
    fontSize: 16,
    color: "#1c1c1c",
  },
  actionSeparator: {
    height: 1,
    backgroundColor: "#f0f0f5", // Çok açık gri ayırıcı
    //marginLeft: 20 + 24 + 15, // İkon genişliği + margin kadar içeriden başla (yaklaşık)
  },
});
