// app/(tabs)/_layout.jsx
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Or your preferred icon library

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

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTabColor, // Color for the active tab icon and label
        tabBarInactiveTintColor: "gray", // Color for inactive tabs
        // You can add other options like tabBarShowLabel: false, etc.
        // headerShown: false, // Usually hide the default header in tabs layout
      }}
    >
      <Tabs.Screen
        name="home" // Matches the filename home.jsx
        options={{
          title: "Home", // Tab bar label
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
        name="education" // Matches education.jsx
        options={{
          title: "Education",
          tabBarIcon: ({ color, focused }) => (
            // Choose an appropriate icon name
            <TabBarIcon
              name={focused ? "school" : "school-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="contact" // Matches contact.jsx
        options={{
          title: "Contact",
          tabBarIcon: ({ color, focused }) => (
            // Choose an appropriate icon name
            <TabBarIcon
              name={focused ? "mail" : "mail-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="products" // Matches products.jsx
        options={{
          title: "Products",
          tabBarIcon: ({ color, focused }) => (
            // Choose an appropriate icon name
            <TabBarIcon
              name={focused ? "cart" : "cart-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile" // Matches profile.jsx
        options={{
          title: "Profile",
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
