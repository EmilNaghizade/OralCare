// app/(auth)/register/email.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  Animated,
  Easing,
  ActivityIndicator,
  StatusBar,
  Text,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import Typo from "../../../components/Typo";
import AnimatedIcon from "../../../components/AnimatedIcon";
import "../../../i18n";
import { useTranslation } from "react-i18next";

const emailIcon = require("../../../assets/images/Email.png");
const NEXT_SCREEN_ROUTE = "/(auth)/register/password";
const BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { name, gender } = params;

  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const validateEmail = (e) => emailRegex.test(e);

  const handleNext = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert(
        t("register.email.alertRequiredTitle", "Email Required"),
        t("register.email.alertRequiredMessage", "Please enter your email address.")
      );
      return;
    }
    if (!validateEmail(trimmed)) {
      Alert.alert(
        t("register.email.alertInvalidTitle", "Invalid Email"),
        t("register.email.alertInvalidMessage", "Please enter a valid email address.")
      );
      return;
    }

    setIsLoading(true);
    try {
      // Check existence
      const checkRes = await fetch(
        `${BACKEND_URL}/api/auth/check-email?email=${trimmed}`
      );
      const { exists } = await checkRes.json();

      if (exists) {
        Alert.alert(
          t("register.email.alertExistsTitle", "Email Already Exists"),
          t(
            "register.email.alertExistsMessage",
            "This email is already registered. Please use a different email address."
          )
        );
      } else {
        // Send OTP
        const otpRes = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed, isReset: false }),
        });
        if (!otpRes.ok) throw new Error("otp");

        router.push({
          pathname: "/(auth)/register/otp",
          params: { name, gender, email: trimmed },
        });
      }
    } catch (err) {
      Alert.alert(
        t("register.email.alertErrorTitle", "Error"),
        t(
          "register.email.alertErrorMessage",
          "An error occurred while checking the email. Please try again later."
        )
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
        <View style={styles.content}>
          <AnimatedIcon iconSource={emailIcon} />

          <Typo fontWeight="600" size={28} style={styles.title}>
            {t("register.email.title", "Enter your email")}
          </Typo>

          <Animated.View style={{ width: "100%" }}>
            <TextInput
              style={styles.input}
              placeholder={t("register.email.placeholder", "user@gmail.com")}
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={handleNext}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </Animated.View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            style={[styles.button, isLoading && styles.buttonDisabled]}
            disabled={isLoading}
            onPress={handleNext}
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
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 30,
    paddingTop:  20 ,
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
    color: "#000",
  },
  input: {
    width: "100%",
    fontSize: 24,
    paddingVertical: 10,
    textAlign: "center",
    color: "#000",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
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