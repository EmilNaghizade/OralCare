
// Add a navigation file for the Admin Panel
// frontend/admin/_layout.jsx
import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../_layout';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminLayout() {
  const { user } = useAuth();
  
  // Ensure only admin users can access this section
  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>You don't have permission to access this page.</Text>
      </View>
    );
  }

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
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ArticleManagement"
        options={{
          title: "Article Management",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ProductManagement"
        options={{
          title: "Product Management",
          headerShown: true,
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