// app/(tabs)/contact.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Typo from "../../components/Typo";
import { dummyContacts } from "../data";
import { useRouter } from "expo-router";

// Ekran boyutlarını al
const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

const countries = [
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "GB", name: "England", flag: "🇬🇧" },
];

const filterContactsByCountry = (contacts, countryCode) => {
  return contacts.filter((contact) => contact.countryCode === countryCode);
};

const ContactListItem = ({ item }) => {
  const router = useRouter();
  const handlePress = () => {
    console.log("Kişiye tıklandı:", item.name);
    router.push(`/contact/${item.id}`);
  };

  return (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image source={item.image} style={styles.profilePic} />
      <View style={styles.contactInfo}>
        <Typo style={styles.contactName} fontWeight="600">
          {item.name}
        </Typo>
        <Typo style={styles.contactTitle}>{item.title}</Typo>
      </View>
      <Ionicons name="chevron-forward-outline" size={22} color="#cccccc" />
    </TouchableOpacity>
  );
};

export default function ContactScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [filteredContacts, setFilteredContacts] = useState(dummyContacts); // Filtrelenmiş kişiler

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    console.log("Seçilen Ülke:", country.name);
    closeModal();
  };
  const clearSelectedCountry = () => {
    setSelectedCountry(null);
  };
  useEffect(() => {
    if (selectedCountry) {
      const newFilteredContacts = filterContactsByCountry(
        dummyContacts,
        selectedCountry.code
      );
      setFilteredContacts(newFilteredContacts);
    } else {
      setFilteredContacts(dummyContacts); // Ülke seçilmediyse tüm kişileri göster
    }
  }, [selectedCountry]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
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

      {/* Ülke Seçici ve Çarpı */}

      <TouchableOpacity
        style={styles.selectorButton}
        onPress={openModal}
      >
        <Typo style={styles.selectorText}>
          {selectedCountry ? selectedCountry.name : "Select Country"}
        </Typo>
        <View style={styles.selectorIcons}>
          {selectedCountry && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSelectedCountry}
            >
              <Ionicons name="close-circle" size={24} color="#666" />
            </TouchableOpacity>
          )}
          <Ionicons name="chevron-down-outline" size={20} color="#666" />
        </View>
      </TouchableOpacity>

      {/* Kişi Listesi */}
      {filteredContacts.length > 0 ? (
        <FlatList
          data={filteredContacts}
          renderItem={({ item }) => <ContactListItem item={item} />}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.noContactsContainer}>
          <Typo style={styles.noContactsText}>
            No managers found in this region.
          </Typo>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContentContainer}
          >
            <View style={styles.modalContent}>
              <FlatList
                style={styles.modalList}
                data={countries}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.countryItem}
                    onPress={() => handleCountrySelect(item)}
                  >
                    <Text style={styles.flagIcon}>{item.flag}</Text>
                    <Typo style={styles.countryName}>{item.name}</Typo>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => (
                  <View style={styles.modalSeparator} />
                )}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
  },
  headerIcon: {
    marginRight: 15,
    marginTop: 5,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    color: "#1c1c1c",
    marginBottom: 6,
  },
  subtitle: {
    color: "#6c757d",
    fontSize: 14,
    lineHeight: 20,
  },
  selectorButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectorText: {
    fontSize: 16,
    color: "#495057",
    fontWeight: "500",
  },
  selectorIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearButton: {
    marginRight: 5,
    padding: 5,
  },
  list: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#ffffff",
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    color: "#212529",
    marginBottom: 4,
  },
  contactTitle: {
    fontSize: 14,
    color: "#6c757d",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f2f5",
    marginLeft: 85,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  modalContentContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    height: 250,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    color: "#333",
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  flagIcon: {
    fontSize: 26,
    marginRight: 15,
  },
  countryName: {
    fontSize: 16,
    color: "#333",
  },
  modalSeparator: {
    height: 1,
    backgroundColor: "#f0f2f5",
    marginLeft: 20,
  },
  noContactsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  noContactsText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
  },
});