// app/(auth)/register/password.jsx
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
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import Typo from "../../../components/Typo";
import "../../../i18n";
import { useTranslation } from "react-i18next";
import { authApi } from "../../../services/api";
import { useAuth } from "../../_layout";
import AnimatedIcon from "../../../components/AnimatedIcon";

const passwordIcon = require("../../../assets/images/Password.png");

export default function PasswordScreen() {
  const router = useRouter();
  const { name, gender, email } = useLocalSearchParams();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (password.length < 6) {
      Alert.alert(
        t("register.password.alertWeakTitle", "Weak Password"),
        t(
          "register.password.alertWeakMessage",
          "Password must be at least 6 characters long."
        )
      );
      return;
    }
    setIsLoading(true);
    try {
      const userData = { name, gender, email, password };
      const response = await authApi.register(userData);
      if (response?.token) {
        await login(email, password);
      } else {
        Alert.alert(
          t("register.password.alertFailedTitle", "Registration Failed"),
          t(
            "register.password.alertFailedMessage",
            "An unexpected error occurred."
          )
        );
      }
    } catch (error) {
      Alert.alert(
        t("register.password.alertFailedTitle", "Registration Failed"),
        error.message ||
          t(
            "register.password.alertFailedMessage",
            "An unexpected error occurred."
          )
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
              {t("register.password.title", "Create password")}
            </Typo>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={t("register.password.placeholder", "Password")}
                placeholderTextColor="#ccc"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
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
          </View>

          <View style={styles.buttonContainer}>
            <Button
              style={[styles.button, isLoading && styles.disabledButton]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Typo fontWeight="600" size={16} color="#fff">
                {isLoading
                  ? t("register.password.signingUp", "Signing Up...")
                  : t(
                      "register.password.button",
                      "Complete sign up"
                    )}
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
    paddingTop: Platform.OS === "ios" ? 20 : 20,
  },
  title: {
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
    fontSize: 25,
    paddingVertical: 10,
    textAlign: "center",
    color: "#333",
  },
  eyeIconContainer: { padding: 10 },
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