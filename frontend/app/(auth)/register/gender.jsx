// app/(auth)/register/gender.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import Typo from "../../../components/Typo";
import AnimatedIcon from "../../../components/AnimatedIcon";
import "../../../i18n";
import { useTranslation } from "react-i18next";

const genderIcon = require("../../../assets/images/Gender.png");

// İndi hər bir seçimin kodu və fallback mətni ilə
const GENDERS = [
  { code: "man", fallback: "Man" },
  { code: "woman", fallback: "Woman" },
  { code: "preferNotToSay", fallback: "Prefer not to say" },
];

const NEXT_SCREEN_ROUTE = "/(auth)/register/email";

export default function GenderSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { name } = params;

  const { t } = useTranslation();
  const [selectedGender, setSelectedGender] = useState(null);

  const handleSelect = (code) => {
    setSelectedGender(code);
  };

  const handleNext = () => {
    if (!selectedGender) {
      Alert.alert(
        t("register.gender.alertTitle", "Selection Required"),
        t("register.gender.alertMessage", "Please select your gender.")
      );
      return;
    }
    router.push({
      pathname: NEXT_SCREEN_ROUTE,
      params: { name, gender: selectedGender },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <BackButton />

      <View style={styles.container}>
        <View style={styles.content}>
          <AnimatedIcon iconSource={genderIcon} />

          <Typo fontWeight="600" size={28} style={styles.title}>
            {t("register.gender.title", "Select your gender")}
          </Typo>

          <View style={styles.optionsContainer}>
            {GENDERS.map(({ code, fallback }) => (
              <TouchableOpacity
                key={code}
                style={[
                  styles.optionButton,
                  selectedGender === code && styles.selectedOptionButton,
                ]}
                onPress={() => handleSelect(code)}
              >
                <Typo fontWeight="600" size={18} style={styles.optionText}>
                  {t(`register.gender.options.${code}`, fallback)}
                </Typo>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            style={[styles.button, !selectedGender && styles.disabledButton]}
            onPress={handleNext}
            disabled={!selectedGender}
          >
            <Text style={styles.buttonText}>
              {t("common.next", "Next")}
            </Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  content: {
    alignItems: "center",
    paddingTop: 20,
  },
  title: {
    lineHeight: 44,
    textAlign: "center",
    marginBottom: 40,
    color: "#333",
  },
  optionsContainer: {
    width: "100%",
  },
  optionButton: {
    backgroundColor: "#F0F5F7",
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedOptionButton: {
    borderColor: "#038565",
  },
  optionText: {
    color: "#000",
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    marginTop: 20,
  },
  button: {
    backgroundColor: "#038565",
    borderRadius: 25,
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#a5d6a7",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});