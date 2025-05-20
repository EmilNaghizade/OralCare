// app/(auth)/login/index.jsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import "../../../i18n";
import { useTranslation } from "react-i18next";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import Typo from "../../../components/Typo";
import AnimatedIcon from "../../../components/AnimatedIcon";
import { authApi } from "../../../services/api";
import normalize, { SCREEN_WIDTH} from "../../../utils/normalize";

const emailIcon = require("../../../assets/images/Email.png");
const NEXT_SCREEN_ROUTE = "/(auth)/login/password";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (e) => emailRegex.test(e);

  const handleNext = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert(
        t("login.email.alertRequiredTitle", "Email Required"),
        t(
          "login.email.alertRequiredMessage",
          "Please enter your email address."
        )
      );
      return;
    }
    if (!validateEmail(trimmed)) {
      Alert.alert(
        t("login.email.alertInvalidTitle", "Invalid Email"),
        t(
          "login.email.alertInvalidMessage",
          "Please enter a valid email address."
        )
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.checkEmail(trimmed);
      if (response.exists) {
        router.push({
          pathname: NEXT_SCREEN_ROUTE,
          params: { email: trimmed },
        });
      }
    } catch (error) {
      // общий заголовок ошибки
      const title = t("login.email.alertErrorTitle", "Error");

      // сначала выводим первый алерт
      Alert.alert(
        title,
        t(
          "login.email.alertErrorUserNotFoundMessage",
          "User not found. Please try again."
        )
      );

      // а затем, если хотим уточнить по статусу
      if (error.response?.status === 404) {
        Alert.alert(
          title,
          t("login.email.alertErrorNotFoundMessage", "User not found.")
        );
      } else {
        Alert.alert(
          title,
          t(
            "login.email.alertErrorGeneralMessage",
            "An error occurred during login. Please try again."
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <BackButton />

      <View style={styles.container}>
        <View style={styles.content}>
          <AnimatedIcon iconSource={emailIcon} />

          <Typo  style={styles.title}>
            {t("login.email.title", "Enter your email")}
          </Typo>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={t("login.email.placeholder", "user@gmail.com")}
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={handleNext}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Typo fontWeight="600" size={16} color="#fff">
                {t("common.next", "Next")}
              </Typo>
            )}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: normalize(30),
    paddingTop: normalize(20),
  },
  title: {
    lineHeight: SCREEN_WIDTH < 481 ? normalize(30) : normalize(40),
    fontSize: SCREEN_WIDTH < 350 ? normalize(28) : normalize(30),
    fontWeight: "600",
    textAlign: "center",
    marginBottom: normalize(40),
    color: "#000",
  },
  inputWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    width: "100%",
    fontSize: normalize(24),
    paddingVertical: normalize(10),
    textAlign: "center",
    color: "#000",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: normalize(30),
    paddingBottom: Platform.OS === "ios" ? normalize(30) : normalize(20),
  },
  button: {
    backgroundColor: "#038565",
    borderRadius: normalize(25),
    width: "100%",
    paddingVertical: normalize(15),
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#7FCFB6",
  },
});
