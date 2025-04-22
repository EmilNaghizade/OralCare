// app/(modal)/_layout.jsx
import React from "react";
import { Stack } from "expo-router";

export default function ModalLayout() {
  // Using Stack to manage header configurations defined in child screens
  return <Stack screenOptions={{ headerShown: false }} />; // Default hide header here
}
