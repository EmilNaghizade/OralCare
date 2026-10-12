import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import Typo from "../../../components/Typo";
import "../../../i18n";
import { useTranslation } from "react-i18next";
import normalize from "../../../utils/normalize";

const BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const OtpVerifyScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert(
        t("login.otpVerify.alertInvalidTitle", "Invalid OTP"),
        t("login.otpVerify.alertInvalidMessage", "OTP must be 6 digits.")
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-email-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      router.push({
        pathname: "/(auth)/login/update-password",
        params: { email },
      });
    } catch (err) {
      console.error("OTP verification failed:", err);
      Alert.alert(
        t("login.otpVerify.alertErrorTitle", "Error"),
        err?.message || t("login.otpVerify.alertErrorMessage", "OTP failed")
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
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Typo fontWeight="600" size={28} style={styles.title}>
            {t("login.otpVerify.title", "Enter the OTP sent to")}
          </Typo>
          <Typo style={styles.checkSpamText}>
            {" "}
            {t("login.otpVerify.checkSpam")}{" "}
          </Typo>

          <Typo fontWeight="400" size={18} style={styles.email}>
            {email}
          </Typo>

          <TextInput
            style={styles.input}
            placeholder={t("login.otpVerify.placeholder", "Enter 6-digit OTP")}
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
                {t("login.otpVerify.button", "Verify OTP")}
              </Typo>
            )}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: normalize(20),
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: normalize(10),
    color: "#000",
  },
  checkSpamText: {
    textAlign: "center",
    marginTop: normalize(8),
    marginBottom: normalize(20),
    color: "#888",
  },
  email: {
    textAlign: "center",
    marginBottom: normalize(30),
    color: "#555",
  },
  input: {
    fontSize: normalize(24),
    textAlign: "center",
    marginBottom: normalize(40),
    color: "#000",
    paddingVertical: normalize(10),
  },
  buttonContainer: {
    alignItems: "flex-end",
    flex: 1,
    justifyContent: "flex-end",
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
export default OtpVerifyScreen;
