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
  TouchableOpacity, // For the eye icon
  Image, // Or import your SVG icon component
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // For the eye icon
import BackButton from "../../../components/BackButton"; // Adjust path
import Button from "../../../components/Button"; // Adjust path
import AsyncStorage from "@react-native-async-storage/async-storage"; // For storing token if backend logs in,
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../../_layout"; // Import your Auth context
// import PasswordIcon from '../../../assets/icons/password-icon.svg'; // Example if using SVG
import Typo from "../../../components/Typo";

// Placeholder for PNG icon - UPDATE PATH
const passwordIcon = require("../../../assets/images/Password.png");

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
// Define endpoint directly or read from .env (e.g., process.env.EXPO_PUBLIC_REGISTER_ENDPOINT)
const REGISTER_ENDPOINT = process.env.EXPO_PUBLIC_REGISTER_ENDPOINT;
const HOME_ROUTE = "/(tabs)/home"; // Adjust route

// --- Check if Base URL is set ---
if (!API_BASE_URL) {
  console.error("ERROR: EXPO_PUBLIC_API_BASE_URL is not set in .env file");
  // Alert.alert("Configuration Error", "API Base URL is not configured."); // Optional alert
}

// --- API Registration Function ---
const registerUserApi = async (userData) => {
  if (!API_BASE_URL) {
    throw new Error("API Base URL is not configured.");
  }
  console.log("Registering user:", userData);
  try {
    const response = await fetch(`${API_BASE_URL}${REGISTER_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData), // Send all collected user data
    });

    const data = await response.json();

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
  const { name, gender, email } = params; // Get all previous data
  const { login } = useAuth(); // Get login function from context

  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State for visibility
  const [isFocused, setIsFocused] = useState(false); // State for animation
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator on button

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

  // Animated styles for the input wrapper view (containing input and icon)
  const animatedWrapperStyle = {
    width: "100%",
    flexDirection: "row", // Arrange input and eye icon horizontally
    alignItems: "center", // Align items vertically
  };

  const handleSignUp = async () => {
    // Basic validation
    if (password.length < 6) {
      // Example: Minimum 8 characters
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters long."
      );
      return;
    }

    setIsLoading(true); // Show loading state

    try {
      const userData = { name, gender, email, password };
      console.log(userData);
      // --- Call the actual backend API function ---
      const result = await registerUserApi(userData);

      // --- Handle Success ---
      console.log("API Registration Result:", result);

      // Check if the backend automatically logs the user in and sends a token
      if (result && result.token) {
        // --- Call context login function ---
        await login(result.token, result.name, result.profileImage);
        // *** REMOVE navigation from here - handled by _layout ***
        // router.replace(HOME_ROUTE);
        console.log("Register success: Context login called.");
      } else {
        // If backend doesn't log in automatically, redirect to login screen
        Alert.alert("Registration Successful", "Please log in.");
        router.push("/(auth)/login"); // Keep navigation here as user is NOT logged in yet
      }
    } catch (error) {
      // --- Handle Error ---
      console.error("Registration Error:", error);
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
      <BackButton />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Replace with SVG if using SVG */}
          <Image source={passwordIcon} style={styles.icon} />
          {/* <PasswordIcon width={60} height={60} fill="#4CAF50" style={styles.iconSvg} /> */}

          <Typo fontWeight="600" size={36} style={styles.title}>
            Create password
          </Typo>
          {/* Animated Wrapper for Input + Eye Icon */}
          <View style={animatedWrapperStyle}>
            <TextInput
              style={styles.input}
              placeholder="Password" // Placeholder matching image
              placeholderTextColor="#ccc"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible} // Toggle based on state
              autoCapitalize="none"
              autoComplete="password" // Help suggest strong passwords
              textContentType="password" // Semantic meaning (iOS)
              returnKeyType="done" // Keyboard return key says "Done"
              onSubmitEditing={handleSignUp} // Allow submitting via keyboard

            />
            {/* Eye Icon Button */}
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.eyeIconContainer}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off" : "eye"} // Change icon based on state
                size={24}
                color="#888" // Icon color
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={isLoading} // Disable button while loading
          >
            {/* Show loading indicator or text */}
            <Typo
              fontWeight="600"
              size={16}
              color={"#fff"}
              style={styles.buttonText}
            >
              {isLoading ? "Signing Up..." : "Complete sign up"}
            </Typo>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    paddingTop: Platform.OS === "ios" ? 0 : 10,
    paddingLeft: 15,
    paddingBottom: 5,
    width: "100%",
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
  },
  title: {
    textAlign: "center",
    marginBottom: 40,
    color: "#333",
  },
  // animatedWrapperStyle is defined dynamically above

  input: {
    flex: 1, // Allow input to take available space next to icon
    fontSize: 25,
    paddingVertical: 10,
    paddingBottom: 10, // Space for underline
    textAlign: "center",
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
  buttonText: {
    color: "#fff",
  },
});

export default PasswordScreen;
