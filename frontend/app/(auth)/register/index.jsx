import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Animated,
  StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import Button from "../../../components/Button"; // Import your custom Button
import Typo from "../../../components/Typo";
import BackButton from "../../../components/BackButton";
import AnimatedIcon from "../../../components/AnimatedIcon";

const nameIcon = require("../../../assets/images/nameIconFinal.png");

export default function register() {
  const [name, setName] = useState("");
  const router = useRouter();

  // Interpolate animation value for styles
  const animatedWrapperStyle = {
    // Ensure the wrapper takes the necessary width
    width: "100%",
  };

  const handleNext = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Name Required", "Please enter your name and surname.");
      return; // Stop execution if validation fails
    }

    // Navigate to the next screen (Gender Selection) and pass the name
    // Adjust the pathname to match your file structure in expo-router
    router.push({
      pathname: "/(auth)/register/gender", // <--- UPDATE THIS ROUTE if needed
      params: { name: trimmedName }, // Pass the name as a parameter
    });
  };
  return (
    <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
      {/* KeyboardAvoidingView helps push content up when keyboard shows */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <BackButton />

        <View style={styles.content}>
          <AnimatedIcon iconSource={nameIcon} />

          <Typo fontWeight="600" size={36} style={styles.title}>
            What's your name{"\n"}and surname?
          </Typo>

          <Animated.View style={animatedWrapperStyle}>
            <TextInput
              style={styles.input} // Apply base and animated styles
              placeholder="Name Surname"
              placeholderTextColor="#ccc"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />
          </Animated.View>
        </View>

        {/* Position the button container at the bottom */}
        <View style={styles.buttonContainer}>
          <Button style={styles.button} onPress={handleNext}>
            {/* Use Typo or Text for button label */}

            <Typo color="#fff" fontWeight="bold" size={16}>
              Next
            </Typo>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "space-between", // Pushes content and button container apart
  },
  content: {
    flex: 1,
    alignItems: "center",
    // Changed justifyContent to 'flex-start'
    justifyContent: "flex-start",
    paddingHorizontal: 30,
    // Added paddingTop to push content down from the top edge
    paddingTop: Platform.OS === "ios" ? 20 : 60, // Adjust value as needed
  },

  title: {
    textAlign: "center",
    marginBottom: 40, // Space below title
    color: "#333",
    lineHeight: 44, // Adjust line height for multi-line text
  },
  input: {
    width: "100%",
    fontSize: 28,
    paddingVertical: 10, // Vertical padding inside input
    textAlign: "center", // Center the text input itself
    color: "#333", // Input text color
  },
  buttonContainer: {
    width: "100%", // Take full width
    alignItems: "center", // Center button within the container
    paddingHorizontal: 30, // Match content padding
    paddingBottom: Platform.OS === "ios" ? 30 : 20, // Padding at the very bottom (more for iOS home indicator)
  },
  button: {
    // Assuming your custom Button takes style props for the container
    // If your button styles background/padding internally, you might not need these
    backgroundColor: "#038565", // Green color from image (adjust if needed)
    borderRadius: 25, // Rounded corners
    width: "100%", // Make button take full width of container
    paddingVertical: 15,
    alignItems: "center",
  },

});
