// app/(auth)/register/otp.jsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import Typo from "../../../components/Typo";
import "../../../i18n";
import { useTranslation } from "react-i18next";

const BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function OtpScreen() {
  const router = useRouter();
  const { email, name, gender } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert(
        t("register.otp.alertInvalidTitle", "Invalid OTP"),
        t("register.otp.alertInvalidMessage", "OTP must be 6 digits.")
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }
      router.push({
        pathname: "/(auth)/register/password",
        params: { name, gender, email },
      });
    } catch (error) {
      Alert.alert(t("register.otp.alertErrorTitle", "Error"), error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <BackButton />

      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Typo fontWeight="600" size={28} style={styles.title}>
            {t("register.otp.title", "Enter the OTP sent to")}
          </Typo>
          <Typo style={styles.checkSpamText}> {t("register.otp.checkSpam")} </Typo>
          <Typo fontWeight="400" size={18} style={styles.email}>
            {email}
          </Typo>

          <TextInput
            style={styles.input}
            placeholder={t("register.otp.placeholder", "Enter 6-digit OTP")}
            placeholderTextColor="#ccc"
            keyboardType="numeric"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            style={[styles.button, isLoading && styles.buttonDisabled]}
            disabled={isLoading}
            onPress={handleVerifyOtp}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Typo fontWeight="600" size={16} color="#fff">
                {t("register.otp.button", "Verify OTP")}
              </Typo>
            )}
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
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
    color: "#000",
  },
  email: {
    textAlign: "center",
    marginBottom: 30,
    color: "#555",
  },
  input: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 40,
    color: "#000",
    paddingVertical: 10,
  },
  buttonContainer: {
    alignItems: "flex-end",
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  button: {
    backgroundColor: "#038565",
    borderRadius: 25,
    width: "100%",
    paddingVertical: 15,
    alignItems: "flex-end",
  },
  checkSpamText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  buttonDisabled: { backgroundColor: "#7FCFB6" },
});
