// app/_layout.jsx
import React, { useState, useEffect, createContext, useContext } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import * as SplashScreen from "expo-splash-screen";

// --- Authentication Context ---
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false); // New state
  const [isLoading, setIsLoading] = useState(true); // Start loading

  useEffect(() => {
    const loadInitialState = async () => {
      let token = null;
      let onboardingFlag = false;
      try {
        token = await SecureStore.getItemAsync("authToken");
        if (token) {
          console.log("AuthProvider: Token found:", token ? "Yes" : "No");
          setAuthToken(token);
        }
  
        // *** FIX: Read onboarding flag from AsyncStorage ***
        const flag = await SecureStore.getItemAsync("hasCompletedOnboarding");
        console.log("flag",flag)
        onboardingFlag = flag === "true";
        console.log("AuthProvider: Onboarding complete flag:", onboardingFlag);
        setOnboardingComplete(onboardingFlag);
  
      } catch (e) {
        console.error("AuthProvider: Failed to load initial state", e);
      } finally {
        console.log("AuthProvider: Finished loading initial state.");
        setIsLoading(false);
      }
    };
    loadInitialState();
  }, []);
  
  const login = async (token) => {
    if (!token) {
       console.error("AuthProvider: Login called without token");
       return; // Added early return
    }
    try {
      console.log("AuthProvider: login - Storing token...");
      await SecureStore.setItemAsync("authToken", token);
      console.log("AuthProvider: login - Setting token state...");
      setAuthToken(token); // Update state
  
      // *** FIX: Ensure onboarding flag is written to AsyncStorage ***
      console.log("AuthProvider: login - Marking onboarding complete...");
      await SecureStore.setItemAsync("hasCompletedOnboarding", "true");
      setOnboardingComplete(true); // Update state
      console.log("AuthProvider: login - Token stored, onboarding marked complete.");
  
    } catch (e) {
      console.error("AuthProvider: Failed to save token/flag on login", e);
      // Consider how to handle this - maybe clear token state if storage fails?
      setAuthToken(null);
      setOnboardingComplete(false);
    }
  };
  
  // Keep markOnboardingComplete as is (it correctly uses AsyncStorage)
  const markOnboardingComplete = async () => {
      try {
          await AsyncStorage.setItemAsync('hasCompletedOnboarding', 'true');
          setOnboardingComplete(true);
          console.log("AuthProvider: Onboarding marked as complete.");
      } catch (e) {
           console.error('AuthProvider: Failed to mark onboarding complete', e);
      }
  };
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("authToken");
      setAuthToken(null);
      // Keep onboarding complete flag as true even after logout
      console.log("AuthProvider: logout - Token removed.");
    } catch (e) {
      console.error("AuthProvider: Failed to delete token on logout", e);
    }
  };



  return (
    <AuthContext.Provider
      value={{
        authToken,
        onboardingComplete,
        isLoading,
        login,
        logout,
        markOnboardingComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
// --- End Auth Context ---

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <LayoutLogic />
    </AuthProvider>
  );
}

function LayoutLogic() {
  const { authToken, onboardingComplete, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      console.log("LayoutLogic: Still loading...");
      return; // Do nothing while loading state
    }

    SplashScreen.hideAsync(); // Hide splash screen once loading is done

    const isInTabs = segments[0] === "(tabs)";
    const isInAuth = segments[0] === "(auth)";
    const isOnboarding = segments[0] === "onboarding"; // Assuming onboarding is at app/onboarding.jsx

    console.log(
      `LayoutLogic: isLoading=${isLoading}, authToken=${!!authToken}, onboardingComplete=${onboardingComplete}, isInTabs=${isInTabs}, isInAuth=${isInAuth}, isOnboarding=${isOnboarding}`
    );

    if (authToken) {
      // User is logged in
      if (!isInTabs) {
        console.log("LayoutLogic: Logged in, redirecting to Tabs...");
        router.replace("/(tabs)/home"); // Redirect to main app
      }
    } else {
      // User is not logged in
      if (onboardingComplete) {
        // Onboarding done, should be in auth flow
       
      } else {
        // Onboarding not done yet
        if (!isOnboarding) {
          console.log(
            "LayoutLogic: Not logged in, onboarding incomplete, redirecting to Onboarding..."
          );

        }
      }
    }
  }, [authToken, onboardingComplete, isLoading, segments, router]); // Dependencies for the effect

  // Show loading indicator or return null while loading (SplashScreen handles visual)
  if (isLoading) {
    // return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><ActivityIndicator size="large" /></View>;
    return null;
  }

  // Render the correct navigator based on the current route determined by the logic above
  return <Slot />;
}
