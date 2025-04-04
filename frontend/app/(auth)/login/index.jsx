import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  Image, 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button"; 
import Typo from "../../../components/Typo";
import { authApi } from "../../../services/api";


const emailIcon = require("../../../assets/images/Email.png");

const NEXT_SCREEN_ROUTE = "/(auth)/login/password"; 

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const [email, setEmail] = useState("");

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
      const response = await authApi.checkEmail(trimmedEmail);
      console.log(response.exists, "RESPONSE HEYYY");
      if (response.exists) {
        router.push({
          pathname: NEXT_SCREEN_ROUTE,
          params: { email: trimmedEmail },
        });
      }
    } catch (error) {
      console.error("Error during email check:", error); // Tüm hatayı logla
      Alert.alert("Error", "User not found. Please try again.");
    }
    if (error) {
      console.error("Error response status:", error.response.status); // Durum kodunu logla
      console.error("Error response data:", error.response.data); // Dönen veriyi logla
      if (error.response.status === 404) {
        Alert.alert("Error", "User not found.");
      } else {
        // Daha genel bir hata mesajı gösterilebilir
        Alert.alert(
          "Error",
          "An error occurred during login. Please try again."
        );
       
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackButton />
      <View style={styles.container}>
        <View style={styles.content}>
          <Image source={emailIcon} style={styles.icon} />

          <Typo fontWeight="600" size={36} style={styles.title}>
            Enter your email
          </Typo>

          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
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
            />
          </View>
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
    paddingHorizontal: 30, // Match content padding
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

export default Login;
