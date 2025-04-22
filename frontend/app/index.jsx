import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "./_layout";

export default function App() {
  const { isLoading, authToken, user } = useAuth();

  if (isLoading) {
    return null; // Loading zamanı heç nə göstərməyək
  }

  // Auth yoxdursa → onboarding
  if (!authToken) {
    return <Redirect href="/onboarding" />;
  }

  // Auth varsa, user də gəlibsə → role yoxlanır
  if (user?.role === "admin") {
    return <Redirect href="/admin" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
