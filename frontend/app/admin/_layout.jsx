// frontend/app/admin/_layout.jsx
import React from "react";
import { Stack, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AdminLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Admin Panel</Text>
          </View>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="VideoManagement"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ArticleManagement"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="NewsManagement"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProductManagement"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="QuizManagement"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Admin"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F5F7",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  homeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#038565",
    marginLeft: 4,
  },
});
