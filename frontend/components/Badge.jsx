// components/Badge.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Typo from "./Typo";

const Badge = ({ label, style, textStyle,children }) => {
  return (
    // View for the badge container
    <View style={[styles.badgeContainer, style]}>
      {/* Text to display the label */}
      <Typo style={[styles.badgeText, textStyle]}>{children}</Typo>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: "#fff", // Light gray background (adjust as needed)
    borderRadius: 20, // High value for pill shape
    borderColor:"#000",
    paddingHorizontal: 12, // Horizontal space around text
    paddingVertical: 6, // Vertical space around text
    alignSelf: "flex-start", // Make the badge only as wide as its content + padding
    // Optional subtle border:
    // borderWidth: 1,
    // borderColor: '#e2e8f0',
  },
  badgeText: {
    fontSize: 12, // Small font size
    fontWeight: "500", // Medium weight
    color: "#4a5568", // Dark blue-gray text color (adjust as needed)
  },
});

export default Badge;
