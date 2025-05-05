// app/(auth)/login/password.jsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import "../../../i18n";
import { useTranslation } from "react-i18next";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import Typo from "../../../components/Typo";
import { useAuth } from "../../_layout";
import AnimatedIcon from "../../../components/AnimatedIcon";
import normalize from "../../../utils/normalize";

const passwordIcon = require("../../../assets/images/Password.png");

export default function PasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (password.length < 6) {
      Alert.alert(
        t("login.password.alertWeakTitle", "Weak Password"),
        t(
          "login.password.alertWeakMessage",
          "Password must be at least 6 characters long."
        )
      );
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      // При успешном входе контекст router переадресует на нужный экран
    } catch (error) {
      Alert.alert(
        t("login.password.alertFailedTitle", "Login Failed"),
        t("login.password.alertFailedMessage", "An unexpected error occurred.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <BackButton />

        <View style={styles.container}>
          <View style={styles.content}>
            <AnimatedIcon iconSource={passwordIcon} />

            <Typo fontWeight="600" size={36} style={styles.title}>
              {t("login.password.title", "Enter password")}
            </Typo>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={t("login.password.placeholder", "Password")}
                placeholderTextColor="#ccc"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible((v) => !v)}
                style={styles.eyeIconContainer}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-off" : "eye"}
                  size={24}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/login/forgot")}
              style={styles.forgotWrapper}
            >
              <Typo fontWeight="500" size={16} color="#038565">
                {t("login.password.forgot", "Forgot your password?")}
              </Typo>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              style={[styles.button, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Typo fontWeight="600" size={16} color="#fff">
                {isLoading
                  ? t("login.password.signingIn", "Signing In...")
                  : t("login.password.button", "Complete sign in")}
              </Typo>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    paddingTop:
      Platform.OS === "ios" ? normalize(20) : normalize(20),
  },
  title: {
    lineHeight: normalize(44),
    textAlign: "center",
    marginBottom: normalize(40),
    color: "#333",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  input: {
    flex: 1,
    fontSize: normalize(24),
    paddingVertical: normalize(10),
    textAlign: "center",
    color: "#000",
  },
  eyeIconContainer: {
    padding: normalize(10),
  },
  forgotWrapper: {
    marginTop: normalize(20),
    alignSelf: "center",
    backgroundColor: "#E0F4EE",
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    borderRadius: normalize(12),
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: normalize(30),
    paddingBottom:
      Platform.OS === "ios" ? normalize(30) : normalize(20),
  },
  button: {
    backgroundColor: "#038565",
    borderRadius: normalize(25),
    width: "100%",
    paddingVertical: normalize(15),
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#a5d6a7",
  },
});