// app/_layout.jsx
import React, { useState, useEffect, createContext, useContext } from "react";
import { Slot, useRouter} from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";

// --- Splash Screen'i başta görünür tut ---
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
          router.replace("/(tabs)/home");
        } else {
          router.replace("/onboarding");
        }
      } catch (e) {
        console.error("[AuthProvider] Başlangıç state yükleme hatası:", e);
      } finally {
        setIsLoading(false); // Yükleme tamamlandı
        SplashScreen.hideAsync().catch(e => console.warn("SplashScreen error:", e)); // Splash screen'i gizle
      }
    };
    const loadInitialPoints = async () => {
      try {
          const storedPoints = await SecureStore.getItem('userTotalPoints');
          setUserPoints(parseInt(storedPoints || '0', 10));
      } catch (e) {
          console.error("Failed to load points from AsyncStorage", e);
      }
  };
    loadInitialState();
    loadInitialPoints()
  }, []); // Sadece component mount edildiğinde çalışır

  // Login fonksiyonu: token ve user objesini alır (API response'dan)
  const login = async (token, loggedInUser) => {
    if (!token) { return; }
    try {
      await SecureStore.setItemAsync('authToken', token);
      setAuthToken(token);
      setUserPoints(userData?.points || 0); // Eğer API user objesinde puan döndürüyorsa
      setUser(loggedInUser);
      router.replace("/(tabs)/home");
    } catch (e) {
      console.error("[AuthProvider login] HATA:", e);
    }
  };

  // Logout fonksiyonu
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
    } catch (e) {
      console.error("[AuthProvider logout] Depolama temizleme hatası:", e);
    } finally {
      // State'leri sıfırla
      setAuthToken(null);
      setUser(null);
      router.replace("/onboarding");
    }
  };

  const updateUserPoints = async (pointsToAdd) => {
    const newTotalPoints = userPoints + pointsToAdd;
    setUserPoints(newTotalPoints);
    // Puanları kalıcı hale getir (örn: AsyncStorage)
    try {
        await SecureStore.setItem('userTotalPoints', newTotalPoints.toString());
    } catch (e) {
    }
    // !!! Backend olsaydı burada API'ye de gönderilebilirdi !!!
  };

  const value = {
    authToken,
    user,
    isLoading,
    userPoints,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
// --- End Auth Context ---

// --- Kök Layout Component ---
export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Yüklenirken hiçbir şey gösterme (Splash screen görünür) */}
      <Slot />
    </AuthProvider>
  );
}
