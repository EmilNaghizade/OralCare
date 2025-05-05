// app/(auth)/login/forgot.jsx
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
} from "react-native";
import { useRouter } from "expo-router";
import "../../../i18n";
import { useTranslation } from "react-i18next";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import Typo from "../../../components/Typo";
import AnimatedIcon from "../../../components/AnimatedIcon";
import normalize from "../../../utils/normalize";

const emailIcon = require("../../../assets/images/Email.png");

const BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleSendOtp = async () => {
    const trimmed = email.trim();
    if (!validateEmail(trimmed)) {
      Alert.alert(
        t("login.forgot.alertInvalidTitle", "Invalid Email"),
        t(
          "login.forgot.alertInvalidMessage",
          "Please enter a valid email address."
        )
      );
      return;
    }
    setIsLoading(true);
    try {
      await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, isReset: true }),
      });
      router.push({
        pathname: "/(auth)/login/otp",
        params: { email: trimmed },
      });
    } catch (err) {
      console.error("Failed to send OTP:", err);
      Alert.alert(
        t("login.forgot.alertErrorTitle", "Error"),
        err?.response?.data?.error ||
          t("login.forgot.alertErrorMessage", "Could not send OTP")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <BackButton />
      <View style={styles.container}>
      
          <View style={styles.inputContainer}>
            <Typo fontWeight="600" size={28} style={styles.title}>
              {t("login.forgot.title", "Forgot your password?")}
            </Typo>
            <TextInput
              style={styles.input}
              placeholder={t("login.forgot.placeholder", "Enter your email")}
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSendOtp}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              style={[styles.button, isLoading && styles.buttonDisabled]}
              disabled={isLoading}
              onPress={handleSendOtp}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Typo fontWeight="600" size={16} color="#fff">
                  {t("login.forgot.button", "Send OTP")}
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
  inputContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: normalize(30),
  },
  title: {
    lineHeight: normalize(36),
    textAlign: "center",
    marginBottom: normalize(40),
    color: "#333",
  },
  input: {
    fontSize: normalize(24),
    paddingVertical: normalize(10),
    textAlign: "center",
    color: "#000",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
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