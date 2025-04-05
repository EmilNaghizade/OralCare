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
  Image, // Or import your SVG icon component
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import BackButton from "../../../components/BackButton"; // Adjust path
import Button from "../../../components/Button"; // Adjust path
import Typo from "../../../components/Typo";

// Placeholder for PNG icon - UPDATE PATH
const emailIcon = require("../../../assets/images/Email.png");

const NEXT_SCREEN_ROUTE = "/(auth)/register/password"; // <-- UPDATE if needed
const BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Simple email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EmailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams(); // Get params passed from previous screen
  const { name, gender } = params; // Extract previous data

  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false); // State for animation
  const focusAnim = useRef(new Animated.Value(0)).current; // Animation value

  useEffect(() => {
    // Input focus animation logic (same as EnterNameScreen)
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnim]);

  // Animated styles for the input wrapper
  const animatedWrapperStyle = {
    width: "100%",
  };

  const validateEmail = (emailToValidate) => {
    return emailRegex.test(emailToValidate);
  };

  const handleNext = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert("Email Required", "Please enter your email address.");
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      // Backend'e e-posta kontrolü için istek gönder
      const response = await fetch(
        `${BACKEND_URL}/api/auth/check-email?email=${trimmedEmail}`,
        {
          // YOUR_BACKEND_API_ENDPOINT yerine backend adresinizi yazın
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.exists) {
        // E-posta veritabanında varsa uyarı göster
        Alert.alert(
          "Email Already Exists",
          "This email is already registered. Please use a different email address."
        );
      } else {
        // E-posta veritabanında yoksa bir sonraki ekrana geç
        router.push({
          pathname: NEXT_SCREEN_ROUTE,
          params: { name, gender, email: trimmedEmail },
        });
      }
    } catch (error) {
      console.error("Error checking email:", error);
      Alert.alert(
        "Error",
        "An error occurred while checking the email. Please try again later."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackButton />
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Replace with SVG if using SVG */}
          <Image source={emailIcon} style={styles.icon} />
          {/* <EmailIcon width={60} height={60} fill="#4CAF50" style={styles.iconSvg} /> */}

          <Typo fontWeight="600" size={36} style={styles.title}>
            Enter your email
          </Typo>

          {/* Animated Wrapper + TextInput */}
          <Animated.View style={animatedWrapperStyle}>
            <TextInput
              style={styles.input}
              placeholder="user@gmail.com" // Placeholder matching image
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address" // Use email keyboard
              autoCapitalize="none" // Disable auto-capitalization
              autoComplete="email" // Help with autofill
              textContentType="emailAddress" // Help with autofill (iOS)
              returnKeyType="next" // Keyboard return key says "Next"
              onSubmitEditing={handleNext} // Allow submitting via keyboard
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </Animated.View>
        </View>

        <View style={styles.buttonContainer}>
          <Button style={styles.button} onPress={handleNext}>
            <Typo
              fontWeight="600"
              size={16}
              color={"#fff"}
              style={styles.buttonText}
            >
              Next
            </Typo>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1, // Take remaining space
    justifyContent: "space-between", // Push content up, button down
    paddingHorizontal: 30, // Push content up, button down
  },
  content: {
    flex: 1, // Allow content to take space
    alignItems: "center",
    justifyContent: "flex-start", // <--- Change to 'flex-start'
    paddingHorizontal: 30,
    paddingBottom: 20,
    paddingTop: Platform.OS === "ios" ? 80 : 60, // <-- Add paddingTop like other screens (adjust value if needed)
  },
  icon: {
    // Style for PNG
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  title: {
    lineHeight: 44, // Adjust line height for multi-line text
    textAlign: "center",
    marginBottom: 40,
    color: "#000",
  },
  input: {
    // Base input styles (border handled by animated wrapper)
    width: "100%",
    fontSize: 24,
    paddingVertical: 10,
    paddingBottom: 10, // Space for underline
    textAlign: "center",
    color: "#000",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20, // Match content padding
    paddingBottom: Platform.OS === "ios" ? 30 : 20, // Space from bottom
  },
  button: {
    backgroundColor: "#038565",
    borderRadius: 25,
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
  },
});

export default EmailScreen;
