// app/(tabs)/contact.jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList, // Kişi listesi için FlatList kullanacağız
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { Stack } from "expo-router"; // Header'ı layout üzerinden yönetmek için (opsiyonel)
import { Ionicons } from "@expo/vector-icons";
import Typo from "../../components/Typo"; // Kendi Typo bileşeniniz (varsa)

// --- Varsayılan Profil Fotoğrafı ---
// Projenizdeki assets klasörüne uygun bir varsayılan fotoğraf ekleyin
const defaultProfilePic = require("../../assets/images/pp.png"); // Örnek yol, kendinize göre değiştirin

// --- Örnek Kişi Verileri ---
const dummyContacts = [
  {
    id: "1",
    name: "Vuqar Mammadov",
    title: "Manager, Azerbaijan",
    image: defaultProfilePic,
  },
  {
    id: "2",
    name: "Alice Johnson",
    title: "Manager, United States",
    image: defaultProfilePic,
  },
  {
    id: "3",
    name: "Satoshi Nakamoto",
    title: "Manager, Japan",
    image: defaultProfilePic,
  },
  {
    id: "4",
    name: "Maria Garcia",
    title: "Manager, Spain",
    image: defaultProfilePic,
  },
  {
    id: "5",
    name: "Liam Patel",
    title: "Manager, Canada",
    image: defaultProfilePic,
  },
  {
    id: "6",
    name: "Anastasia Ivanova",
    title: "Manager, Russia",
    image: defaultProfilePic,
  },
  // İhtiyaç halinde daha fazla kişi eklenebilir
];

// --- Kişi Listesi Öğesi Bileşeni ---
const ContactListItem = ({ item }) => {
  // Her bir satır için tıklama olayı (opsiyonel)
  const handlePress = () => {
    console.log("Kişiye tıklandı:", item.name);
    // Detay sayfasına yönlendirme vb. eklenebilir
  };

  return (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Profil Fotoğrafı */}
      <Image source={item.image} style={styles.profilePic} />
      {/* İsim ve Ünvan */}
      <View style={styles.contactInfo}>
        <Typo style={styles.contactName} fontWeight="600">
          {item.name}
        </Typo>
        <Typo style={styles.contactTitle}>{item.title}</Typo>
      </View>
      {/* Sağdaki Ok İkonu */}
      <Ionicons name="chevron-forward-outline" size={22} color="#cccccc" />
    </TouchableOpacity>
  );
};

// --- Ana İletişim Ekranı Bileşeni ---
export default function ContactScreen() {
  // Ülke seçici için placeholder fonksiyon
  const handleSelectCountry = () => {
    console.log("Ülke Seçici Tıklandı");
    // Dropdown açma/kapama mantığı buraya eklenebilir
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Eğer header'ı layout'tan yönetiyorsanız bu satırı kullanın: */}
      {/* <Stack.Screen options={{ title: 'Contact Us' }} /> */}

      {/* Başlık Alanı */}
      <View style={styles.headerContainer}>
        <Ionicons
          name="call-outline"
          size={26}
          color="#333"
          style={styles.headerIcon}
        />
        <View style={styles.headerTextContainer}>
          <Typo size={24} fontWeight="600" style={styles.title}>
            Contact us
          </Typo>
          <Typo style={styles.subtitle}>
            Select managers by country for regional expertise and support.
          </Typo>
        </View>
      </View>

      {/* Ülke Seçici */}
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={handleSelectCountry}
      >
        <Typo style={styles.selectorText}>Select Country</Typo>
        <Ionicons name="chevron-down-outline" size={20} color="#666" />
      </TouchableOpacity>

      {/* Kişi Listesi */}
      <FlatList
        data={dummyContacts}
        renderItem={({ item }) => <ContactListItem item={item} />}
        keyExtractor={(item) => item.id}
        style={styles.list} // Listeye flex: 1 vermek için
        contentContainerStyle={styles.listContainer} // Liste içeriği için padding
        ItemSeparatorComponent={() => <View style={styles.separator} />} // Ayırıcı çizgi
      />
    </SafeAreaView>
  );
}

// --- Stiller ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // Beyaz arka plan
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-start", // İkon ve metin bloğunu yukarı hizala
    paddingHorizontal: 20,
    paddingTop: 25, // Üst boşluk
    paddingBottom: 20, // Alt boşluk
    backgroundColor: "#ffffff",
  },
  headerIcon: {
    marginRight: 15,
    marginTop: 5, // İkonu metinle hizalamak için hafif boşluk
  },
  headerTextContainer: {
    flex: 1, // Metin alanının kalan genişliği almasını sağla
  },
  title: {
    color: "#1c1c1c",
    marginBottom: 6, // Başlık altı boşluk
  },
  subtitle: {
    color: "#6c757d", // Gri alt başlık
    fontSize: 14,
    lineHeight: 20, // Satır yüksekliği
  },
  selectorButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa", // Çok açık gri buton arka planı
    marginHorizontal: 20, // Yanlardan boşluk
    paddingVertical: 16, // Dikey iç boşluk
    paddingHorizontal: 15, // Yatay iç boşluk
    borderRadius: 14, // Yuvarlak köşeler
    marginBottom: 20, // Listenin üstündeki boşluk
    // Hafif border
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectorText: {
    fontSize: 16,
    color: "#495057", // Seçici metin rengi
    fontWeight: "500",
  },
  list: {
    flex: 1, // Listenin kalan alanı kaplaması için
  },
  listContainer: {
    paddingBottom: 20, // Listenin en altında boşluk
  },
  contactItem: {
    flexDirection: "row", // Fotoğraf, metin ve oku yan yana diz
    alignItems: "center", // Öğeleri dikeyde ortala
    paddingHorizontal: 20, // Satırın yan boşlukları
    paddingVertical: 15, // Satırın dikey boşlukları
    backgroundColor: "#ffffff",
  },
  profilePic: {
    width: 50, // Profil fotoğrafı boyutu
    height: 50,
    borderRadius: 25, // Tam daire
    backgroundColor: "#e0e0e0", // Resim yüklenemezse görünen arka plan
    marginRight: 15, // Fotoğraf ile metin arası boşluk
  },
  contactInfo: {
    flex: 1, // Metin alanının kalan genişliği almasını sağla
  },
  contactName: {
    fontSize: 16,
    color: "#212529", // Koyu isim rengi
    marginBottom: 4, // İsim ile ünvan arası boşluk
  },
  contactTitle: {
    fontSize: 14,
    color: "#6c757d", // Gri ünvan rengi
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f2f5", // Çok açık gri ayırıcı çizgi
    marginLeft: 85, // Profil fotoğrafı + boşluk kadar içeriden başla
  },
});
