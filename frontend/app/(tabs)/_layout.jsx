// app/(tabs)/_layout.jsx
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Or your preferred icon library
import "../../i18n"; // Import your i18n setup if needed

import { useTranslation } from "react-i18next"; // Import i18n hook

// Define a helper function for tabBarIcon for cleaner code
const TabBarIcon = ({ name, color }) => {
  return (
    <Ionicons
      size={28}
      style={{ marginBottom: -3 }}
      name={name}
      color={color}
    />
  );
};

export default function TabLayout() {
  // Define your active tab color (e.g., your app's theme color)
  const activeTabColor = "#038565"; // Example green color
  const { t } = useTranslation(); // Initialize the translation hook
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTabColor, // Color for the active tab icon and label
        tabBarInactiveTintColor: "gray", // Color for inactive tabs
        // You can add other options like tabBarShowLabel: false, etc.
        headerShown: false, // Usually hide the default header in tabs layout
        tabBarStyle: {
          height: 70, 
          paddingTop: 8, // Add padding at the top
          paddingBottom: 8, // Add padding at the bottom
        },
        tabBarLabelStyle: {
          marginTop: 4, // Add space between icon and label
        },
      }}
    >
      <Tabs.Screen
        name="home" // Matches the filename home.jsx
        options={{
          title: t("tabs.home"), // Tab bar label
          // headerShown: true, // Optionally show header for specific tabs
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="products" // Matches products.jsx
        options={{
          title: t("tabs.products"),
          tabBarIcon: ({ color, focused }) => (
            // Choose an appropriate icon name
            <TabBarIcon
              name={focused ? "briefcase" : "briefcase-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile" // Matches profile.jsx
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "person-circle" : "person-circle-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
