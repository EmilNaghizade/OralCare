import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image, // Or import your SVG icon component
  Platform,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import BackButton from "../../../components/BackButton"; // Adjust path
import Button from "../../../components/Button"; // Adjust path
import Typo from "../../../components/Typo";
// import GenderIcon from '../../../assets/icons/gender-icon.svg'; // Example if using SVG

// Placeholder for PNG icon - UPDATE PATH
const genderIcon = require("../../../assets/images/Gender.png");

const genders = ["Man", "Woman", "Prefer not to say"];
const NEXT_SCREEN_ROUTE = "/(auth)/register/email"; // <-- UPDATE if needed

const GenderSelectionScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams(); // Get params passed from previous screen
  const { name } = params; // Extract the name

  const [selectedGender, setSelectedGender] = useState(null); // State for selected gender

  const handleSelectGender = (gender) => {
    setSelectedGender(gender);
  };

  const handleNext = () => {
    if (!selectedGender) {
      Alert.alert("Selection Required", "Please select your gender.");
      return;
    }

    // Navigate to the next screen, passing name and selected gender
    router.push({
      pathname: NEXT_SCREEN_ROUTE,
      params: { name: name, gender: selectedGender },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackButton />

      {/* Use flex: 1 and space-between to push button to bottom */}
      <View style={styles.container}>
        {/* Content Area */}
        <View style={styles.content}>
          {/* Replace with SVG if using SVG */}
          <Image source={genderIcon} style={styles.icon} />
          {/* <GenderIcon width={60} height={60} fill="#4CAF50" style={styles.iconSvg} /> */}

          <Typo fontWeight="600" size={36} style={styles.title}>
            Select your gender
          </Typo>

          {/* Gender Options */}
          <View style={styles.optionsContainer}>
            {genders.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.optionButton,
                  // Apply selected style if this gender matches the state
                  selectedGender === gender && styles.selectedOptionButton,
                ]}
                onPress={() => handleSelectGender(gender)}
              >
                <Typo fontWeight="600" size={18} style={styles.optionText}>
                  {gender}
                </Typo>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Button Container */}
        <View style={styles.buttonContainer}>
          <Button
            style={[styles.button, !selectedGender && styles.disabledButton]} // Optionally disable style
            onPress={handleNext}
            disabled={!selectedGender} // Optionally disable press
          >
            <Text style={styles.buttonText}>Next</Text>
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
    paddingHorizontal: 30,
  },
  content: {
    // flex: 1, // Allow content to take up space but not push button excessively
    alignItems: "center",
    paddingTop: 20, // Space below header/back button
  },
  icon: {
    // Style for PNG
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 30,
    // tintColor: '#4CAF50' // Use tintColor if needed for PNG
  },
  iconSvg: {
    // Style for SVG
    marginBottom: 30,
  },
  title: {
    lineHeight: 44, // Adjust line height for multi-line text
    textAlign: "center",
    marginBottom: 40,
    color: "#333",
  },
  optionsContainer: {
    width: "100%", // Options take full width of padding
  },
  optionButton: {
    backgroundColor: "#F0F5F7", // Light grey background
    paddingVertical: 18, // Make buttons taller
    paddingHorizontal: 15,
    borderRadius: 15, // Rounded corners
    marginBottom: 15, // Space between buttons
    alignItems: "center", // Center text horizontally
    borderWidth: 1,
    borderColor: "transparent", // Default transparent border
  },
  selectedOptionButton: {
    // Green background when selected
    borderColor: "#038565", // Green border when selected
    borderWidth: 1,
  },
  optionText: {
    color: "#000", // Dark text color for non-selected
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 30 : 20, // Space from bottom edge
    marginTop: 20, // Add space above button if options list gets long
  },
  button: {
    backgroundColor: "#038565",
    borderRadius: 25,
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
  },
  disabledButton: {
    // Optional style for disabled button state
    backgroundColor: "#a5d6a7", // Lighter green
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default GenderSelectionScreen;
