// app/(auth)/login/update-password.jsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
  Alert,
  Keyboard,
  Platform,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import "../../../i18n";
import { useTranslation } from "react-i18next";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import Typo from "../../../components/Typo";
import AnimatedIcon from "../../../components/AnimatedIcon";
import { authApi } from "../../../services/api";
import normalize from "../../../utils/normalize";

const passwordIcon = require("../../../assets/images/Password.png");

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const { email, otp } = useLocalSearchParams();
  const { t } = useTranslation();

  const [newPassword, setNewPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert(
        t("login.updatePassword.alertWeakTitle", "Weak Password"),
        t(
          "login.updatePassword.alertWeakMessage",
          "Password must be at least 6 characters."
        )
      );
      return;
    }
    setIsLoading(true);
    try {
      await authApi.resetPasswordWithOtp({ email, otp, newPassword });
      Alert.alert(
        t("login.updatePassword.alertSuccessTitle", "Success"),
        t("login.updatePassword.alertSuccessMessage", "Your password was updated.")
      );
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert(
        t("login.updatePassword.alertErrorTitle", "Error"),
        error?.message ||
          t("login.updatePassword.alertErrorMessage", "Could not update password")
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

            <Typo fontWeight="600" size={28} style={styles.title}>
              {t(
                "login.updatePassword.title",
                "Create new password"
              )}
            </Typo>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={t(
                  "login.updatePassword.placeholder",
                  "New Password"
                )}
                placeholderTextColor="#ccc"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
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
              onPress={handleUpdatePassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Typo fontWeight="600" size={16} color="#fff">
                  {t(
                    "login.updatePassword.button",
                    "Reset Password"
                  )}
                </Typo>
              )}
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
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
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
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: normalize(30),
    paddingBottom:
      Platform.OS === "ios" ? normalize(20) : normalize(20),
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