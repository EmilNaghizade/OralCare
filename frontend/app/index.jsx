import React, { useEffect } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "./_layout";

export default function App() {
  const { isLoading, authToken } = useAuth();

  // If loading, don't redirect yet
  if (isLoading) {
    return null; // Or return a splash screen/loading component
  }

  // Only redirect if we know the auth state
  return authToken ? (
    <Redirect href="/(tabs)/home" />
  ) : (
    <Redirect href="/onboarding" />
  );
}
