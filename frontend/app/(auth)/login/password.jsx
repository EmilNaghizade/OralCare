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
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, justifyContent: "space-between" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 30,
    paddingTop: Platform.OS === "ios" ? 20 : 60,
  },
  title: {
    lineHeight: 44,
    textAlign: "center",
    marginBottom: 40,
    color: "#333",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  input: {
    flex: 1,
    fontSize: 24,
    paddingVertical: 10,
    textAlign: "center",
    color: "#000",
  },
  eyeIconContainer: { padding: 10 },
  forgotWrapper: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "#E0F4EE",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buttonContainer: {
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
  disabledButton: { backgroundColor: "#a5d6a7" },
});
