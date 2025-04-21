
// Add a navigation file for the Admin Panel
// frontend/admin/_layout.jsx
import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminLayout() {


  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Admin Panel",
          headerShown: true,
          
        }}
      />
      <Stack.Screen
        name="VideoManagement"
        options={{
          title: "Video Management",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ArticleManagement"
        options={{
          title: "Article Management",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProductManagement"
        options={{
          title: "Product Management",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
});