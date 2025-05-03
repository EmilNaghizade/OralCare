// app/(tabs)/settings/language-selection.jsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../components/BackButton";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

export default function LanguageSelection() {
  const { t, i18n } = useTranslation();

  const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);
  };

  return (
    <SafeAreaView style={styles.container}>
        <BackButton />
      <View style={styles.containerContent}>
        
        <Text style={styles.header}>
          {t("settings.selectLanguage", "Select Language")}
        </Text>
        {LANGUAGES.map(({ code, name, flag }) => (
          <TouchableOpacity
            key={code}
            style={styles.option}
            onPress={() => changeLanguage(code)}
          >
            <Text style={styles.text}>
              {flag} {name}
            </Text>
            {i18n.language === code && (
              <Ionicons name="checkmark" size={20} color="#038565" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  containerContent: {
    flex: 1,
    padding: 20
  },
  header: { fontSize: 20, fontWeight: "600", marginBottom: 20 },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 10,
  },
  text: { fontSize: 16 },
});
