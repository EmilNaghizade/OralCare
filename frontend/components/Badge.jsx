// components/Badge.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Typo from "./Typo";

const Badge = ({ label, style, textStyle, children }) => {
  return (
    // View for the badge container
    <View style={styles.badgeContainer}>
      <Text style={styles.badgeText}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DFEAEF",
    // --- DEĞİŞİKLİK ---
    borderRadius: 24, // Yuvarlak köşeler 24 olarak güncellendi
    // --- DEĞİŞİKLİK ---
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  badgeText: {
    color: "#4a4a4a",
    fontSize: 11,
    fontWeight: "500",
  },
});

export default Badge;
