// app/onboarding/_layout.jsx
import React from "react";
import { Stack } from "expo-router"; // Or Slot if no header needed

export default function OnboardingLayout() {
  // Use Stack if you want a header potentially, or Slot for just content
  // Hiding the default header as your onboarding screen likely handles its own look
  return <Stack screenOptions={{ headerShown: false }} />;
  // Or simply:
  // return <Slot />;
}
