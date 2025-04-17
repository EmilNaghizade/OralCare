// frontend/admin/index.jsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../_layout";
import { View, Text, StyleSheet } from "react-native";
import VideoManagement from "./VideoManagement";
import ArticleManagement from "./ArticleManagement";
import ProductManagement from "./ProductManagement";

const Tab = createBottomTabNavigator();

export default function AdminPanel() {
  const { user } = useAuth();

  // Check if user has admin role
  if (!user || user.role !== "admin") {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          You don't have permission to access this page.
        </Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Videos") {
            iconName = focused ? "videocam" : "videocam-outline";
          } else if (route.name === "Articles") {
            iconName = focused ? "document-text" : "document-text-outline";
          } else if (route.name === "Products") {
            iconName = focused ? "pricetag" : "pricetag-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Videos" component={VideoManagement} />
      <Tab.Screen name="Articles" component={ArticleManagement} />
      <Tab.Screen name="Products" component={ProductManagement} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
  },
});

  
  