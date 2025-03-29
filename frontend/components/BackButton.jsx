import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons for the chevron
import { useRouter } from 'expo-router';

const BackButton = ({ style, iconColor = '#000', iconSize = 30 }) => {
  const router = useRouter();

  // Function to handle the back navigation
  const handlePress = () => {
    // Check if navigation history allows going back
    if (router.canGoBack()) {
      router.back();
    }
    // Optional: Add fallback behavior if router.canGoBack() is false,
    // e.g., navigate to a default screen like '/home'
    // else { router.replace('/home'); }
  };

  return (
    // TouchableOpacity makes the area pressable
    <TouchableOpacity onPress={handlePress} style={[styles.button, style]}>
      <Ionicons name="chevron-back" size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    // Add some padding to increase the touchable area around the icon
    padding: 5,
    // Default position is relative, alignment usually handled by parent container
    // If you want it absolutely positioned, add position:'absolute', top: ..., left: ...
    // Example:
    // position: 'absolute',
    // top: 10, // Adjust based on Safe Area / Status bar
    // left: 10, // Adjust as needed
    zIndex: 1, // Ensure it's clickable if overlapping other elements
  },
  // Icon styles (size, color) are passed as props for flexibility
});

export default BackButton;