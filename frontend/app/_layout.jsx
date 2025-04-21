// app/_layout.jsx
import React, { useState, useEffect, createContext, useContext } from "react";
import { Slot, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { ActivityIndicator, View } from "react-native";
import { authApi } from "../services/api";

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

  useEffect(() => {
    const loadInitialState = async () => {
      let token = null;
      try {
        token = await SecureStore.getItemAsync("authToken");
        if (token) {
          setAuthToken(token);
        }
      } catch (e) {
        console.error("[AuthProvider] Başlangıç state yükleme hatası:", e);
      }
    };
    const loadInitialPoints = async () => {
      try {
        const storedPoints = await SecureStore.getItemAsync("userTotalPoints");
        setUserPoints(parseInt(storedPoints || "0", 10));
      } catch (e) {
        console.error("Failed to load points from AsyncStorage", e);
      }
    };
    const getProfile = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("authToken");
        if (storedToken) {
          setAuthToken(storedToken);
          const storedUser = await SecureStore.getItemAsync("user");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          const response = await authApi.getProfile(storedToken);
          setUser(response);
          await SecureStore.setItemAsync("user", JSON.stringify(response));
        }
      } catch (error) {
        console.error("[AuthProvider getProfile] HATA:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const loadCompletedQuizzes = async () => {
      try {
        const storedQuizzes = await SecureStore.getItemAsync(
          "completedQuizzes"
        );
        if (storedQuizzes) {
          setCompletedQuizzes(JSON.parse(storedQuizzes));
        }
      } catch (e) {
        console.error("Failed to load completed quizzes", e);
      }
    };

    // Call this in your useEffect
    loadCompletedQuizzes();
    loadInitialState();
    loadInitialPoints();
    getProfile();
  }, []); // Sadece component mount edildiğinde çalışır

  useEffect(() => {
    const getAdmin = async () => {
      try {
        if (!isLoading && authToken && user) {
          // User is authenticated and profile is loaded
          const storedUser = await SecureStore.getItemAsync("user");
          // Check if user has admin role and redirect accordingly
          if (user.role === "admin") {
            router.replace("/admin");
          } else {
            router.replace("/(tabs)/home");
          }
        } else if (!isLoading && !authToken) {
          router.replace("/onboarding");
        }
      } catch (error) {
        console.error("[AuthProvider getAdmin] HATA:", error);
      }
    };
    getAdmin();
  }, [isLoading, authToken, ]); // isLoading, authToken ve user değiştiğinde çalışır

  // Login fonksiyonu: token ve user objesini alır (API response'dan)
  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      const { token, user } = response;
      setAuthToken(token);
      setUser(user);
      await SecureStore.setItemAsync("authToken", token);
      await SecureStore.setItemAsync("user", JSON.stringify(user));
      console.log("Login response: USER", user.role === "admin");
      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/(tabs)/home");
      }
      return user;
    } catch (error) {
      console.error("[AuthProvider login] HATA:", error);
      throw error;
    }
  };

  // Logout fonksiyonu
  const logout = async () => {
    try {
      await authApi.logout(authToken);
      setAuthToken(null);
      setUser(null);
      await SecureStore.deleteItemAsync("authToken");
      await SecureStore.deleteItemAsync("user");
      router.push("/onboarding");
    } catch (error) {
      console.error("[AuthProvider logout] HATA:", error);
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

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#007AFF" />
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
  SplashScreen.preventAutoHideAsync();
  return (
    <AuthProvider>
      {/* Yüklenirken hiçbir şey gösterme (Splash screen görünür) */}
      <Slot />
    </AuthProvider>
  );
}
