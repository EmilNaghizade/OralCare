import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
  Alert,
  Keyboard,
  Platform,
  Animated,
  Easing,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import BackButton from "../../../components/BackButton"; // Adjust path
import Button from "../../../components/Button"; // Adjust path
import Typo from "../../../components/Typo"; // Adjust path
import { useAuth } from "../../_layout"; // Import your Auth context
import { authApi } from "../../../services/api";
import AnimatedIcon from "../../../components/AnimatedIcon";

// UPDATE PATH if needed
const passwordIcon = require("../../../assets/images/Password.png");

const PasswordScreen = () => {
  const params = useLocalSearchParams();
  const { email } = params; // Get previous data
  const { login } = useAuth(); // Get login function from context

  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const animatedWrapperStyle = {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  };

  const handleLogin = async () => {
    // Basic validation
    if (password.length < 6) {
      // Keep validation consistent
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters long."
      );
      return;
    }

    setIsLoading(true);

    try {
      // --- Call context login function ---
      await login(email, password);
      router.push("/(tabs)/home");
      // --- Handle Success ---
      console.log("Login successful");
    } catch (error) {
      // --- Handle Error ---
      console.error("Login Error:", error);
      Alert.alert(
        "Login Failed",
        error.message || "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <BackButton />

        <View style={styles.container}>
          <View style={styles.content}>
            <AnimatedIcon iconSource={passwordIcon} />

            <Typo fontWeight="600" size={36} style={styles.title}>
              Enter password
            </Typo>

            <View style={animatedWrapperStyle}>
              <TextInput
                style={styles.input}
                placeholder="Password"
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
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Typo fontWeight="600" size={16} color={"#fff"}>
                {isLoading ? "Signing Up..." : "Complete sign in"}
              </Typo>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

// --- Styles (Keep existing styles from your provided code) ---
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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start", // Align content higher
    paddingHorizontal: 30,
    paddingTop: Platform.OS === "ios" ? 20 : 60, // Consistent padding
  },
  title: {
    lineHeight: 44, // Adjust line height for multi-line text
    textAlign: "center",
    marginBottom: 40,
    color: "#333",
  },
  // animatedWrapperStyle is defined dynamically above

  input: {
    flex: 1,
    fontSize: 24,
    paddingVertical: 10,
    paddingBottom: 10, // Space for underline
    textAlign: "center",
    color: "#000",
    // Remove borders here - handled by wrapper
  },
  eyeIconContainer: {
    padding: 10, // Tappable area for the eye icon
  },
  // eye icon color/size set directly on component
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
    // Style for loading state
    backgroundColor: "#a5d6a7",
  },
  // buttonText style likely handled by Typo component
});

export default PasswordScreen;
