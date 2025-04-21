import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  StatusBar, // For the eye icon
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // For the eye icon
import BackButton from "../../../components/BackButton"; // Adjust path
import Button from "../../../components/Button"; // Adjust path
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../../_layout"; // Import your Auth context
import Typo from "../../../components/Typo";
import { authApi } from "../../../services/api";
import AnimatedIcon from "../../../components/AnimatedIcon";

// Placeholder for PNG icon - UPDATE PATH
const passwordIcon = require("../../../assets/images/Password.png");

const PasswordScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { name, gender, email } = params; // Get all previous data
  const { login } = useAuth(); // Get login function from context
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State for visibility
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator on button

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
      const response = await authApi.register(userData);
      // --- Handle Success ---
      console.log("API Registration Result:", response);

      // Check if the backend automatically logs the user in and sends a token
      if (response && response.token) {
        await login(email, password);
        router.replace("(tabs)/home");
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
                    <StatusBar barStyle="dark-content" />
        
        <BackButton />

        <View style={styles.container}>
          <View style={styles.content}>
            {/* Replace with SVG if using SVG */}
            <AnimatedIcon iconSource={passwordIcon} />

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
    paddingTop: Platform.OS === "ios" ? 20 : 60, // Consistent padding
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
