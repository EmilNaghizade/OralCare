// File: app/(auth)/login/update-password.jsx

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
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import Typo from "../../../components/Typo";
import AnimatedIcon from "../../../components/AnimatedIcon";
import { authApi } from "../../../services/api";

const passwordIcon = require("../../../assets/images/Password.png");

const UpdatePasswordScreen = () => {
  const router = useRouter();
  const { email, otp } = useLocalSearchParams();

  const [newPassword, setNewPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPasswordWithOtp({ email, otp, newPassword });
      Alert.alert("Success", "Your password was updated.");
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Password update failed:", error);
      Alert.alert("Error", error?.message || "Could not update password");
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
              Create new password
            </Typo>

            <View style={styles.animatedWrapperStyle}>
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor="#ccc"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
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
              <Typo fontWeight="600" size={16} color="#fff">
                {isLoading ? "Updating..." : "Reset Password"}
              </Typo>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

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
    paddingHorizontal: 30,
    paddingTop: Platform.OS === "ios" ? 20 : 60,
  },
  title: {
    lineHeight: 44,
    textAlign: "center",
    marginBottom: 40,
    color: "#333",
  },
  animatedWrapperStyle: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 24,
    paddingVertical: 10,
    paddingBottom: 10,
    textAlign: "center",
    color: "#000",
  },
  eyeIconContainer: {
    padding: 10,
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
  disabledButton: {
    backgroundColor: "#a5d6a7",
  },
});

export default UpdatePasswordScreen;
