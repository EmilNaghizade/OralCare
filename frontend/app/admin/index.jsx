// frontend/admin/index.jsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, BackHandler, Platform } from "react-native";
import VideoManagement from "./VideoManagement";
import ArticleManagement from "./ArticleManagement";
import ProductManagement from "./ProductManagement";
import AdminManagement from "./AdminManagement";
import NewsManagement from "./NewsManagement"; // Import the NewsManagement component
import QuizManagement from "./QuizManagement"; // Add quiz management import

const Tab = createBottomTabNavigator();

export default function AdminPanel() {
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === "android") {
          BackHandler.exitApp(); // exits the app
          return true; // prevent default behavior
        }
        return false;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Videos") {
            iconName = focused ? "videocam" : "videocam-outline";
          } else if (route.name === "Articles") {
            iconName = focused ? "document-text" : "document-text-outline";
          } else if (route.name === "News") {
            // Add News tab
            iconName = focused ? "newspaper" : "newspaper-outline";
          } else if (route.name === "Products") {
            iconName = focused ? "pricetag" : "pricetag-outline";
          } else if (route.name === "Quizzes") {
            iconName = focused ? "help-circle" : "help-circle-outline";
          } else if (route.name === "Admin") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Videos"
        options={{ headerShown: false }}
        component={VideoManagement}
      />
      <Tab.Screen
        name="Articles"
        options={{ headerShown: false }}
        component={ArticleManagement}
      />
      <Tab.Screen
        name="News"
        options={{ headerShown: false }}
        component={NewsManagement}
      />

      <Tab.Screen
        name="Products"
        options={{ headerShown: false }}
        component={ProductManagement}
      />
      <Tab.Screen
        name="Quizzes"
        options={{ headerShown: false }}
        component={QuizManagement}
      />
      <Tab.Screen
        name="Admin"
        options={{ headerShown: false }}
        component={AdminManagement}
      />
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
