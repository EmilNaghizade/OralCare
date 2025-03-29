import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Easing,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // For storing token if backend logs in
import * as SecureStore from "expo-secure-store";
import BackButton from "../../../components/BackButton"; // Adjust path
import Button from "../../../components/Button"; // Adjust path
import Typo from "../../../components/Typo"; // Adjust path
import { useAuth } from "../../_layout"; // Import your Auth context

// UPDATE PATH if needed
const passwordIcon = require("../../../assets/images/Password.png");

// --- Configuration ---
// Read from environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
// Define endpoint directly or read from .env (e.g., process.env.EXPO_PUBLIC_REGISTER_ENDPOINT)
const REGISTER_ENDPOINT = process.env.EXPO_PUBLIC_LOGIN_ENDPOINT;
const HOME_ROUTE = "/(tabs)/home"; // Adjust route

// --- Check if Base URL is set ---
if (!API_BASE_URL) {
  console.error("ERROR: EXPO_PUBLIC_API_BASE_URL is not set in .env file");
  // Alert.alert("Configuration Error", "API Base URL is not configured."); // Optional alert
}

// --- API Registration Function ---
const registerUserApi = async (loginData) => {
  if (!API_BASE_URL) {
    throw new Error("API Base URL is not configured.");
  }

  console.log(loginData, "LOGIN DATA");
  try {
    const response = await fetch(`${API_BASE_URL}${REGISTER_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData), // Send all collected user data
    });

    const data = await response.json();
    console.log(data, "DATA");

    if (!response.ok) {
      // Throw error with backend message
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    console.log("Registration successful:", data);
    // Return data from backend (might include user info, maybe a token)
    return data;
  } catch (error) {
    console.error("API Registration Error:", error);
    throw error; // Re-throw to be caught in handleSignUp
  }
};

const PasswordScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email } = params; // Get previous data
  const { login } = useAuth(); // Get login function from context

  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Input focus animation
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnim]);

  const animatedWrapperStyle = {
    borderBottomColor: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["#ccc", "#038565"], // Use theme color
    }),
    borderBottomWidth: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2],
    }),
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
      const loginData = { email, password };
      // --- Call the actual backend API function ---
      const result = await registerUserApi(loginData);

      // --- Handle Success ---
      console.log("API Registration Result:", result);

      // Check if the backend automatically logs the user in and sends a token
      if (result.token) {
        // --- Call context login function ---
        await login(result.token);
        // *** REMOVE navigation from here - handled by _layout ***
        // router.replace(HOME_ROUTE);
        console.log("Login success: Context login called.");
      } else {
        // Should be caught by loginUserApi error handling, but as fallback:
        throw new Error("Login successful, but no token received.");
      }
    } catch (error) {
      // --- Handle Error ---
      console.error("Registration Error: 144", error);
      Alert.alert(
        "Registration Failed",
        error.message || "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Back button was missing in the provided code, added it back */}
      <View style={styles.headerContainer}>
        <BackButton />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          <Image source={passwordIcon} style={styles.icon} />

          <Typo fontWeight="600" size={36} style={styles.title}>
            Enter password
          </Typo>

          <Animated.View style={animatedWrapperStyle}>
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
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
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
          </Animated.View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Typo
              fontWeight="600"
              size={16}
              color={"#fff"}
              // style={styles.buttonText} // Typo handles styling
            >
              {isLoading ? "Signing Up..." : "Complete sign in"}
            </Typo>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Styles (Keep existing styles from your provided code) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  // Added headerContainer style from previous examples
  headerContainer: {
    paddingTop: Platform.OS === "ios" ? 0 : 10,
    paddingLeft: 15,
    paddingBottom: 5,
    width: "100%",
    alignSelf: "flex-start", // Keep back button left aligned
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start", // Align content higher
    paddingHorizontal: 30,
    paddingTop: Platform.OS === "ios" ? 80 : 60, // Consistent padding
  },
  icon: {
    // Style for PNG
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 30, // Added margin below icon
  },
  title: {
    textAlign: "center",
    marginBottom: 40,
    color: "#333",
  },
  // animatedWrapperStyle is defined dynamically above

  input: {
    flex: 1, // Allow input to take available space next to icon
    fontSize: 20, // Adjusted size slightly
    paddingVertical: 10,
    paddingBottom: 10, // Space for underline
    textAlign: "left", // Changed to left align
    paddingLeft: 10, // Added padding for left align
    color: "#333",
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
