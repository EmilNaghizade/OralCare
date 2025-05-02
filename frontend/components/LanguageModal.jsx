import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Typo from "./Typo";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

const LanguageModal = ({ visible, onClose, onSelectLanguage }) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const modalAnimation = React.useRef(new Animated.Value(0)).current;

  // Configure pan responder for swipe down to close
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Only allow downward dragging
          modalAnimation.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          // If dragged down more than 50px, close the modal
          onClose();
        } else {
          // Otherwise snap back to original position
          Animated.spring(modalAnimation, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: modalAnimation }],
            },
          ]}
        >
          <View {...panResponder.panHandlers}>
            <View style={styles.modalHandle} />
          </View>

          <View style={styles.languageList}>
            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={styles.modalOption}
                onPress={() => {
                  onSelectLanguage(language.code);
                  onClose();
                }}
              >
                <View style={styles.iconStyle}>
                  <Text style={styles.flagText}>{language.flag}</Text>
                </View>
                <Text style={styles.modalOptionText}>{language.name}</Text>
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  {currentLanguage === language.code && (
                    <Ionicons name="checkmark" size={22} color="#038565" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    paddingHorizontal: 20,
  },
  modalHandle: {
    width: 36,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  languageList: {
    paddingVertical: 10,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 15,
    fontWeight: "600",
    lineHeight: 24,
  },
  iconStyle: {
    backgroundColor: "#F6F8FC",
    borderRadius: 12,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  flagText: {
    fontSize: 24,
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 28,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
});

export default LanguageModal;