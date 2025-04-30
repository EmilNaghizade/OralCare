// File: app/(auth)/login/forgot.jsx

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
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import Typo from "../../../components/Typo";


const BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (emailToValidate) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToValidate);
  };

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim();

    if (!validateEmail(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const otpResponse = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail, isReset: true }),
      });
      console.log("OTP response:", otpResponse);

      router.push({
        pathname: "/(auth)/login/otp",
        params: { email: trimmedEmail },
      });
    } catch (err) {
      console.error("Failed to send OTP:", err);
      Alert.alert("Error", err?.response?.data?.error || "Could not send OTP");
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
            Forgot your password?
          </Typo>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
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
                Send OTP
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
  // Added headerContainer style from previous examples

  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    lineHeight: 44, // Adjust line height for multi-line text
    textAlign: "center",
    marginBottom: 40,
    color: "#333",
  },
  input: {
    fontSize: 24,
    paddingVertical: 10,
    paddingBottom: 10, // Space for underline
    textAlign: "center",
    color: "#000",
    // Remove borders here - handled by wrapper
  },
  inputContainer: {
    flex: 1,
    justifyContent: "center",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  button: {
    backgroundColor: "#038565",
    borderRadius: 25,
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#7FCFB6",
  },
});

export default ForgotPasswordScreen;
