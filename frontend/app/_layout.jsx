// app/_layout.jsx

import "react-native-gesture-handler";
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator, View, Text } from "react-native";
import { authApi } from "../services/api";
import "../i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

// --- Authentication Context ---
const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(null);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Başlangıçta yükleniyor
  const [userPoints, setUserPoints] = useState(0); // <<< YENİ: Quiz Puanları State'i
  const router = useRouter();
  const hasNavigated = React.useRef(false);
  const [appIsReady, setAppIsReady] = useState(false);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log("Starting to load initial data...");

        // Load token
        let token = null;
        try {
          token = await SecureStore.getItemAsync("authToken");
          if (token) {
            setAuthToken(token);
            console.log("Auth token loaded successfully");
            console.log("🔑 Current token:", token.substring(0, 50) + "...");
            console.log("🔑 Full token length:", token.length);
          } else {
            console.log("❌ No token found in storage");
          }
        } catch (e) {
          console.error("[AuthProvider] Initial state loading error:", e);
        }

        // Load user points
        try {
          const storedPoints = await SecureStore.getItemAsync(
            "userTotalPoints"
          );
          setUserPoints(parseInt(storedPoints || "0", 10));
          console.log("User points loaded successfully");
        } catch (e) {
          console.error("Failed to load points from secure storage:", e);
        }

        // Get user profile
        try {
          const storedToken = await SecureStore.getItemAsync("authToken");
          if (storedToken) {
            setAuthToken(storedToken);
            const storedUser = await SecureStore.getItemAsync("user");
            if (storedUser) {
              setUser(JSON.parse(storedUser));
              console.log("User loaded from secure storage");
            }

            // Try to get fresh user data from API
            try {
              const response = await authApi.getProfile(storedToken);
              setUser(response);
              await SecureStore.setItemAsync("user", JSON.stringify(response));
              console.log("Fresh user profile loaded from API");
            } catch (profileError) {
              console.log(
                "Using cached user data instead of API due to error:",
                profileError
              );
              // We'll continue with the cached user data
            }
          }
        } catch (error) {
          console.error("[AuthProvider getProfile] ERROR:", error);
        }

        // Load completed quizzes
        try {
          const storedQuizzes = await SecureStore.getItemAsync(
            "completedQuizzes"
          );
          if (storedQuizzes) {
            setCompletedQuizzes(JSON.parse(storedQuizzes));
            console.log("Completed quizzes loaded successfully");
          }
        } catch (e) {
          console.error("Failed to load completed quizzes:", e);
        }

        // Add a small artificial delay for smoother experience
        // This gives time for React Native to initialize properly
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log("Initial data loading complete");
      } catch (e) {
        console.warn("Error during app preparation:", e);
      } finally {
        console.log("Setting app as ready");
        // Mark app as ready to render
        setAppIsReady(true);
        setIsLoading(false);
      }
    }

    prepare();
  }, []); // Sadece component mount edildiğinde çalışır

  useEffect(() => {
    if (appIsReady) {
      const hideSplashScreen = async () => {
        await SplashScreen.hideAsync();
      };
      hideSplashScreen();
    }
  }, [appIsReady]);

  // Modified getAdmin useEffect
  useEffect(() => {
    const navigateUser = async () => {
      if (isLoading || hasNavigated.current || !appIsReady) return;

      if (!authToken || !user) {
        hasNavigated.current = true;
        router.replace("/onboarding");
      } else if (authToken && user && user?.role) {
        hasNavigated.current = true;
        console.log("User role is:", user.role);
        if (user.role === "admin") {
          console.log("Navigating to /admin");
          router.replace("/admin");
        } else {
          router.replace("/(tabs)/home");
        }
      } else {
        console.log("User or role not ready yet, waiting...");
      }
    };

    navigateUser();
  }, [isLoading, authToken, user?.role, appIsReady]);

  // Login fonksiyonu: token ve user objesini alır (API response'dan)
  // Login function without routing
  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      const { token, user } = response;

      // Validate token before storing
      if (
        !token ||
        typeof token !== "string" ||
        token.split(".").length !== 3
      ) {
        console.error("Invalid token received from server:", token);
        throw new Error("Received invalid authentication token");
      }

      console.log("Received valid token, storing...");

      // Set in state
      setAuthToken(token);
      setUser(user);

      console.log("User role is:", user.role);
      if (user?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/(tabs)/home");
      }

      // Store in SecureStore
      try {
        await SecureStore.setItemAsync("authToken", token);
        await SecureStore.setItemAsync("user", JSON.stringify(user));
        console.log("Token and user data saved successfully");
      } catch (storageError) {
        console.error("Failed to store authentication data:", storageError);
        // Continue anyway - state is already set
      }

      // Let the useEffect handle routing based on user role
      // REMOVE the routing logic from here

      return user;
    } catch (error) {
      console.error("[AuthProvider login] ERROR:", error);
      throw error;
    }
  };

  // Logout fonksiyonu
  const logout = async () => {
    try {
      // Try API logout first, but don't fail if it errors
      try {
        await authApi.logout(authToken);
      } catch (apiError) {
        console.log(
          "[AuthProvider] API logout failed, continuing with local logout:",
          apiError
        );
      }

      // Always clear local storage regardless of API success/failure
      setAuthToken(null);
      setUser(null);
      await SecureStore.deleteItemAsync("authToken");
      await SecureStore.deleteItemAsync("user");
      await SecureStore.deleteItemAsync("userTotalPoints");
      router.push("/onboarding");
      console.log("[AuthProvider] Logout completed successfully");
    } catch (error) {
      console.error("[AuthProvider logout] HATA:", error);
      // Even if there's an error, try to clear storage
      try {
        setAuthToken(null);
        setUser(null);
        await SecureStore.deleteItemAsync("authToken");
        await SecureStore.deleteItemAsync("user");
        router.push("/onboarding");
      } catch (cleanupError) {
        console.error("[AuthProvider] Cleanup failed:", cleanupError);
      }
    }
  };

  const updateUserPoints = async (pointsToAdd) => {
    const newTotalPoints = userPoints + pointsToAdd;
    setUserPoints(newTotalPoints);
    // Puanları kalıcı hale getir (örn: AsyncStorage)
    try {
      await SecureStore.setItemAsync(
        "userTotalPoints",
        newTotalPoints.toString()
      );
    } catch (e) {}
    // !!! Backend olsaydı burada API'ye de gönderilebilirdi !!!
  };

  const value = {
    authToken,
    user,
    isLoading,
    userPoints,
    login,
    logout,
    updateUserPoints,
  };

  if (!appIsReady) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#ffffff",
          }}
        >
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10, color: "#666" }}>
            Loading your app...
          </Text>
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
// --- End Auth Context ---

// --- Kök Layout Component ---
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
