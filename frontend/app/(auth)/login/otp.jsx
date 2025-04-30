import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import Typo from "../../../components/Typo";

const BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const OtpVerifyScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "OTP must be 6 digits");
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
      Alert.alert("Error", err?.response?.data?.error || "OTP failed");
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
            Enter the OTP sent to
          </Typo>
          <Typo fontWeight="400" size={18} style={styles.email}>
            {email}
          </Typo>

          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit OTP"
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
                Verify OTP
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
  },
  button: {
    justifyContent: "flex-end",
    backgroundColor: "#038565",
    borderRadius: 25,
    width: "100%",
    paddingVertical: 15,
    alignItems: "flex-end",
  },
  buttonDisabled: {
    backgroundColor: "#7FCFB6",
  },
});
export default OtpVerifyScreen;
