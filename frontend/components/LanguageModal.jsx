// components/LanguageModal.jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

const LanguageModal = ({ visible, onClose, onSelectLanguage, currentLanguage }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {LANGUAGES.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={styles.languageOption}
              onPress={() => {
                onSelectLanguage(language.code);
                onClose();
              }}
            >
              <View style={styles.languageRow}>
                <Text style={styles.flagText}>{language.flag}</Text>
                <Text style={styles.languageText}>{language.name}</Text>
              </View>
              {currentLanguage === language.code && (
                <Ionicons name="checkmark" size={22} color="#038565" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  flagText: {
    fontSize: 24,
    marginRight: 15,
  },
  languageText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default LanguageModal;