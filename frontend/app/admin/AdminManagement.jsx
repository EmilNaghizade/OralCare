import React from "react";
import { Stack, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AdminManagement = () => {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.replace("/(tabs)/home")}
      >
        <Ionicons name="home-outline" size={22} color="#038565" />
        <Text style={styles.homeButtonText}>Go To Homepage</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdminManagement;

const styles = StyleSheet.create({
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F5F7",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  homeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#038565",
    marginLeft: 4,
  },
});
