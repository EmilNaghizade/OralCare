import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Using Ionicons for the chevron
import { useRouter } from "expo-router";

const BackButton = ({ style, iconColor = "#000", iconSize = 30, route }) => {
  const router = useRouter();
  const handlePress = () => {
    if (router.canGoBack() && !route) {
      router.back();
    } else if (route) {
      router.replace(route);
    }
  };
  return (
    <TouchableOpacity onPress={handlePress} style={[styles.button, style]}>
      <Ionicons name="chevron-back" size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 5,
    zIndex: 1,
  },
});

export default BackButton;
