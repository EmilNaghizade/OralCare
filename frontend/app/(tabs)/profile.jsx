// app/(tabs)/profile.jsx (Example)
import React from "react";
import { View, Button } from "react-native";
import { useAuth } from "../_layout"; // Assuming AuthContext is exported from root layout or context file
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { logout } = useAuth(); // Get logout function from context
  const router = useRouter();

  const handleLogout = () => {
    console.log("Logging out...");

    logout(); // Clears token and updates context state
    router.replace("/onboarding"); // Redirect to login screen
    
    // The root layout's useEffect will automatically redirect to login
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {/* ... other profile content ... */}
      <Button title="Log Out" onPress={handleLogout} color="red" />
    </View>
  );
}
